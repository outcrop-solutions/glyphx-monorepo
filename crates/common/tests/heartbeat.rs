use glyphx_common::util::Heartbeat;
use glyphx_database::{ProcessTrackingModel, MongoDbConnection, GlyphxDataModel};
use glyphx_core::Singleton;
use bson::oid::ObjectId;

#[tokio::test]
async fn test() {
    let oid = ObjectId::new();
    let process_name = format!("heartbeat_test_{}", oid);
    MongoDbConnection::build_singleton().await;
    let mut heartbeat = Heartbeat::new(process_name.clone(), 1);
    let result = heartbeat.start().await;
    assert!(result.is_ok());


    let process_tracking_document = ProcessTrackingModel::process_id_exists(&heartbeat.get_process_id()).await;
    assert!(process_tracking_document.is_ok());
    let process_tracking_document = process_tracking_document.unwrap();
    assert!(process_tracking_document.is_some());

    //lets wait for .5 seconds to give the heartbeat a chance to run at least once
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    let process_tracking_document = ProcessTrackingModel::get_by_process_id(&heartbeat.get_process_id()).await;
    assert!(process_tracking_document.is_ok());
    let process_tracking_document = process_tracking_document.unwrap();
    assert!(process_tracking_document.is_some());
    let process_tracking_document = process_tracking_document.unwrap();

    //lets wait for .5 seconds to give the heartbeat a chance to run at least once more
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    let process_tracking_document2 = ProcessTrackingModel::get_by_process_id(&heartbeat.get_process_id()).await;

    assert!(process_tracking_document2.is_ok());
    let process_tracking_document2 = process_tracking_document2.unwrap();
    assert!(process_tracking_document2.is_some());
    let process_tracking_document2 = process_tracking_document2.unwrap();

    assert!(process_tracking_document2.process_heartbeat.unwrap() > process_tracking_document.process_heartbeat.unwrap()); 

    heartbeat.stop();

    let process_tracking_document = ProcessTrackingModel::get_by_process_id(&heartbeat.get_process_id()).await;
    assert!(process_tracking_document.is_ok());
    let process_tracking_document = process_tracking_document.unwrap();
    assert!(process_tracking_document.is_some());
    let process_tracking_document = process_tracking_document.unwrap();

    //lets wait for .5 seconds to give the heartbeat a chance to run at least once more -- if it
    //going to
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    let process_tracking_document2 = ProcessTrackingModel::get_by_process_id(&heartbeat.get_process_id()).await;

    assert!(process_tracking_document2.is_ok());
    let process_tracking_document2 = process_tracking_document2.unwrap();
    assert!(process_tracking_document2.is_some());
    let process_tracking_document2 = process_tracking_document2.unwrap();

    assert!(process_tracking_document2.process_heartbeat.unwrap() == process_tracking_document.process_heartbeat.unwrap()); 

    let result = ProcessTrackingModel::delete_document_by_filter(&bson::doc! {"processId" : heartbeat.get_process_id()}).await;
    assert!(result.is_ok());

}
