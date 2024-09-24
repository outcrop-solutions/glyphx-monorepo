///Our internal/production implementation of the S3ManagerOps trait.
use crate::{
    aws::upload_stream::{UploadStream, UploadStreamConstructorOptionsBuilder},
    traits::S3ManagerOps,
    types::{
        aws::{s3_manager::*, upload_stream::*},
        error::GlyphxErrorData,
    },
};
use async_trait::async_trait;

use aws_sdk_s3::{
    error::SdkError,
    operation::{
        delete_object::{DeleteObjectError, DeleteObjectOutput},
        get_object::{GetObjectError, GetObjectOutput},
        head_object::{HeadObjectError, HeadObjectOutput},
        put_object::{PutObjectError, PutObjectOutput},
    },
    presigning::PresigningConfig,
    primitives::ByteStream,
    Client as S3Client,
};

use http::Request;
use log::warn;
use serde_json::json;
use std::time::Duration;

pub struct S3ManagerOpsImpl;

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
            }
            let msg = e.meta().message().unwrap().to_string();
            let data = json!({ "bucket_name": bucket });
            warn!(
                "Error calling head_bucket for bucket {}, error : {} ",
                bucket, e
            );
            Err(GlyphxErrorData::new(msg, Some(data), None))
        } else {
            Ok(true)
        }
    }

    /// Our private file_exists_operation function that will return a boolean if the file
    /// exists and false if it does not.  This can be used by any function which wants
    /// to determine whether or not a file exists.  This operation actaully makes the call to
    /// S3.
    /// # Arguments
    /// * `client` - An S3Client that will be used to make the call to S3.
    /// * `bucket` - A String that represents the bucket name that we want to operate on.
    /// * `key` - A String that represents the key name that we want to operate on.
    async fn file_exists_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
    ) -> Result<bool, GlyphxErrorData> {
        let head_result = client.head_object().bucket(bucket).key(key).send().await;
        if head_result.is_err() {
            let e = head_result.err().unwrap();
            let e = e.into_service_error();
            if e.is_not_found() {
                return Ok(false);
            }
            let msg = e.meta().message().unwrap().to_string();
            let data = json!({ "bucket_name": bucket, "key": key });
            warn!(
                "Error calling head_bucket for bucket {}, error : {} ",
                bucket, e
            );
            Err(GlyphxErrorData::new(msg, Some(data), None))
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
                let truncated = result.is_truncated().unwrap_or(false);
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
                        format!("Bucket {} does not exist", bucket),
                        Some(json!({ "bucket_name": bucket })),
                        None,
                    )));
                }
                let msg = e.meta().to_string();
                return Err(ListObjectsError::UnexpectedError(GlyphxErrorData::new(
                    msg,
                    Some(json!({ "bucket_name": bucket })),
                    None,
                )));
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
            Ok(request) => Ok(request.into_http_02x_request(String::from(""))),
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
        let options = UploadStreamConstructorOptionsBuilder::default()
            .bucket_name(bucket_name)
            .file_name(key)
            .client(client.clone())
            .build()
            .unwrap();
        UploadStream::new(options).await
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

    ///Will handle the calls to the put_object to upload a file to S3.
    async fn put_object_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
        body: ByteStream,
        content_type: Option<String>,
    ) -> Result<PutObjectOutput, SdkError<PutObjectError>> {
        let mut op = client.put_object().bucket(bucket).key(key).body(body);
        if content_type.is_some() {
            op = op.content_type(content_type.unwrap());
        }
        op.send().await
    }
}
