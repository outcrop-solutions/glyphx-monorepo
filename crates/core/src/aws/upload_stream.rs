use crate::error::GlyphxErrorData;
use aws_sdk_s3::primitives::SdkBody;
use aws_sdk_s3::types::{CompletedMultipartUpload, CompletedPart};
use aws_sdk_s3::Client;
use aws_smithy_http::byte_stream::ByteStream;
use serde_json::json;
const BUFFER_LIMIT: usize = 1025 * 1024 * 5; // 5 MB
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
}

#[derive(Debug)]
pub enum UploadStreamConstructorError {
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug)]
pub enum UploadStreamWriteError {
    UnexpectedError(GlyphxErrorData),
}

impl UploadStream {
    pub async fn new(
        bucket_name: &str,
        file_name: &str,
        client: Client,
    ) -> Result<UploadStream, UploadStreamConstructorError> {
        let buffer = Vec::with_capacity(BUFFER_LIMIT);
        let mp_upload = client
            .create_multipart_upload()
            .bucket(bucket_name)
            .key(file_name)
            .send()
            .await;
        if mp_upload.is_err() {
            let err = mp_upload.err().unwrap().into_service_error();
            let err = err.to_string();
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
        })
    }

    pub fn get_file_name(&self) -> &str {
        &self.file_name
    }

    pub fn get_file_size(&self) -> i64 {
        self.file_size
    }

    pub fn get_bucket_name(&self) -> &str {
        &self.bucket_name
    }

    pub async fn write(&mut self, bytes: Option<Vec<u8>>) -> Result<(), UploadStreamWriteError> {
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
                self.buffer.extend_from_slice( &bytes[vec_start..vec_start + bytes_to_copy]   );
                self.buffer_size += bytes_to_copy as i32;
                bytes_remain -= bytes_to_copy;
                if self.buffer_size == BUFFER_LIMIT as i32 {
                    let flush_result = self.flush().await;
                    if flush_result.is_err() {
                        return flush_result;
                    }
                }
            }
        } else {
            return self.flush().await;
        }
        Ok(())
    }

    pub async fn finish(&mut self) -> Result<(), UploadStreamWriteError> {
        if self.buffer_size > 0 {
            self.flush().await;
        }
        let completed_multipart_upload: CompletedMultipartUpload =
            CompletedMultipartUpload::builder()
                .set_parts(Some(self.upload_parts.clone()))
                .build();
        let _complete_multipart_upload = self
            .client
            .complete_multipart_upload()
            .bucket(self.bucket_name.clone())
            .key(self.file_name.clone())
            .upload_id(self.upload_id.clone())
            .multipart_upload(completed_multipart_upload)
            .send()
            .await;
        Ok(())
    }
    pub async fn flush(&mut self) -> Result<(), UploadStreamWriteError> {
        if self.buffer_size > 0 {

            let body = ByteStream::from(self.buffer[0..self.buffer_size as usize].to_vec());
            let upload_part_response = self
                .client
                .upload_part()
                .bucket(self.bucket_name.clone())
                .key(self.file_name.clone())
                .part_number(self.part_number)
                .upload_id(self.upload_id.clone())
                .body(body)
                .send()
                .await;
            if upload_part_response.is_err() {
                let err = upload_part_response.err().unwrap();
                let err = err.into_service_error();
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
}
