use async_trait::async_trait;
use glyphx_core::aws::S3Manager;
use glyphx_core::SecretBoundSingleton;
use glyphx_core::aws::s3_manager::ConstructorError as S3ManagerConstructorError;
use crate::types::s3_connection_errors::ConstructorError;
use log::error;
use mockall::automock;
use glyphx_core::SecretBoundError;

#[automock]
#[async_trait]
trait S3ConnectionOps {
    async fn build_s3_manager(
        &self,
        bucket_name: String,
    ) -> Result<S3Manager, S3ManagerConstructorError>;
}

#[derive(SecretBoundSingleton, Debug, Clone)]
#[secret_binder({"secret_name" : "file/s3", "initializer": "new", "initializer_error": "S3ManagerConstructorError"})]
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

    //Will return Err(AthenaManagerConstructorError) if something fails.  The T is 
    //required to make the compiler happy, but it will always be S3ManagerConstructorError 
    //which is defined in the attribute on the struct.
    pub async fn new<T>(bucket_name: String) -> Result<Self, T> 
    where T : SecretBoundError {
        Self::new_impl(bucket_name, &S3ConnectionOpsImpl).await
    }

    async fn new_impl<T, T2>(bucket_name: String, ops: &T) -> Result<Self, T2> 
    where T: S3ConnectionOps, T2 : SecretBoundError {
        let s3_manager = ops.build_s3_manager(bucket_name.clone()).await;
        if s3_manager.is_err() {
            let err = s3_manager.err().unwrap();
            let variant = err.parse_error_type();
            let error_data = err.get_glyphx_error_data();
            let err = T2::from_str(&variant, error_data.clone());

            err.error();
            return Err(err);
        }
        Ok(Self {
            bucket_name,
            s3_manager: s3_manager.unwrap(),
        })
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

        let s3_connection: Result<S3Connection, S3ManagerConstructorError> = S3Connection::new_impl(bucket_name.clone(), &mock_ops).await;
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

        let s3_connection: Result<S3Connection, S3ManagerConstructorError> = S3Connection::new_impl(bucket_name.clone(), &mock_ops).await;
        assert!(s3_connection.is_err());
        let s3_connection = s3_connection.err().unwrap();
        match s3_connection {
            S3ManagerConstructorError::BucketDoesNotExist(_) => assert!(true), 
            _ => assert!(false),
        }
    }
}
