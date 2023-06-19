pub mod sub_mod;
use glyphx_core::aws::S3Manager;  
use glyphx_core::aws::s3_manager::GetFileInformationError;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use reqwest;
use std::io::Read;
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
fn generate_random_file_name(length: usize) -> String {
    let rng = thread_rng();
    let file_name: String = rng
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect();
    file_name
}
#[tokio::test]
async fn get_signed_upload_url() {
//    let file_text = "I am the file's text";
    let file_name = "test/test_".to_owned() + generate_random_file_name(10).as_str() + ".txt"; 

    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());
    let s3_manager = s3_manager.unwrap();

    let upload_url = s3_manager.get_signed_upload_url(file_name.as_str(), None).await;
    assert!(upload_url.is_ok());
    let upload_url = upload_url.unwrap();

    assert!(upload_url.len() > 0);

    // let req_client = reqwest::Client::new();
    // let res = req_client.put(upload_url.as_str())
    //     .body(file_text.clone())
    //     .send()
    //     .await;
    // assert!(res.is_ok());
    // let res = res.unwrap();
    // assert!(res.status().is_success());
        
}


async fn full_test() {
    //1.  Create a new S3Manager
    //2.  Check if the bucket exists
    //3.  List the objects in the bucket
    //4.  Upload a file using S3Client 
    //5.  Check if the file exists. 
    //6.  Get the file information.
    //7.  Download the file.
    //8.  Delete the file.
    //9.  Upload the file using the SignedUpLoadUrl. 
    //10. Check if the file exists.
    //11. Download the File using a download url.
    //12. Delete the file.
}
