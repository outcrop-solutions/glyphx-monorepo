use crate::error::GlyphxErrorData;
use async_recursion::async_recursion;
use aws_sdk_s3::{presigning::PresigningConfig, primitives::DateTime, Client as S3Client};
use log::warn;
use serde_json::json;
use std::future::Future;
use std::time::Duration;

#[derive(Debug)]
pub struct S3FileInfo {
    pub file_name: String,
    pub file_size: i64,
    pub last_modified: DateTime,
}

#[derive(Clone, Debug)]
pub struct S3Manager {
    client: S3Client,
    bucket: String,
}

#[derive(Debug)]
pub enum ConstructorError {
    BucketDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug)]
pub enum BucketExistsError {
    BucketDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug)]
pub enum ListObjectsError {
    BucketDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug)]
pub enum GetFileInformationError {
    KeyDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug)]
pub enum GetSignedUploadUrlError {
    UnexpectedError(GlyphxErrorData),
}

impl S3Manager {
    /// Our public new function that will return an S3Manager.  This uses our new_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the new logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    pub async fn new(bucket: String) -> Result<Self, ConstructorError> {
        Self::new_impl(bucket, |s3_client, bucket| async move {
            Self::bucket_exists_operation(&s3_client, &bucket).await
        })
        .await
    }

    /// A Get accesor for the bucket name.  This is just a simple getter. It is probably
    /// most usefull when debugging to keep track of which bucket we are operating on.
    pub fn get_bucket_name(&self) -> String {
        self.bucket.clone()
    }

    /// Our public bucket_exists function that will return a bool.  This uses our bucket_exists_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the bucket_exists logic with no down stream effects.  This function just wraps our impl call.
    pub async fn bucket_exists(&self) -> Result<bool, BucketExistsError> {
        Self::bucket_exists_impl(self.client.clone(), self.bucket.clone(),  |s3_client, bucket| async move {
            Self::bucket_exists_operation(&s3_client, &bucket).await
        })
        .await
    }

    /// Our public list_objects function that will return a Vec<String> of all of the keys in a bucket.
    /// This uses our list_objects_impl function which uses dependency injection to inject the calls to S3.
    /// In this manner, we can fully test the list_objects logic with no down stream effects.  
    /// This function just wraps our impl call.
    /// # Arguments
    /// * `filter` - An Option<String> that represents a filter that we want to apply to the list_objects call.
    pub async fn list_objects(
        &self,
        filter: Option<String>,
    ) -> Result<Vec<String>, ListObjectsError> {
        Self::list_objects_impl(
            self.client.clone(),
            self.bucket.clone(),
            filter,
            None,
            |s3_client, bucket, filter, start_after| async move {
                Self::list_objects_operation(s3_client, bucket, filter, start_after).await
            },
        )
        .await
    }

    pub async fn get_file_information(
        &self,
        key: String,
    ) -> Result<S3FileInfo, GetFileInformationError> {
        Self::get_file_information_operation(&self.client, &self.bucket, key.as_str()).await
    }

    pub async fn get_signed_upload_url(
        &self,
        key: &str,
        content_type: Option<&str>
    ) -> Result<String, GetSignedUploadUrlError> {
        Self::get_signed_upload_url_operation(&self.client, &self.bucket, key, content_type, None ).await
    }
    /// Our private new_impl function that will return an S3Manager.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `aws_operation` - A function that takes an S3Client and a String and returns a Future<bool>.
    /// This function will make the actual call to the S3Client to see if the bucket exists.
    async fn new_impl<T, Fut>(bucket: String, aws_operation: T) -> Result<Self, ConstructorError>
    where
        T: FnOnce(S3Client, String) -> Fut + Send + Sync,
        Fut: Future<Output = Result<bool, GlyphxErrorData>> + Send,
    {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let result = aws_operation(client.clone(), bucket.clone()).await;
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
                return Err(ConstructorError::UnexpectedError(e));
            }
        };
        let s3_manager = Self {
            client,
            bucket: bucket.clone(),
        };
        Ok(s3_manager)
    }
    ///Our private bucket_exists_operation function that will return a bool indicating if the bucket exists.
    ///This function takes an aws_operation function that will be used to make the actual call to S3.
    ///This will allow us to inject the call to S3 so that we can fully test this function.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `aws_operation` - A function that takes an S3Client and a String and returns a Future<bool>.
    async fn bucket_exists_impl<T, Fut>(
        client: S3Client,
        bucket: String,
        aws_operation: T,
    ) -> Result<bool, BucketExistsError>
    where
        T: FnOnce(S3Client, String) -> Fut + Send + Sync,
        Fut: Future<Output = Result<bool, GlyphxErrorData>> + Send,
    {
        let result = aws_operation(client.clone(), bucket.clone()).await;
        match result {
            Ok(exists) => {
                if !exists {
                    return Err(BucketExistsError::BucketDoesNotExist(GlyphxErrorData::new(
                        format!("Bucket {} does not exist", bucket),
                        Some(json!({ "bucket_name": bucket })),
                        None,
                    )));
                }
            }
            Err(e) => {
                return Err(BucketExistsError::UnexpectedError(e));
            }
        };
        Ok(true)
    }

    #[async_recursion]
    ///Our internal implimentation of list objects.  This version takes an aws_func which will make
    ///the actual call to S3.  This allows us to inject our own function for testing.
    ///This function will call the aws_func and if the result is truncated, it will call itself
    ///with the last key as the start_after parameter.  It will then append the results of the
    ///recursive call to the results of the original call and return the results.
    ///If the aws_func returns an error, it will return the error.
    ///# Arguments
    ///* `client` - The S3Client to use for the call
    ///* `bucket` - The bucket to list objects from
    ///* `filter` - An optional filter to apply to the list
    ///* `start_after` - An optional key to start listing after -- this is used in our recursive
    ///calls to keep track of our place.
    ///* `aws_operation` - A closure that performs the interaction with S3.
    async fn list_objects_impl<T, Fut>(
        client: S3Client,
        bucket: String,
        filter: Option<String>,
        start_after: Option<String>,
        aws_operation: T,
    ) -> Result<Vec<String>, ListObjectsError>
    where
        T: FnOnce(S3Client, String, Option<String>, Option<String>) -> Fut + Send + Sync + Copy,
        Fut: Future<Output = Result<(Vec<String>, bool), ListObjectsError>> + Send,
    {
        let res = aws_operation(
            client.clone(),
            bucket.clone(),
            filter.clone(),
            start_after.clone(),
        )
        .await;
        match res {
            Ok((mut keys, truncated)) => {
                if truncated {
                    let last_key = keys.last().unwrap().clone();
                    let res = Self::list_objects_impl(
                        client.clone(),
                        bucket.clone(),
                        filter.clone(),
                        Some(last_key),
                        aws_operation,
                    )
                    .await;
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

    /// Our private bucket_exists_operation function that will return a boolean if the bucket
    /// exists and false if it does not.  This can be used by any function which wants
    /// to determine whether or not a bucket exists.  This operation actaully makes the call to
    /// S3.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    async fn bucket_exists_operation(
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

    /// Our private get_file_information_operation function that will return an S3FileInfo if the
    /// file exists and a GetFileInformationErrorif it does not.  This operation actaully makes the call to S3.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `key` - A String that represents the filename to get the information for.
    async fn get_file_information_operation(
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<S3FileInfo, GetFileInformationError> {
        let head_result = client.head_object().bucket(bucket).key(key).send().await;
        if head_result.is_err() {
            let e = head_result.err().unwrap();
            let e = e.into_service_error();
            if e.is_not_found() {
                return Err(GetFileInformationError::KeyDoesNotExist(
                    GlyphxErrorData::new(
                        String::from(format!(
                            "The file {} does not exist on the bucket {}",
                            key.clone(),
                            bucket.clone()
                        )),
                        Some(serde_json::json!({"Bucket": bucket, "Key": key})),
                        None,
                    ),
                ));
            } else {
                let msg = e.meta().message().unwrap().to_string();
                let data = json!({ "bucket_name": bucket, "key" : key });
                warn!(
                    "Error calling head_object for bucket {}, key {}, error : {} ",
                    bucket, key, e
                );
                Err(GetFileInformationError::UnexpectedError(
                    GlyphxErrorData::new(msg, Some(data), None),
                ))
            }
        } else {
            let info = head_result.unwrap();
            let dt = info.last_modified().unwrap();
            let size = info.content_length();
            Ok(S3FileInfo {
                file_name: key.to_string(),
                file_size: size,
                last_modified: dt.to_owned(),
            })
        }
    }

    /// Our private list_objects_operation function that will return a vector of keys and a boolean
    /// indicating whether or not the result is truncated.  This can be used by any function which wants
    /// to list objects in a bucket.  This operation actaully makes the call to S3.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `filter` - An optional String that represents a filter to apply to the list.
    /// * `start_after` - An optional String that represents a key to start listing after.
    async fn list_objects_operation(
        client: S3Client,
        bucket: String,
        filter: Option<String>,
        start_after: Option<String>,
    ) -> Result<(Vec<String>, bool), ListObjectsError> {
        let mut res = client.list_objects_v2().bucket(bucket.clone());
        if filter.is_some() {
            res = res.prefix(filter.clone().unwrap());
        }

        if start_after.is_some() {
            res = res.start_after(start_after.unwrap());
        }
        let res = res.send().await;
        match res {
            Ok(result) => {
                let truncated = result.is_truncated();
                let mut keys = Vec::new();
                if let Some(contents) = result.contents {
                    for content in contents {
                        if let Some(key) = content.key {
                            keys.push(key);
                        }
                    }
                }
                return Ok((keys, truncated));
            }
            Err(e) => {
                let e = e.into_service_error();
                if e.is_no_such_bucket() {
                    return Err(ListObjectsError::BucketDoesNotExist(GlyphxErrorData::new(
                        format!("Bucket {} does not exist", bucket.clone()),
                        Some(json!({ "bucket_name": bucket.clone() })),
                        None,
                    )));
                } else {
                    return Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                        format!("Unexpected error listing objects in bucket {}", bucket),
                        Some(json!({ "bucket_name": bucket })),
                        None,
                    )));
                }
            }
        }
    }

    async fn get_signed_upload_url_operation(
        client: &S3Client,
        bucket: &str,
        key: &str,
        content_type: Option<&str>,
        lifetime: Option<u64>,
    ) -> Result<String, GetSignedUploadUrlError> {
        let expires_in = match lifetime {
            Some(lifetime) => Duration::from_secs(lifetime),
            None => Duration::from_secs(60 * 5), // 5 minutes
        };

        let mut op = client.put_object().bucket(bucket).key(key);
        if content_type.is_some() {
            op = op.content_type(content_type.unwrap());
        }

        let res = op
            .presigned(PresigningConfig::expires_in(expires_in).unwrap())
            .await;
        match res {
            Ok(url) => {
                return Ok(url.uri().to_string());
            }
            Err(e) => {
                let e = e.into_service_error();
                let msg = e.meta().message().unwrap().to_string();
                let data = json!({ "bucket_name": bucket, "key" : key });
                return Err(GetSignedUploadUrlError::UnexpectedError(
                    GlyphxErrorData::new(msg, Some(data), None),
                ));
            }
        }
    }
}

#[cfg(test)]
mod constructor {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;
        assert!(s3_manager_result.is_ok());
        let s3_manager = s3_manager_result.ok().unwrap();
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
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(false) },
        )
        .await;
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
        let s3_manager_result =
            S3Manager::new_impl(bucket.clone(), |_client, _bucket_name| async move {
                Err(GlyphxErrorData::new(
                    format!("Error calling head_bucket for bucket {}", bucket),
                    Some(json!({ "bucket_name": bucket })),
                    None,
                ))
            })
            .await;
        assert!(s3_manager_result.is_err());
        let s3_manager = s3_manager_result.err().unwrap();
        let is_invalid: bool;
        match s3_manager {
            ConstructorError::UnexpectedError(e) => {
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
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;
        assert!(s3_manager_result.is_ok());

        let bucket_name = s3_manager_result.ok().unwrap().get_bucket_name();
    }
}

#[cfg(test)]
mod bucket_exists {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;
        assert!(s3_manager_result.is_ok());
        let s3_manager = s3_manager_result.ok().unwrap();

        let bucket_exists_result = S3Manager::bucket_exists_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            |client, bucket| async move { Ok(true) },
        )
        .await;

        assert!(bucket_exists_result.is_ok());
        let bucket_exists = bucket_exists_result.ok().unwrap();
        assert!(bucket_exists);
    }

    #[tokio::test]
    async fn does_not_exist() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();
        let bucket_exists_result = S3Manager::bucket_exists_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            |client, bucket| async move { Ok(false) },
        )
        .await;

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
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();
        let bucket_exists_result = S3Manager::bucket_exists_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            |client, bucket| async move {
                Err(GlyphxErrorData::new(
                    format!("Error calling head_bucket for bucket {}", bucket),
                    Some(json!({ "bucket_name": bucket })),
                    None,
                ))
            },
        )
        .await;

        assert!(bucket_exists_result.is_err());
        let bucket_exists = bucket_exists_result.err().unwrap();
        let is_invalid: bool;
        match bucket_exists {
            BucketExistsError::UnexpectedError(e) => {
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
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = S3Manager::list_objects_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            None,
            None,
            |_client, _bucket, _filter, _start_after| async move {
                let mut keys = Vec::new();
                for i in 0..10 {
                    keys.push(format!("key-{}", i));
                }
                Ok((keys, false))
            },
        )
        .await;

        assert!(res.is_ok());
        let keys = res.unwrap();
        assert_eq!(keys.len(), 10);
    }

    #[tokio::test]
    async fn truncation() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        static mut CALL_COUNT: u32 = 0;
        let res = S3Manager::list_objects_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            None,
            None,
            |_client, _bucket, _filter, _start_after| async move {
                unsafe {
                    CALL_COUNT += 1;
                    let mut keys = Vec::new();
                    if CALL_COUNT == 1 {
                        for i in 0..5 {
                            keys.push(format!("key-{}", i));
                        }
                        Ok((keys, true))
                    } else {
                        for i in 5..10 {
                            let start_after = _start_after.clone();
                            assert_eq!(start_after.unwrap(), format!("key-{}", 4));
                            keys.push(format!("key-{}", i));
                        }
                        Ok((keys, false))
                    }
                }
            },
        )
        .await;

        assert!(res.is_ok());
        let keys = res.unwrap();
        assert_eq!(keys.len(), 10);
        unsafe {
            assert_eq!(CALL_COUNT, 2);
        }
    }

    #[tokio::test]
    async fn truncation_error() {
        let bucket = "jps-test-bucket".to_string();
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        static mut CALL_COUNT: u32 = 0;
        let res = S3Manager::list_objects_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            None,
            None,
            |_client, _bucket, _filter, _start_after| async move {
                unsafe {
                    CALL_COUNT += 1;
                    let mut keys = Vec::new();
                    if CALL_COUNT == 1 {
                        for i in 0..5 {
                            keys.push(format!("key-{}", i));
                        }
                        Ok((keys, true))
                    } else {
                        Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                            "Error listing objects".to_string(),
                            None,
                            None,
                        )))
                    }
                }
            },
        )
        .await;

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
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = S3Manager::list_objects_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            None,
            None,
            |_client, _bucket, _filter, _start_after| async move {
                Err(ListObjectsError::BucketDoesNotExist(GlyphxErrorData::new(
                    format!("Bucket {} does not exist", _bucket.clone()),
                    Some(json!({ "bucket_name": _bucket.clone() })),
                    None,
                )))
            },
        )
        .await;

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
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            |_client, _bucket_name| async move { Ok(true) },
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = S3Manager::list_objects_impl(
            s3_manager.client.clone(),
            s3_manager.bucket.clone(),
            None,
            None,
            |_client, bucket, _filter, _start_after| async move {
                return Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                    format!("Unexpected error listing objects in bucket {}", bucket),
                    Some(json!({ "bucket_name": bucket })),
                    None,
                )));
            },
        )
        .await;

        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_invalid: bool;
        match err {
            ListObjectsError::UnexpectedError(e) => {
                is_invalid = true;
            }
            _ => {
                panic!("Expected Unexpected error");
            }
        }
        assert!(is_invalid);
    }
}
