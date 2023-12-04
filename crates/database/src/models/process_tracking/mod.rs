mod process_status;

use crate::errors::*;
use crate::traits::GlyphxDataModel;

use glyphx_core::GlyphxErrorData;
use glyphx_data_model::GlyphxDataModel;

use mongodb::bson::{doc, DateTime};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::common::deserialize_object_id;
pub use process_status::*;

#[derive(Clone, Debug, Serialize, Deserialize, GlyphxDataModel)]
#[model_definition({"collection" : "processtrackings"})]
pub struct ProcessTrackingModel {
    #[serde(rename = "_id", deserialize_with = "deserialize_object_id")]
    #[field_definition({"updateable" : false, "createable" : false, "object_id" : true})]
    pub id: String,
    #[serde(rename = "processId")]
    #[field_definition({"updateable" : false})]
    pub process_id: String,
    #[serde(rename = "processName")]
    pub process_name: String,
    #[serde(rename = "processStatus")]
    #[field_definition({"default_value" : "ProcessStatus::Running"})]
    pub process_status: ProcessStatus,
    #[serde(rename = "processStartTime")]
    #[field_definition({"createable" : false, "default_value" : "DateTime::now()"})]
    pub process_start_time: DateTime,
    #[serde(rename = "processEndTime", skip_serializing_if = "Option::is_none")]
    #[field_definition({"createable" : false})]
    pub process_end_time: Option<DateTime>,
    #[serde(rename = "processMessages")]
    #[field_definition({"createable" : false, "default_value" : "Vec::new()"})]
    pub process_messages: Vec<String>,
    #[serde(rename = "processError")]
    #[field_definition({"createable" : false, "default_value" : "Vec::new()"})]
    pub process_error: Vec<Value>,
    #[serde(rename = "processResult", skip_serializing_if = "Option::is_none")]
    #[field_definition({"createable" : false})]
    pub process_result: Option<Value>,
    #[serde(rename = "processHeartbeat", skip_serializing_if = "Option::is_none")]
    #[field_definition({"createable" : false})]
    pub process_heartbeat: Option<DateTime>,
}

//Functions in this impl block are unique to this collection and must be created by hand.
impl ProcessTrackingModel {
    async fn process_id_exists_impl<T: DatabaseOperations>(
        process_id: &str,
        database_operations: &T,
    ) -> Result<Option<()>, IdExistsError> {
        let raw_document = database_operations
            .count_documents(mongodb::bson::doc! { "processId": process_id }, None)
            .await;
        if raw_document.is_err() {
            return Err(IdExistsError::from_mongo_db_error(
                &raw_document.unwrap_err().kind,
                "process_tracking",
                "process_id_exists",
            ));
        }
        let raw_document = raw_document.unwrap();
        if raw_document == 0 {
            return Ok(None);
        }
        return Ok(Some(()));
    }
    pub async fn process_id_exists(process_id: &str) -> Result<Option<()>, IdExistsError> {
        ProcessTrackingModel::process_id_exists_impl(process_id, &DatabaseOperationsImpl).await
    }

    async fn get_by_process_id_impl<T: DatabaseOperations>(
        process_id: &str,
        database_operations: &T,
    ) -> Result<Option<ProcessTrackingModel>, FindOneError> {
        let filter = doc! { "processId": process_id };
        Self::get_one_by_filter_impl(&filter, database_operations).await
    }

    pub async fn get_by_process_id(
        process_id: &str,
    ) -> Result<Option<ProcessTrackingModel>, FindOneError> {
        ProcessTrackingModel::get_by_process_id_impl(process_id, &DatabaseOperationsImpl).await
    }

    pub async fn update_heartbeat(process_id: &str) -> Result<(), UpdateDocumentError> {
        Self::update_heartbeat_impl(process_id, &DatabaseOperationsImpl).await
    }

    pub async fn update_heartbeat_impl<T: DatabaseOperations>(
        process_id: &str,
        database_operations: &T,
    ) -> Result<(), UpdateDocumentError> {
        let filter = doc! { "processId": process_id };
        let document = doc! { "$set": { "processHeartbeat": DateTime::now() } };
        let results = database_operations.update_one_document(&filter, &document, None).await;
        if results.is_err() {
            return Err(UpdateDocumentError::from_mongo_db_error(
                &results.unwrap_err().kind,
                "processtrackings",
                "update_heartbeat",
            ));
        }
        let results = results.unwrap();
        if results.modified_count == 0 {
            let message = format!(
                "No documents found to update that match the process_id : {}",
                process_id
            );
            let data = json!({"processId" : process_id, "operation" : "update_heartbeat", "collection" : "processtrackings"});
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            return Err(UpdateDocumentError::UpdateFailure(error_data));
        }
        Ok(())
    }
}

impl Default for ProcessTrackingModel {
    fn default() -> Self {
        ProcessTrackingModel {
            id: "".to_string(),
            process_id: "".to_string(),
            process_name: "".to_string(),
            process_status: ProcessStatus::Running,
            process_start_time: DateTime::now(),
            process_end_time: None,
            process_messages: Vec::new(),
            process_error: Vec::new(),
            process_result: None,
            process_heartbeat: None,
        }
    }
}

#[cfg(test)]
mod get_by_id {
    use super::*;
    use mongodb::bson::oid::ObjectId;
    use mongodb::error::{Error as MongoDbError, Result as MongoDbResult};

    #[tokio::test]
    async fn is_ok() {
        let id = ObjectId::new().to_string();
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_find_one()
            .times(1)
            .return_const(MongoDbResult::Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: "process_id".to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: vec!["process_messages".to_string()],
                process_error: vec![Value::Null],
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::get_by_id_impl(&id, &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_some());
        let result = result.unwrap();
        assert_eq!(result.id, "id");
    }

    #[tokio::test]
    async fn is_none() {
        let id = ObjectId::new().to_string();
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_find_one()
            .times(1)
            .return_const(MongoDbResult::Ok(None));

        let result = ProcessTrackingModel::get_by_id_impl(&id, &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn is_error() {
        let id = ObjectId::new().to_string();
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_find_one()
            .times(1)
            .return_const(MongoDbResult::Err(MongoDbError::custom(
                "An error occurred",
            )));

        let result = ProcessTrackingModel::get_by_id_impl(&id, &mock_impl).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            FindOneError::UnexpectedError(error_data) => {
                let operation = error_data.data.unwrap();
                let operation = operation["operation"].as_str().unwrap();
                assert_eq!(operation, "get_by_id");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod get_one_by_filter {
    use super::*;
    use mongodb::error::{Error as MongoDbError, Result as MongoDbResult};

    #[tokio::test]
    async fn is_ok() {
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_find_one()
            .times(1)
            .return_const(MongoDbResult::Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: "process_id".to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: vec!["process_messages".to_string()],
                process_error: vec![Value::Null],
                process_result: None,
                process_heartbeat: None,
            })));

        let result =
            ProcessTrackingModel::get_one_by_filter_impl(&doc! {"_id": "id"}, &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_some());
        let result = result.unwrap();
        assert_eq!(result.id, "id");
    }

    #[tokio::test]
    async fn is_none() {
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_find_one()
            .times(1)
            .return_const(MongoDbResult::Ok(None));

        let result =
            ProcessTrackingModel::get_one_by_filter_impl(&doc! { "_id" : "id"}, &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn is_error() {
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_find_one()
            .times(1)
            .return_const(MongoDbResult::Err(MongoDbError::custom(
                "An error occurred",
            )));

        let result =
            ProcessTrackingModel::get_one_by_filter_impl(&doc! { "_id" : "id" }, &mock_impl).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            FindOneError::UnexpectedError(error_data) => {
                let operation = error_data.data.unwrap();
                let operation = operation["operation"].as_str().unwrap();
                assert_eq!(operation, "get_by_id");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod get_by_process_id {
    use super::*;
    use mongodb::error::Result as MongoDbResult;
    use serde_json::from_str;

    #[tokio::test]
    async fn is_ok() {
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_find_one()
            .once()
            .withf(|filter, _| {
                let json_str = filter.to_string();
                let json_value: Value = from_str(&json_str).unwrap();
                let process_id = json_value["processId"].as_str().unwrap();
                process_id == "process_id"
            })
            .return_const(MongoDbResult::Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: "process_id".to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: vec!["process_messages".to_string()],
                process_error: vec![Value::Null],
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::get_by_process_id_impl("process_id", &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_some());
        let result = result.unwrap();
        assert_eq!(result.id, "id");
    }
}

#[cfg(test)]
mod id_exists {
    use super::*;
    use mongodb::bson::oid::ObjectId;
    use mongodb::error::{Error as MongoDbError, Result as MongoDbResult};

    #[tokio::test]
    async fn id_exists() {
        let id = ObjectId::new().to_string();
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .times(1)
            .return_const(Ok(1));

        let result = ProcessTrackingModel::id_exists_impl(&id, &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_some());
    }

    #[tokio::test]
    async fn id_does_not_exist() {
        let id = ObjectId::new().to_string();
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .times(1)
            .return_const(MongoDbResult::Ok(0));

        let result = ProcessTrackingModel::id_exists_impl(&id, &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn is_error() {
        let id = ObjectId::new().to_string();
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .times(1)
            .return_const(MongoDbResult::Err(MongoDbError::custom(
                "An error occurred",
            )));

        let result = ProcessTrackingModel::id_exists_impl(&id, &mock_impl).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            IdExistsError::UnexpectedError(error_data) => {
                let operation = error_data.data.unwrap();
                let operation = operation["operation"].as_str().unwrap();
                assert_eq!(operation, "id_exists");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn invalid_oid() {
        let id = "invalid".to_string();
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .never()
            .return_const(MongoDbResult::Err(MongoDbError::custom(
                "An error occurred",
            )));

        let result = ProcessTrackingModel::id_exists_impl(&id, &mock_impl).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            IdExistsError::InvalidId(error_data) => {
                let operation = error_data.data.unwrap();
                let operation = operation["operation"].as_str().unwrap();
                assert_eq!(operation, "id_exists");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod process_id_exists {
    use super::*;
    use mongodb::error::{Error as MongoDbError, Result as MongoDbResult};
    use serde_json::from_str;

    #[tokio::test]
    async fn process_id_exists() {
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .times(1)
            .withf(|filter, _| {
                let json_str = filter.to_string();
                let json_value: Value = from_str(&json_str).unwrap();
                let process_id = json_value["processId"].as_str().unwrap();
                process_id == "process_id"
            })
            .return_const(Ok(1));

        let result = ProcessTrackingModel::process_id_exists_impl("process_id", &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_some());
    }

    #[tokio::test]
    async fn id_does_not_exist() {
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .times(1)
            .withf(|filter, _| {
                let json_str = filter.to_string();
                let json_value: Value = from_str(&json_str).unwrap();
                let process_id = json_value["processId"].as_str().unwrap();
                process_id == "process_id"
            })
            .return_const(Ok(0));

        let result = ProcessTrackingModel::process_id_exists_impl("process_id", &mock_impl).await;
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn is_error() {
        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .times(1)
            .withf(|filter, _| {
                let json_str = filter.to_string();
                let json_value: Value = from_str(&json_str).unwrap();
                let process_id = json_value["processId"].as_str().unwrap();
                process_id == "process_id"
            })
            .return_const(MongoDbResult::Err(MongoDbError::custom(
                "An error occurred",
            )));

        let result = ProcessTrackingModel::process_id_exists_impl("process_id", &mock_impl).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            IdExistsError::UnexpectedError(error_data) => {
                let operation = error_data.data.unwrap();
                let operation = operation["operation"].as_str().unwrap();
                assert_eq!(operation, "process_id_exists");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod process_tracking_model_tests {
    use super::*;
    use mongodb::bson::from_document;
    use mongodb::bson::oid::ObjectId;

    #[test]
    fn test1() {
        let id1 = ObjectId::new().to_string();
        let id2 = ObjectId::new().to_string();
        let model = ProcessTrackingModel {
            id: id1.clone(),
            process_id: "process_id".to_string(),
            process_name: "process_name".to_string(),
            process_status: ProcessStatus::Running,
            process_start_time: DateTime::now(),
            process_end_time: None,
            process_messages: vec!["process_messages".to_string()],
            process_error: vec![Value::Null],
            process_result: None,
            process_heartbeat: None,
        };

        let output = model.to_bson().unwrap();
        let _json = model.to_json();
        assert!(true);

        let document = output.clone();
        let s = from_document::<ProcessTrackingModel>(document.clone());
        let _s = s.unwrap();
        assert!(true);

        let json2 = serde_json::json!({
            "_id": id2.clone(),
            "process_id": "process_id",
            "process_name": "process_name",
            "process_status": "Bad",
            "process_start_time": "2023-11-03 17:47:16.641 +00:00:00",
            "process_end_time": null,
            "process_messages": [
                "process_messages"
            ],
            "process_error": [
                null
            ],
            "process_result": null,
            "process_heartbeat": null
        });
        let s2: serde_json::Result<ProcessTrackingModel> = serde_json::from_value(json2);
        let err = s2.unwrap_err();
        let _err_msg = format!("{:?}", err);
        let _cat = format!("{:?}", err.classify());
        assert!(true);
    }
}

#[cfg(test)]
mod all_ids_exist {
    use super::*;
    use crate::models::common::*;
    use mongodb::bson::oid::ObjectId;
    use mongodb::error::{Error as MongoDbError, Result as MongoDbResult};

    #[tokio::test]
    async fn all_ids_exist() {
        let id1 = ObjectId::new().to_string();
        let id2 = ObjectId::new().to_string();
        let id3 = ObjectId::new().to_string();
        let ids = vec![id1.as_str(), &id2.as_str(), &id3.as_str()];

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_query_ids()
            .times(1)
            .return_const(MongoDbResult::Ok(Some(vec![
                DocumentIds { id: id1.clone() },
                DocumentIds { id: id2.clone() },
                DocumentIds { id: id3.clone() },
            ])));

        let result = ProcessTrackingModel::all_ids_exist_impl(&ids, &mock_impl).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn some_ids_exist() {
        let id1 = ObjectId::new().to_string();
        let id2 = ObjectId::new().to_string();
        let id3 = ObjectId::new().to_string();
        let ids = vec![id1.as_str(), &id2.as_str(), &id3.as_str()];

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_query_ids()
            .times(1)
            .return_const(MongoDbResult::Ok(Some(vec![DocumentIds {
                id: id2.clone(),
            }])));

        let result = ProcessTrackingModel::all_ids_exist_impl(&ids, &mock_impl).await;
        assert!(result.is_err());
        match result.err().unwrap() {
            AllIdsExistError::MissingIds(error_data) => {
                let ids = error_data.data.unwrap();
                let ids = ids["ids"].as_array().unwrap();
                assert_eq!(ids.len(), 2);
                assert_eq!(ids[0], id1);
                assert_eq!(ids[1], id3);
            }
            _ => panic!("Unexpected error type"),
        }
    }
    #[tokio::test]
    async fn no_ids_exist() {
        let id1 = ObjectId::new().to_string();
        let id2 = ObjectId::new().to_string();
        let id3 = ObjectId::new().to_string();
        let ids = vec![id1.as_str(), &id2.as_str(), &id3.as_str()];

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_query_ids()
            .times(1)
            .return_const(MongoDbResult::Ok(None));

        let result = ProcessTrackingModel::all_ids_exist_impl(&ids, &mock_impl).await;
        assert!(result.is_err());
        match result.err().unwrap() {
            AllIdsExistError::MissingIds(error_data) => {
                let ids = error_data.data.unwrap();
                let ids = ids["ids"].as_array().unwrap();
                assert_eq!(ids.len(), 3);
                assert_eq!(ids[0], id1);
                assert_eq!(ids[1], id2);
                assert_eq!(ids[2], id3);
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn mongodb_error() {
        let id1 = ObjectId::new().to_string();
        let id2 = ObjectId::new().to_string();
        let id3 = ObjectId::new().to_string();
        let ids = vec![id1.as_str(), &id2.as_str(), &id3.as_str()];

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_query_ids()
            .times(1)
            .return_const(MongoDbResult::Err(MongoDbError::custom(
                "An error occurred",
            )));

        let result = ProcessTrackingModel::all_ids_exist_impl(&ids, &mock_impl).await;
        assert!(result.is_err());
        match result.err().unwrap() {
            AllIdsExistError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "all_ids_exist");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod insert_document {
    use super::*;
    use crate::models::common::*;
    use mongodb::error::Error as MongoDbError;

    #[tokio::test]
    async fn is_ok() {
        let id = mongodb::bson::oid::ObjectId::new();
        let process_id = "process_id";
        let process_name = "test process";
        let insert_document = CreateProcessTrackingModelBuilder::default()
            .process_id(process_id.to_string())
            .process_name(process_name.to_string())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_insert_document()
            .once()
            .return_const(Ok(CreateOneData { id: id.to_string() }));

        mocks
            .expect_find_one()
            .once()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: id.to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::insert_document_impl(&insert_document, &mocks).await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.id, id.to_string());
        assert_eq!(result.process_id, process_id);
        assert_eq!(result.process_name, process_name);
    }

    #[tokio::test]
    async fn call_to_insert_document_fails() {
        let id = mongodb::bson::oid::ObjectId::new();
        let process_id = "process_id";
        let process_name = "test process";
        let insert_document = CreateProcessTrackingModelBuilder::default()
            .process_id(process_id.to_string())
            .process_name(process_name.to_string())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_insert_document()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        mocks
            .expect_find_one()
            .never()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: id.to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::insert_document_impl(&insert_document, &mocks).await;

        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            InsertDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "insert_document");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn get_by_id_fails() {
        let id = mongodb::bson::oid::ObjectId::new();
        let process_id = "process_id";
        let process_name = "test process";
        let insert_document = CreateProcessTrackingModelBuilder::default()
            .process_id(process_id.to_string())
            .process_name(process_name.to_string())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_insert_document()
            .once()
            .return_const(Ok(CreateOneData { id: id.to_string() }));

        mocks
            .expect_find_one()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        let result = ProcessTrackingModel::insert_document_impl(&insert_document, &mocks).await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            InsertDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "insert_document");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn get_by_id_returns_none() {
        let id = mongodb::bson::oid::ObjectId::new();
        let process_id = "process_id";
        let process_name = "test process";
        let insert_document = CreateProcessTrackingModelBuilder::default()
            .process_id(process_id.to_string())
            .process_name(process_name.to_string())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_insert_document()
            .once()
            .return_const(Ok(CreateOneData { id: id.to_string() }));

        mocks.expect_find_one().once().return_const(Ok(None));

        let result = ProcessTrackingModel::insert_document_impl(&insert_document, &mocks).await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            InsertDocumentError::CreateFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "insert_document");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod update_document_by_id {
    use super::*;
    use crate::models::common::*;

    #[tokio::test]
    async fn is_ok() {
        let id = mongodb::bson::oid::ObjectId::new();
        let process_id = "process_id";
        let process_name = "test process";
        let update_document = UpdateProcessTrackingModelBuilder::default()
            .process_end_time(DateTime::now())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mocks
            .expect_find_one()
            .once()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: id.to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::update_document_by_id_impl(
            &id.to_string(),
            &update_document,
            &mocks,
        )
        .await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.id, id.to_string());
        assert_eq!(result.process_id, process_id);
        assert_eq!(result.process_name, process_name);
    }
}

#[cfg(test)]
mod update_document_by_filter {
    use super::*;
    use crate::models::common::*;
    use mongodb::error::Error as MongoDbError;

    #[tokio::test]
    async fn is_ok() {
        let id = mongodb::bson::oid::ObjectId::new();
        let process_id = "process_id";
        let process_name = "test process";
        let update_document = UpdateProcessTrackingModelBuilder::default()
            .process_end_time(DateTime::now())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mocks
            .expect_find_one()
            .once()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: id.to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::update_document_by_filter_impl(
            &doc! { "_id": id.to_string()},
            &update_document,
            &mocks,
        )
        .await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.id, id.to_string());
        assert_eq!(result.process_id, process_id);
        assert_eq!(result.process_name, process_name);
    }

    #[tokio::test]
    async fn call_to_update_document_fails() {
        let id = mongodb::bson::oid::ObjectId::new();
        let process_id = "process_id";
        let process_name = "test process";
        let update_document = UpdateProcessTrackingModelBuilder::default()
            .process_end_time(DateTime::now())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        mocks
            .expect_find_one()
            .never()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: id.to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::update_document_by_filter_impl(
            &doc! { "_id" : id.to_string()},
            &update_document,
            &mocks,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            UpdateDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "update_document_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn get_by_filter_fails() {
        let id = mongodb::bson::oid::ObjectId::new();
        let update_document = UpdateProcessTrackingModelBuilder::default()
            .process_end_time(DateTime::now())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(UpdateOneResult::Ok(UpdateOneData { modified_count: 1 }));

        mocks
            .expect_find_one()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        let result = ProcessTrackingModel::update_document_by_filter_impl(
            &doc! { "_id" : id.to_string()},
            &update_document,
            &mocks,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "update_document_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn get_by_filter_returns_none() {
        let id = mongodb::bson::oid::ObjectId::new();
        let insert_document = UpdateProcessTrackingModelBuilder::default()
            .process_end_time(DateTime::now())
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mocks.expect_find_one().once().return_const(Ok(None));

        let result = ProcessTrackingModel::update_document_by_filter_impl(
            &doc! { "id" : id.to_string()},
            &insert_document,
            &mocks,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UpdateFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "update_document_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn validation_fails() {
        let id = mongodb::bson::oid::ObjectId::new();
        let insert_document = UpdateProcessTrackingModelBuilder::default()
            .build()
            .unwrap();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .never()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mocks.expect_find_one().never().return_const(Ok(None));

        let result = ProcessTrackingModel::update_document_by_filter_impl(
            &doc! { "id" : id.to_string()},
            &insert_document,
            &mocks,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::DocumentValidationFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "update_document_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod delete_document_by_id {
    use super::*;
    use crate::models::common::*;

    #[tokio::test]
    async fn is_ok() {
        let id = mongodb::bson::oid::ObjectId::new();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_delete_one_document()
            .once()
            .return_const(Ok(DeleteOneData { deleted_count: 1 }));

        let result =
            ProcessTrackingModel::delete_document_by_id_impl(&id.to_string(), &mocks).await;

        assert!(result.is_ok());
    }
}

#[cfg(test)]
mod delete_document_by_filter {
    use super::*;
    use crate::models::common::*;
    use mongodb::error::Error as MongoDbError;

    #[tokio::test]
    async fn is_ok() {
        let id = mongodb::bson::oid::ObjectId::new();
        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_delete_one_document()
            .once()
            .return_const(Ok(DeleteOneData { deleted_count: 1 }));

        let result = ProcessTrackingModel::delete_document_by_filter_impl(
            &doc! { "_id": id.to_string()},
            &mocks,
        )
        .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn call_to_delete_document_fails() {
        let id = mongodb::bson::oid::ObjectId::new();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_delete_one_document()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        let result = ProcessTrackingModel::delete_document_by_filter_impl(
            &doc! { "_id" : id.to_string()},
            &mocks,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            DeleteDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "delete_document_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn no_documents_deleted() {
        let id = mongodb::bson::oid::ObjectId::new();

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_delete_one_document()
            .once()
            .return_const(Ok(DeleteOneData { deleted_count: 0 }));

        let result = ProcessTrackingModel::delete_document_by_filter_impl(
            &doc! { "id" : id.to_string()},
            &mocks,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            DeleteDocumentError::DeleteFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "delete_document_by_filter");
                assert_eq!(data["collection"], "processtrackings");
                assert!(data["filter"].is_object());
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod add_message_by_filter {
    use super::*;
    use crate::models::common::*;
    use mongodb::error::Error as MongoDbError;

    #[tokio::test]
    async fn is_ok() {
        let process_id = "process_id";

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl
            .expect_find_one()
            .once()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_messages_by_filter_impl(
            &doc! { "processId": process_id},
            &"message".to_string(),
            &mock_impl,
        )
        .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn update_errors() {
        let process_id = "process_id";

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        mock_impl
            .expect_find_one()
            .never()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_messages_by_filter_impl(
            &doc! { "processId": process_id},
            &"message".to_string(),
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_messages_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn no_documents_updated() {
        let process_id = "process_id";

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 0 }));

        mock_impl
            .expect_find_one()
            .never()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_messages_by_filter_impl(
            &doc! { "processId": process_id},
            &"message".to_string(),
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UpdateFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_messages_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn find_document_errors() {
        let process_id = "process_id";

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl
            .expect_find_one()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        let result = ProcessTrackingModel::add_process_messages_by_filter_impl(
            &doc! { "processId": process_id},
            &"message".to_string(),
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_messages_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn find_document_returns_none() {
        let process_id = "process_id";

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl.expect_find_one().once().return_const(Ok(None));

        let result = ProcessTrackingModel::add_process_messages_by_filter_impl(
            &doc! { "processId": process_id},
            &"message".to_string(),
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UpdateFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_messages_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod add_message_by_id {
    use super::*;
    use crate::models::common::*;
    use mongodb::bson::oid::ObjectId;

    #[tokio::test]
    async fn is_ok() {
        let id = ObjectId::new().to_string();

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl
            .expect_find_one()
            .once()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: id.clone(),
                process_id: "process_id".to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_messages_impl(
            &id,
            &"message".to_string(),
            &mock_impl,
        )
        .await;

        assert!(result.is_ok());
    }
}

#[cfg(test)]
mod add_error_by_filter {
    use super::*;
    use crate::models::common::*;
    use mongodb::error::Error as MongoDbError;
    use serde_json::json;

    #[tokio::test]
    async fn is_ok() {
        let process_id = "process_id";
        let error = json!({"error": "error"});
        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl
            .expect_find_one()
            .once()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: vec![error.clone()],
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_error_by_filter_impl(
            &doc! { "processId": process_id},
            &error,
            &mock_impl,
        )
        .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn update_errors() {
        let process_id = "process_id";
        let error = json!({"error": "error"});

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        mock_impl
            .expect_find_one()
            .never()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: vec![error.clone()],
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_error_by_filter_impl(
            &doc! { "processId": process_id},
            &error,
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_error_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn no_documents_updated() {
        let process_id = "process_id";
        let error = json!({"error": "error"});

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 0 }));

        mock_impl
            .expect_find_one()
            .never()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: vec![error.clone()],
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_error_by_filter_impl(
            &doc! { "processId": process_id},
            &error,
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UpdateFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_error_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn find_document_errors() {
        let process_id = "process_id";
        let error = json!({"error": "error"});

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl
            .expect_find_one()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        let result = ProcessTrackingModel::add_process_error_by_filter_impl(
            &doc! { "processId": process_id},
            &error,
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_error_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn find_document_returns_none() {
        let process_id = "process_id";
        let error = json!({"error": "error"});

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl.expect_find_one().once().return_const(Ok(None));

        let result = ProcessTrackingModel::add_process_error_by_filter_impl(
            &doc! { "processId": process_id},
            &error,
            &mock_impl,
        )
        .await;

        assert!(result.is_err());
        let result = result.err().unwrap();

        match result {
            UpdateDocumentError::UpdateFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "add_process_error_by_filter");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[cfg(test)]
mod add_error_by_id {
    use super::*;
    use crate::models::common::*;
    use mongodb::bson::oid::ObjectId;
    use serde_json::json;

    #[tokio::test]
    async fn is_ok() {
        let id = ObjectId::new().to_string();
        let process_id = "process_id";
        let error = json!({"error": "error"});

        let mut mock_impl = MockDatabaseOperations::new();

        mock_impl
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        mock_impl
            .expect_find_one()
            .once()
            .return_const(Ok(Some(ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: "process_name".to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            })));

        let result = ProcessTrackingModel::add_process_error_impl(&id, &error, &mock_impl).await;

        assert!(result.is_ok());
    }
}

#[cfg(test)]
mod query_documents {
    use super::*;
    use mongodb::error::Error as MongoDbError;

    #[tokio::test]
    async fn is_ok() {
        let process_id = "process_id";
        let process_name = "process_name";

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .once()
            .return_const(Ok(1));

        mock_impl
            .expect_query_documents()
            .once()
            .return_const(Ok(Some(vec![ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            }])));

        let results =
            ProcessTrackingModel::query_documents_impl(&doc! {"_id": "id"}, None, None, &mock_impl)
                .await;

        assert!(results.is_ok());
        let results = results.unwrap();
        assert!(results.is_some());
        let results = results.unwrap();
        assert_eq!(results.number_of_items, 1);
        assert_eq!(results.results.len(), 1);
        assert_eq!(results.page_number, 0);
        assert_eq!(results.page_size, 10);
    }

    #[tokio::test]
    async fn is_ok_no_defaults() {
        let process_id = "process_id";
        let process_name = "process_name";
        let page_size = 5;
        let page_number = 1;

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .once()
            .return_const(Ok(6));

        mock_impl
            .expect_query_documents()
            .once()
            .return_const(Ok(Some(vec![ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            }])));

        let results = ProcessTrackingModel::query_documents_impl(
            &doc! {"_id": "id"},
            Some(page_number),
            Some(page_size),
            &mock_impl,
        )
        .await;

        assert!(results.is_ok());
        let results = results.unwrap();
        assert!(results.is_some());
        let results = results.unwrap();
        assert_eq!(results.number_of_items, 6);
        assert_eq!(results.results.len(), 1);
        assert_eq!(results.page_number, page_number);
        assert_eq!(results.page_size, page_size);
    }

    #[tokio::test]
    async fn page_size_is_0() {
        let process_id = "process_id";
        let process_name = "process_name";
        let page_size = 0;
        let page_number = 1;

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .never()
            .return_const(Ok(6));

        mock_impl
            .expect_query_documents()
            .never()
            .return_const(Ok(Some(vec![ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            }])));

        let results = ProcessTrackingModel::query_documents_impl(
            &doc! {"_id": "id"},
            Some(page_number),
            Some(page_size),
            &mock_impl,
        )
        .await;

        assert!(results.is_err());
        let results = results.err().unwrap();
        match results {
            QueryDocumentsError::InvalidPageSize(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "query_documents");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn count_documents_errors() {
        let process_id = "process_id";
        let process_name = "process_name";
        let page_size = 5;
        let page_number = 1;

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        mock_impl
            .expect_query_documents()
            .never()
            .return_const(Ok(Some(vec![ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            }])));

        let results = ProcessTrackingModel::query_documents_impl(
            &doc! {"_id": "id"},
            Some(page_number),
            Some(page_size),
            &mock_impl,
        )
        .await;

        assert!(results.is_err());
        let results = results.err().unwrap();
        match results {
            QueryDocumentsError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "query_documents");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn number_of_documents_is_zero() {
        let process_id = "process_id";
        let process_name = "process_name";
        let page_size = 5;
        let page_number = 1;

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .once()
            .return_const(Ok(0));

        mock_impl
            .expect_query_documents()
            .never()
            .return_const(Ok(Some(vec![ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            }])));

        let results = ProcessTrackingModel::query_documents_impl(
            &doc! {"_id": "id"},
            Some(page_number),
            Some(page_size),
            &mock_impl,
        )
        .await;

        assert!(results.is_ok());
        let results = results.unwrap();
        assert!(results.is_none());
    }

    #[tokio::test]
    async fn invalid_page_number() {
        let process_id = "process_id";
        let process_name = "process_name";
        let page_size = 5;
        let page_number = 1;

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .once()
            .return_const(Ok(4));

        mock_impl
            .expect_query_documents()
            .never()
            .return_const(Ok(Some(vec![ProcessTrackingModel {
                id: "id".to_string(),
                process_id: process_id.to_string(),
                process_name: process_name.to_string(),
                process_status: ProcessStatus::Running,
                process_start_time: DateTime::now(),
                process_end_time: None,
                process_messages: Vec::new(),
                process_error: Vec::new(),
                process_result: None,
                process_heartbeat: None,
            }])));

        let results = ProcessTrackingModel::query_documents_impl(
            &doc! {"_id": "id"},
            Some(page_number),
            Some(page_size),
            &mock_impl,
        )
        .await;

        assert!(results.is_err());
        let results = results.err().unwrap();
        match results {
            QueryDocumentsError::InvalidPageNumber(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "query_documents");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn query_documents_is_error() {
        let page_size = 5;
        let page_number = 1;

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .once()
            .return_const(Ok(6));

        mock_impl
            .expect_query_documents()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        let results = ProcessTrackingModel::query_documents_impl(
            &doc! {"_id": "id"},
            Some(page_number),
            Some(page_size),
            &mock_impl,
        )
        .await;

        assert!(results.is_err());
        let results = results.err().unwrap();
        match results {
            QueryDocumentsError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "query_documents");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn query_documents_is_none() {
        let page_size = 5;
        let page_number = 1;

        let mut mock_impl = MockDatabaseOperations::new();
        mock_impl
            .expect_count_documents()
            .once()
            .return_const(Ok(6));

        mock_impl
            .expect_query_documents()
            .once()
            .return_const(Ok(None));

        let results = ProcessTrackingModel::query_documents_impl(
            &doc! {"_id": "id"},
            Some(page_number),
            Some(page_size),
            &mock_impl,
        )
        .await;

        assert!(results.is_ok());
        let results = results.unwrap();
        assert!(results.is_none());
    }
}

#[cfg(test)]
mod update_heartbeat {
    use super::*;
    use crate::models::common::*;
    use mongodb::error::Error as MongoDbError;

    #[tokio::test]
    async fn is_ok() {
        let process_id = "process_id";

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 1 }));

        let result = ProcessTrackingModel::update_heartbeat_impl(process_id, &mocks).await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn call_to_update_document_fails() {
        let process_id = "process_id";

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(Err(MongoDbError::custom("An error occurred")));

        let result = ProcessTrackingModel::update_heartbeat_impl(process_id, &mocks).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            UpdateDocumentError::UnexpectedError(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "update_heartbeat");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }

    #[tokio::test]
    async fn update_does_not_update_any_documents() {
        let process_id = "process_id";

        let mut mocks = MockDatabaseOperations::new();
        mocks
            .expect_update_one_document()
            .once()
            .return_const(Ok(UpdateOneData { modified_count: 0 }));

        let result = ProcessTrackingModel::update_heartbeat_impl(process_id, &mocks).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            UpdateDocumentError::UpdateFailure(error_data) => {
                let data = error_data.data.unwrap();
                assert_eq!(data["operation"], "update_heartbeat");
                assert_eq!(data["collection"], "processtrackings");
            }
            _ => panic!("Unexpected error type"),
        }
    }
}
