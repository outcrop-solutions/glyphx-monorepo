use crate::generate_random_file_name;
use glyphx_core::aws::upload_stream::UploadStream;
use glyphx_core::aws::S3Manager;
const BUCKET_NAME: &str = "jps-test-bucket";

#[tokio::test]
async fn upload_a_file_from_string() {
    let file_contents = "These are my test file contents";
    let file_name = "test/test_".to_owned() + generate_random_file_name(10).as_str() + ".txt";

    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());
    let s3_manager = s3_manager.unwrap();
    let upload_stream_res = UploadStream::new(
        s3_manager.get_bucket_name().as_str(),
        &file_name,
        s3_manager.get_client(),
    )
    .await;
    let mut upload_stream: UploadStream = upload_stream_res.unwrap();
    let mut vec_u8 = Vec::new();
    for byte in file_contents.as_bytes() {
        vec_u8.push(byte.clone());
    }
    upload_stream.write(Some(vec_u8)).await;
    let res = upload_stream.finish().await;
    assert!(res.is_ok());
}
