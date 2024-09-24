use glyphx_core::aws::s3_manager::BucketExistsError;
use glyphx_core::aws::s3_manager::FileExistsError;
use glyphx_core::aws::s3_manager::ListObjectsError;
use glyphx_core::aws::s3_manager::S3Client;
use glyphx_core::traits::BlockStorageManager;
use glyphx_core::types::aws::s3_manager::*;

#[derive(Debug)]
pub struct TestingS3Manager {}

impl BlockStorageManager for TestingS3Manager {
    fn get_bucket_name(&self) -> String {
        panic!("Not implemented")
    }
    fn get_client(&self) -> S3Client {
        panic!("Not implemented")
    }

    async fn bucket_exists(&self) -> Result<(), BucketExistsError> {
        panic!("Not implemented")
    }

    async fn file_exists(&self, key: &str) -> Result<(), FileExistsError> {
        panic!("Not implemented")
    }

    async fn list_objects(
        &self,
        filter: Option<String>,
        start_after: Option<String>,
    ) -> Result<Vec<String>, ListObjectsError> {
        panic!("Not implemented")
    }

    async fn get_file_information(&self, key: &str) -> Result<S3FileInfo, GetFileInformationError> {
        panic!("Not implemented")
    }
    async fn get_signed_upload_url(
        &self,
        key: &str,
        lifetime: Option<u64>,
        content_type: Option<String>,
    ) -> Result<String, GetSignedUploadUrlError> {
        panic!("Not implemented")
    }
    async fn get_object_stream(&self, key: &str) -> Result<ByteStream, GetObjectStreamError> {
        panic!("Not implemented")
    }
    async fn get_upload_stream(&self, key: &str) -> Result<UploadStream, GetUploadStreamError> {
        panic!("Not implemented")
    }
    async fn remove_object(&self, key: &str) -> Result<(), RemoveObjectError> {
        panic!("Not implemented")
    }
    async fn upload_object(
        &self,
        key: &str,
        data: Vec<u8>,
        content_type: Option<String>,
    ) -> Result<(), UploadObjectError> {
        panic!("Not implemented")
    }
}
