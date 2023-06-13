use crate::error::{InvalidArgumentError, UnexpectedError};
use aws_sdk_s3::Client as S3Client;
use log::warn;
use std::future::Future;
use std::pin::Pin;

#[derive(Clone)]
pub struct S3Manager {
    client: S3Client,
    bucket: String,
}

//What I am trying to do is --
// 1. Create a standard api for the clients to consume
// 2. Under the covers use dependency injection to inject the actual s3 logic
//    -- This will allow me to test the logic without having to actually hit s3
//So here is an example:
//1. Our new function fully returns an S3Manager Structure
//    A. As part of that logic we will call head bucket to see if the bucket exists.
//    B. So we will need to pass a function that return a Result<boolean, InvalidArgumentError>
//    that actually calls head bucket.
//
//fn new(bucket: String) -> Result<S3Manager, InvalidArgumentError> {
//    new_impl(bucket, |bucket| {
//
//}
//fn new_impl(bucket: String, validator: FnOnce(String) -> Result<bool, InvalidArgumentError>) -> Result<S3Manager, InvalidArgumentError> {
//
//}

impl S3Manager {
    pub async fn new(bucket: String) -> Self {
        let res = Self::new_impl(bucket.clone(), |s3_manager, bucket| {
            async move { s3_manager.validate_helper(&bucket).await }
        })
        .await;

        match res {
            Ok(s3_manager) => s3_manager,
            Err(err) => {
                println!("Error: {}", err);
                panic!("Error: {}", err);
            }
        }
    }

    async fn new_impl<'a, T, Fut>(bucket: String, validator: T) -> Result<Self, String>
    where
        T: FnOnce(S3Manager, String) -> Fut + Send + Sync,
        Fut: Future<Output = bool> + Send + 'a,
    {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let s3_manager = Self {
            client,
            bucket: bucket.clone(),
        };
        let exists = validator(s3_manager.clone(), bucket.clone()).await;
        if !exists {
            return Err(format!("Bucket {} does not exist", bucket));
        }
        Ok(s3_manager)
    }

    async fn validate_helper(&self, bucket: &str) -> bool {
        let head_result = self
            .client
            .head_bucket()
            .bucket(bucket)
            .send()
            .await;

        if let Err(ref err) = head_result {
            println!("Error: {:?}", err);
        }

        head_result.is_ok()
    }
}

#[cfg(test)]
mod s3_manager_tests {
    use super::*;

    #[tokio::test]
    async fn new_s3_manager() {
        let bucket = "jps-test-bucket".to_string();
        let _s3_manager = S3Manager::new(bucket).await;
        let _i = 0;
    }
}
