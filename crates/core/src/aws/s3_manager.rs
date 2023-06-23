///! This module holds the S3Manager structure which is used to interact with S3.
use crate::error::GlyphxErrorData;
use async_recursion::async_recursion;
use async_trait::async_trait;
use mockall::*;

use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::{presigning::PresigningConfig, Client as S3Client};

use aws_sdk_s3::error::SdkError;
use aws_sdk_s3::operation::delete_object::{DeleteObjectError, DeleteObjectOutput};
use aws_sdk_s3::operation::get_object::{GetObjectError, GetObjectOutput};
use aws_sdk_s3::operation::head_object::{HeadObjectError, HeadObjectOutput};
use aws_sdk_s3::operation::put_object::PutObjectError;

use super::types::s3_manager::*;
use super::upload_stream::*;
use http::Request;
use log::warn;
use serde_json::json;
use std::time::Duration;

/// Our S3Manager structure which wraps the AWS S3 api and exposes all of the functions that we need to interact with S3.
#[derive(Clone, Debug)]
pub struct S3Manager {
    client: S3Client,
    bucket: String,
}

/// this API wrapper uses our impl pattern.  As part of that pattern, we use dependency injection
/// to inject our third party/external functions. This pattern allows us to mock those functions
/// for more efficient and complete unit testing.  This trait defines the functions that
/// can be mocked.
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
    ) -> Result<(Vec<String>, bool), ListObjectsError>;

    async fn get_file_information_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<HeadObjectOutput, SdkError<HeadObjectError>>;

    async fn get_upload_url_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
        expires_in: Duration,
        content_type: Option<String>,
    ) -> Result<Request<String>, SdkError<PutObjectError>>;
    async fn get_object_stream_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<GetObjectOutput, SdkError<GetObjectError>>;

    async fn get_upload_stream_operation(
        &self,
        client: &S3Client,
        bucket_name: &str,
        key: &str,
    ) -> Result<UploadStream, UploadStreamConstructorError>;

    async fn remove_object_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<DeleteObjectOutput, SdkError<DeleteObjectError>>;
}

///Our internal/production implementation of the S3ManagerOps trait.
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

    ///Will handle the calls to head_object to get S3 infromation about a file.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `key` - A String that represents the key of the file that we want to get information about.
    async fn get_file_information_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<HeadObjectOutput, SdkError<HeadObjectError>> {
        client.head_object().bucket(bucket).key(key).send().await
    }

    ///Will handle the calls to put_object to get a presigned url for uploading a file.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `key` - A String that represents the key of the file that we want to get information about.
    /// * `expires_in` - A Duration that represents how long the presigned url will be valid for
    /// * `content_type` - An optional String that represents the content type of the file that we want to upload.
    async fn get_upload_url_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
        expires_in: Duration,
        content_type: Option<String>,
    ) -> Result<Request<String>, SdkError<PutObjectError>> {
        let mut op = client.put_object().bucket(bucket).key(key);
        if content_type.is_some() {
            op = op.content_type(content_type.unwrap());
        }

        let result = op
            .presigned(PresigningConfig::expires_in(expires_in).unwrap())
            .await;
        match result {
            Ok(request) => Ok(request.to_http_request(String::from("")).unwrap()),
            Err(e) => Err(e),
        }
    }
    /// Will handle the calls to get_object to get the ByteStream from aws.
    async fn get_object_stream_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<GetObjectOutput, SdkError<GetObjectError>> {
        client.get_object().bucket(bucket).key(key).send().await
    }

    ///Makes the call to the UploadConstructor::new to get a new UploadStream.
    async fn get_upload_stream_operation(
        &self,
        client: &S3Client,
        bucket_name: &str,
        key: &str,
    ) -> Result<UploadStream, UploadStreamConstructorError> {
        UploadStream::new(bucket_name, key, client.clone()).await
    }

    ///Will handle the calls to delete_object to delete an object from S3.
    async fn remove_object_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<DeleteObjectOutput, SdkError<DeleteObjectError>> {
        client.delete_object().bucket(bucket).key(key).send().await
    }
}

impl S3Manager {
    /// Our public new function that will return an S3Manager.  This uses our new_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the new logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    pub async fn new(bucket: String) -> Result<Self, ConstructorError> {
        Self::new_impl(bucket, &S3ManagerOpsImpl {}).await
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
    pub async fn bucket_exists(&self) -> Result<(), BucketExistsError> {
        self.bucket_exists_impl(&S3ManagerOpsImpl {}).await
    }

    /// Our public list_objects function that will return a `Vec<String>` of all of the keys in a bucket.
    /// This uses our list_objects_impl function which uses dependency injection to inject the calls to S3.
    /// In this manner, we can fully test the list_objects logic with no down stream effects.  
    /// This function just wraps our impl call.
    /// # Arguments
    /// * `filter` - An `Option<String>` that represents a filter that we want to apply to the list_objects call.
    pub async fn list_objects(
        &self,
        filter: Option<String>,
    ) -> Result<Vec<String>, ListObjectsError> {
        self.list_objects_impl(filter, None, &S3ManagerOpsImpl {})
            .await
    }

    /// Will return file information for a given key.  This uses our get_file_information_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the get_file_information logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to get information about.
    pub async fn get_file_information(
        &self,
        key: &str,
    ) -> Result<S3FileInfo, GetFileInformationError> {
        self.get_file_information_impl(key, &S3ManagerOpsImpl {})
            .await
    }

    /// Will return a presigned url for uploading a file.  This uses our get_signed_upload_url_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the get_signed_upload_url logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to get information about.
    /// * `lifetime` - An `Option<u64>` that represents how long the presigned url will be valid for
    /// in seconds (the default is 300 seconds).
    /// * `content_type` - An optional String that represents the content type of the file that we want to upload.
    pub async fn get_signed_upload_url(
        &self,
        key: &str,
        lifetime: Option<u64>,
        content_type: Option<String>,
    ) -> Result<String, GetSignedUploadUrlError> {
        self.get_signed_upload_url_impl(key, content_type, lifetime, &S3ManagerOpsImpl {})
            .await
    }

    /// Will return a presigned url for downloading a file.  This uses our get_signed_download_url_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the get_signed_download_url logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to get information about.
    pub async fn get_object_stream(&self, key: &str) -> Result<ByteStream, GetObjectStreamError> {
        self.get_object_stream_impl(key, &S3ManagerOpsImpl {}).await
    }

    /// Will return an UploadStream that wraps the AWs S3 Multipart upload.  This will allow us to
    /// write data as we consume it with out having to buffer the entire file in memory.  This uses our
    /// get_upload_stream_impl function which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the get_upload_stream logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to upload.
    pub async fn get_upload_stream(&self, key: &str) -> Result<UploadStream, GetUploadStreamError> {
        self.get_upload_stream_impl(key, &S3ManagerOpsImpl {}).await
    }

    /// Will remove a file from the S3 bucket.  This uses our remove_file_impl function
    /// which uses dependency injection to inject the calls to S3.  In this manner, we can fully
    /// test the remove_file logic with no down stream effects.  This function just wraps our impl call.
    /// # Arguments
    /// * `key` - A String that represents the key of the file that we want to remove.
    pub async fn remove_object(&self, key: &str) -> Result<(), RemoveObjectError> {
        self.remove_object_impl(key, &S3ManagerOpsImpl {}).await
    }

    /// Our private new_impl function that will return an S3Manager.
    /// # Arguments
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make calls to S3.
    async fn new_impl<T: S3ManagerOps>(
        bucket: String,
        aws_operations: &T,
    ) -> Result<Self, ConstructorError> {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = S3Client::new(&config);
        let result = aws_operations
            .bucket_exists_operation(&client, &bucket)
            .await;
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
    ///This function takes an aws_operations function that will be used to make the actual call to S3.
    ///This will allow us to inject the call to S3 so that we can fully test this function.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make calls to S3.
    async fn bucket_exists_impl<T: S3ManagerOps>(
        &self,
        aws_operations: &T,
    ) -> Result<(), BucketExistsError> {
        let result = aws_operations
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

    #[async_recursion]
    ///Our internal implimentation of list objects.  This version takes an S3ManagerOps which will make
    ///the actual call to S3.  This allows us to inject our own function for testing.
    ///This function will call the required aws_operations and if the result is truncated, it will call itself
    ///with the last key as the start_after parameter.  It will then append the results of the
    ///recursive call to the results of the original call and return the results.
    ///If the aws_operations return an error, it will return the error.
    ///# Arguments
    ///* `client` - The S3Client to use for the call
    ///* `bucket` - The bucket to list objects from
    ///* `filter` - An optional filter to apply to the list
    ///* `start_after` - An optional key to start listing after -- this is used in our recursive
    ///calls to keep track of our place.
    ///* `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make calls to S3.
    async fn list_objects_impl<T: S3ManagerOps + std::marker::Send + std::marker::Sync>(
        &self,
        filter: Option<String>,
        start_after: Option<String>,
        aws_operations: &T,
    ) -> Result<Vec<String>, ListObjectsError> {
        let res = aws_operations
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
                    let res = self
                        .list_objects_impl(filter.clone(), Some(last_key), aws_operations)
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

    /// The implementation for our get_file_information call.  This function will take a
    /// S3ManagerOps trait to make the actual calls to AWS..
    /// # Arguments
    /// * `key` - A String that represents the filename to get the information for.
    /// * `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make calls to S3.
    async fn get_file_information_impl<T: S3ManagerOps>(
        &self,
        key: &str,
        aws_operations: &T,
    ) -> Result<S3FileInfo, GetFileInformationError> {
        let head_result = aws_operations
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
                            key, self.bucket
                        )),
                        Some(serde_json::json!({"Bucket": self.bucket, "Key": key})),
                        None,
                    ),
                ));
            } else {
                let msg = e.meta().message().unwrap().to_string();
                let data = json!({ "bucket_name": self.bucket, "key" : key });
                warn!(
                    "Error calling head_object for bucket {}, key {}, error : {} ",
                    self.bucket, key, e
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

    /// The implementation for our get_signed_download_url call.  This function will take a
    /// S3ManagerOps trait to make the actual calls to AWS.
    /// # Arguments
    /// * `key` - A String that represents the filename to get the information for.
    /// * 'content_type' - An optional String that represents the content type of the file.
    /// * `lifetime` - An optional u64 that represents the lifetime of the url in seconds.  If not
    /// provided, the default is 5 minutes.
    /// * `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make calls to S3.
    async fn get_signed_upload_url_impl<T: S3ManagerOps>(
        &self,
        key: &str,
        content_type: Option<String>,
        lifetime: Option<u64>,
        aws_operations: &T,
    ) -> Result<String, GetSignedUploadUrlError> {
        let expires_in = match lifetime {
            Some(lifetime) => Duration::from_secs(lifetime),
            None => Duration::from_secs(60 * 5), // 5 minutes
        };

        let res = aws_operations
            .get_upload_url_operation(&self.client, &self.bucket, key, expires_in, content_type)
            .await;
        match res {
            Ok(url) => {
                return Ok(url.uri().to_string());
            }
            Err(e) => {
                let e = e.into_service_error();
                let msg = e.meta().message().unwrap().to_string();
                let data = json!({ "bucket_name": self.bucket, "key" : key });
                return Err(GetSignedUploadUrlError::UnexpectedError(
                    GlyphxErrorData::new(msg, Some(data), None),
                ));
            }
        }
    }

    /// The implementation for our get_object_stream call.  This function will take a
    /// S3ManagerOps trait to make the actual calls to AWS.
    /// # Arguments
    /// * `key` - A String that represents the filename to get the information for.
    /// * `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make calls to S3.
    async fn get_object_stream_impl<T: S3ManagerOps>(
        &self,
        key: &str,
        aws_operations: &T,
    ) -> Result<ByteStream, GetObjectStreamError> {
        let res = aws_operations
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
                            format!("The object {} exists on the bucket {}, but is archived and cannot be accessed", key, self.bucket),
                            Some(json!({ "bucket_name": self.bucket, "key" : key })),
                            None,
                        )));
                    }
                    GetObjectError::NoSuchKey(_) => {
                        return Err(GetObjectStreamError::KeyDoesNotExist(GlyphxErrorData::new(
                            format!(
                                "The object {} does not exist on the bucket {}",
                                key, self.bucket
                            ),
                            Some(json!({ "bucket_name": self.bucket, "key" : key })),
                            None,
                        )));
                    }

                    GetObjectError::Unhandled(unhandled) => {
                        let msg = unhandled.to_string();
                        let data = json!({ "bucket_name": self.bucket, "key" : key });
                        return Err(GetObjectStreamError::UnexpectedError(GlyphxErrorData::new(
                            msg,
                            Some(data),
                            None,
                        )));
                    }
                    _ => {
                        let msg = e.meta().message().unwrap().to_string();
                        let data = json!({ "bucket_name": self.bucket, "key" : key });
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

    /// The implementation for our get_upload_stream call.  This function will take a
    /// S3ManagerOps trait to make the actual calls to our upload manager struct.  This function
    /// will return a Result that contains either an UploadStream or a GetUploadStreamError.
    /// # Arguments
    /// * `key` - A String that represents the filename to get the information for.
    /// * `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make
    /// external calls.
    async fn get_upload_stream_impl<T: S3ManagerOps>(
        &self,
        key: &str,
        aws_operations: &T,
    ) -> Result<UploadStream, GetUploadStreamError> {
        let res = aws_operations
            .get_upload_stream_operation(&self.client, &self.bucket, key)
            .await;

        if res.is_err() {
            let inner_data = match res.err().unwrap() {
                UploadStreamConstructorError::UnexpectedError(e) => {
                    serde_json::to_value(e).unwrap()
                }
            };

            let inner_err = json!({ "unexpected": inner_data });

            return Err(GetUploadStreamError::UnexpectedError(GlyphxErrorData::new(String::from("An error occurred while getting the upload stream.  See the inner error for more information"), Some(json!({"bucket_name": self.bucket, "key": key})), Some(inner_err))));
        }

        Ok(res.unwrap())
    }

    /// The implementation for our delete_object call.  This function will take a
    /// S3ManagerOps trait to make the actual calls to AWS.
    /// # Arguments
    /// * `key` - A String that represents the filename to delete.
    /// * `aws_operations` - An implementation of the S3ManagerOps trait that will be used to make calls to S3.
    async fn remove_object_impl<T: S3ManagerOps>(
        &self,
        key: &str,
        aws_operations: &T,
    ) -> Result<(), RemoveObjectError> {
        let res = aws_operations
            .remove_object_operation(&self.client, &self.bucket, key)
            .await;
        match res {
            Ok(_) => {
                return Ok(());
            }
            Err(e) => {
                let e = e.into_service_error();
                let msg = e.meta().to_string();
                let data = json!({ "bucket_name": self.bucket, "key" : key });
                return Err(RemoveObjectError::UnexpectedError(GlyphxErrorData::new(
                    msg,
                    Some(data),
                    None,
                )));
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

        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
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
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(false))
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
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
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| {
                Err(GlyphxErrorData::new(
                    format!("Error calling head_bucket for bucket"),
                    None,
                    None,
                ))
            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
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
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        assert!(s3_manager_result.is_ok());

        let bucket_name = s3_manager_result.ok().unwrap().get_bucket_name();
        assert_eq!(bucket_name, bucket);
    }

    #[tokio::test]
    async fn get_client() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
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
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(2);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        assert!(s3_manager_result.is_ok());
        let s3_manager = s3_manager_result.ok().unwrap();

        let bucket_exists_result = s3_manager.bucket_exists_impl(&mock_ops).await;

        assert!(bucket_exists_result.is_ok());
    }

    #[tokio::test]
    async fn does_not_exist() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .times(1)
            .returning(|_, _| Ok(true));
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;

        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .times(1)
            .returning(|_, _| Ok(false));
        let s3_manager = s3_manager_result.ok().unwrap();
        let bucket_exists_result = s3_manager.bucket_exists_impl(&mock_ops).await;

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
        mock_ops
            .expect_bucket_exists_operation()
            .times(1)
            .returning(|_, _| Ok(true));
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;

        let s3_manager = s3_manager_result.ok().unwrap();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .times(1)
            .returning(|_, _| {
                Err(GlyphxErrorData::new(
                    format!("Error calling head_bucket for bucket "),
                    None,
                    None,
                ))
            });
        let bucket_exists_result = s3_manager.bucket_exists_impl(&mock_ops).await;

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
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_list_objects_operation()
            .returning(|_, _, _, _| {
                let mut keys = Vec::new();
                for i in 0..10 {
                    keys.push(format!("key-{}", i));
                }
                Ok((keys, false))
            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(None, None, &mock_ops).await;

        assert!(res.is_ok());
        let keys = res.unwrap();
        assert_eq!(keys.len(), 10);
    }

    #[tokio::test]
    async fn truncation() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_list_objects_operation()
            .returning(|_, _, _, _| {
                let mut keys = Vec::new();
                for i in 0..5 {
                    keys.push(format!("key-{}", i));
                }
                Ok((keys, true))
            })
            .times(1);

        mock_ops
            .expect_list_objects_operation()
            .returning(|_, _, _, _| {
                let mut keys = Vec::new();
                for i in 5..10 {
                    keys.push(format!("key-{}", i));
                }
                Ok((keys, false))
            })
            .withf(|_, _, _, start_after| {
                start_after.is_some() && start_after.as_ref().unwrap() == "key-4"
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(None, None, &mock_ops).await;

        assert!(res.is_ok());
        let keys = res.unwrap();
        assert_eq!(keys.len(), 10);
    }

    #[tokio::test]
    async fn truncation_error() {
        let bucket = "jps-test-bucket".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_list_objects_operation()
            .returning(|_, _, _, _| {
                let mut keys = Vec::new();
                for i in 0..5 {
                    keys.push(format!("key-{}", i));
                }
                Ok((keys, true))
            })
            .times(1);

        mock_ops
            .expect_list_objects_operation()
            .returning(|_, _, _, _| {
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

        let res = s3_manager.list_objects_impl(None, None, &mock_ops).await;

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
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_list_objects_operation()
            .returning(|_, _, _, _| {
                Err(ListObjectsError::BucketDoesNotExist(GlyphxErrorData::new(
                    format!("Bucket does not exist"),
                    None,
                    None,
                )))
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(None, None, &mock_ops).await;

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
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_list_objects_operation()
            .returning(|_, _, _, _| {
                Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                    format!("Unexpected error listing objects in bucket "),
                    None,
                    None,
                )))
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;

        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.list_objects_impl(None, None, &mock_ops).await;

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
    use aws_sdk_s3::primitives::{DateTime, DateTimeFormat};
    use aws_sdk_s3::types::error::NotFound;
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;
    use http;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let file_size = 6300;
        let modified_date =
            DateTime::from_str("1972-05-15T00:00:00Z", DateTimeFormat::DateTime).unwrap();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_file_information_operation()
            .returning(move |_, _, _| {
                Ok(HeadObjectOutput::builder()
                    .content_length(file_size.clone() as i64)
                    .last_modified(modified_date.clone())
                    .build())
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager
            .get_file_information_impl(&key.clone(), &mock_ops)
            .await;
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
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
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager
            .get_file_information_impl(&key.clone(), &mock_ops)
            .await;
        assert!(res.is_err());
        let is_not_found = match res.err().unwrap() {
            GetFileInformationError::KeyDoesNotExist(_) => true,
            _ => false,
        };
        assert!(is_not_found);
    }

    #[tokio::test]
    async fn unhandled_error() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_file_information_operation()
            .returning(move |_, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let unhandled = Unhandled::builder().source("not found").meta(meta).build();
                let err = HeadObjectError::Unhandled(unhandled);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager
            .get_file_information_impl(&key.clone(), &mock_ops)
            .await;
        assert!(res.is_err());
        let is_unhandled = match res.err().unwrap() {
            GetFileInformationError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unhandled);
    }
}

#[cfg(test)]
mod get_signed_upload_url {
    use super::*;
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use http;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        //The underlying call to Request::builder() adds a trailing slash to the uri, so adding
        //when we define it will allow the asserts to pass.
        let uri = "https://www.example.com/".to_string();
        // we need to clone the uri because the mock_ops takes ownership of the uri
        // and we want to use it again in the assertion
        let url = uri.clone();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_upload_url_operation()
            .returning(move |_, _, _, _, _| {
                Ok(Request::builder()
                    .method("PUT")
                    .uri(url.clone())
                    .body(String::from(""))
                    .unwrap())
            })
            .withf(|_, _, _, expires_in, _| {
                // 5 minutes the default
                expires_in.as_secs() == 300
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager
            .get_signed_upload_url_impl(&key, None, None, &mock_ops)
            .await;
        assert!(res.is_ok());
        let url = res.unwrap();
        assert_eq!(url, uri);
    }
    #[tokio::test]
    async fn unhandled_error() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        //The underlying call to Request::builder() adds a trailing slash to the uri, so adding
        //when we define it will allow the asserts to pass.
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_upload_url_operation()
            .returning(move |_, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = PutObjectError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);

        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager
            .get_signed_upload_url_impl(&key, None, None, &mock_ops)
            .await;
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
    use aws_sdk_s3::types::error::{InvalidObjectState, NoSuchKey};
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;
    use http;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let file_contents = String::from("These are my test file contents");
        let file_contents_clone = file_contents.clone();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_object_stream_operation()
            .returning(move |_, _, _| {
                let mut vec_u8 = Vec::new();
                for byte in file_contents_clone.as_bytes() {
                    vec_u8.push(byte.clone());
                }

                Ok(GetObjectOutput::builder()
                    .body(ByteStream::from(vec_u8))
                    .build())
            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.get_object_stream_impl(&key, &mock_ops).await;
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
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
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.get_object_stream_impl(&key, &mock_ops).await;
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
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
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
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.get_object_stream_impl(&key, &mock_ops).await;
        assert!(res.is_err());
        let is_not_found = match res.err().unwrap() {
            GetObjectStreamError::KeyDoesNotExist(_) => true,
            _ => false,
        };
        assert!(is_not_found);
    }

    #[tokio::test]
    async fn is_unexpected_error() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_object_stream_operation()
            .returning(move |_, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let unhandled = Unhandled::builder()
                    .meta(meta)
                    .source("an error has occurred")
                    .build();
                let err = GetObjectError::Unhandled(unhandled);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.get_object_stream_impl(&key, &mock_ops).await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            GetObjectStreamError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
mod get_upload_stream {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_upload_stream_operation()
            .returning(|client, _, _| Ok(UploadStream::empty(client.clone())))
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.get_upload_stream_impl(&key, &mock_ops).await;
        assert!(res.is_ok());
    }

    #[tokio::test]
    async fn is_unexpected_error() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_get_upload_stream_operation()
            .returning(|_, _, _| {
                Err(UploadStreamConstructorError::UnexpectedError(
                    GlyphxErrorData::new(
                        "an error has occurred".to_string(),
                        Some(json!({"foo": "bar"})),
                        None,
                    ),
                ))
            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.get_upload_stream_impl(&key, &mock_ops).await;
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
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;
    use http;

    #[tokio::test]
    async fn is_ok() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_remove_object_operation()
            .returning(|_, _, _| Ok(DeleteObjectOutput::builder().build()))
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.remove_object_impl(&key, &mock_ops).await;
        assert!(res.is_ok());
    }

    #[tokio::test]
    async fn is_unexpected_error() {
        let bucket = "jps-test-bucket".to_string();
        let key = "jps-test-key".to_string();
        let mut mock_ops = MockS3ManagerOps::new();
        mock_ops
            .expect_bucket_exists_operation()
            .returning(|_, _| Ok(true))
            .times(1);

        mock_ops
            .expect_remove_object_operation()
            .returning(|_, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let unhandled = Unhandled::builder()
                    .meta(meta)
                    .source("an error has occurred")
                    .build();
                let err = DeleteObjectError::Unhandled(unhandled);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))

            })
            .times(1);
        let s3_manager_result = S3Manager::new_impl(bucket.clone(), &mock_ops).await;
        let s3_manager = s3_manager_result.ok().unwrap();

        let res = s3_manager.remove_object_impl(&key, &mock_ops).await;
        assert!(res.is_err());
        let is_unexpected = match res.as_ref().err().unwrap() {
            RemoveObjectError::UnexpectedError(_) => true,
        };
        assert!(is_unexpected);
    }
}
