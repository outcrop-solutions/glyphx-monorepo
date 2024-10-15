mod s3_manager_constructor_options;
///! This module holds the S3Manager structure which is used to interact with S3.
mod s3_manager_ops_impl;
pub use crate::types::error::GlyphxErrorData;
use async_trait::async_trait;

use aws_sdk_s3::{
    operation::get_object::GetObjectError, primitives::ByteStream,
};
pub use aws_sdk_s3::Client as S3Client;
use crate::aws::upload_stream::UploadStream;
use crate::traits::{BlockStorageManager, S3ManagerOps};
pub use crate::types::aws::s3_manager::*;
pub use crate::types::aws::upload_stream::*;
use log::warn;
pub use s3_manager_constructor_options::{
    S3ManagerContructorOptions, S3ManagerContructorOptionsBuilder,
};
pub use s3_manager_ops_impl::S3ManagerOpsImpl;
use serde_json::json;
use std::sync::Arc;
use std::time::Duration;

/// Our S3Manager structure which wraps the AWS S3 api and exposes all of the functions that we need to interact with S3.
#[derive(Clone, Debug)]
pub struct S3Manager {
    client: S3Client,
    bucket: String,
    operations: std::sync::Arc<Box<dyn S3ManagerOps>>,
}

#[async_trait]
impl BlockStorageManager for S3Manager {
    /// A Get accesor for the bucket name.  This is just a simple getter. It is probably
    /// most usefull when debugging to keep track of which bucket we are operating on.
    fn get_bucket_name(&self) -> String {
        self.bucket.clone()
    }

    /// A Get accesor for the S3Client.  This is just a simple getter. It is probably
    /// most usefull when testing to get access to the S3Client we have instantiated for.
    /// aws calls.
    fn get_client(&self) -> S3Client {
        self.client.clone()
    }

    /// Our bucket_exists function that will return Ok(()) .
    async fn bucket_exists(&self) -> Result<(), BucketExistsError> {
        let result = self
            .operations
            .bucket_exists_operation(&self.client, &self.bucket)
            .await;
        match result {
            Ok(exists) => {
                if !exists {
                    return Err(BucketExistsError::BucketDoesNotExist(GlyphxErrorData::new(
                        format!("Bucket {} does not exist", self.bucket),
                        Some(json!({ "bucket_name": self.bucket })),
                        None,
                    )));
                }
            }
            Err(e) => {
                return Err(BucketExistsError::UnexpectedError(e));
            }
        };
        Ok(())
    }

    /// Our file_exists function that will return a Ok(()).  
    async fn file_exists(&self, key: &str) -> Result<(), FileExistsError> {
        let result = self
            .operations
            .file_exists_operation(&self.client, &self.bucket, key)
            .await;
        match result {
            Ok(exists) => {
                if !exists {
                    return Err(FileExistsError::FileDoesNotExist(GlyphxErrorData::new(
                        format!("Bucket {} does not exist", &self.bucket),
                        Some(json!({ "bucket_name": &self.bucket, "key": key })),
                        None,
                    )));
                }
            }
            Err(e) => {
                return Err(FileExistsError::UnexpectedError(e));
            }
        };
        Ok(())
    }

    /// Our list_objects function that will return a `Vec<String>` of all of the keys in a bucket.
    /// This function will call the required aws_operations and if the result is truncated, it will call itself
    /// with the last key as the start_after parameter.  It will then append the results of the
    /// recursive call to the results of the original call and return the results.
    /// If the aws_operations return an error, it will return the error.
    /// # Arguments
    /// * `filter` - An `Option<String>` that represents a filter that we want to apply to the list_objects call.
    async fn list_objects(
        &self,
        filter: Option<String>,
        start_after: Option<String>,
    ) -> Result<Vec<String>, ListObjectsError> {
        let res = self
            .operations
            .list_objects_operation(
                &self.client,
                &self.bucket,
                filter.clone(),
                start_after.clone(),
            )
            .await;
        match res {
            Ok((mut keys, truncated)) => {
                if truncated {
                    let last_key = keys.last().unwrap().clone();
                    let res = self.list_objects(filter.clone(), Some(last_key)).await;
                    match res {
                        Ok(mut new_keys) => {
                            keys.append(&mut new_keys);
                            return Ok(keys);
                        }
                        Err(e) => {
                            return Err(e);
                        }
                    }
                } else {
                    return Ok(keys);
                }
            }
            Err(e) => {
                return Err(e);
            }
        }
    }

    /// Will return file information for a given key.  
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to get information about.
    async fn get_file_information(&self, key: &str) -> Result<S3FileInfo, GetFileInformationError> {
        let head_result = self
            .operations
            .get_file_information_operation(&self.client, &self.bucket, key)
            .await;
        if head_result.is_err() {
            let e = head_result.err().unwrap();
            let e = e.into_service_error();
            if e.is_not_found() {
                return Err(GetFileInformationError::KeyDoesNotExist(
                    GlyphxErrorData::new(
                        String::from(format!(
                            "The file {} does not exist on the bucket {}",
                            key, &self.bucket
                        )),
                        Some(serde_json::json!({"Bucket": &self.bucket, "Key": key})),
                        None,
                    ),
                ));
            } else {
                let msg = e.meta().message().unwrap().to_string();
                let data = json!({ "bucket_name": &self.bucket, "key" : key });
                warn!(
                    "Error calling head_object for bucket {}, key {}, error : {} ",
                    &self.bucket, key, e
                );
                Err(GetFileInformationError::UnexpectedError(
                    GlyphxErrorData::new(msg, Some(data), None),
                ))
            }
        } else {
            let info = head_result.unwrap();
            let dt = info.last_modified().unwrap();
            let size = info.content_length().unwrap_or(0);
            Ok(S3FileInfo {
                file_name: key.to_string(),
                file_size: size,
                last_modified: dt.to_owned(),
            })
        }
    }

    /// Will return a presigned url for uploading a file.  
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to get information about.
    /// * `lifetime` - An `Option<u64>` that represents how long the presigned url will be valid for
    /// in seconds (the default is 300 seconds).
    /// * `content_type` - An optional String that represents the content type of the file that we want to upload.
    async fn get_signed_upload_url(
        &self,
        key: &str,
        lifetime: Option<u64>,
        content_type: Option<String>,
    ) -> Result<String, GetSignedUploadUrlError> {
        let expires_in = match lifetime {
            Some(lifetime) => Duration::from_secs(lifetime),
            None => Duration::from_secs(60 * 5), // 5 minutes
        };

        let res = self
            .operations
            .get_upload_url_operation(&self.client, &self.bucket, key, expires_in, content_type)
            .await;
        match res {
            Ok(url) => {
                return Ok(url.uri().to_string());
            }
            Err(e) => {
                let e = e.into_service_error();
                let msg = e.meta().message().unwrap().to_string();
                let data = json!({ "bucket_name": &self.bucket, "key" : key });
                return Err(GetSignedUploadUrlError::UnexpectedError(
                    GlyphxErrorData::new(msg, Some(data), None),
                ));
            }
        }
    }

    /// Will return an object stream for a file.  
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to get information about.
    async fn get_object_stream(&self, key: &str) -> Result<ByteStream, GetObjectStreamError> {
        let res = self
            .operations
            .get_object_stream_operation(&self.client, &self.bucket, key)
            .await;
        match res {
            Ok(result) => {
                return Ok(result.body);
            }
            Err(e) => {
                let e = e.into_service_error();
                match e {
                    GetObjectError::InvalidObjectState(_) => {
                        return Err(GetObjectStreamError::ObjectUnavailable(GlyphxErrorData::new(
                            format!("The object {} exists on the bucket {}, but is archived and cannot be accessed", key, &self.bucket),
                            Some(json!({ "bucket_name": &self.bucket, "key" : key })),
                            None,
                        )));
                    }
                    GetObjectError::NoSuchKey(_) => {
                        return Err(GetObjectStreamError::KeyDoesNotExist(GlyphxErrorData::new(
                            format!(
                                "The object {} does not exist on the bucket {}",
                                key, &self.bucket
                            ),
                            Some(json!({ "bucket_name": &self.bucket, "key" : key })),
                            None,
                        )));
                    }

                    _ => {
                        let msg = e.meta().message().unwrap().to_string();
                        let data = json!({ "bucket_name":&self.bucket, "key" : key });
                        return Err(GetObjectStreamError::UnexpectedError(GlyphxErrorData::new(
                            msg,
                            Some(data),
                            None,
                        )));
                    }
                }
            }
        }
    }

    /// Will return an UploadStream that wraps the AWs S3 Multipart upload.  This will allow us to
    /// write data as we consume it with out having to buffer the entire file in memory.  
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to upload.
    async fn get_upload_stream(&self, key: &str) -> Result<UploadStream, GetUploadStreamError> {
        let res = self
            .operations
            .get_upload_stream_operation(&self.client, &self.bucket, key)
            .await;

        if res.is_err() {
            let inner_data = match res.err().unwrap() {
                UploadStreamConstructorError::UnexpectedError(e) => {
                    serde_json::to_value(e).unwrap()
                }
            };

            let inner_err = json!({ "unexpected": inner_data });

            return Err(GetUploadStreamError::UnexpectedError(GlyphxErrorData::new(String::from("An error occurred while getting the upload stream.  See the inner error for more information"), Some(json!({"bucket_name": &self.bucket, "key": key})), Some(inner_err))));
        }

        Ok(res.unwrap())
    }

    /// Will remove a file from the S3 bucket.  
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to remove.
    async fn remove_object(&self, key: &str) -> Result<(), RemoveObjectError> {
        let res = self
            .operations
            .remove_object_operation(&self.client, &self.bucket, key)
            .await;
        match res {
            Ok(_) => {
                return Ok(());
            }
            Err(e) => {
                let e = e.into_service_error();
                let msg = e.meta().to_string();
                let data = json!({ "bucket_name": &self.bucket, "key" : key });
                return Err(RemoveObjectError::UnexpectedError(GlyphxErrorData::new(
                    msg,
                    Some(data),
                    None,
                )));
            }
        }
    }

    /// Will upload a file to the S3 bucket.  This upload does not use the multipart upload.  
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to upload.
    /// * `data` - A Vec<u8> that represents the data that we want to upload.
    /// * `content_type` - An optional String that represents the content type of the file that we want to upload.
    async fn upload_object(
        &self,
        key: &str,
        data: Vec<u8>,
        content_type: Option<String>,
    ) -> Result<(), UploadObjectError> {
        let res = self
            .operations
            .put_object_operation(
                &self.client,
                &self.bucket,
                key,
                ByteStream::from(data),
                content_type,
            )
            .await;
        match res {
            Ok(_) => {
                return Ok(());
            }
            Err(e) => {
                let e = e.into_service_error();
                let msg = e.meta().to_string();
                let data = json!({ "bucket_name":&self.bucket, "key" : key });
                return Err(UploadObjectError::UnexpectedError(GlyphxErrorData::new(
                    msg,
                    Some(data),
                    None,
                )));
            }
        }
    }
}

impl S3Manager {
    /// Our new function that will return an S3Manager.  This uses our new_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the new logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    pub async fn new(options: S3ManagerContructorOptions) -> Result<Self, ConstructorError> {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let result = options
            .dependencies
            .bucket_exists_operation(&client, &options.bucket)
            .await;
        match result {
            Ok(exists) => {
                if !exists {
                    return Err(ConstructorError::BucketDoesNotExist(GlyphxErrorData::new(
                        format!("Bucket {} does not exist", options.bucket),
                        Some(json!({ "bucket_name": options.bucket })),
                        None,
                    )));
                }
            }
            Err(e) => {
                return Err(ConstructorError::UnexpectedError(e));
            }
        };
        let s3_manager = Self {
            client,
            bucket: options.bucket,
            operations: Arc::new(options.dependencies),
        };
        Ok(s3_manager)
    }
}

//We will use our default trait to create a dummy S3Manager for testing.
//This will allow us to create an S3 manager in structures that may hold
//an instance to an S3 manager, and allow us to use our impl patterns to write tests
//against that struture without any downstream ts.
impl Default for S3Manager {
    fn default() -> Self {
        //We just want an empty config as we are not going to actually call anything on it.
        let config = aws_config::SdkConfig::builder().build();
        let client = S3Client::new(&config);
        S3Manager {
            client,
            bucket: "mock".to_string(),
            operations: Arc::new(Box::new(S3ManagerOpsImpl)),
        }
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;
    use crate::traits::MockS3ManagerOps;
    pub use s3_manager_constructor_options::S3ManagerContructorOptionsBuilder;
    use std::future::ready;

    macro_rules! future {
        ($e:expr) => {
            Box::pin(ready($e))
        };
    }

    mod constructor {
        use super::*;
        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());

            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            assert!(s3_manager_result.is_ok());
            let s3_manager = s3_manager_result.unwrap();
            assert_eq!(s3_manager.bucket, bucket);

            //test our Debug trait to satisfy code coverage.
            let debug_fmt = format!("{:?}", s3_manager);
            assert!(debug_fmt.len() > 0);

            //test our clone trait to satisfy code coverage.
            let s3_manager_clone = s3_manager.clone();
            assert_eq!(s3_manager.bucket, s3_manager_clone.bucket);
        }

        #[tokio::test]
        async fn does_not_exist() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(false)))
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            assert!(s3_manager_result.is_err());
            let s3_manager = s3_manager_result.err().unwrap();
            let is_invalid: bool;
            match s3_manager {
                ConstructorError::BucketDoesNotExist(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected BucketDoesNotExist error");
                }
            }
            assert!(is_invalid);

            //test our Debug trait to satisfy code coverage.
            let debug_fmt = format!("{:?}", s3_manager);
            assert!(debug_fmt.len() > 0);
        }

        #[tokio::test]
        async fn unexpected_error() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| {
                    future!(Err(GlyphxErrorData::new(
                        format!("Error calling head_bucket for bucket"),
                        None,
                        None,
                    )))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            assert!(s3_manager_result.is_err());
            let s3_manager = s3_manager_result.err().unwrap();
            let is_invalid: bool;
            match s3_manager {
                ConstructorError::UnexpectedError(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected Unexpected error");
                }
            }
            assert!(is_invalid);
        }
    }

    #[cfg(test)]
    mod accessors {
        use super::*;

        #[tokio::test]
        async fn get_bucket_name() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            assert!(s3_manager_result.is_ok());

            let bucket_name = s3_manager_result.unwrap().get_bucket_name();
            assert_eq!(bucket_name, bucket);
        }

        #[tokio::test]
        async fn get_client() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            assert!(s3_manager_result.is_ok());

            let _client = s3_manager_result.unwrap().get_client();
        }
    }

    #[cfg(test)]
    mod bucket_exists {
        use super::*;

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(2);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            assert!(s3_manager_result.is_ok());
            let s3_manager = s3_manager_result.unwrap();

            let bucket_exists_result = s3_manager.bucket_exists().await;

            assert!(bucket_exists_result.is_ok());
        }

        #[tokio::test]
        async fn does_not_exist() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .times(1)
                .returning_st(|_, _| future!(Ok(true)));
            mock_ops
                .expect_bucket_exists_operation()
                .times(1)
                .returning_st(|_, _| future!(Ok(false)));
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();
            let bucket_exists_result = s3_manager.bucket_exists().await;

            assert!(bucket_exists_result.is_err());
            let bucket_exists = bucket_exists_result.err().unwrap();
            let is_invalid: bool;
            match bucket_exists {
                BucketExistsError::BucketDoesNotExist(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected BucketDoesNotExist error");
                }
            }
            assert!(is_invalid);

            //test our Debug trait to satisfy code coverage.
            let debug_fmt = format!("{:?}", bucket_exists);
            assert!(debug_fmt.len() > 0);
        }

        #[tokio::test]
        async fn unexpected_error() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .times(1)
                .returning(|_, _| future!(Ok(true)));

            mock_ops
                .expect_bucket_exists_operation()
                .times(1)
                .returning(move |_, _| {
                    future!(Err(GlyphxErrorData::new(
                        format!("Error calling head_bucket for bucket "),
                        None,
                        None,
                    )))
                });
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();
            let bucket_exists_result = s3_manager.bucket_exists().await;

            assert!(bucket_exists_result.is_err());
            let bucket_exists = bucket_exists_result.err().unwrap();
            let is_invalid: bool;
            match bucket_exists {
                BucketExistsError::UnexpectedError(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected Unexpected error");
                }
            }
            assert!(is_invalid);
        }
    }

    #[cfg(test)]
    mod file_exists {
        use super::*;

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);
            mock_ops
                .expect_file_exists_operation()
                .returning(|_, _, _| future!(Ok(true)))
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            assert!(s3_manager_result.is_ok());
            let s3_manager = s3_manager_result.unwrap();

            let file_exists_result = s3_manager.file_exists(&key).await;

            assert!(file_exists_result.is_ok());
        }

        #[tokio::test]
        async fn does_not_exist() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .times(1)
                .returning(|_, _| future!(Ok(true)));
            mock_ops
                .expect_file_exists_operation()
                .times(1)
                .returning(|_, _, _| future!(Ok(false)));
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();
            let file_exists_result = s3_manager.file_exists(&key).await;

            assert!(file_exists_result.is_err());
            let file_exists = file_exists_result.err().unwrap();
            let is_invalid: bool;
            match file_exists {
                FileExistsError::FileDoesNotExist(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected FileDoesNotExist error");
                }
            }
            assert!(is_invalid);

            //test our Debug trait to satisfy code coverage.
            let debug_fmt = format!("{:?}", file_exists);
            assert!(debug_fmt.len() > 0);
        }

        #[tokio::test]
        async fn unexpected_error() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .times(1)
                .returning(|_, _| future!(Ok(true)));
            mock_ops
                .expect_file_exists_operation()
                .times(1)
                .returning(|_, _, _| {
                    future!(Err(GlyphxErrorData::new(
                        format!("Error calling head_object for key "),
                        None,
                        None,
                    )))
                });
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();
            let file_exists_result = s3_manager.file_exists(&key).await;

            assert!(file_exists_result.is_err());
            let file_exists = file_exists_result.err().unwrap();
            let is_invalid: bool;
            match file_exists {
                FileExistsError::UnexpectedError(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected Unexpected error");
                }
            }
            assert!(is_invalid);
        }
    }

    #[cfg(test)]
    mod list_objects {
        use super::*;

        #[tokio::test]
        async fn return_10_keys() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_list_objects_operation()
                .returning(|_, _, _, _| {
                    let mut keys = Vec::new();
                    for i in 0..10 {
                        keys.push(format!("key-{}", i));
                    }
                    future!(Ok((keys, false)))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.list_objects(None, None).await;

            assert!(res.is_ok());
            let keys = res.unwrap();
            assert_eq!(keys.len(), 10);
        }

        #[tokio::test]
        async fn truncation() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_list_objects_operation()
                .returning(|_, _, _, _| {
                    let mut keys = Vec::new();
                    for i in 0..5 {
                        keys.push(format!("key-{}", i));
                    }
                    future!(Ok((keys, true)))
                })
                .times(1);

            mock_ops
                .expect_list_objects_operation()
                .returning(|_, _, _, _| {
                    let mut keys = Vec::new();
                    for i in 5..10 {
                        keys.push(format!("key-{}", i));
                    }
                    future!(Ok((keys, false)))
                })
                .withf(|_, _, _, start_after| {
                    start_after.is_some() && start_after.as_ref().unwrap() == "key-4"
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.list_objects(None, None).await;

            assert!(res.is_ok());
            let keys = res.unwrap();
            assert_eq!(keys.len(), 10);
        }

        #[tokio::test]
        async fn truncation_error() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_list_objects_operation()
                .returning(|_, _, _, _| {
                    let mut keys = Vec::new();
                    for i in 0..5 {
                        keys.push(format!("key-{}", i));
                    }
                    future!(Ok((keys, true)))
                })
                .times(1);

            mock_ops
                .expect_list_objects_operation()
                .returning(|_, _, _, _| {
                    future!(Err(ListObjectsError::UnexpectedError(
                        GlyphxErrorData::new("Error listing objects".to_string(), None, None),
                    )))
                })
                .withf(|_, _, _, start_after| {
                    start_after.is_some() && start_after.as_ref().unwrap() == "key-4"
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.list_objects(None, None).await;

            assert!(res.is_err());

            let is_invalid: bool;
            match res.err().unwrap() {
                ListObjectsError::UnexpectedError(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected Unexpected error");
                }
            }
            assert!(is_invalid);
        }

        #[tokio::test]
        async fn bucket_does_not_exist() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());

            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_list_objects_operation()
                .returning(|_, _, _, _| {
                    future!(Err(ListObjectsError::BucketDoesNotExist(
                        GlyphxErrorData::new(format!("Bucket does not exist"), None, None),
                    )))
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.list_objects(None, None).await;

            assert!(res.is_err());
            let err = res.err().unwrap();
            let is_invalid: bool;
            match err {
                ListObjectsError::BucketDoesNotExist(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected BucketDoesNotExist error");
                }
            }
            assert!(is_invalid);

            //format with debug to satisfy coverage
            let err_str = format!("{:?}", err);
            assert!(err_str.len() > 0);
        }

        #[tokio::test]
        async fn unexpected_error() {
            let bucket = "jps-test-bucket".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_list_objects_operation()
                .returning(|_, _, _, _| {
                    future!(Err(ListObjectsError::UnexpectedError(
                        GlyphxErrorData::new(
                            format!("Unexpected error listing objects in bucket "),
                            None,
                            None,
                        ),
                    )))
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;

            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.list_objects(None, None).await;

            assert!(res.is_err());
            let err = res.err().unwrap();
            let is_invalid: bool;
            match err {
                ListObjectsError::UnexpectedError(_) => {
                    is_invalid = true;
                }
                _ => {
                    panic!("Expected Unexpected error");
                }
            }
            assert!(is_invalid);
        }
    }

    #[cfg(test)]
    pub mod get_file_information {
        use super::*;
        use aws_sdk_s3::{
            error::SdkError,
            operation::head_object::{HeadObjectError, HeadObjectOutput},
            primitives::{DateTime, DateTimeFormat},
            types::error::NotFound,
        };
        use aws_smithy_runtime_api::http::{Response, StatusCode};
        use aws_smithy_types::{body::SdkBody, error::metadata::ErrorMetadata};

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let file_size = 6300;
            let modified_date =
                DateTime::from_str("1972-05-15T00:00:00Z", DateTimeFormat::DateTime).unwrap();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_file_information_operation()
                .returning(move |_, _, _| {
                    future!(Ok(HeadObjectOutput::builder()
                        .content_length(file_size.clone() as i64)
                        .last_modified(modified_date.clone())
                        .build()))
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_file_information(&key.clone()).await;
            assert!(res.is_ok());
            let file_info = res.unwrap();
            assert_eq!(file_info.file_size, file_size);
            assert_eq!(file_info.last_modified, modified_date);
            assert_eq!(file_info.file_name, key);
        }

        #[tokio::test]
        async fn bucket_does_not_exist() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_file_information_operation()
                .returning(move |_, _, _| {
                    let meta = ErrorMetadata::builder()
                        .message("an error has occurred")
                        .code("500")
                        .build();
                    let not_found = NotFound::builder().message("not found").meta(meta).build();
                    let err = HeadObjectError::NotFound(not_found);
                    let inner_status = http::StatusCode::from_u16(200).unwrap();
                    let mut inner = Response::new(StatusCode::from(inner_status), SdkBody::empty());
                    let headers = inner.headers_mut();
                    headers.insert(
                        "Content-Type",
                        http::HeaderValue::from_str("application/json").unwrap(),
                    );
                    future!(Err(SdkError::service_error(err, inner)))
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_file_information(&key.clone()).await;
            assert!(res.is_err());
            let is_not_found = match res.err().unwrap() {
                GetFileInformationError::KeyDoesNotExist(_) => true,
                _ => false,
            };
            assert!(is_not_found);
        }
    }

    #[cfg(test)]
    mod get_signed_upload_url {
        use super::*;
        use aws_sdk_s3::{error::SdkError, operation::put_object::PutObjectError};
        use aws_smithy_runtime_api::http::{Response, StatusCode};
        use aws_smithy_types::{body::SdkBody, error::metadata::ErrorMetadata};

        use http::Request;

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            //The underlying call to Request::builder() adds a trailing slash to the uri, so adding
            //when we define it will allow the asserts to pass.
            let uri = "https://www.example.com/".to_string();
            // we need to clone the uri because the mock_ops takes ownership of the uri
            // and we want to use it again in the assertion
            let url = uri.clone();
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_upload_url_operation()
                .returning(move |_, _, _, _, _| {
                    future!(Ok(Request::builder()
                        .method("PUT")
                        .uri(url.clone())
                        .body(String::from(""))
                        .unwrap()))
                })
                .withf(|_, _, _, expires_in, _| {
                    // 5 minutes the default
                    expires_in.as_secs() == 300
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_signed_upload_url(&key, None, None).await;
            assert!(res.is_ok());
            let url = res.unwrap();
            assert_eq!(url, uri);
        }

        #[tokio::test]
        async fn unhandled_error() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            //The underlying call to Request::builder() adds a trailing slash to the uri, so adding
            //when we define it will allow the asserts to pass.
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_upload_url_operation()
                .returning(move |_, _, _, _, _| {
                    let meta = ErrorMetadata::builder()
                        .message("an error has occurred")
                        .code("500")
                        .build();
                    let err = PutObjectError::generic(meta);
                    let inner_status = http::StatusCode::from_u16(200).unwrap();
                    let mut inner = Response::new(StatusCode::from(inner_status), SdkBody::empty());
                    let headers = inner.headers_mut();
                    headers.insert(
                        "Content-Type",
                        http::HeaderValue::from_str("application/json").unwrap(),
                    );
                    future!(Err(SdkError::service_error(err, inner)))
                })
                .times(1);

            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_signed_upload_url(&key, None, None).await;
            assert!(res.is_err());
            //It seems like we could just check to see if res.is_err() is true, but this pattern
            //will trip us up if someone adds an error type to GetSignedUploadUrlError.  In effect
            //if we add an error type then our test will pass for any error.  So this will make sure
            //that we are handling all of the error types.
            let is_unhandled = match res.err().unwrap() {
                GetSignedUploadUrlError::UnexpectedError(_) => true,
            };
            assert!(is_unhandled);
        }
    }

    #[cfg(test)]
    mod get_object_stream {
        use super::*;
        use aws_sdk_s3::{
            error::SdkError,
            operation::get_object::GetObjectOutput,
            types::error::{InvalidObjectState, NoSuchKey},
        };
        use aws_smithy_runtime_api::http::{Response, StatusCode};
        use aws_smithy_types::{body::SdkBody, error::metadata::ErrorMetadata};

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let file_contents = String::from("These are my test file contents");
            let file_contents_clone = file_contents.clone();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_object_stream_operation()
                .returning(move |_, _, _| {
                    let mut vec_u8 = Vec::new();
                    for byte in file_contents_clone.as_bytes() {
                        vec_u8.push(byte.clone());
                    }

                    future!(Ok(GetObjectOutput::builder()
                        .body(ByteStream::from(vec_u8))
                        .build()))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_object_stream(&key).await;
            assert!(res.is_ok());
            let stream = res.unwrap();

            let buf = stream.collect().await.unwrap().to_vec();

            let result = String::from_utf8(buf).unwrap();
            assert_eq!(result, file_contents);
        }

        #[tokio::test]
        async fn is_invalid_state_error() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_object_stream_operation()
                .returning(move |_, _, _| {
                    let meta = ErrorMetadata::builder()
                        .message("an error has occurred")
                        .code("500")
                        .build();
                    let invalid_state = InvalidObjectState::builder()
                        .message("an error has occurred")
                        .meta(meta)
                        .build();
                    let err = GetObjectError::InvalidObjectState(invalid_state);
                    let inner_status = http::StatusCode::from_u16(200).unwrap();
                    let mut inner = Response::new(StatusCode::from(inner_status), SdkBody::empty());
                    let headers = inner.headers_mut();
                    headers.insert(
                        "Content-Type",
                        http::HeaderValue::from_str("application/json").unwrap(),
                    );
                    future!(Err(SdkError::service_error(err, inner)))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_object_stream(&key).await;
            assert!(res.is_err());
            let is_invalid_state = match res.err().unwrap() {
                GetObjectStreamError::ObjectUnavailable(_) => true,
                _ => false,
            };
            assert!(is_invalid_state);
        }

        #[tokio::test]
        async fn is_object_not_found_error() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_object_stream_operation()
                .returning(move |_, _, _| {
                    let meta = ErrorMetadata::builder()
                        .message("an error has occurred")
                        .code("500")
                        .build();
                    let not_found = NoSuchKey::builder()
                        .message("an error has occurred")
                        .meta(meta)
                        .build();
                    let err = GetObjectError::NoSuchKey(not_found);
                    let inner_status = http::StatusCode::from_u16(200).unwrap();
                    let mut inner = Response::new(StatusCode::from(inner_status), SdkBody::empty());
                    let headers = inner.headers_mut();
                    headers.insert(
                        "Content-Type",
                        http::HeaderValue::from_str("application/json").unwrap(),
                    );
                    future!(Err(SdkError::service_error(err, inner)))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_object_stream(&key).await;
            assert!(res.is_err());
            let is_not_found = match res.err().unwrap() {
                GetObjectStreamError::KeyDoesNotExist(_) => true,
                _ => false,
            };
            assert!(is_not_found);
        }
    }

    #[cfg(test)]
    mod get_upload_stream {
        use super::*;
        use aws_sdk_s3::operation::delete_object::DeleteObjectOutput;

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_upload_stream_operation()
                .returning(|client, _, _| future!(Ok(UploadStream::empty(client.clone()))))
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_upload_stream(&key).await;
            assert!(res.is_ok());
        }

        #[tokio::test]
        async fn is_unexpected_error() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_get_upload_stream_operation()
                .returning(|_, _, _| {
                    future!(Err(UploadStreamConstructorError::UnexpectedError(
                        GlyphxErrorData::new(
                            "an error has occurred".to_string(),
                            Some(json!({"foo": "bar"})),
                            None,
                        ),
                    )))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.get_upload_stream(&key).await;
            assert!(res.is_err());
            let is_unexpected = match res.as_ref().err().unwrap() {
                GetUploadStreamError::UnexpectedError(_) => true,
            };
            assert!(is_unexpected);
        }
    }

    #[cfg(test)]
    mod remove_object {
        use super::*;
        use aws_sdk_s3::{
            error::SdkError,
            operation::delete_object::{DeleteObjectError, DeleteObjectOutput},
        };
        use aws_smithy_runtime_api::http::{Response, StatusCode};
        use aws_smithy_types::{body::SdkBody, error::metadata::ErrorMetadata};

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_remove_object_operation()
                .returning(|_, _, _| future!(Ok(DeleteObjectOutput::builder().build())))
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.remove_object(&key).await;
            assert!(res.is_ok());
        }

        #[tokio::test]
        async fn is_unexpected_error() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_remove_object_operation()
                .returning(|_, _, _| {
                    let meta = ErrorMetadata::builder()
                        .message("an error has occurred")
                        .code("500")
                        .build();
                    let err = DeleteObjectError::generic(meta);
                    let inner_status = http::StatusCode::from_u16(200).unwrap();
                    let mut inner = Response::new(StatusCode::from(inner_status), SdkBody::empty());
                    let headers = inner.headers_mut();
                    headers.insert(
                        "Content-Type",
                        http::HeaderValue::from_str("application/json").unwrap(),
                    );
                    future!(Err(SdkError::service_error(err, inner)))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.remove_object(&key).await;
            assert!(res.is_err());
            let is_unexpected = match res.as_ref().err().unwrap() {
                RemoveObjectError::UnexpectedError(_) => true,
            };
            assert!(is_unexpected);
        }
    }

    #[cfg(test)]
    mod upload_object {
        use super::*;
        use aws_sdk_s3::{
            error::SdkError,
            operation::put_object::{PutObjectError, PutObjectOutput},
        };
        use aws_smithy_runtime_api::http::{Response, StatusCode};
        use aws_smithy_types::{body::SdkBody, error::metadata::ErrorMetadata};

        #[tokio::test]
        async fn is_ok() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let bytes = vec![0, 1, 2, 3, 4];
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_put_object_operation()
                .returning(|_, _, _, _, _| future!(Ok(PutObjectOutput::builder().build())))
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.upload_object(&key, bytes, None).await;
            assert!(res.is_ok());
        }

        #[tokio::test]
        async fn is_unexpected_error() {
            let bucket = "jps-test-bucket".to_string();
            let key = "jps-test-key".to_string();
            let bytes = vec![0, 1, 2, 3, 4];
            let mut mock_ops = Box::new(MockS3ManagerOps::new());
            mock_ops
                .expect_bucket_exists_operation()
                .returning(|_, _| future!(Ok(true)))
                .times(1);

            mock_ops
                .expect_put_object_operation()
                .returning(|_, _, _, _, _| {
                    let meta = ErrorMetadata::builder()
                        .message("an error has occurred")
                        .code("500")
                        .build();
                    let err = PutObjectError::generic(meta);
                    let inner_status = http::StatusCode::from_u16(200).unwrap();
                    let mut inner = Response::new(StatusCode::from(inner_status), SdkBody::empty());
                    let headers = inner.headers_mut();
                    headers.insert(
                        "Content-Type",
                        http::HeaderValue::from_str("application/json").unwrap(),
                    );
                    future!(Err(SdkError::service_error(err, inner)))
                })
                .times(1);
            let options = S3ManagerContructorOptionsBuilder::default()
                .bucket(&bucket)
                .dependencies(mock_ops)
                .build()
                .unwrap();
            let s3_manager_result = S3Manager::new(options).await;
            let s3_manager = s3_manager_result.unwrap();

            let res = s3_manager.upload_object(&key, bytes, None).await;
            assert!(res.is_err());
            let is_unexpected = match res.as_ref().err().unwrap() {
                UploadObjectError::UnexpectedError(_) => true,
            };
            assert!(is_unexpected);
        }
    }
}
