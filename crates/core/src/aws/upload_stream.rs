use crate::error::GlyphxErrorData;
use aws_sdk_s3::Client;
use serde_json::json;

const BUFFER_LIMIT: usize = 4096;
pub struct UploadStream {
    file_name: String,
    file_size: u64,
    buffer: [u8; BUFFER_LIMIT],
    buffer_size: u32,
    client: Client,
    bucket_name: String,
    part_number: u32,
}

pub enum UploadStreamWriteError {
    UnexpectedError(GlyphxErrorData),
}

impl UploadStream {
    pub async fn new(bucket_name: &str, file_name: &str, client: Client) -> UploadStream {
        let mut buffer = [0; BUFFER_LIMIT];
        Ok(UploadStream {
            file_name: String::from(file_name),
            file_size: 0,
            buffer,
            buffer_size: 0,
            client,
            bucket_name: String::from(bucket_name),
            part_number: 0,
        })
    }

    pub fn get_file_name(&self) -> &str {
        &self.file_name
    }

    pub fn get_file_size(&self) -> u64 {
        self.file_size
    }

    pub fn get_bucket_name(&self) -> &str {
        &self.bucket_name
    }

    pub async fn write(&mut self, bytes: Option<vec<u8>>) -> Result<(), UploadStreamWriteError> {
        if (bytes.is_some()) {
            let bytes = bytes.unwrap();
            let vec_size = bytes.len();
            let mut bytes_remain = bytes.len();
            let buff_remain = BUFFER_LIMIT - self.buffer_size;
            while bytes_remain > 0 {
                let bytes_to_copy = if bytes_remain > buff_remain {
                    buff_remain
                } else {
                    bytes_remain
                };
                let vec_start = vec_size - bytes_remain;
                self.buffer[self.buffer_size..self.buffer_size + bytes_to_copy]
                    .copy_from_slice(&bytes[vec_start..vec_start + bytes_to_copy]);
                self.buffer_size += bytes_to_copy;
                bytes_remain -= bytes_to_copy;
                if self.buffer_size == BUFFER_LIMIT {
                    let flush_result = self.flush().await;
                    if flush_result.is_err() {
                        return flush_result;
                    }
                }
            }
        } else {
            self.flush().await;
        }
        Ok(())
    }

    pub async fn flush(&mut self) -> Result<(), UploadStreamWriteError> {
        if self.buffer_size > 0 {
            let mut body = SdkBody::from(&self.buffer[0..self.buffer_size]);
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
                            json!({"Bucket" : self.get_bucket_name(), "FileName" : bucket.get_file_name()}),
                        ),
                        None,
                    ),
                ));
            }
            self.file_size += self.buffer_size as u64;
            self.part_number += 1;
            self.buffer = [0; BUFFER_LIMIT];
            self.buffer_size = 0;
        }
        Ok(())
    }
}
