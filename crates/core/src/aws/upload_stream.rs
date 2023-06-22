use crate::error::GlyphxErrorData;
use serde_json::json;

use aws_sdk_s3::error::SdkError;
use aws_sdk_s3::operation::abort_multipart_upload::{
    AbortMultipartUploadError, AbortMultipartUploadOutput,
};
use aws_sdk_s3::operation::complete_multipart_upload::{
    CompleteMultipartUploadError, CompleteMultipartUploadOutput,
};
use aws_sdk_s3::operation::create_multipart_upload::{
    CreateMultipartUploadError, CreateMultipartUploadOutput,
};
use aws_sdk_s3::operation::upload_part::{UploadPartError, UploadPartOutput};
use aws_sdk_s3::types::{CompletedMultipartUpload, CompletedPart};
use aws_sdk_s3::Client;
use aws_smithy_http::byte_stream::ByteStream;

use async_trait::async_trait;
use mockall::*;


const BUFFER_LIMIT: usize = 1025 * 1024 * 5; // 5 MB

/// The UploadStream struct is a wrapper around the AWS S3 multipart upload functions.
/// This structure behaves like a poor man's file stream.  It allows the user to 
/// arbitrarily write bytes to the stream.  At perscribed intervals (5MB), the stream 
/// will push the data to the AWS S3 service.  Once the stream is finished, the user
/// can call the finish function to complete the upload.
#[derive(Debug)]
pub struct UploadStream {
    file_name: String,
    file_size: i64,
    buffer: Vec<u8>,
    buffer_size: i32,
    client: Client,
    bucket_name: String,
    part_number: i32,
    upload_id: String,
    upload_parts: Vec<CompletedPart>,
    state: UploadStreamState,
}

///This is our trait which wraps the AWS S3 Functions.  We pass this trait 
///into our impl versions of our functions to control access to the AWS resources.
///This allows us to mock the AWS S3 functions for testing.
#[automock]
#[async_trait]
trait UploadStreamOps {
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


/// This is our private implementation of the UploadStreamOps trait.  This structure 
/// holds all of our production implementations of the AWS S3 functions.  This structure 
/// is passed to our impl functions to inject the AWS dependencies.
struct UploadStreamImpl;

#[async_trait]
impl UploadStreamOps for UploadStreamImpl {
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

/// This enum holds the possible errors that can be returned by the upload streams constructor
/// (::new) function.
#[derive(Debug)]
pub enum UploadStreamConstructorError {
    ///Indicates that an unexpected error occurred while trying to start the multipart upload
    UnexpectedError(GlyphxErrorData),
}

/// This enum holds the possible errors that can be returned by the upload streams write
/// function.
#[derive(Debug)]
pub enum UploadStreamWriteError {
    ///Indicates that an unexpected error occurred while trying to write a part of the multipart upload
    ///to AWS S3.
    UnexpectedError(GlyphxErrorData),
    ///Indicates that the upload stream has been previously aborted and cannot be written to.
    Aborted(GlyphxErrorData),
    ///Indicates that the upload stream has been previously finished and cannot be written to.
    Finished(GlyphxErrorData),
}

/// This enum holds the possible errors that can be returned by the upload streams finish
/// function.
#[derive(Debug)]
pub enum UploadStreamFinishError {
    ///Indicates that the enternal buffer was empty and no previous writes had occurred.  
    ///There is no data to write to AWS S3.
    NoDataToWrite(GlyphxErrorData),
    ///Indicates that an unexpected error occurred while trying to complete the multipart upload. 
    ///this could have occurred as an returned by flush or the complete_multipart_upload call.
    UnexpectedError(GlyphxErrorData),
    ///Indicates that the upload stream has been previously aborted and cannot be finished.
    Aborted(GlyphxErrorData),
    ///Indicates that the upload stream has been previously finished and cannot be finished again.
    Finished(GlyphxErrorData),
}
/// This enum holds the current state of our upload stream.  This is used to determine if the
/// stream can be written to or finished.
#[derive(Debug)]
pub enum UploadStreamState {
    Ok,
    Aborted,
    Finished,
}
impl UploadStream {
    /// A Get accessor to get a reference to the file name
    pub fn get_file_name(&self) -> &str {
        &self.file_name
    }

    /// A Get accessor to get a reference to the file size
    pub fn get_file_size(&self) -> i64 {
        self.file_size
    }

    /// A Get accessor to get a reference to the bucket name
    pub fn get_bucket_name(&self) -> &str {
        &self.bucket_name
    }

    /// A Get accessor to get the streams state
    pub fn get_state(&self) -> &UploadStreamState {
        &self.state
    }

    ///Our contructor for UploadStream.  This function is used to create a new UploadStream.
    ///This function uses our impl dependency injection pattern and calls the write_impl
    ///function passing it the UploadStreamOpsImpl structure which implements the UploadStreamOps
    ///trait and implements the actual aws calls. This pattern allows us to mock the aws calls
    ///for testing by testing the impl version of the functions with mocked operations.
    pub async fn new(
        bucket_name: &str,
        file_name: &str,
        client: Client,
    ) -> Result<UploadStream, UploadStreamConstructorError> {
        Self::new_impl(bucket_name, file_name, client, &UploadStreamImpl {}).await
    }

    ///This function is used to submit bytes to the strcture to be uploaded.  This function uses
    ///our impl dependency injection pattern and calls the write_impl function passing it the
    ///UploadStreamOpsImpl structure which implements the UploadStreamOps trait and implements the
    ///actual aws calls. This pattern allows us to mock the aws calls for testing by testing the
    ///impl version of the functions with mocked operations.
    pub async fn write(&mut self, bytes: Option<Vec<u8>>) -> Result<(), UploadStreamWriteError> {
        self.write_impl(bytes, &UploadStreamImpl {}).await
    }

    ///This function is used to complete our stream and complete the
    ///upload to S3.  This function uses our impl dependency injection pattern and calls
    ///the write_impl function passing it the UploadStreamOpsImpl structure which implements
    ///the UploadStreamOps trait and implements the actual aws calls. This pattern allows us
    ///to mock the aws calls for testing by testing the impl version of the functions with
    ///mocked operations.
    pub async fn finish(&mut self) -> Result<(), UploadStreamFinishError> {
        self.finish_impl(&UploadStreamImpl {}).await
    }

    /// This is our private impl for new.  This function handles error handling and resolving
    /// the values retured by the aws_operation.  This pattern allows us to test our logic in
    /// our unit tests without hitting aws directly.
    /// # Arguments
    /// * `bucket_name` - The name of the bucket to upload to
    /// * `file_name` - The name of the file to upload
    /// * `client` - The aws client to use for the upload
    /// * `aws_operations` - The aws operation to use for the upload.  This trait holds all of the
    /// aws operations that are used by the functions in this structure.  To test this
    /// function, you can pass in your own traits implementtion.
    async fn new_impl<T: UploadStreamOps>(
        bucket_name: &str,
        file_name: &str,
        client: Client,
        aws_operations: &T,
    ) -> Result<UploadStream, UploadStreamConstructorError> {
        let bucket_name = String::from(bucket_name);
        let file_name = String::from(file_name);
        let buffer = Vec::with_capacity(BUFFER_LIMIT);
        let mp_upload = aws_operations
            .start_multipart_upload_operation(
                bucket_name.clone(),
                file_name.clone(),
                client.clone(),
            )
            .await;

        if mp_upload.is_err() {
            let err = mp_upload.err().unwrap().into_service_error();
            let err = err.meta().to_string();
            return Err(UploadStreamConstructorError::UnexpectedError(
                GlyphxErrorData::new(
                    err,
                    Some(json!({"bucket_name": bucket_name, "file_name": file_name})),
                    None,
                ),
            ));
        }
        let mp_upload = mp_upload.unwrap();
        let upload_id = mp_upload.upload_id.unwrap();

        Ok(UploadStream {
            file_name: String::from(file_name),
            file_size: 0,
            buffer,
            buffer_size: 0,
            client,
            bucket_name: String::from(bucket_name),
            part_number: 1,
            upload_id,
            upload_parts: Vec::new(),
            state: UploadStreamState::Ok,
        })
    }

    ///This is our private impl for the write operation.  This function handles error handling and
    ///resolving the values retured by the aws_operation.  This pattern allows us to test our logic
    ///in our unit tests without hitting aws directly.
    /// # Arguments
    /// * `bytes` - The bytes to write to the stream
    /// * `aws_operations` - The aws operation to use for the upload.  This trait holds all of the
    /// aws operations that are used by the functions in this structure.  To test this
    /// function, you can pass in your own traits implementtion.
    async fn write_impl<T: UploadStreamOps>(
        &mut self,
        bytes: Option<Vec<u8>>,
        aws_operations: &T,
    ) -> Result<(), UploadStreamWriteError> {
        match self.state {
            UploadStreamState::Aborted => {
                return Err(UploadStreamWriteError::Aborted(GlyphxErrorData::new(
                    String::from("Stream has been previously aborted"),
                    Some(json!({"bucket_name": self.bucket_name, "file_name": self.file_name})),
                    None,
                )))
            }

            UploadStreamState::Finished => {
                return Err(UploadStreamWriteError::Finished(GlyphxErrorData::new(
                    String::from("Stream has been previously finished"),
                    Some(json!({"bucket_name": self.bucket_name, "file_name": self.file_name})),
                    None,
                )))
            }

            UploadStreamState::Ok => {
                if bytes.is_some() {
                    let bytes = bytes.unwrap();
                    let vec_size = bytes.len();
                    let mut bytes_remain = bytes.len();
                    let buff_remain = BUFFER_LIMIT - self.buffer_size as usize;
                    while bytes_remain > 0 {
                        let bytes_to_copy = if bytes_remain > buff_remain {
                            buff_remain
                        } else {
                            bytes_remain
                        };
                        let vec_start = vec_size - bytes_remain;
                        self.buffer
                            .extend_from_slice(&bytes[vec_start..vec_start + bytes_to_copy]);
                        self.buffer_size += bytes_to_copy as i32;
                        bytes_remain -= bytes_to_copy;
                        if self.buffer_size == BUFFER_LIMIT as i32 {
                            let flush_result = self.flush_impl(aws_operations).await;
                            if flush_result.is_err() {
                                self.abort_impl(aws_operations).await;
                                return flush_result;
                            }
                        }
                    }
                } else {
                    //Finish will abandon for us if there was an error so we don't need to do
                    //anything else here.
                    let res = self.finish_impl(aws_operations).await;
                    if res.is_err() {
                       let err = match res.err().unwrap() {
                            UploadStreamFinishError::Aborted(err) => UploadStreamWriteError::Aborted(err),
                            UploadStreamFinishError::Finished(err) => UploadStreamWriteError::Finished(err),
                            UploadStreamFinishError::UnexpectedError(err) => UploadStreamWriteError::UnexpectedError(err),
                            UploadStreamFinishError::NoDataToWrite(err) => UploadStreamWriteError::UnexpectedError(err),
                        };
                        return Err(err); 
                    } else {
                        return Ok(());
                    }
                }
                Ok(())
            }
        }
    }

    ///This is our private impl for finish.  This function handles error handling and resolving
    ///the values retured by the aws_operation.  This pattern allows us to test our logic in
    ///our unit tests without hitting aws directly.
    ///# Arguments
    /// * `aws_operations` - The aws operation to use for the upload.  This trait holds all of the
    /// aws operations that are used by the functions in this structure.  To test this
    /// function, you can pass in your own traits implementtion.
    async fn finish_impl<T: UploadStreamOps>(
        &mut self,
        aws_operations: &T,
    ) -> Result<(), UploadStreamFinishError>
where {
        match self.state {
            UploadStreamState::Aborted => {
                return Err(UploadStreamFinishError::Aborted(GlyphxErrorData::new(
                    "The upload has been previously aborted aborted".to_string(),
                    Some(json!({
                        "bucket_name": &self.bucket_name,
                        "file_name": &self.file_name
                    })),
                    None,
                )));
            }
            UploadStreamState::Finished => {
                return Err(UploadStreamFinishError::Finished(GlyphxErrorData::new(
                    "The upload has already been finished".to_string(),
                    Some(json!({
                        "bucket_name": &self.bucket_name,
                        "file_name": &self.file_name
                    })),
                    None,
                )));
            }
            UploadStreamState::Ok => {
                //We have no data to write so we need to error.  You can't finish an
                //empty stream.
                if self.buffer_size == 0 && self.part_number == 1 {
                    self.abort_impl(aws_operations).await;
                    return Err(UploadStreamFinishError::NoDataToWrite(
                        GlyphxErrorData::new(
                            "There is no data to write to the stream".to_string(),
                            Some(json!({
                                "bucket_name": &self.bucket_name,
                                "file_name": &self.file_name
                            })),
                            None,
                        ),
                    ));
                }

                if self.buffer_size > 0 {
                    let res = self.flush_impl(aws_operations).await;

                    if res.is_err() {
                        let err = match res.err().unwrap() {
                            UploadStreamWriteError::UnexpectedError(err) => {
                                UploadStreamFinishError::UnexpectedError(err)
                            }
                            UploadStreamWriteError::Aborted(err) => {
                                UploadStreamFinishError::Aborted(err)
                            }
                            UploadStreamWriteError::Finished(err) => {
                                UploadStreamFinishError::Finished(err)
                            }
                        };

                        self.abort_impl(aws_operations).await;
                        return Err(err);
                    }
                }
                let res = aws_operations
                    .complete_multipart_upload_operation(
                        self.bucket_name.clone(),
                        self.file_name.clone(),
                        self.upload_parts.clone(),
                        self.upload_id.clone(),
                        self.client.clone(),
                    )
                    .await;

                if res.is_err() {
                    self.abort_impl(aws_operations).await;
                    let err = res.err().unwrap().into_service_error();
                    let err = err.meta().to_string();
                    return Err(UploadStreamFinishError::UnexpectedError(
                        GlyphxErrorData::new(
                            err,
                            Some(
                                json!({"bucket_name": &self.bucket_name, "file_name": &self.file_name}),
                            ),
                            None,
                        ),
                    ));
                }
                self.state = UploadStreamState::Finished;
                Ok(())
            }
        }
    }

    ///this is our private implentation for flush.  This function will create a multipart upload
    ///part and send it to S3.  After the part is sent, the internal buffer will be cleared and
    ///and counters will be reset. Since AWS has restrictions on the sizes of upload parts, each
    ///part other than the last one must be 5MB, flush is not made available as part of the public
    ///api.  
    ///# Arguments
    /// * `aws_operations` - The aws operation to use for the upload.  This trait holds all of the
    /// aws operations that are used by the functions in this structure.  To test this
    /// function, you can pass in your own traits implementation.
    async fn flush_impl<T: UploadStreamOps>(
        &mut self,
        aws_operations: &T,
    ) -> Result<(), UploadStreamWriteError> {
        if self.buffer_size > 0 {
            let body = ByteStream::from(self.buffer[0..self.buffer_size as usize].to_vec());
            let upload_part_response = aws_operations
                .upload_part_operation(
                    self.bucket_name.clone(),
                    self.file_name.clone(),
                    self.part_number.clone(),
                    self.upload_id.clone(),
                    body,
                    self.client.clone(),
                )
                .await;
            if upload_part_response.is_err() {
                let err = upload_part_response.err().unwrap().into_service_error();
                let err = err.meta().to_string();
                return Err(UploadStreamWriteError::UnexpectedError(
                    GlyphxErrorData::new(
                        err.to_string(),
                        Some(
                            json!({"Bucket" : self.get_bucket_name(), "FileName" : self.get_file_name()}),
                        ),
                        None,
                    ),
                ));
            }
            let upload_part_response = upload_part_response.unwrap();
            self.upload_parts.push(
                CompletedPart::builder()
                    .e_tag(upload_part_response.e_tag.unwrap_or_default())
                    .part_number(self.part_number)
                    .build(),
            );
            self.file_size += self.buffer_size as i64;
            self.part_number += 1;
            self.buffer.clear();
            self.buffer_size = 0;
        }
        Ok(())
    }

    ///this is our private impleimentation for abort.  This function will abort the multipart upload
    ///and reset the internal state.
    ///# Arguments
    /// * `aws_operations` - The aws operation to use for the upload.  This trait holds all of the
    /// aws operations that are used by the functions in this structure.  To test this
    /// function, you can pass in your own traits implementation.
    async fn abort_impl<T: UploadStreamOps>(&mut self, aws_operations: &T ) {
        //We are going to try to abort, but we really don't care if it fails.
        //We are already in a bad state so no sense reporting an erorr handling the 
        //error.
        let _ = aws_operations
            .abort_multipart_upload_operation(
                self.bucket_name.clone(),
                self.file_name.clone(),
                self.upload_id.clone(),
                self.client.clone(),
            )
            .await;
        self.state = UploadStreamState::Aborted;
        self.buffer.clear();
        self.buffer_size = 0;
        self.part_number = 1;
    }
}

#[cfg(test)]
mod constructor {
    use super::*;
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use http;

    #[tokio::test]
    async fn is_ok() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        let res = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops).await;

        assert!(res.is_ok());
        let upload_manager = res.unwrap();
        assert_eq!(upload_manager.get_bucket_name(), bucket_name);
        assert_eq!(upload_manager.get_file_name(), file_name);
        assert_eq!(upload_manager.upload_id, upload_id);
        assert_eq!(upload_manager.part_number, 1);
        assert_eq!(upload_manager.buffer_size, 0);
    }

    #[tokio::test]
    async fn create_multipart_upload_fails() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";

        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = CreateMultipartUploadError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);

        let res = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops).await;

        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_error = match err {
            UploadStreamConstructorError::UnexpectedError(_) => true,
            _ => false,
        };

        assert!(is_error);
    }
}

#[cfg(test)]
mod flush {
    use super::*;
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use http;

    #[tokio::test]
    async fn is_ok_data_to_flush() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 1;
        //we need to seed so dummy data so that the buffer is not empty
        //and the call to flush will be able to run.
        upload_manager.buffer_size = 1;
        upload_manager.buffer = vec![1];
        let res = upload_manager.flush_impl(&mock_ops).await;
        assert!(res.is_ok());
        assert_eq!(upload_manager.buffer_size, 0);
        assert_eq!(upload_manager.part_number, 2);
        assert!(upload_manager.buffer.is_empty());
    }

    #[tokio::test]
    async fn is_ok_no_data_to_flush() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(0);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 1;
        //we need to seed so dummy data so that the buffer is not empty
        //and the call to flush will be able to run.
        upload_manager.buffer_size = 0;
        upload_manager.buffer = vec![1];
        let res = upload_manager.flush_impl(&mock_ops).await;
        assert!(res.is_ok());
        //These asserts would should never occur in the wild
        //but I just want to make sure that the buffer is not
        //cleared.  buffer_size controls this so buffer_size
        //should never 0 if there is data in the buffer.
        assert_eq!(upload_manager.buffer_size, 0);
        assert_eq!(upload_manager.part_number, 1);
        assert_eq!(upload_manager.buffer.len(), 1);
    }

    #[tokio::test]
    async fn is_unexpected_error() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = UploadPartError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 1;
        //we need to seed so dummy data so that the buffer is not empty
        //and the call to flush will be able to run.
        upload_manager.buffer_size = 1;
        upload_manager.buffer = vec![1];
        let res = upload_manager.flush_impl(&mock_ops).await;
        assert!(res.is_err());
        let err = res.unwrap_err();
        let is_error = match err {
            UploadStreamWriteError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_error);

        assert_eq!(upload_manager.buffer_size, 1);
        assert_eq!(upload_manager.part_number, 1);
        assert!(!upload_manager.buffer.is_empty());
    }
}

#[cfg(test)]
mod write {
    use super::*;
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use http;

    #[tokio::test]
    async fn is_ok_with_data_no_flush() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(0);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 1;
        let res = upload_manager.write_impl(Some(vec![1]), &mock_ops).await;
        assert!(res.is_ok());
        assert_eq!(upload_manager.buffer_size, 1);
        assert_eq!(upload_manager.part_number, 1);
        assert_eq!(upload_manager.buffer.len(), 1);
    }

    #[tokio::test]
    async fn is_ok_with_data_to_flush() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 1;
        upload_manager.buffer_size = (BUFFER_LIMIT - 1) as i32;
        let mut vec = Vec::new();
        for _ in 0..(BUFFER_LIMIT - 1) {
            vec.push(1);
        }
        upload_manager.buffer = vec;
        let res = upload_manager.write_impl(Some(vec![1]), &mock_ops).await;
        assert!(res.is_ok());
        assert_eq!(upload_manager.buffer_size, 0);
        assert_eq!(upload_manager.part_number, 2);
        assert_eq!(upload_manager.buffer.len(), 0);
    }

    #[tokio::test]
    async fn is_ok_with_data_to_flush_and_leftover_bytes() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 1;
        upload_manager.buffer_size = (BUFFER_LIMIT - 1) as i32;
        let mut vec = Vec::new();
        for _ in 0..(BUFFER_LIMIT - 1) {
            vec.push(1);
        }
        upload_manager.buffer = vec;
        let res = upload_manager.write_impl(Some(vec![1, 1]), &mock_ops).await;
        assert!(res.is_ok());
        assert_eq!(upload_manager.buffer_size, 1);
        assert_eq!(upload_manager.part_number, 2);
        assert_eq!(upload_manager.buffer.len(), 1);
    }
    #[tokio::test]
    async fn is_err_with_flush_error() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = UploadPartError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);
        mock_ops.expect_abort_multipart_upload_operation().returning(|_, _, _, _| Ok(AbortMultipartUploadOutput::builder().build())).times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 1;
        upload_manager.buffer_size = (BUFFER_LIMIT - 1) as i32;
        let mut vec = Vec::new();
        for _ in 0..(BUFFER_LIMIT - 1) {
            vec.push(1);
        }
        upload_manager.buffer = vec;
        let res = upload_manager.write_impl(Some(vec![1]), &mock_ops).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_error = match err {
            UploadStreamWriteError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_error);
        let aborted = match upload_manager.state {
            UploadStreamState::Aborted => true,
            _ => false,
        };
        assert!(aborted);
    }
    #[tokio::test]
    async fn is_err_previously_aborted() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(0);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();

        upload_manager.state = UploadStreamState::Aborted;
        let res = upload_manager.write_impl(Some(vec![1]), &mock_ops).await;
        assert!(res.is_err());
        let aborted = match res.err().unwrap() {
            UploadStreamWriteError::Aborted(_) => true,
            _ => false,
        };
        assert!(aborted);
    }

    #[tokio::test]
    async fn is_err_previously_finished() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(0);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(0);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();

        upload_manager.state = UploadStreamState::Finished;
        let res = upload_manager.write_impl(Some(vec![1]), &mock_ops).await;
        assert!(res.is_err());
        let finished = match res.err().unwrap() {
            UploadStreamWriteError::Finished(_) => true,
            _ => false,
        };
        assert!(finished);
    }

}

#[cfg(test)]
mod finish {
    use super::*;
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use http;

    #[tokio::test]
    async fn is_ok_no_data_to_flush() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 2;
        let res = upload_manager.finish_impl(&mock_ops).await;
        assert!(res.is_ok());
        let is_finished = match upload_manager.state {
            UploadStreamState::Finished => true,
            _ => false,
        };
        assert!(is_finished);
    }

    #[tokio::test]
    async fn is_ok_data_to_flush() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| Ok(CompleteMultipartUploadOutput::builder().build()))
            .times(1);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| Ok(UploadPartOutput::builder().build()))
            .times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 2;
        //we need to seed so dummy data so that the buffer is not empty
        //and the call to flush will be able to run.
        upload_manager.buffer_size = 1;
        upload_manager.buffer = vec![1];
        let res = upload_manager.finish_impl(&mock_ops).await;
        assert!(res.is_ok());
        let is_finished = match upload_manager.state {
            UploadStreamState::Finished => true,
            _ => false,
        };
        assert!(is_finished);
    }

    #[tokio::test]
    async fn is_unexpected_error() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_complete_multipart_upload_operation()
            .returning(|_, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = CompleteMultipartUploadError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);
        mock_ops.expect_abort_multipart_upload_operation().returning(|_, _, _, _| Ok(AbortMultipartUploadOutput::builder().build())).times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 2;
        let res = upload_manager.finish_impl(&mock_ops).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_error = match err {
            UploadStreamFinishError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_error);

        let is_aborted = match upload_manager.state {
            UploadStreamState::Aborted => true,
            _ => false,
        };
        assert!(is_aborted);
    }

    #[tokio::test]
    async fn is_no_data_to_write_error() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);
        mock_ops.expect_abort_multipart_upload_operation().returning(|_, _, _, _| Ok(AbortMultipartUploadOutput::builder().build())).times(1);

        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        let res = upload_manager.finish_impl(&mock_ops).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_error = match err {
            UploadStreamFinishError::NoDataToWrite(_) => true,
            _ => false,
        };
        assert!(is_error);

        let is_aborted = match upload_manager.state {
            UploadStreamState::Aborted => true,
            _ => false,
        };
        assert!(is_aborted);
    }

    #[tokio::test]
    async fn flush_is_unexpected_error() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = UploadPartError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(1);
        mock_ops.expect_abort_multipart_upload_operation().returning(|_, _, _, _| Ok(AbortMultipartUploadOutput::builder().build())).times(1);

        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 2;
        //we need to seed so dummy data so that the buffer is not empty
        //and the call to flush will be able to run.
        upload_manager.buffer_size = 1;
        upload_manager.buffer = vec![1];
        let res = upload_manager.finish_impl(&mock_ops).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_error = match err {
            UploadStreamFinishError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_error);

        let is_aborted = match upload_manager.state {
            UploadStreamState::Aborted => true,
            _ => false,
        };
        assert!(is_aborted);
    }

    #[tokio::test]
    async fn previously_aborted() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = UploadPartError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(0);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 2;
        //we need to seed so dummy data so that the buffer is not empty
        //and the call to flush will be able to run.
        upload_manager.buffer_size = 1;
        upload_manager.buffer = vec![1];
        upload_manager.state = UploadStreamState::Aborted;
        let res = upload_manager.finish_impl(&mock_ops).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_error = match err {
            UploadStreamFinishError::Aborted(_) => true,
            _ => false,
        };
        assert!(is_error);
    }

    #[tokio::test]
    async fn previously_finished() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);

        mock_ops
            .expect_upload_part_operation()
            .returning(|_, _, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = UploadPartError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            })
            .times(0);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.part_number = 2;
        //we need to seed so dummy data so that the buffer is not empty
        //and the call to flush will be able to run.
        upload_manager.buffer_size = 1;
        upload_manager.buffer = vec![1];
        upload_manager.state = UploadStreamState::Finished;
        let res = upload_manager.finish_impl(&mock_ops).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_error = match err {
            UploadStreamFinishError::Finished(_) => true,
            _ => false,
        };
        assert!(is_error);
    }
}

#[cfg(test)]
pub mod abort {
    use super::*;
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use http;

    #[tokio::test]
    async fn is_ok() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);


        mock_ops.expect_abort_multipart_upload_operation().returning(|_, _, _, _| Ok(AbortMultipartUploadOutput::builder().build())).times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.abort_impl(&mock_ops).await;

        let is_aborted = match upload_manager.state {
            UploadStreamState::Aborted => true,
            _ => false,
        };
        assert!(is_aborted);
        assert!(upload_manager.buffer.is_empty());
        assert_eq!(upload_manager.buffer_size, 0);
        assert_eq!(upload_manager.part_number, 1);
    }

    #[tokio::test]
    async fn failures_are_swallowed() {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = Client::new(&config);
        let file_name = "test.txt";
        let bucket_name = "glyphx-test";
        let upload_id = "test_upload_id";
        let mut mock_ops = MockUploadStreamOps::new();
        mock_ops
            .expect_start_multipart_upload_operation()
            .returning(|_, _, _| {
                Ok(CreateMultipartUploadOutput::builder()
                    .bucket(bucket_name.to_string())
                    .key(file_name.to_string())
                    .upload_id(upload_id.to_string())
                    .build())
            })
            .times(1);


        mock_ops.expect_abort_multipart_upload_operation().returning(|_, _, _, _| {

                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let err = AbortMultipartUploadError::generic(meta);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
        }).times(1);
        let mut upload_manager = UploadStream::new_impl(bucket_name, file_name, client, &mock_ops)
            .await
            .unwrap();
        upload_manager.abort_impl(&mock_ops).await;

        let is_aborted = match upload_manager.state {
            UploadStreamState::Aborted => true,
            _ => false,
        };
        assert!(is_aborted);
        assert!(upload_manager.buffer.is_empty());
        assert_eq!(upload_manager.buffer_size, 0);
        assert_eq!(upload_manager.part_number, 1);
    }

}
