use glyphx_types::error::GlyphxErrorData;
use async_recursion::async_recursion;
use async_trait::async_trait;
use mockall::*;

use aws_sdk_secretsmanager as secrets_manager; 

use glyphx_types::aws::secret_manager::*;

use http::Request;
use log::warn;
use serde_json::{json, Value};
use std::time::Duration;
use std::env;

#[derive(Debug, Clone)]
pub struct SecretManager {
    client: secrets_manager::Client,
    secret_name: String,
   
}

#[automock]
#[async_trait]
trait SecretsManagerOps {
    async fn get_secret_string(&self, client:&secrets_manager::Client, secret_name: &str) -> Result<Option<String>, GlyphxErrorData>;

}

struct SecretsManagerOpsImpl ;

#[async_trait]
impl SecretsManagerOps for SecretsManagerOpsImpl{
    async fn get_secret_string(&self, client:&secrets_manager::Client, secret_name: &str) -> Result<Option<String>, GlyphxErrorData> {
        let res = client.get_secret_value()
            .secret_id(secret_name)
            .send()
            .await;

        if res.is_err() {
            let err = res.err().unwrap();
            let msg = err.into_service_error().meta().message().unwrap().to_string();
            let data = json!({"secret_name": secret_name}); 
            return Err(GlyphxErrorData::new(msg, Some(data), None));
        }
        let res = res.unwrap();

        if res.secret_string.is_none() {
           return Ok(None);
        }

        let secret_string = res.secret_string.unwrap().trim().to_string();
        if secret_string.is_empty() {
            return Ok(None);
        }
        Ok(Some(secret_string))

    }
    
}

impl SecretManager {
    pub async fn new(secret_name: &str ) -> Self {
        let mut environment = "dev".to_string();
        if let Ok(env_var) = env::var("GLYPHX_ENV") {
            match env_var.as_str() {
                "prod" | "demo" | "dev" => environment = env_var,
                _ => () 
            }
        }

        let secret_name = format!("{}/{}", environment, secret_name);
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = secrets_manager::Client::new(&config);

        return Self {
            client,
            secret_name,
        };
    }

    pub fn get_secret_name(&self) -> String {
        self.secret_name.clone()
    }

    pub fn get_client(&self) -> secrets_manager::Client {
        self.client.clone()
    }

    pub async fn get_secret_value(&self) -> Result<Value, GetSecretsValueError> {
         self.get_secret_value_impl(&SecretsManagerOpsImpl).await
    }

    async fn get_secret_value_impl<T: SecretsManagerOps>(&self, aws_operations: &T ) ->  Result<Value, GetSecretsValueError> {
        let results = aws_operations.get_secret_string(&self.client, &self.secret_name).await;
        if results.is_err() {
            let err = results.err().unwrap();
            return Err(GetSecretsValueError::UnexpectedError(err));
        } 
        let results = results.unwrap();
        if results.is_none() {
            let msg = format!("The secret is empty: {}", self.secret_name);
            let data = json!({"secret_name": self.secret_name});
            return Err(GetSecretsValueError::SecretNotDefined(GlyphxErrorData::new(msg, Some(data), None)));
        }

        let results = results.unwrap();
        let json_value = serde_json::from_str(&results);
        if json_value.is_err() {
            let msg = format!("The secret is not valid json: {}", self.secret_name);
            let data = json!({"secret_name": self.secret_name});
            return Err(GetSecretsValueError::InvalidJson(GlyphxErrorData::new(msg, Some(data), None)));

        }
        let json_value = json_value.unwrap();
        Ok(json_value)

    }
}

#[cfg(test)]
mod constructor {
    use super::*;
    use serial_test::serial;

    #[tokio::test]
    #[serial]
    async fn is_ok() {
        let secret_manager = SecretManager::new("foo").await;
        assert_eq!(secret_manager.get_secret_name(), "dev/foo");
        assert_eq!(secret_manager.secret_name, "dev/foo");
    }

    #[tokio::test]
    #[serial]
    async fn is_dev() {
        env::set_var("GLYPHX_ENV", "dev");
        let secret_manager = SecretManager::new("foo").await;
        assert_eq!(secret_manager.get_secret_name(), "dev/foo");
        assert_eq!(secret_manager.secret_name, "dev/foo");
    }

    #[tokio::test]
    #[serial]
    async fn is_demo() {
        env::set_var("GLYPHX_ENV", "demo");
        let secret_manager = SecretManager::new("foo").await;
        assert_eq!(secret_manager.get_secret_name(), "demo/foo");
        assert_eq!(secret_manager.secret_name, "demo/foo");
    }

    #[tokio::test]
    #[serial]
    async fn is_prod() {
        env::set_var("GLYPHX_ENV", "prod");
        let secret_manager = SecretManager::new("foo").await;
        assert_eq!(secret_manager.get_secret_name(), "prod/foo");
        assert_eq!(secret_manager.secret_name, "prod/foo");
    }

    #[tokio::test]
    #[serial]    
    async fn is_default_dev() {
        env::set_var("GLYPHX_ENV", "dem");
        let secret_manager = SecretManager::new("foo").await;
        assert_eq!(secret_manager.get_secret_name(), "dev/foo");
        assert_eq!(secret_manager.secret_name, "dev/foo");
    }
}

#[cfg(test)]
mod get_secret_value {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let secret_manager = SecretManager::new("foo").await;
        let mut mock_ops = MockSecretsManagerOps::new();
        mock_ops.expect_get_secret_string()
            .times(1)
            .returning(|_, _| Ok(Some(r#"{"foo": "bar"}"#.to_string())));
        let result = secret_manager.get_secret_value_impl(&mock_ops).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result["foo"], "bar");
    }

    #[tokio::test]
    async fn is_not_defined() {
        let secret_manager = SecretManager::new("foo").await;
        let mut mock_ops = MockSecretsManagerOps::new();
        mock_ops.expect_get_secret_string()
            .times(1)
            .returning(|_, _| Ok(None));
        let result = secret_manager.get_secret_value_impl(&mock_ops).await;
        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            GetSecretsValueError::SecretNotDefined(..) => (),
            _ => panic!("Unexpected error"),
        }

    }

    #[tokio::test]
    async fn invalid_json() {
        let secret_manager = SecretManager::new("foo").await;
        let mut mock_ops = MockSecretsManagerOps::new();
        mock_ops.expect_get_secret_string()
            .times(1)
            .returning(|_, _| Ok(Some("{\"foo\": \"bar".to_string())));
        let result = secret_manager.get_secret_value_impl(&mock_ops).await;
        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            GetSecretsValueError::InvalidJson(..) => (),
            _ => panic!("Unexpected error"),
        }

    }

    #[tokio::test]
    async fn unexpected_error() {
        let secret_manager = SecretManager::new("foo").await;
        let mut mock_ops = MockSecretsManagerOps::new();
        mock_ops.expect_get_secret_string()
            .times(1)
            .returning(|_, _| Err(GlyphxErrorData::new("An Unexpected Error Occurred".to_string(), None, None)));
        let result = secret_manager.get_secret_value_impl(&mock_ops).await;
        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            GetSecretsValueError::UnexpectedError(..) => (),
            _ => panic!("Unexpected error"),
        }

    }
}
