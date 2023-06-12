use aws_sdk_s3::Client as S3Client;
use log::warn;
use std::future::Future;
use std::pin::Pin;

pub struct S3Manager {
    client: S3Client,
    bucket: String,
}

impl S3Manager {
    pub async fn new(bucket: String) -> Self {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let head_result = client.head_bucket().bucket(bucket.clone()).send().await;
        if head_result.is_err() {
            if let Some(err) = head_result.err() {
                println!("Error: {:?}", err);
            }
        }
        Self { client, bucket }
    }

    async fn new_impl<T>(bucket: String, validator: T) -> Self
    where
        T: FnOnce(&S3Manager, String) -> Pin<Box<dyn Future<Output = bool>>> + Send + Sync,
    {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let s3_manager = Self {
            client,
            bucket: bucket.clone(),
        };
        let exists = validator(&s3_manager, bucket.clone()).await;
        s3_manager
    }
async fn process_bucket(&self, bucket_name: String) -> bool {
    let head_result = self
        .client
        .head_bucket()
        .bucket(bucket_name.clone())
        .send()
        .await;
    if let Err(err) = head_result {
        println!("Error: {:?}", err);
    }
    head_result.is_ok()
}
    pub async fn does_bucket_exist(&self) -> bool {
        does_bucket_exist_impl(self.bucket.clone(), closure).await
    }
}

async fn does_bucket_exist_impl<T>(bucket: String, logic: T) -> bool
where
    T: FnOnce(String) -> Pin<Box<dyn Future<Output = bool>>> + Send + Sync,
{
    let head_result = manager
        .client
        .head_bucket()
        .bucket(bucket.clone())
        .send()
        .await;
    if head_result.is_err() {
        if let Some(err) = head_result.as_ref().err() {
            println!("Error: {:?}", err);
        }
    }
    head_result.is_ok()
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
