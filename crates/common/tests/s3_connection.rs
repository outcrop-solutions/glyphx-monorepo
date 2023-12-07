 use glyphx_common::S3Connection;
use glyphx_core::Singleton;

 #[tokio::test]
 async fn s3_connection() {
    let s3_connection = S3Connection::build_singleton().await;
    assert!(s3_connection.is_ok());
    let s3_connection = s3_connection.unwrap();
    let s3_manager = s3_connection.get_s3_manager();
    let file_exists = s3_manager.file_exists("templates/template_new.sdt").await;
    assert!(file_exists.is_ok());
 }
