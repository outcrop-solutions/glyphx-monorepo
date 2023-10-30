use async_trait::async_trait;
use glyphx_core::aws::S3Manager;
use glyphx_core::SecretBoundSingleton;
use glyphx_core::aws::s3_manager::ConstructorError as S3ManagerConstructorError;
use crate::types::s3_connection_errors::ConstructorError;
use log::error;
use mockall::automock;

#[automock]
#[async_trait]
trait S3ConnectionOps {
    async fn build_s3_manager(
        &self,
        bucket_name: String,
    ) -> Result<S3Manager, S3ManagerConstructorError>;
}

#[derive(SecretBoundSingleton, Debug, Clone)]
#[secret_binder({"secret_name" : "file/s3", "initializer": "new"})]
pub struct S3Connection {
    #[bind_field({"secret_name": "bucketName" })]
    bucket_name: String,
    #[bind_field({"is_bound": false})]
    s3_manager: S3Manager,
}

struct S3ConnectionOpsImpl;

#[async_trait]
impl S3ConnectionOps for S3ConnectionOpsImpl {
    async fn build_s3_manager(
        &self,
        bucket_name: String,
    ) -> Result<S3Manager, S3ManagerConstructorError> {
        S3Manager::new(bucket_name).await
    }
}

impl S3Connection {
    pub fn get_s3_manager(&self) -> &S3Manager {
        &self.s3_manager
    }

    pub fn get_bucket_name(&self) -> &String {
        &self.bucket_name
    }

    ///Panics if we cannot create the S3Manager
    pub async fn new(bucket_name: String) -> Self {
        Self::new_impl(bucket_name, &S3ConnectionOpsImpl).await
    }

    async fn new_impl<T: S3ConnectionOps>(bucket_name: String, ops: &T) -> Self {
        let s3_manager = ops.build_s3_manager(bucket_name.clone()).await;
        if s3_manager.is_err() {
            let err =
                ConstructorError::from_s3_manager_constructor_error(s3_manager.err().unwrap());
            error!("Failed to create S3Manager: {:?}", &err);
            panic!("Failed to create S3Manager: {:?}", &err);
        }
        Self {
            bucket_name,
            s3_manager: s3_manager.unwrap(),
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
        let mut mock_ops = MockS3ConnectionOps::new();

        mock_ops
            .expect_build_s3_manager()
            .withf(move |arg| arg == &clone_bucket_name)
            .times(1)
            .returning(|_| Ok(S3Manager::default()));

        let s3_connection = S3Connection::new_impl(bucket_name.clone(), &mock_ops).await;
        assert_eq!(&s3_connection.bucket_name, &bucket_name);

        let struct_bucket_name = s3_connection.get_bucket_name();
        assert_eq!(struct_bucket_name, &bucket_name);

        //Nothing to really assert here, just making sure that we can call the function.
        s3_connection.get_s3_manager();
    }

    #[tokio::test]
    #[should_panic]
    async fn is_error() {
        let bucket_name = "test_bucket".to_string();
        let clone_bucket_name = bucket_name.clone();
        let mut mock_ops = MockS3ConnectionOps::new();

        mock_ops
            .expect_build_s3_manager()
            .withf(move |arg| arg == &clone_bucket_name)
            .times(1)
            .returning(|_| {
                Err(S3ManagerConstructorError::BucketDoesNotExist(
                    GlyphxErrorData::default(),
                ))
            });

        S3Connection::new_impl(bucket_name.clone(), &mock_ops).await;
    }
}
