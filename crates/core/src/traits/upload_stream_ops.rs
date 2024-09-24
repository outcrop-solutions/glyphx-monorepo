use async_trait::async_trait;
use aws_sdk_s3::{
    error::SdkError,
    operation::{
        abort_multipart_upload::{AbortMultipartUploadError, AbortMultipartUploadOutput},
        complete_multipart_upload::{CompleteMultipartUploadError, CompleteMultipartUploadOutput},
        create_multipart_upload::{CreateMultipartUploadError, CreateMultipartUploadOutput},
        upload_part::{UploadPartError, UploadPartOutput},
    },
    types::CompletedPart,
    Client,
};
use aws_smithy_types::byte_stream::ByteStream;
use mockall::*;

///This is our trait which wraps the AWS S3 Functions.  We pass this trait
///into our impl versions of our functions to control access to the AWS resources.
///This allows us to mock the AWS S3 functions for testing.
#[automock]
#[async_trait]
pub trait UploadStreamOps: Sync + Send {
    ///The production implementation will wrap the call to the AWS S3 API to start a multipart
    ///upload and return any errors or the response from the AWS SDK.
    async fn start_multipart_upload_operation(
        &self,
        bucket_name: String,
        file_name: String,
        client: Client,
    ) -> Result<CreateMultipartUploadOutput, SdkError<CreateMultipartUploadError>>;

    /// The production implementation will wrap the call to the AWS S3 API to upload a part
    /// of the multipart upload and return any errors or the response from the AWS SDK.
    async fn upload_part_operation(
        &self,
        bucket_name: String,
        file_name: String,
        part_number: i32,
        upload_id: String,
        body: ByteStream,
        client: Client,
    ) -> Result<UploadPartOutput, SdkError<UploadPartError>>;

    /// The production implementation will wrap the call to the AWS S3 API to complete a multipart
    /// upload and return any errors or the response from the AWS SDK.
    async fn complete_multipart_upload_operation(
        &self,
        bucket_name: String,
        file_name: String,
        upload_parts: Vec<CompletedPart>,
        upload_id: String,
        client: Client,
    ) -> Result<CompleteMultipartUploadOutput, SdkError<CompleteMultipartUploadError>>;

    ///In the case of errors, the production implementation will wrap the call to the AWS S3 API to abort a multipart
    ///upload and return any errors or the response from the AWS SDK.
    async fn abort_multipart_upload_operation(
        &self,
        bucket_name: String,
        file_name: String,
        upload_id: String,
        client: Client,
    ) -> Result<AbortMultipartUploadOutput, SdkError<AbortMultipartUploadError>>;
}

impl std::fmt::Debug for dyn UploadStreamOps {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "UploadStreamOps")
    }
}
