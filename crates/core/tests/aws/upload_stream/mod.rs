use crate::generate_random_file_name;
use glyphx_core::aws::upload_stream::UploadStream;
use glyphx_core::aws::S3Manager;
const BUCKET_NAME: &str = "jps-test-bucket";

//#[tokio::test]
async fn upload_a_file_from_string() {
  //TODO: We don't need this anymore as the integration test for this is now in the S3Manager integration test
  //I am keeping this here as an example of adding additional tests as their own modules.  Once we

}
