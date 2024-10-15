pub use crate::types::error::GlyphxErrorData;
use async_trait::async_trait;
use mockall::*;

use aws_sdk_s3::{
    error::SdkError,
    operation::{
        delete_object::{DeleteObjectError, DeleteObjectOutput},
        get_object::{GetObjectError, GetObjectOutput},
        head_object::{HeadObjectError, HeadObjectOutput},
        put_object::{PutObjectError, PutObjectOutput},
    },
    primitives::ByteStream,
    Client as S3Client,
};

use crate::aws::upload_stream::UploadStream;
pub use crate::types::aws::s3_manager::*;
pub use crate::types::aws::upload_stream::*;
use http::Request;
use std::time::Duration;
/// this API wrapper uses our impl pattern.  As part of that pattern, we use dependency injection
/// to inject our third party/external functions. This pattern allows us to mock those functions
/// for more efficient and complete unit testing.  This trait defines the functions that
/// can be mocked.
#[async_trait]
#[automock]
pub trait S3ManagerOps: Send + Sync {
    async fn bucket_exists_operation(
        &self,
        client: &S3Client,
        bucket: &str,
    ) -> Result<bool, GlyphxErrorData>;

    async fn file_exists_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
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

    async fn put_object_operation(
        &self,
        client: &S3Client,
        bucket: &str,
        key: &str,
        body: ByteStream,
        content_type: Option<String>,
    ) -> Result<PutObjectOutput, SdkError<PutObjectError>>;
}

impl std::fmt::Debug for dyn S3ManagerOps {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "S3ManagerOps")
    }
}
