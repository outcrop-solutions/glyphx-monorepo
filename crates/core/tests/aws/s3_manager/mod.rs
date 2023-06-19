pub mod sub_mod;
use glyphx_core::aws::S3Manager;  
use glyphx_core::aws::s3_manager::GetFileInformationError;

const BUCKET_NAME: &str = "jps-test-bucket";

#[tokio::test]
async fn constructor() {
    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());
    assert_eq!(s3_manager.unwrap().get_bucket_name(), BUCKET_NAME);
}

#[tokio::test]
async fn bucket_exists() {
    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());

    let bucket_exists = s3_manager.unwrap().bucket_exists().await;
    assert!(bucket_exists.is_ok());

}

#[tokio::test]
async fn list_objects() {
    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());

    let list_objects = s3_manager.unwrap().list_objects(None).await;
    assert!(list_objects.is_ok());
    let list_objects = list_objects.unwrap();
    assert!(list_objects.len() >= 1000);

}

#[tokio::test]
async fn get_file_info() {
    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());
    let file_name = String::from("test/TestClient1.csv");

    let file_info = s3_manager.unwrap().get_file_information(file_name.clone()).await;
    assert!(file_info.is_ok());
    let file_info = file_info.unwrap();
    assert_eq!(file_info.file_name, file_name);
    assert_eq!(file_info.file_size, 2012);

    let file_info_debug = format!("{:?}", file_info);
    assert!(file_info_debug.len() > 0);
}

#[tokio::test]
async fn get_file_info_fails() {
    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());
    let file_name = String::from("test/foo_TestClient1.csv");

    let file_info = s3_manager.unwrap().get_file_information(file_name.clone()).await;
    assert!(file_info.is_err());
    let err = file_info.err().unwrap();
    let errored:bool;
    match err {
       GetFileInformationError::KeyDoesNotExist(_)  => errored = true,
        _ => panic!("Unexpected error: ")
    }
    assert!(errored);

    //format our error for debug to satisfy code coverage
    let err_debug = format!("{:?}", err);
    assert!(err_debug.len() > 0);

}
