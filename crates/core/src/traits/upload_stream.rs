use crate::aws::upload_stream::UploadStreamState;
use crate::types::aws::upload_stream::*;
use async_trait::async_trait;

#[async_trait]
pub trait IUploadStream: Send + Sync {
    fn get_file_name(&self) -> &str;
    fn get_file_size(&self) -> i64;
    fn get_bucket_name(&self) -> &str;
    fn get_state(&self) -> &UploadStreamState;
    async fn write(&mut self, bytes: Option<Vec<u8>>) -> Result<(), UploadStreamWriteError>;
    async fn finish(&mut self) -> Result<(), UploadStreamFinishError>;
}
