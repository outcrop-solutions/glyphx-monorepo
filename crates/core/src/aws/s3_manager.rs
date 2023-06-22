use crate::error::GlyphxErrorData;
use async_trait::async_trait;
use async_recursion::async_recursion;
use mockall::*; 

use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::{
    operation::get_object::GetObjectError, presigning::PresigningConfig, primitives::DateTime,
    Client as S3Client,
};
use log::warn;
use serde_json::json;
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

pub enum GetObjectStreamError {
    ObjectUnavailable(GlyphxErrorData),
    KeyDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[automock]
#[async_trait]
trait S3ManagerOps {
async fn bucket_exists_operation(
        &self,
        client: &S3Client,
        bucket: &str,
    ) -> Result<bool, GlyphxErrorData>;

async fn list_objects_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        filter: Option<String>,
        start_after: Option<String>,
    ) -> Result<(Vec<String>, bool), ListObjectsError> ;
}

struct S3ManagerOpsImpl;

#[async_trait]
impl S3ManagerOps for S3ManagerOpsImpl {
    /// Our private bucket_exists_operation function that will return a boolean if the bucket
    /// exists and false if it does not.  This can be used by any function which wants
    /// to determine whether or not a bucket exists.  This operation actaully makes the call to
    /// S3.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    async fn bucket_exists_operation(
        &self,
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

    /// Our private list_objects_operation function that will return a vector of keys and a boolean
    /// indicating whether or not the result is truncated.  This can be used by any function which wants
    /// to list objects in a bucket.  This operation actaully makes the call to S3.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `filter` - An optional String that represents a filter to apply to the list.
    /// * `start_after` - An optional String that represents a key to start listing after.
    async fn list_objects_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        filter: Option<String>,
        start_after: Option<String>,
    ) -> Result<(Vec<String>, bool), ListObjectsError> {
        let mut res = client.list_objects_v2().bucket(bucket);
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
                    let msg = e.meta().to_string();
                    return Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                        msg,
                        Some(json!({ "bucket_name": bucket })),
                        None,
                    )));
                }
            }
        }
    }
}

impl S3Manager {
    /// Our public new function that will return an S3Manager.  This uses our new_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the new logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    pub async fn new(bucket: String) -> Result<Self, ConstructorError> {
        Self::new_impl(bucket, &S3ManagerOpsImpl{})
        .await
    }

    /// A Get accesor for the bucket name.  This is just a simple getter. It is probably
    /// most usefull when debugging to keep track of which bucket we are operating on.
    pub fn get_bucket_name(&self) -> String {
        self.bucket.clone()
    }

    /// A Get accesor for the S3Client.  This is just a simple getter. It is probably
    /// most usefull when testing to get access to the S3Client we have instantiated for.
    /// aws calls.
    pub fn get_client(&self) -> S3Client {
        self.client.clone()
    }

    /// Our public bucket_exists function that will return a bool.  This uses our bucket_exists_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the bucket_exists logic with no down stream effects.  This function just wraps our impl call.
    pub async fn bucket_exists(&self) -> Result<bool, BucketExistsError> {
        self.bucket_exists_impl( &S3ManagerOpsImpl{})
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
        self.list_objects_impl(
            filter,
            None,
            &S3ManagerOpsImpl{},
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
        content_type: Option<&str>,
    ) -> Result<String, GetSignedUploadUrlError> {
        Self::get_signed_upload_url_operation(&self.client, &self.bucket, key, content_type, None)
            .await
    }

    pub async fn get_object_stream(
        &self,
        key: &str,
    ) -> Result<ByteStream, GetObjectStreamError> {
        Self::get_object_stream_operation(&self.client, &self.bucket, key).await
    }

    /// Our private new_impl function that will return an S3Manager.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `aws_operation` - A function that takes an S3Client and a String and returns a Future<bool>.
    /// This function will make the actual call to the S3Client to see if the bucket exists.
    async fn new_impl<T: S3ManagerOps>(bucket: String, aws_operations: &T) -> Result<Self, ConstructorError>
    {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let result = aws_operations.bucket_exists_operation(&client, &bucket).await;
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
    async fn bucket_exists_impl< T : S3ManagerOps>(
        &self,
        aws_operations: &T,
    ) -> Result<bool, BucketExistsError>
    {
        let result = aws_operations.bucket_exists_operation(&self.client, &self.bucket).await;
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
    async fn list_objects_impl<T: S3ManagerOps + std::marker::Send + std::marker::Sync>(
        &self,
        filter: Option<String>,
        start_after: Option<String>,
        aws_operations: &T ,
    ) -> Result<Vec<String>, ListObjectsError>
    {
        let res = aws_operations.list_objects_operation(
            &self.client,
            &self.bucket,
            filter.clone(),
            start_after.clone()
        )
        .await;
        match res {
            Ok((mut keys, truncated)) => {
                if truncated {
                    let last_key = keys.last().unwrap().clone();
                    let res = self.list_objects_impl(
                        filter.clone(),
                        Some(last_key),
                        aws_operations,
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

    async fn get_object_stream_operation(
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<ByteStream, GetObjectStreamError> {
        let res = client.get_object().bucket(bucket).key(key).send().await;
        match res {
            Ok(result) => {
                return Ok(result.body);
            }
            Err(e) => {
                let e = e.into_service_error();
                match e {
                    GetObjectError::InvalidObjectState(_) => {
                        return Err(GetObjectStreamError::ObjectUnavailable(GlyphxErrorData::new(
                            format!("The object {} exists on the bucket {}, but is archived and cannot be accessed", key, bucket),
                            Some(json!({ "bucket_name": bucket, "key" : key })),
                            None,
                        )));
                    }
                    GetObjectError::NoSuchKey(_) => {
                        return Err(GetObjectStreamError::KeyDoesNotExist(GlyphxErrorData::new(
                            format!("The object {} does not exist on the bucket {}", key, bucket),
                            Some(json!({ "bucket_name": bucket, "key" : key })),
                            None,
                        )));
                    }

                    GetObjectError::Unhandled(unhandled) => {
                        let msg = unhandled.to_string();
                        let data = json!({ "bucket_name": bucket, "key" : key });
                        return Err(GetObjectStreamError::UnexpectedError(GlyphxErrorData::new(
                            msg,
                            Some(data),
                            None,
                        )));
                    }
                    _ => {
                        let msg = e.meta().message().unwrap().to_string();
                        let data = json!({ "bucket_name": bucket, "key" : key });
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
}

#[cfg(test)]
mod constructor {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();

        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);

        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(false) }).times(1);
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Err(GlyphxErrorData::new(
                    format!("Error calling head_bucket for bucket"),
                    None,
                    None,
                )) }).times(1);
        let s3_manager_result =
            S3Manager::new_impl(bucket.clone(), &mock_ops)
            .await;
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;
        assert!(s3_manager_result.is_ok());

        let bucket_name = s3_manager_result.ok().unwrap().get_bucket_name();
        assert_eq!(bucket_name, bucket);
    }

    #[tokio::test]
    async fn get_client() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;
        assert!(s3_manager_result.is_ok());

        let _client = s3_manager_result.ok().unwrap().get_client();
    
    }
}

#[cfg(test)]
mod bucket_exists {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(2);
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;
        assert!(s3_manager_result.is_ok());
        let s3_manager = s3_manager_result.ok().unwrap();

        let bucket_exists_result = s3_manager.bucket_exists_impl(
            &mock_ops
        )
        .await;

        assert!(bucket_exists_result.is_ok());
        let bucket_exists = bucket_exists_result.ok().unwrap();
        assert!(bucket_exists);
    }

    #[tokio::test]
    async fn does_not_exist() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().times(1).returning(|_, _| { Ok(true) });
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;

        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().times(1).returning(|_, _| { Ok(false) });
        let s3_manager = s3_manager_result.ok().unwrap();
        let bucket_exists_result = s3_manager.bucket_exists_impl(
            &mock_ops
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().times(1).returning(|_, _| { Ok(true) });
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().times(1).returning(|_, _| { Err(GlyphxErrorData::new(
                    format!("Error calling head_bucket for bucket "),
                    None,
                    None,
                )) });
        let bucket_exists_result = s3_manager.bucket_exists_impl(
            &mock_ops
        )
        .await;

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
mod list_objects {
    use super::*;

    #[tokio::test]
    async fn return_10_keys() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);
       
        mock_ops.expect_list_objects_operation().returning(|_, _, _, _| {
            let mut keys = Vec::new();
            for i in 0..10 {
                keys.push(format!("key-{}", i));
            }
            Ok((keys, false))
        }).times(1);
        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;
       
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(
            None,
            None,
            &mock_ops            
        )
        .await;

        assert!(res.is_ok());
        let keys = res.unwrap();
        assert_eq!(keys.len(), 10);
    }

    #[tokio::test]
    async fn truncation() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);
        
        mock_ops.expect_list_objects_operation().returning(|_, _, _, _| {
            let mut keys = Vec::new();
            for i in 0..5 {
                keys.push(format!("key-{}", i));
            }
            Ok((keys, true))
        }).times(1);

        mock_ops.expect_list_objects_operation().returning(|_, _, _, _| {
            let mut keys = Vec::new();
            for i in 5..10 {
                keys.push(format!("key-{}", i));
            }
            Ok((keys, false))
        }).withf(|_, _, _, start_after| {
            start_after.is_some() && start_after.as_ref().unwrap() == "key-4"
        }).times(1);

        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(
            None,
            None,
            &mock_ops
        )
        .await;

        assert!(res.is_ok());
        let keys = res.unwrap();
        assert_eq!(keys.len(), 10);
    }

    #[tokio::test]
    async fn truncation_error() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);

        mock_ops.expect_list_objects_operation().returning(|_, _, _, _| {
            let mut keys = Vec::new();
            for i in 0..5 {
                keys.push(format!("key-{}", i));
            }
            Ok((keys, true))
        }).times(1);

        mock_ops.expect_list_objects_operation().returning(|_, _, _, _| {
          
                Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                    "Error listing objects".to_string(),
                    None,
                    None,
                )))
            })
            .withf(|_, _, _, start_after| {
                start_after.is_some() && start_after.as_ref().unwrap() == "key-4"
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(
            None,
            None,
            &mock_ops
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);

        mock_ops.expect_list_objects_operation().returning(|_, _, _, _| {
                Err(ListObjectsError::BucketDoesNotExist(GlyphxErrorData::new(
                    format!("Bucket does not exist"),
                    None,
                    None,)))
        }).times(1);

        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(
            None,
            None,
            &mock_ops
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops.expect_bucket_exists_operation().returning(|_, _| { Ok(true) }).times(1);


        mock_ops.expect_list_objects_operation().returning(|_, _, _, _| {
Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                    format!("Unexpected error listing objects in bucket "),
                    None,
                    None,
                )))
        }).times(1);

        let s3_manager_result = S3Manager::new_impl(
            bucket.clone(),
            &mock_ops
        )
        .await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(
            None,
            None,
            &mock_ops
        )
        .await;

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
