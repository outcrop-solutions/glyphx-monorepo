use crate::error::GlyphxErrorData;
use aws_sdk_s3::Client as S3Client;
use log::warn;
use serde_json::json;
use std::future::Future;

#[derive(Clone)]
pub struct S3Manager {
    client: S3Client,
    bucket: String,
}

pub enum ConstructorError {
    BucketDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
    
}

pub enum BucketExistsError { 
    BucketDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
    
}

impl S3Manager {
    /// Our public new function that will return an S3Manager.  This uses our new_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the new logic with no down stream effects.  This function just wraps our impl call.
    pub async fn new(bucket: String) -> Result<Self, ConstructorError> {
        Self::new_impl(bucket, |s3_client, bucket| async move {
            Self::bucket_exists_validator(&s3_client, &bucket).await
        })
        .await
    }

    pub async fn bucket_exists(&self) -> Result<bool, BucketExistsError> {
        Self::bucket_exists_impl(self.client.clone(), self.bucket.clone(),  |s3_client, bucket| async move {
            Self::bucket_exists_validator(&s3_client, &bucket).await
        })
        .await
        
    }

    /// Our private new_impl function that will return an S3Manager.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `validator` - A function that takes an S3Client and a String and returns a Future<bool>.
    /// This function will make the actual call to the S3Client to see if the bucket exists.
    async fn new_impl< T, Fut>(
        bucket: String,
        validator: T,
    ) -> Result<Self, ConstructorError>
    where
        T: FnOnce(S3Client, String) -> Fut + Send + Sync,
        Fut: Future<Output = Result<bool, GlyphxErrorData>>  + Send ,
    {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let result = validator(client.clone(), bucket.clone()).await;
        match result {
            Ok(exists) => {
                if !exists {
                    return Err(ConstructorError::BucketDoesNotExist(GlyphxErrorData::new(
                        format!("Bucket {} does not exist", bucket),
                        Some(json!({ "bucket_name": bucket })),
                        None,
                    )));
                }
            }
            Err(e) => {
                return Err( ConstructorError::UnexpectedError(e));
            }
        };
        let s3_manager = Self {
            client,
            bucket: bucket.clone(),
        };
        Ok(s3_manager)
    }


    async fn bucket_exists_impl< T, Fut>(
        client: S3Client,
        bucket: String,
        validator: T,
    ) -> Result<bool, BucketExistsError> 
    where
        T: FnOnce(S3Client, String) -> Fut + Send + Sync,
        Fut: Future<Output = Result<bool, GlyphxErrorData>>  + Send ,
    {

        let result = validator(client.clone(), bucket.clone()).await;
        match result {
            Ok(exists) => {
                if !exists {
                    return Err( BucketExistsError::BucketDoesNotExist(GlyphxErrorData::new(
                        format!("Bucket {} does not exist", bucket),
                        Some(json!({ "bucket_name": bucket })),
                        None,
                    )));
                }
            }
            Err(e) => {
                return Err( BucketExistsError::UnexpectedError(e));
            }
        };
        Ok(true)
    }

    /// Our private bucket_exists_validator function that will return a boolean if the bucket
    /// exists and false if it does not.  This can be used by any function which wants
    /// to determine whether or not a bucket exists.
    async fn bucket_exists_validator(
        client: &S3Client,
        bucket: &str,
    ) -> Result<bool, GlyphxErrorData> {
        let head_result = client.head_bucket().bucket(bucket).send().await;
        if head_result.is_err() {
            let e = head_result.err().unwrap();
            let e = e.into_service_error();
            if e.is_not_found() {
                return Ok(false);
            } else {
                let msg = e.meta().message().unwrap().to_string();
                let data = json!({ "bucket_name": bucket });
                warn!(
                    "Error calling head_bucket for bucket {}, error : {} ",
                    bucket, e
                );
                Err(GlyphxErrorData::new(msg, Some(data), None))
            }
        } else {
            Ok(true)
        }
    }
}

#[cfg(test)]
mod s3_manager_tests {
    use super::*;

    #[tokio::test]
    async fn new_impl_is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), |_client, _bucket_name| async move {
           Ok(true)
        }).await;
        assert!(s3_manager_result.is_ok());
        let s3_manager = s3_manager_result.ok().unwrap(); 
        assert_eq!(s3_manager.bucket, bucket);
        let _i = 0;
    }

    #[tokio::test]
    async fn new_impl_bucket_does_not_exist() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), |_client, _bucket_name| async move {
           Ok(false)
        }).await;
        assert!(s3_manager_result.is_err());
        let s3_manager = s3_manager_result.err().unwrap(); 
        let is_invalid: bool; 
        match s3_manager {
            ConstructorError::BucketDoesNotExist(e) => {
                is_invalid = true;
                
            
            },
            _ => {
                panic!("Expected BucketDoesNotExist error");
            }
        } 
        assert!(is_invalid);
    }

    #[tokio::test]
    async fn new_impl_bucket_unexpected_error() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), |_client, _bucket_name| async move {
                Err(GlyphxErrorData::new(
                    format!(
                        "Error calling head_bucket for bucket {}",
                        bucket 
                    ),
                    Some(json!({ "bucket_name": bucket })),
                    None,
                ))
        }).await;
        assert!(s3_manager_result.is_err());
        let s3_manager = s3_manager_result.err().unwrap(); 
        let is_invalid: bool;
        match s3_manager {
            ConstructorError::UnexpectedError(e) => {
                is_invalid = true;
                
            
            },
            _ => {
                panic!("Expected Unexpected error");
            }
        } 
        assert!(is_invalid);
    }

    #[tokio::test]
    async fn bucket_exists_impl_is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), |_client, _bucket_name| async move {
           Ok(true)
        }).await;
        assert!(s3_manager_result.is_ok());
        let s3_manager = s3_manager_result.ok().unwrap(); 

        let bucket_exists_result = S3Manager::bucket_exists_impl(s3_manager.client.clone(), s3_manager.bucket.clone(), |client, bucket| async move {
            Ok(true)
        }).await;

        assert!(bucket_exists_result.is_ok());
        let bucket_exists = bucket_exists_result.ok().unwrap();
        assert!(bucket_exists);
    }

    #[tokio::test]
    async fn bucket_exists_impl_bucket_does_not_exist() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), |_client, _bucket_name| async move {
           Ok(true)
        }).await;

        let s3_manager = s3_manager_result.ok().unwrap(); 
        let bucket_exists_result = S3Manager::bucket_exists_impl(s3_manager.client.clone(), s3_manager.bucket.clone(), |client, bucket| async move {
            Ok(false)
        }).await;

        assert!(bucket_exists_result.is_err());
        let bucket_exists = bucket_exists_result.err().unwrap(); 
        let is_invalid: bool; 
        match bucket_exists {
            BucketExistsError::BucketDoesNotExist(e) => {
                is_invalid = true;
                
            
            },
            _ => {
                panic!("Expected BucketDoesNotExist error");
            }
        } 
        assert!(is_invalid);
    }

    #[tokio::test]
    async fn bucket_exists_impl_unexpected_error() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), |_client, _bucket_name| async move {
           Ok(true)
        }).await;

        let s3_manager = s3_manager_result.ok().unwrap(); 
        let bucket_exists_result = S3Manager::bucket_exists_impl(s3_manager.client.clone(), s3_manager.bucket.clone(), |client, bucket| async move {
                Err(GlyphxErrorData::new(
                    format!(
                        "Error calling head_bucket for bucket {}",
                        bucket 
                    ),
                    Some(json!({ "bucket_name": bucket })),
                    None,
                ))
        }).await;

        assert!(bucket_exists_result.is_err());
        let bucket_exists = bucket_exists_result.err().unwrap(); 
        let is_invalid: bool; 
        match bucket_exists {
            BucketExistsError::UnexpectedError(e) => {
                is_invalid = true;
                
            
            },
            _ => {
                panic!("Expected Unexpected error");
            }
        } 
        assert!(is_invalid);
    }

}
