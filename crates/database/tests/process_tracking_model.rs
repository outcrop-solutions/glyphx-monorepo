use glyphx_core::ErrorTypeParser;
use glyphx_core::logging::setup_logging;
use glyphx_core::Singleton;
use glyphx_database::models::process_tracking::*;
use glyphx_database::traits::GlyphxDataModel;
use glyphx_database::MongoDbConnection;
use glyphx_database::errors::AllIdsExistError;
use log::LevelFilter;
use mongodb::bson::uuid::Uuid;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, DateTime};
use serde_json::json;

#[tokio::test]
async fn test() {
    setup_logging(
        "process_tracking_mode_tests".to_string(),
        None,
        None,
        Some(LevelFilter::Warn),
    );
    MongoDbConnection::build_singleton().await;

    let unique_id = Uuid::new().to_string();
    let process_id = format!("test_process_id_{}", unique_id);
    let bad_id = ObjectId::new().to_string();


    //Create a new process tracking model
    let inbound_model = CreateProcessTrackingModelBuilder::default()
        .process_id(process_id.clone())
        .process_name("process_tracking_model_tests")
        .build()
        .unwrap();
    let created_document = ProcessTrackingModel::insert_document(&inbound_model).await;
    if let Err(error) = &created_document {
        error.fatal();
    }

    let created_document = created_document.unwrap();
    let id = created_document.id.clone();
   
    //There is no reason to call find as the create process also calls find

    //id_exists 
    let does_id_exist = ProcessTrackingModel::id_exists(&id).await;
    if let Err(error) = &does_id_exist {
        error.fatal();
    }

    let does_id_exist = does_id_exist.unwrap();
    assert!(does_id_exist.is_some());


    //id_does_not_exist 
    let does_id_exist = ProcessTrackingModel::id_exists(&bad_id).await;
    if let Err(error) = &does_id_exist {
        error.fatal();
    }

    let does_id_exist = does_id_exist.unwrap();
    assert!(does_id_exist.is_none());

    //all_ids_exist
    let do_all_ids_exist = ProcessTrackingModel::all_ids_exist(&vec![&id]).await; 
    if let Err(error) = &do_all_ids_exist {
        error.fatal();
    }

    //all_ids_do_not_exist
    let do_all_ids_exist = ProcessTrackingModel::all_ids_exist(&vec![&id, &bad_id]).await; 
    assert!(do_all_ids_exist.is_err());
    let do_all_ids_exist = do_all_ids_exist.err().unwrap();
    match do_all_ids_exist {
        AllIdsExistError::MissingIds(_) => {
        },
        _ => {
            panic!("Expected AllIdsExistError::IdDoesNotExist");
        }
    }
    
    //get the document by process_id
    let document = ProcessTrackingModel::get_by_process_id(&process_id).await;
    if let Err(error) = &document {
        error.fatal();
    }

    //query the document by process_id
    let filter = doc! {"processId" : process_id};
    let query_results = ProcessTrackingModel::query_documents(&filter, None, None).await;
    if let Err(error) = &query_results {
        error.fatal();
    }
    let query_results = query_results.unwrap();
    assert!(query_results.is_some());
    let query_results = query_results.unwrap();
    assert_eq!(query_results.results.len(), 1);


    //now lets update the document
    let new_process_name = format!("updated_process_tracking_model_tests_{}", unique_id);
    let process_end_time = DateTime::now();
   let update_model = UpdateProcessTrackingModelBuilder::default()
       .process_name(&new_process_name)
       .process_end_time(process_end_time.clone())
       .process_result(json!({"message" : "This is a test result"}))
       .build()
       .unwrap();
   let update_results = ProcessTrackingModel::update_document_by_id(&id, &update_model).await;

    if let Err(error) = &update_results {
        error.fatal();
    }
    let update_results = update_results.unwrap();
    assert_eq!(update_results.process_name, new_process_name);
    assert_eq!(update_results.process_end_time, Some(process_end_time));

    //add a message
    let message1 = "This is a test message".to_string();
    let message2 = "This is a second test message".to_string();
    let add_message_results = ProcessTrackingModel::add_process_messages(&id, &message1).await;
    if let Err(error) = &add_message_results {
        error.fatal();
    }
    let add_message_results = add_message_results.unwrap();
    assert_eq!(add_message_results.process_messages.len(), 1);

    let add_message_results = ProcessTrackingModel::add_process_messages(&id, &message2).await;
    if let Err(error) = &add_message_results {
        error.fatal();
    }
    let add_message_results = add_message_results.unwrap();
    assert_eq!(add_message_results.process_messages.len(), 2);
    assert_eq!(add_message_results.process_messages[0], message2);
   assert_eq!(add_message_results.process_messages[1], message1);

   //add an error 
   let error1 = json!({"message" : "This is a test error"});
   let error2 = json!({"message" : "This is a second test error"});
   let add_error_results = ProcessTrackingModel::add_process_error(&id, &error1).await;
   if let Err(error) = &add_error_results {
       error.fatal();
    }
    let add_error_results = add_error_results.unwrap();
    assert_eq!(add_error_results.process_error.len(), 1);

    let add_error_results = ProcessTrackingModel::add_process_error(&id, &error2).await;
    if let Err(error) = &add_error_results {
        error.fatal();
    }
    let add_error_results = add_error_results.unwrap();
    assert_eq!(add_error_results.process_error.len(), 2);
    assert_eq!(add_error_results.process_error[0], error2);
    assert_eq!(add_error_results.process_error[1], error1);

    //delete the document
     let delete_results = ProcessTrackingModel::delete_document_by_id(&id).await;
     if let Err(error) = &delete_results {
         error.fatal();
     }

     let find_results = ProcessTrackingModel::get_by_id(&id).await;
     if let Err(error) = &find_results {
         error.fatal();
     }
     let find_results = find_results.unwrap();
     assert!(find_results.is_none());



}
