use super::UploadStreamOps;
use async_trait::async_trait;
use aws_sdk_s3::{
    error::SdkError,
    operation::{
        abort_multipart_upload::{AbortMultipartUploadError, AbortMultipartUploadOutput},
        complete_multipart_upload::{CompleteMultipartUploadError, CompleteMultipartUploadOutput},
        create_multipart_upload::{CreateMultipartUploadError, CreateMultipartUploadOutput},
        upload_part::{UploadPartError, UploadPartOutput},
    },
    types::{CompletedMultipartUpload, CompletedPart},
    Client,
};
use aws_smithy_types::byte_stream::ByteStream;

/// This is our private implementation of the UploadStreamOps trait.  This structure
/// holds all of our production implementations of the AWS S3 functions.  This structure
/// is passed to our impl functions to inject the AWS dependencies.
pub struct UploadStreamOpsImpl;

#[async_trait]
impl UploadStreamOps for UploadStreamOpsImpl {
    /// Our private implementation of the start_multipart_upload operation.
    /// This operation makes the actual call to the AWS API.  This is a private
    /// function that can be used by any function starting the upload.
    async fn start_multipart_upload_operation(
        &self,
        bucket_name: String,
        file_name: String,
        client: Client,
    ) -> Result<CreateMultipartUploadOutput, SdkError<CreateMultipartUploadError>> {
        client
            .create_multipart_upload()
            .bucket(bucket_name)
            .key(file_name)
            .send()
            .await
    }

    /// Our private implementation of the complete_multipart_upload operation.  
    /// This operation makes the actual call to the AWS API.  This is a private
    /// function that can be used by any function completing the upload.
    async fn complete_multipart_upload_operation(
        &self,
        bucket_name: String,
        file_name: String,
        upload_parts: Vec<CompletedPart>,
        upload_id: String,
        client: Client,
    ) -> Result<CompleteMultipartUploadOutput, SdkError<CompleteMultipartUploadError>> {
        let completed_multipart_upload: CompletedMultipartUpload =
            CompletedMultipartUpload::builder()
                .set_parts(Some(upload_parts))
                .build();

        client
            .complete_multipart_upload()
            .bucket(bucket_name)
            .key(file_name)
            .upload_id(upload_id)
            .multipart_upload(completed_multipart_upload)
            .send()
            .await
    }

    /// Our private implementation of the upload_part operation.
    /// This operation makes the actual call to the AWS API.  This is a private
    /// function that can be used by any function uploading a part.
    async fn upload_part_operation(
        &self,
        bucket_name: String,
        file_name: String,
        part_number: i32,
        upload_id: String,
        body: ByteStream,
        client: Client,
    ) -> Result<UploadPartOutput, SdkError<UploadPartError>> {
        client
            .upload_part()
            .bucket(bucket_name)
            .key(file_name)
            .part_number(part_number)
            .upload_id(upload_id)
            .body(body)
            .send()
            .await
    }
    /// Our private implementation of the abort_multipart_upload operation.
    /// This operation makes the actual call to the AWS API.  This is a private
    /// function that can be used by any function aborting the upload.
    async fn abort_multipart_upload_operation(
        &self,
        bucket_name: String,
        file_name: String,
        upload_id: String,
        client: Client,
    ) -> Result<AbortMultipartUploadOutput, SdkError<AbortMultipartUploadError>> {
        client
            .abort_multipart_upload()
            .bucket(bucket_name)
            .key(file_name)
            .upload_id(upload_id)
            .send()
            .await
    }
}
