use crate::types::athena_connection_errors::ConstructorError;
use async_trait::async_trait;
use glyphx_core::aws::athena_manager::AthenaManager;
use glyphx_core::aws::athena_manager::ConstructorError as AthenaManagerConstructorError;
use glyphx_core::SecretBoundError;
use glyphx_core::SecretBoundSingleton;
use log::error;
use mockall::automock;

#[automock]
#[async_trait]
trait AthenaConnectionOps: Sized {
    async fn build_athena_manager(
        &self,
        catalog_name: String,
        database_name: String,
    ) -> Result<AthenaManager, AthenaManagerConstructorError>;
}

#[derive(SecretBoundSingleton, Debug, Clone)]
#[secret_binder({"secret_name" : "db/athena", "initializer": "new", "initializer_error": "AthenaManagerConstructorError"})]
pub struct AthenaConnection {
    #[bind_field({"secret_name" : "catalogName" })]
    catalog_name: String,
    #[bind_field({"secret_name": "databaseName" })]
    database_name: String,
    #[bind_field({"is_bound": false})]
    athena_manager: AthenaManager,
}

struct AthenaConnectionOpsImpl {}

#[async_trait]
impl AthenaConnectionOps for AthenaConnectionOpsImpl {
    async fn build_athena_manager(
        &self,
        catalog_name: String,
        database_name: String,
    ) -> Result<AthenaManager, AthenaManagerConstructorError> {
        AthenaManager::new(&catalog_name, &database_name).await
    }
}

impl AthenaConnection {
    pub fn get_athena_manager(&self) -> &AthenaManager {
        &self.athena_manager
    }

    pub fn get_database_name(&self) -> &String {
        &self.database_name
    }

    pub fn get_data_catalog_name(&self) -> &String {
        &self.catalog_name
    }

    //Will return Err(AthenaManagerConstructorError) if something fails.  The T is
    //required to make the compiler happy, but it will always be AthenaManagerConstructorError
    //which is defined in the attribute on the struct.
    pub async fn new<T>(catalog_name: String, bucket_name: String) -> Result<Self, T>
    where
        T: SecretBoundError,
    {
        Self::new_impl(catalog_name, bucket_name, &AthenaConnectionOpsImpl {}).await
    }

    async fn new_impl<T, T2>(
        catalog_name: String,
        database_name: String,
        ops: &T,
    ) -> Result<Self, T2>
    where
        T: AthenaConnectionOps,
        T2: SecretBoundError,
    {
        let athena_manager = ops
            .build_athena_manager(catalog_name.clone(), database_name.clone())
            .await;
        if athena_manager.is_err() {
            let err = athena_manager.err().unwrap();
            let variant = err.parse_error_type();
            let error_data = err.get_glyphx_error_data();
            let err = T2::from_str(&variant, error_data.clone());

            err.error();
            return Err(err);
        }
        Ok(Self {
            catalog_name,
            database_name,
            athena_manager: athena_manager.unwrap(),
        })
    }
}

#[cfg(test)]
mod contructor {
    use super::*;
    use glyphx_core::aws::athena_manager::ConstructorError as AthenaManagerConstructorError;
    use glyphx_core::GlyphxErrorData;
    #[tokio::test]
    async fn is_ok() {
        let catalog_name = "test_catalog".to_string();
        let database_name = "test_database".to_string();
        let clone_database_name = database_name.clone();
        let clone_catalog_name = catalog_name.clone();
        let mut mock_ops = MockAthenaConnectionOps::new();

        mock_ops
            .expect_build_athena_manager()
            .withf(move |arg1, arg2| arg1 == &clone_catalog_name && arg2 == &clone_database_name)
            .times(1)
            .returning(|_, _| Ok(AthenaManager::default()));

        let athena_connection: Result<AthenaConnection, AthenaManagerConstructorError> =
            AthenaConnection::new_impl(catalog_name.clone(), database_name.clone(), &mock_ops)
                .await;
        assert!(athena_connection.is_ok());
        let athena_connection = athena_connection.unwrap();
        assert_eq!(&athena_connection.database_name, &database_name);
        assert_eq!(&athena_connection.catalog_name, &catalog_name);

        let struct_database_name = athena_connection.get_database_name();
        assert_eq!(struct_database_name, &database_name);
        let struct_catalog_name = athena_connection.get_data_catalog_name();
        assert_eq!(struct_catalog_name, &catalog_name);
        //Nothing to really assert here, just making sure that we can call the function.
        athena_connection.get_athena_manager();
    }

    #[tokio::test]
    async fn is_error() {
        let catalog_name = "test_catalog".to_string();
        let database_name = "test_database".to_string();
        let clone_database_name = database_name.clone();
        let clone_catalog_name = catalog_name.clone();
        let mut mock_ops = MockAthenaConnectionOps::new();

        mock_ops
            .expect_build_athena_manager()
            .withf(move |arg1, arg2| arg1 == &clone_catalog_name && arg2 == &clone_database_name)
            .times(1)
            .returning(|_, _| {
                Err(AthenaManagerConstructorError::DatabaseDoesNotExist(
                    GlyphxErrorData::default(),
                ))
            });

        let athena_connection: Result<AthenaConnection, AthenaManagerConstructorError> =
            AthenaConnection::new_impl(catalog_name.clone(), database_name.clone(), &mock_ops)
                .await;
        assert!(athena_connection.is_err());
        let athena_connection = athena_connection.err().unwrap();
        match athena_connection {
            AthenaManagerConstructorError::DatabaseDoesNotExist(_) => assert!(true),
            _ => assert!(false),
        }
    }
}
