use crate::errors::HeartbeatError;
use glyphx_core::ErrorTypeParser;
use glyphx_database::errors::{InsertDocumentError, UpdateDocumentError};
use glyphx_database::models::process_tracking::*;
use glyphx_database::traits::GlyphxDataModel;

use async_trait::async_trait;
use bson::oid::ObjectId;
use mockall::automock;
use tokio::task::{spawn, JoinHandle};

#[automock]
#[async_trait]
pub trait ProcessTrackingModelOperations: Send + Sync {
    async fn insert_document(
        &self,
        document: &CreateProcessTrackingModel,
    ) -> Result<ProcessTrackingModel, InsertDocumentError>;
    async fn update_heartbeat(&self, id: String) -> Result<(), UpdateDocumentError>;
}

#[derive(Clone)]
struct ProcessTrackingModelOperationsImpl;

#[automock]
#[async_trait]
impl ProcessTrackingModelOperations for ProcessTrackingModelOperationsImpl {
    async fn insert_document(
        &self,
        document: &CreateProcessTrackingModel,
    ) -> Result<ProcessTrackingModel, InsertDocumentError> {
        let doc = document.clone();
        ProcessTrackingModel::insert_document(&doc).await
    }

    async fn update_heartbeat(&self, process_id: String) -> Result<(), UpdateDocumentError> {
        ProcessTrackingModel::update_heartbeat(&process_id).await
    }
}

use std::sync::Arc;
#[derive(Debug, Clone)]
pub struct Heartbeat {
    process_name: String,
    process_id: String,
    interval: usize,
    in_error: bool,
    join_handle: Arc<Option<JoinHandle<()>>>,
}

impl Heartbeat {
    pub fn new(process_name: String, interval: usize) -> Heartbeat {
        let process_id = Self::get_new_process_id();
        Heartbeat {
            process_name,
            process_id,
            interval,
            in_error: false,
            join_handle: Arc::new(None),
        }
    }

    fn get_new_process_id() -> String {
        let process_id = ObjectId::new();
        process_id.to_string()
    }

    pub fn get_process_id(&self) -> String {
        self.process_id.clone()
    }

    pub fn get_process_name(&self) -> String {
        self.process_name.clone()
    }

    pub fn get_interval(&self) -> usize {
        self.interval
    }

    async fn create_process_tracking_record_impl<T: ProcessTrackingModelOperations>(
        &self,
        process_tracking_operations: &T,
    ) -> Result<ProcessTrackingModel, HeartbeatError> {
        let create_process_tracking_document = CreateProcessTrackingModelBuilder::default()
            .process_id(self.process_id.clone())
            .process_name(self.process_name.clone())
            .build()
            .unwrap();

        let result = process_tracking_operations
            .insert_document(&create_process_tracking_document)
            .await;
        if result.is_err() {
            let error = result.err().unwrap();
            let error = HeartbeatError::from(error);
            return Err(error);
        }
        let result = result.unwrap();
        Ok(result)
    }

    async fn start_impl<T1>(
        &mut self,
        process_tracking_operations: T1,
    ) -> Result<(), HeartbeatError>
    where
        T1: ProcessTrackingModelOperations + 'static,
    {
        let process_tracking_document = self
            .create_process_tracking_record_impl(&process_tracking_operations)
            .await;
        if process_tracking_document.is_err() {
            self.in_error = true;
            return Err(process_tracking_document.err().unwrap());
        }
        let process_tracking_document = process_tracking_document.unwrap();
        let interval = self.interval;
        let process_id = process_tracking_document.process_id.clone();
        let handle = spawn(async move {
            loop {
                tokio::time::sleep(tokio::time::Duration::from_millis(interval as u64)).await;
                let update_result = process_tracking_operations
                    .update_heartbeat(process_id.clone())
                    .await;
                if update_result.is_err() {
                    let error = update_result.err().unwrap();
                    error.error();
                    break;
                }
            }
        });
        self.join_handle = Arc::new(Some(handle));
        Ok(())
    }

    pub async fn start(&mut self) -> Result<(), HeartbeatError> {
        self.start_impl(ProcessTrackingModelOperationsImpl).await
    }

    pub fn stop(&mut self) {
        let handle = self.join_handle.as_ref();
        let handle = handle.as_ref().unwrap();
        if !handle.is_finished() {
            handle.abort();
        }
        self.join_handle = Arc::new(None);
    }
}

impl Default for Heartbeat {
    fn default() -> Self {
        let process_id = Self::get_new_process_id();
        Heartbeat {
            process_name: "Default".to_string(),
            process_id,
            interval: 60000,
            in_error: false,
            join_handle: Arc::new(None),
        }
    }
}

#[cfg(test)]
mod start {
    use super::*;
    use glyphx_core::GlyphxErrorData;
    use serde_json::json;

    #[tokio::test]
    async fn is_ok() {
        let mut heartbeat = Heartbeat::new("test".to_string(), 1);
        let mut mocks = MockProcessTrackingModelOperations::new();
        //The mocks do panic when we do not get to 5 calls to update_heartbeat, but
        //the test still passes.  This is because the panic is in a different thread.
        //this approach counts the number of calls so we can check that
        //the thread really is running
        #[allow(non_upper_case_globals)]
        static mut number_of_times_called: usize = 0;
        mocks
            .expect_insert_document()
            .once()
            .return_const(Ok(ProcessTrackingModel::default()));

        mocks
            .expect_update_heartbeat()
            .returning(|_| {
                unsafe { number_of_times_called += 1 };
                Ok(())
            })
            .times(5..);

        let result = heartbeat.start_impl(mocks).await;
        tokio::time::sleep(tokio::time::Duration::from_millis(20)).await;
        assert!(result.is_ok());
        assert!(unsafe { number_of_times_called } >= 5);
    }

    #[tokio::test]
    async fn is_create_process_tracking_err() {
        let mut heartbeat = Heartbeat::new("test".to_string(), 1);
        let mut mocks = MockProcessTrackingModelOperations::new();
        mocks.expect_insert_document().once().returning(|_| {
            let message = "An Error Occurred";
            let data = json!({"inner" : "data"});
            let glyphx_error_data = GlyphxErrorData::new(message.to_string(), Some(data), None);
            Err(InsertDocumentError::AuthenticationError(glyphx_error_data))
        });
        let result = heartbeat.start_impl(mocks).await;
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            HeartbeatError::CreateProcessTrackingError(_) => assert!(true),
            _ => panic!("Expected HeartbeatError::CreateProcessTracingError"),
        }
    }

    #[tokio::test]
    async fn update_heartbeat_fails() {
        let mut heartbeat = Heartbeat::new("test".to_string(), 1);
        let mut mocks = MockProcessTrackingModelOperations::new();
        //The mocks do panic when we do not get to 5 calls to update_heartbeat, but
        //the test still passes.  This is because the panic is in a different thread.
        //this approach counts the number of calls so we can check that
        //the thread really is running
        #[allow(non_upper_case_globals)]
        static mut number_of_times_called: usize = 0;

        mocks
            .expect_insert_document()
            .once()
            .return_const(Ok(ProcessTrackingModel::default()));

        mocks.expect_update_heartbeat().times(2).returning(|_| {
            unsafe { number_of_times_called += 1 };
            if unsafe { number_of_times_called } == 1 {
                Ok(())
            } else {
                Err(UpdateDocumentError::AuthenticationError(
                    GlyphxErrorData::new("An Error Occurred".to_string(), None, None),
                ))
            }
        });
        let result = heartbeat.start_impl(mocks).await;
        tokio::time::sleep(tokio::time::Duration::from_millis(20)).await;
        assert!(result.is_ok());
        assert_eq!(unsafe { number_of_times_called }, 2);
        let is_finished = heartbeat.join_handle.as_ref();
        let is_finished = is_finished.as_ref().unwrap();
        let is_finished = is_finished.is_finished();

        assert!(is_finished);
    }
}

#[cfg(test)]
mod stop {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let mut heartbeat = Heartbeat::new("test".to_string(), 1);
        let mut mocks = MockProcessTrackingModelOperations::new();
        //The mocks do panic when we do not get to 5 calls to update_heartbeat, but
        //the test still passes.  This is because the panic is in a different thread.
        //this approach counts the number of calls so we can check that
        //the thread really is running
        #[allow(non_upper_case_globals)]
        static mut number_of_times_called: usize = 0;
        mocks
            .expect_insert_document()
            .once()
            .return_const(Ok(ProcessTrackingModel::default()));

        mocks
            .expect_update_heartbeat()
            .returning(|_| {
                unsafe { number_of_times_called += 1 };
                Ok(())
            })
            .times(5..);

        let result = heartbeat.start_impl(mocks).await;
        tokio::time::sleep(tokio::time::Duration::from_millis(20)).await;
        assert!(result.is_ok());
        assert!(unsafe { number_of_times_called } >= 5);
        heartbeat.stop();
        let saved_call_count = unsafe { number_of_times_called };
        tokio::time::sleep(tokio::time::Duration::from_millis(20)).await;
        assert_eq!(saved_call_count, unsafe { number_of_times_called });
        assert!(heartbeat.join_handle.as_ref().is_none());
    }
}
