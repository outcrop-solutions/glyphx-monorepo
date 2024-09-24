use crate::types::aws::s3_manager::*;
use crate::aws::upload_stream::UploadStream;

use async_trait::async_trait;
use aws_sdk_s3::{ Client as S3Client, primitives::ByteStream };
use mockall::*;

//TODO: This needs to be refactored to make it less AWS dependent.  For instance, bucket could be
//location(url) or something similar.
#[async_trait]
#[automock]
pub trait BlockStorageManager  : std::fmt::Debug + Send + Sync{
    fn get_bucket_name(&self) -> String;
    fn get_client(&self) -> S3Client;
    async fn bucket_exists(&self) -> Result<(), BucketExistsError>;
    async fn file_exists(&self, key: &str) -> Result<(), FileExistsError>;
    async fn list_objects(
        &self,
        filter: Option<String>,
        start_after: Option<String>,
    ) -> Result<Vec<String>, ListObjectsError>;
    async fn get_file_information(&self, key: &str) -> Result<S3FileInfo, GetFileInformationError>;
    async fn get_signed_upload_url(
        &self,
        key: &str,
        lifetime: Option<u64>,
        content_type: Option<String>,
    ) -> Result<String, GetSignedUploadUrlError>;
    async fn get_object_stream(&self, key: &str) -> Result<ByteStream, GetObjectStreamError>;
    async fn get_upload_stream(&self, key: &str) -> Result<UploadStream, GetUploadStreamError>;
    async fn remove_object(&self, key: &str) -> Result<(), RemoveObjectError>;
    async fn upload_object(
        &self,
        key: &str,
        data: Vec<u8>,
        content_type: Option<String>,
    ) -> Result<(), UploadObjectError>;
}
