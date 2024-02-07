pub mod sub_mod;
use crate::generate_random_file_name;
use glyphx_core::aws::S3Manager;
use glyphx_core::aws::s3_manager::FileExistsError;
use reqwest;

const BUCKET_NAME: &str = "jps-test-bucket";

async fn file_exists(s3_manager: &S3Manager, key: &str) -> bool {
    let exist_result = s3_manager.file_exists(key).await;
    if exist_result.is_ok() {
        return true;
    } else {
        let file_not_found = match exist_result.as_ref().err().unwrap() {
            FileExistsError::FileDoesNotExist(_) => true,
            _ => false,
        };
        if file_not_found {
            return false;
        } else {
            panic!(
                "Error checking if file exists: {:?}",
                exist_result.err().unwrap()
            );
        }
    }
}
async fn download_file_as_string(s3_manager: &S3Manager, key: &str) -> String {
    let stream = s3_manager.get_object_stream(key).await;
    assert!(stream.is_ok());
    let stream = stream.unwrap();
    let buf = stream.collect().await.unwrap().to_vec();

    let result = String::from_utf8(buf).unwrap();
    result
}
#[tokio::test]
async fn integration() {
    //1.  Create a new S3Manager
    let s3_manager = S3Manager::new(String::from(BUCKET_NAME)).await;
    assert!(s3_manager.is_ok());
    let s3_manager = s3_manager.unwrap();

    //2.  Check if the bucket exists
    let bucket_exists = s3_manager.bucket_exists().await;
    assert!(bucket_exists.is_ok());

    //3.  List the objects in the bucket
    let list_objects = s3_manager.list_objects(None).await;
    assert!(list_objects.is_ok());

    let list_objects = list_objects.unwrap();
    assert!(list_objects.len() >= 1000);

    //4.  Upload a file using S3Client
    let file_name = "test/test_".to_owned() + generate_random_file_name(10).as_str() + ".txt";
    let file_text = "I am the file's text";
    assert_eq!(file_exists(&s3_manager, &file_name).await, false);

    let bytes: Vec<u8> = file_text.bytes().collect();
    let upload_result = s3_manager.upload_object(&file_name, bytes, None).await;
    assert!(upload_result.is_ok());

    //5.  Check if the file exists.
    assert!(file_exists(&s3_manager, &file_name).await);

    //6.  Get the file information.
    let file_info = s3_manager.get_file_information(&file_name).await;
    assert!(file_info.is_ok());
    let file_info = file_info.unwrap();
    assert_eq!(file_info.file_name, file_name);

    //7.  Download the file.
    let file_contents = download_file_as_string(&s3_manager, &file_name).await;
    assert_eq!(file_contents, file_text);

    //8.  Delete the file.
    let delete_result = s3_manager.remove_object(&file_name).await;
    assert!(delete_result.is_ok());
    assert_eq!(file_exists(&s3_manager, &file_name).await, false);

    //9.  Upload the file using the SignedUpLoadUrl.
    let file_name = "test/test_".to_owned() + generate_random_file_name(10).as_str() + ".txt";
    let upload_url = s3_manager
        .get_signed_upload_url(&file_name, None, None)
        .await;
    assert!(upload_url.is_ok());
    let upload_url = upload_url.unwrap();

    let req_client = reqwest::Client::new();
    let res = req_client
        .put(upload_url.as_str())
        .body(file_text.clone())
        .send()
        .await;
    assert!(res.is_ok());
    let res = res.unwrap();
    assert!(res.status().is_success());

    assert!(file_exists(&s3_manager, &file_name).await);

    let file_contents = download_file_as_string(&s3_manager, &file_name).await;
    assert_eq!(file_contents, file_text);

    let delete_result = s3_manager.remove_object(&file_name).await;
    assert!(delete_result.is_ok());

    //10. Upload a file using the UploadStream.
    let file_name = "test/test_".to_owned() + generate_random_file_name(10).as_str() + ".txt";
    let upload_stream = s3_manager.get_upload_stream(&file_name).await;
    assert!(upload_stream.is_ok());
    let mut upload_stream = upload_stream.unwrap();
    let bytes: Vec<u8> = file_text.bytes().collect();
    let write_result = upload_stream.write(Some(bytes)).await;
    assert!(write_result.is_ok());

    let upload_result = upload_stream.finish().await;
    assert!(upload_result.is_ok());

    assert!(file_exists(&s3_manager, &file_name).await);

    let file_contents = download_file_as_string(&s3_manager, &file_name).await;
    assert_eq!(file_contents, file_text);

    let delete_result = s3_manager.remove_object(&file_name).await;
    assert!(delete_result.is_ok());
}
