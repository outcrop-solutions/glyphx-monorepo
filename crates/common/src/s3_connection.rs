use crate::types::s3_connection_errors::ConstructorError;


use glyphx_core::{
    aws::{
        s3_manager::{
            ConstructorError as S3ManagerConstructorError, S3ManagerContructorOptionsBuilder,
        },
        S3Manager,
    },
    traits::BlockStorageManager,
    SecretBoundError, SecretBoundSingleton,
};

use async_trait::async_trait;
use derive_builder::Builder;
use mockall::automock;

#[automock]
#[async_trait]
pub trait S3ConnectionOps : std::fmt::Debug + Send + Sync{
    async fn build_s3_manager(
        &self,
        bucket_name: String,
    ) -> Result<Box<dyn BlockStorageManager>, S3ManagerConstructorError>;
}

#[derive(Builder)]
#[builder(pattern = "owned")]
pub struct S3ConnectionConstructorOptions {
    #[builder(setter(into))]
    pub bucket_name: String,
    #[builder(default = "Box::new(S3ConnectionOpsImpl)")]
    pub dependencies: Box<dyn S3ConnectionOps>,
}

#[derive(SecretBoundSingleton, Debug)]
#[secret_binder({"secret_name" : "file/s3", "initializer": "from_secret", "initializer_error": "ConstructorError"})]
pub struct S3Connection {
    #[bind_field({"secret_name": "bucketName" })]
    bucket_name: String,
    #[bind_field({"is_bound": false})]
    s3_manager: Box<dyn BlockStorageManager>,
    #[bind_field({"is_bound": false})]
    dependencies: Box<dyn S3ConnectionOps>,
}

#[derive(Debug)]
struct S3ConnectionOpsImpl;

#[async_trait]
impl S3ConnectionOps for S3ConnectionOpsImpl {
    async fn build_s3_manager(
        &self,
        bucket_name: String,
    ) -> Result<Box<dyn BlockStorageManager>, S3ManagerConstructorError> {
        let options = S3ManagerContructorOptionsBuilder::default()
            .bucket(bucket_name)
            .build()
            .unwrap();
        let result = S3Manager::new(options).await?;
        Ok(Box::new(result))
    }
}

impl S3Connection {
    pub fn get_s3_manager(&self) -> &Box<dyn BlockStorageManager> {
        &self.s3_manager
    }

    pub fn get_bucket_name(&self) -> &String {
        &self.bucket_name
    }

    //Will return Err(AthenaManagerConstructorError) if something fails.  The T is
    //required to make the compiler happy, but it will always be S3ManagerConstructorError
    //which is defined in the attribute on the struct.
    pub async fn from_secret<T>(bucket_name: String) -> Result<Self, T>
    where
        T: SecretBoundError,
    {
        let options = S3ConnectionConstructorOptionsBuilder::default()
            .bucket_name(bucket_name)
            .build()
            .unwrap();
        Self::new(options).await
    }

    pub async fn new<T>(options: S3ConnectionConstructorOptions) -> Result<Self, T>
    where
        T: SecretBoundError,
    {
        let s3_manager = options.dependencies.build_s3_manager(options.bucket_name.clone()).await;
        if s3_manager.is_err() {
            let err = s3_manager.err().unwrap();
            let variant = err.parse_error_type();
            let error_data = err.get_glyphx_error_data();
            let err = T::from_str(&variant, error_data.clone());

            err.error();
            return Err(err);
        }
        Ok(Self {
            bucket_name : options.bucket_name,
            s3_manager: s3_manager.unwrap(),
            dependencies: options.dependencies,
        })
    }
}
impl Default for S3Connection {
    fn default() -> Self {
        Self {
            bucket_name: "".to_string(),
            s3_manager: Box::new(S3Manager::default()),
            dependencies: Box::new(S3ConnectionOpsImpl),
        }
    }
}

#[cfg(test)]
mod contructor {
    use super::*;
    use glyphx_core::GlyphxErrorData;
    #[tokio::test]
    async fn is_ok() {
        let bucket_name = "test_bucket".to_string();
        let clone_bucket_name = bucket_name.clone();
        let mut mock_ops = Box::new(MockS3ConnectionOps::new());

        mock_ops
            .expect_build_s3_manager()
            .withf(move |arg| arg == &clone_bucket_name)
            .times(1)
            .returning(|_| Ok(Box::new(S3Manager::default())));
        let options = S3ConnectionConstructorOptionsBuilder::default().bucket_name(&bucket_name).dependencies(mock_ops).build().unwrap();
        let s3_connection: Result<S3Connection, S3ManagerConstructorError> =
            S3Connection::new(options).await;
        assert!(s3_connection.is_ok());
        let s3_connection = s3_connection.unwrap();
        assert_eq!(&s3_connection.bucket_name, &bucket_name);

        let struct_bucket_name = s3_connection.get_bucket_name();
        assert_eq!(struct_bucket_name, &bucket_name);

        //Nothing to really assert here, just making sure that we can call the function.
        s3_connection.get_s3_manager();
    }

    #[tokio::test]
    async fn is_error() {
        let bucket_name = "test_bucket".to_string();
        let clone_bucket_name = bucket_name.clone();
        let mut mock_ops = Box::new(MockS3ConnectionOps::new());

        mock_ops
            .expect_build_s3_manager()
            .withf(move |arg| arg == &clone_bucket_name)
            .times(1)
            .returning(|_| {
                Err(S3ManagerConstructorError::BucketDoesNotExist(
                    GlyphxErrorData::default(),
                ))
            });

        let options = S3ConnectionConstructorOptionsBuilder::default().bucket_name(&bucket_name).dependencies(mock_ops).build().unwrap();
        let s3_connection: Result<S3Connection, S3ManagerConstructorError> =
            S3Connection::new(options).await;
        assert!(s3_connection.is_err());
        let s3_connection = s3_connection.err().unwrap();
        match s3_connection {
            S3ManagerConstructorError::BucketDoesNotExist(_) => assert!(true),
            _ => assert!(false),
        }
    }
}
