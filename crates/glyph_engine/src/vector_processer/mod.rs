mod errors;
mod task_status;

pub use errors::*;
pub use task_status::*;

use crate::types::vectorizer_parameters::FieldDefinition;
use glyphx_common::{AthenaConnection, S3Connection};
use glyphx_core::{
    aws::{
        athena_manager::RunQueryError,
        s3_manager::{GetUploadStreamError, UploadStreamFinishError, UploadStreamWriteError},
        upload_stream::UploadStream,
    },
    ErrorTypeParser, GlyphxErrorData, Singleton,
};
use model_common::vectors::{Vector, VectorOrigionalValue};

use async_trait::async_trait;
use bincode::serialize;
use im::OrdMap;
use log::error;
use mockall::automock;
use serde_json::{json, to_value, Value};
use std::sync::mpsc::{channel, Receiver, TryRecvError};
use tokio::task::{spawn, JoinHandle};

/// This macro is used to handle functions that return Result<T, E>  in a consistent way in our
/// tokio Tasks. If a code block returns the Result::Err(E) variant, the emited code will unwrap the error
/// and convert it to the supplied error type using the From trait.  Should our underlying logging
/// fail, we will use the internal error! macro from the log crate to spit out the error. An exmaple of
/// using this macro is:
///handle_task_error! (let x = foo(1,2,5), sender)
///If the call to foo is an error, the error will be converted to a VectorCaclulationError logged and returned.
///sender is the name of the variable that holdds the sender for the channel that the task is using to communicate. The macro will also unwrap the result of the call to foo and assign it to the variable x.  If the
///call to foo is successful, the variable x will be assigned the result of the call to foo.
macro_rules! handle_task_error {
    //In this pattern, the error will be passed to the $function_name as the first argument.
    //The $functions_arguments will be passed as the second argument.
    (let $var_name:ident = $express : expr, $sender:ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = VectorCalculationError::from(error);
            error.error();
            let send_result = $sender.send(Err(error));
            if send_result.is_err() {
                let send_error = send_result.err().unwrap();
                let error_string = format!("{:?}", send_error);
                error!("{}", error_string);
            }
            return;
        }
        let $var_name = $var_name.unwrap();
    };
}

macro_rules! handle_sync_task_error {
    //In this pattern, the error will be passed to the $function_name as the first argument.
    //The $functions_arguments will be passed as the second argument.
    (let $var_name:ident = $express : expr) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.err().unwrap();
            let error = VectorCalculationError::from(error);
            error.error();
            return TaskStatus::Errored(error);
        }
        let $var_name = $var_name.unwrap();
    };
}

#[automock]
#[async_trait]
pub trait ThreadOperations {
    async fn run_athena_query(&self, query: &str) -> Result<Value, RunQueryError>;
    async fn get_upload_stream(
        &self,
        s3_file_name: &str,
    ) -> Result<UploadStream, GetUploadStreamError>;
    async fn write_to_stream(
        &self,
        stream: &mut UploadStream,
        data: Vec<u8>,
    ) -> Result<(), UploadStreamWriteError>;

    async fn finish_stream(&self, stream: &mut UploadStream)
        -> Result<(), UploadStreamFinishError>;
}

struct ThreadOperationsImpl;

#[async_trait]
impl ThreadOperations for ThreadOperationsImpl {
    async fn run_athena_query(&self, query: &str) -> Result<Value, RunQueryError> {
        let athena_connection = AthenaConnection::get_instance();
        let athena_manager = athena_connection.get_athena_manager();
        athena_manager
            .run_query(&query, Some(300), Some(true))
            .await
    }
    async fn get_upload_stream(
        &self,
        s3_file_name: &str,
    ) -> Result<UploadStream, GetUploadStreamError> {
        let s3_connection = S3Connection::get_instance();
        let s3_manager = s3_connection.get_s3_manager();
        let upload_stream = s3_manager.get_upload_stream(&s3_file_name).await;
        upload_stream
    }
    async fn write_to_stream(
        &self,
        stream: &mut UploadStream,
        data: Vec<u8>,
    ) -> Result<(), UploadStreamWriteError> {
        let write_result = stream.write(Some(data)).await;
        write_result
    }
    async fn finish_stream(
        &self,
        stream: &mut UploadStream,
    ) -> Result<(), UploadStreamFinishError> {
        let result = stream.finish().await;
        result
    }
}

pub struct VectorProcesser {
    axis_name: String,
    table_name: String,
    s3_file_name: String,
    field_definition: FieldDefinition,
    receiver: Option<Receiver<Result<Vector, VectorCalculationError>>>,
    vectors: OrdMap<VectorOrigionalValue, Vector>,
    join_handle: Option<JoinHandle<()>>,
    task_status: TaskStatus,
    max_rank: usize,
}

///Using a trait pattern will allow me to implemnet a mock for testing using a
///impl pattern in glyph_engine directly.
#[automock]
#[async_trait]
pub trait VectorValueProcesser: Send + Sync {
    fn get_axis_name(&self) -> &str;
    fn start(&mut self);
    async fn run_sync(&mut self) -> TaskStatus;
    fn check_status(&mut self) -> TaskStatus;
    fn get_vector(&self, key: &VectorOrigionalValue) -> Option<Vector>;
    fn get_statistics_vector(&self) -> Vec<f64>;
    fn get_max_vector(&self) -> Option<Vector>;
    fn get_max_rank(&self) -> usize;
}

unsafe impl Sync for VectorProcesser {}

#[async_trait]
impl VectorValueProcesser for VectorProcesser {
    fn get_axis_name(&self) -> &str {
        &self.axis_name
    }

    fn start(&mut self) {
        self.start_impl(&ThreadOperationsImpl)
    }

    async fn run_sync(&mut self) -> TaskStatus {
        self.run_sync_impl(&ThreadOperationsImpl).await
    }

    fn check_status(&mut self) -> TaskStatus {
        if self.receiver.is_none() {
            let data = json!({
                "axis_name": self.axis_name,
                "table_name": self.table_name,
                "field_definition": to_value(&self.field_definition).unwrap(),

            });
            let error_data = GlyphxErrorData::new(
                "The vector processer has not been started.".to_string(),
                Some(data),
                None,
            );
            self.task_status =
                TaskStatus::Errored(VectorCalculationError::IntializationError(error_data));
            return self.task_status.clone();
        }
        //This task has already run to completion so just return the status
        if self.task_status == TaskStatus::Complete {
            return self.task_status.clone();
        }
        let rcv = self.receiver.as_ref().unwrap();
        loop {
            //This is the value from the receiver not the data
            let result = rcv.try_recv();
            if result.is_err() {
                match result.err().unwrap() {
                    TryRecvError::Empty => {
                        //there is no data on the channel so we are still processing
                        return self.task_status.clone();
                    }
                    TryRecvError::Disconnected => {
                        //the channel has been disconnected so the task has errored
                        let data = json!({
                            "axis_name": self.axis_name,
                            "table_name": self.table_name,
                            "field_definition": to_value(&self.field_definition).unwrap(),

                        });
                        let error_data = GlyphxErrorData::new(
                            "The thread has disconnected.".to_string(),
                            Some(data),
                            None,
                        );
                        self.task_status = TaskStatus::Errored(
                            VectorCalculationError::IntializationError(error_data),
                        );
                        self.join_handle.as_ref().unwrap().abort();
                        self.join_handle = None;
                        return self.task_status.clone();
                    }
                }
            }
            //Ok this is data from the channel which is also a result
            let result = result.unwrap();
            if result.is_err() {
                //we don't need to log the error here, it has already been logged
                //on the other thread before it was sent.
                let error = result.err().unwrap();
                self.task_status = TaskStatus::Errored(error);
                self.join_handle = None;
                return self.task_status.clone();
            }
            //And this is data from the channel
            let result = result.unwrap();
            //sending empty data is a signal that the task is complete
            if result.is_empty.is_some() {
                self.task_status = TaskStatus::Complete;
                self.join_handle = None;
                return self.task_status.clone();
            } else {
                self.vectors.insert(result.orig_value.clone(), result);
                self.max_rank = self.max_rank + 1;
            }
        }
    }
    fn get_vector(&self, key: &VectorOrigionalValue) -> Option<Vector> {
        let vector = self.vectors.get(key);
        if vector.is_none() {
            None
        } else {
            Some(vector.unwrap().clone())
        }
    }

    fn get_statistics_vector(&self) -> Vec<f64> {
        self.vectors.iter().map(|(_, v)| v.vector).collect()
    }

    fn get_max_vector(&self) -> Option<Vector> {
        let vec = self.vectors.get_max();
        if vec.is_none() {
            None
        } else {
            let (_, vector) = vec.unwrap();
            Some(vector.clone())
        }
    }

    fn get_max_rank(&self) -> usize {
        self.max_rank
    }
}

impl VectorProcesser {
    pub fn new(
        axis_name: &str,
        table_name: &str,
        s3_file_name: &str,
        field_definition: FieldDefinition,
    ) -> Self {
        Self {
            axis_name: axis_name.to_string(),
            table_name: table_name.to_string(),
            field_definition,
            receiver: None,
            vectors: OrdMap::new(),
            join_handle: None,
            task_status: TaskStatus::Pending,
            s3_file_name: s3_file_name.to_string(),
            max_rank: 0,
        }
    }
    async fn run_sync_impl<T: ThreadOperations>(&mut self, thread_operations: &T) -> TaskStatus {
        let (field_name, query) = self.build_query();
        let s3_file_name = self.s3_file_name.clone();
        self.task_status = TaskStatus::Processing;
        handle_sync_task_error!(let result = thread_operations.run_athena_query(&query).await);
        handle_sync_task_error!(let upload_stream = thread_operations.get_upload_stream(&s3_file_name).await);
        let mut upload_stream = upload_stream;
        let mut rank = 0;
        for row in result.as_array().unwrap() {
            let vector = build_vector(row, &field_name, rank);
            //Byte Serialize the vector
            let ser_vector = serialize_vector(&vector);

            handle_sync_task_error!(let _write_result = thread_operations.write_to_stream(&mut upload_stream, ser_vector).await);

            self.vectors.insert(vector.orig_value.clone(), vector);
            self.max_rank = rank.clone() as usize;
            rank += 1;
        }
        handle_sync_task_error!(let _result = thread_operations.finish_stream(&mut upload_stream).await);
        self.task_status = TaskStatus::Complete;
        TaskStatus::Complete
    }
    fn build_query(&self) -> (String, String) {
        let (field_name, field_value, _) = self.field_definition.get_query_parts();
        let query = format!(
            "SELECT DISTINCT {} FROM {} ORDER BY {}",
            field_value, self.table_name, field_name
        );
        (field_name, query)
    }
    fn start_impl<T: ThreadOperations + Sync>(&mut self, thread_operations: &'static T) {
        let (field_name, query) = self.build_query();
        let s3_file_name = self.s3_file_name.clone();
        let (sender, receiver) = channel::<Result<Vector, VectorCalculationError>>();
        self.receiver = Some(receiver);
        let thread_handle = spawn(async move {
            handle_task_error!(let result = thread_operations.run_athena_query(&query).await, sender);
            let mut rank = 0;
            handle_task_error!(let upload_stream = thread_operations.get_upload_stream(&s3_file_name).await, sender);
            //handle_task_error does not unwrap as mut, we need to do that here
            let mut upload_stream = upload_stream;
            for row in result.as_array().unwrap() {
                let vector = build_vector(row, &field_name, rank);
                //Byte Serialize the vector
                let ser_vector = serialize_vector(&vector);

                handle_task_error!(let _write_result = thread_operations.write_to_stream(&mut upload_stream, ser_vector).await, sender);
                //This doesn't use our macro because the it is actually already sending the result
                //so if that fails, there is no need to try and send the error a second time as it
                //will always fail.
                let send_result = sender.send(Ok(vector));
                if send_result.is_err() {
                    let send_error = send_result.err().unwrap();
                    let error_string = format!("{:?}", send_error);
                    error!("{}", error_string);
                    return;
                }
                rank += 1;
            }
            handle_task_error!(let _result = thread_operations.finish_stream(&mut upload_stream).await, sender);
            //Send and empty vector to signal that the task is complete
            let send_result = sender.send(Ok(Vector::empty()));
            //Same as above, if this fails, there is no need to try and send the error a second time as it
            //will always fail.
            if send_result.is_err() {
                let send_error = send_result.err().unwrap();
                let error_string = format!("{:?}", send_error);
                error!("{}", error_string);
                return;
            }
        });
        self.join_handle = Some(thread_handle);
    }
}

///These functions are run inside the tokio task and have no understading of Self as it is not
///copied into the clousure.  It is ok to place them here outside of the impl block.
fn build_vector(row: &Value, field_name: &String, rank: u64) -> Vector {
    let value = row.get(field_name).unwrap();
    let orig_value: VectorOrigionalValue;
    let vector: f64;
    if value.is_string() {
        orig_value = VectorOrigionalValue::String(value.as_str().unwrap().to_string());
        vector = rank.clone() as f64;
    } else if value.is_f64() {
        let raw_value = value.as_f64().unwrap();
        vector = raw_value.clone();
        orig_value = VectorOrigionalValue::F64(raw_value);
    } else {
        let raw_value = value.as_u64().unwrap();
        vector = raw_value.clone() as f64;
        orig_value = VectorOrigionalValue::U64(raw_value);
    }
    let vector = Vector::new(orig_value, vector, rank);
    vector
}

fn serialize_vector(vector: &Vector) -> Vec<u8> {
    let vector_binary_size = vector.get_binary_size();
    let mut ser_vector: Vec<u8> = Vec::with_capacity(8 + vector_binary_size);
    //We are including the size of the vector so that when we write this to a file we
    //will be able to determine the size of the vector when we read it back in.  This
    //prevents us from having to store the vectors in two seperate blocks of memory,
    //one here and one on the main thread.  In the future, we will stream the results
    //back from athena so we will not hold them all ion memory at once.
    ser_vector.append(serialize(&vector_binary_size).unwrap().as_mut());
    ser_vector.append(serialize(vector).unwrap().as_mut());
    ser_vector
}

//This allows us to build a vector processer from a json result set.  This is useful for testing
#[cfg(test)]
pub(super) fn build_vector_processer_from_json(
    axis_name: &str,
    table_name: &str,
    s3_file_name: &str,
    field_definition: FieldDefinition,
    result_set: Value,
    field_name: String,
) -> Box<dyn VectorValueProcesser> {
    let mut vector_processer =
        VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
    let mut rank = 0;
    for row in result_set.as_array().unwrap() {
        let vector = build_vector(row, &field_name, rank);
        vector_processer
            .vectors
            .insert(vector.orig_value.clone(), vector);
        rank += 1;
    }
    vector_processer.task_status = TaskStatus::Complete;
    Box::new(vector_processer)
}

#[cfg(test)]
mod tests {
    use super::*;
    mod helper_functions {
        use super::*;
        use crate::{
            field_definition_type::FieldDefinitionType,
            types::vectorizer_parameters::{FieldDefinition, StandardFieldDefinition},
            FieldType,
        };
        use glyphx_core::{aws::S3Manager, BlockStorageManager};

        pub struct StringMocks1;
        #[async_trait]
        impl ThreadOperations for StringMocks1 {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let json = serde_json::json!([
                    {
                        "Test": "a"
                    },
                    {
                        "Test": "b"
                    },
                    {
                        "Test": "c"
                    },
                    {
                        "Test": "d"
                    },
                    {
                        "Test": "e"
                    },
                ]);
                Ok(json)
            }
            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let s3_manager = S3Manager::default();
                let client = s3_manager.get_client();
                Ok(UploadStream::empty(client))
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                Ok(())
            }

            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                Ok(())
            }
        }

        pub struct StringMocks2;
        #[async_trait]
        impl ThreadOperations for StringMocks2 {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let json = serde_json::json!([
                    {
                        "Test2": "f"
                    },
                    {
                        "Test2": "g"
                    },
                    {
                        "Test2": "h"
                    },
                    {
                        "Test2": "i"
                    },
                    {
                        "Test2": "j"
                    },
                ]);
                Ok(json)
            }
            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let s3_manager = S3Manager::default();
                let client = s3_manager.get_client();
                Ok(UploadStream::empty(client))
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                Ok(())
            }
            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                Ok(())
            }
        }

        pub struct NumberFloatMocks;
        #[async_trait]
        impl ThreadOperations for NumberFloatMocks {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let json = serde_json::json!([
                    {
                        "Test": 1.0
                    },
                    {
                        "Test": 2.0
                    },
                    {
                        "Test": 3.0
                    },
                    {
                        "Test": 4.0
                    },
                    {
                        "Test": 5.0
                    },
                ]);
                Ok(json)
            }
            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let s3_manager = S3Manager::default();
                let client = s3_manager.get_client();
                Ok(UploadStream::empty(client))
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                Ok(())
            }
            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                Ok(())
            }
        }

        pub struct NumberIntMocks;
        #[async_trait]
        impl ThreadOperations for NumberIntMocks {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let json = serde_json::json!([
                    {
                        "Test": 1
                    },
                    {
                        "Test": 2
                    },
                    {
                        "Test": 3
                    },
                    {
                        "Test": 4
                    },
                    {
                        "Test": 5
                    },
                ]);
                Ok(json)
            }
            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let s3_manager = S3Manager::default();
                let client = s3_manager.get_client();
                Ok(UploadStream::empty(client))
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                Ok(())
            }
            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                Ok(())
            }
        }
        pub struct MocksRunAthenaError;
        #[async_trait]
        impl ThreadOperations for MocksRunAthenaError {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let error_data = GlyphxErrorData::new(
                    "An unexpected error occurred while running the  query.".to_string(),
                    None,
                    None,
                );
                let error = RunQueryError::QueryFailed(error_data);
                Err(error)
            }
            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let s3_manager = S3Manager::default();
                let client = s3_manager.get_client();
                Ok(UploadStream::empty(client))
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                Ok(())
            }
            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                Ok(())
            }
        }

        pub struct MocksStartUploadError;
        #[async_trait]
        impl ThreadOperations for MocksStartUploadError {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let json = serde_json::json!([
                    {
                        "Test2": "f"
                    },
                    {
                        "Test2": "g"
                    },
                    {
                        "Test2": "h"
                    },
                    {
                        "Test2": "i"
                    },
                    {
                        "Test2": "j"
                    },
                ]);
                Ok(json)
            }

            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let error_data = GlyphxErrorData::new(
                    "An unexpected error occurred while starting the upload stream.".to_string(),
                    None,
                    None,
                );
                let error = GetUploadStreamError::UnexpectedError(error_data);
                Err(error)
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                Ok(())
            }
            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                Ok(())
            }
        }

        pub struct MocksWriteUploadError;
        #[async_trait]
        impl ThreadOperations for MocksWriteUploadError {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let json = serde_json::json!([
                    {
                        "Test": "f"
                    },
                    {
                        "Test": "g"
                    },
                    {
                        "Test": "h"
                    },
                    {
                        "Test": "i"
                    },
                    {
                        "Test": "j"
                    },
                ]);
                Ok(json)
            }

            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let s3_manager = S3Manager::default();
                let client = s3_manager.get_client();
                Ok(UploadStream::empty(client))
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                let error_data = GlyphxErrorData::new(
                    "An unexpected error occurred while writing to the upload stream.".to_string(),
                    None,
                    None,
                );
                let error = UploadStreamWriteError::UnexpectedError(error_data);
                Err(error)
            }
            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                Ok(())
            }
        }

        pub struct MocksFinishUploadError;
        #[async_trait]
        impl ThreadOperations for MocksFinishUploadError {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let json = serde_json::json!([
                    {
                        "Test": "f"
                    },
                    {
                        "Test": "g"
                    },
                    {
                        "Test": "h"
                    },
                    {
                        "Test": "i"
                    },
                    {
                        "Test": "j"
                    },
                ]);
                Ok(json)
            }

            async fn get_upload_stream(
                &self,
                _s3_file_name: &str,
            ) -> Result<UploadStream, GetUploadStreamError> {
                let s3_manager = S3Manager::default();
                let client = s3_manager.get_client();
                Ok(UploadStream::empty(client))
            }
            async fn write_to_stream(
                &self,
                _stream: &mut UploadStream,
                _data: Vec<u8>,
            ) -> Result<(), UploadStreamWriteError> {
                Ok(())
            }
            async fn finish_stream(
                &self,
                _stream: &mut UploadStream,
            ) -> Result<(), UploadStreamFinishError> {
                let error_data = GlyphxErrorData::new(
                    "An unexpected error occurred while writing to the upload stream.".to_string(),
                    None,
                    None,
                );
                let error = UploadStreamFinishError::UnexpectedError(error_data);
                Err(error)
            }
        }
        pub fn get_standard_field_definition(
            display_name: &str,
            field_name: &str,
        ) -> FieldDefinition {
            FieldDefinition::Standard {
                field_display_name: display_name.to_string(),
                field_data_type: FieldType::String,
                field_definition: StandardFieldDefinition {
                    field_name: field_name.to_string(),
                    field_type: FieldDefinitionType::Standard,
                },
                field_query: format!(r#""{}" as "{}""#, field_name, display_name),
                raw_query: format!(r#""{}""#, field_name),
            }
        }
    }
    mod constructor {
        use super::*;

        #[test]
        fn is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert!(vector_processer.max_rank == 0);
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);
        }
    }

    mod threading {

        use super::*;

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn single_string_axis_is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            vector_processer.start_impl(&helper_functions::StringMocks1);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }
            let values = vec![
                VectorOrigionalValue::String("a".to_string()),
                VectorOrigionalValue::String("b".to_string()),
                VectorOrigionalValue::String("c".to_string()),
                VectorOrigionalValue::String("d".to_string()),
                VectorOrigionalValue::String("e".to_string()),
            ];

            let mut rank = 0;
            for value in values {
                let vector = vector_processer.get_vector(&value);
                assert!(vector.is_some());
                let vector = vector.unwrap();
                assert_eq!(vector.orig_value, value);
                assert_eq!(vector.vector, rank as f64);
                assert_eq!(vector.rank, rank);
                rank += 1;
            }
            let f = vector_processer.get_vector(&VectorOrigionalValue::String("f".to_string()));
            assert!(f.is_none());

            assert_eq!(final_status, TaskStatus::Complete);
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn two_string_axis_is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            let axis_name2 = "test_axis2";
            let table_name2 = "test_table2";
            let s3_file_name2 = "s3_file_name2";
            let field_definition2 =
                helper_functions::get_standard_field_definition("Test2", "field_name2");
            let mut vector_processer2 =
                VectorProcesser::new(axis_name2, table_name2, s3_file_name2, field_definition2);

            vector_processer.start_impl(&helper_functions::StringMocks1);
            vector_processer2.start_impl(&helper_functions::StringMocks2);

            let mut final_status = TaskStatus::Pending;
            let mut final_status2 = TaskStatus::Pending;
            let mut one_done = false;
            let mut two_done = false;
            loop {
                if !one_done {
                    let status = vector_processer.check_status();
                    if status != TaskStatus::Pending && status != TaskStatus::Processing {
                        final_status = status;
                        one_done = true;
                    }
                }
                if !two_done {
                    let status2 = vector_processer2.check_status();
                    if status2 != TaskStatus::Pending && status2 != TaskStatus::Processing {
                        final_status2 = status2;
                        two_done = true;
                    }
                }
                if one_done && two_done {
                    break;
                }
            }
            let values = vec![
                VectorOrigionalValue::String("a".to_string()),
                VectorOrigionalValue::String("b".to_string()),
                VectorOrigionalValue::String("c".to_string()),
                VectorOrigionalValue::String("d".to_string()),
                VectorOrigionalValue::String("e".to_string()),
            ];

            let mut rank = 0;
            for value in values {
                let vector = vector_processer.get_vector(&value);
                assert!(vector.is_some());
                let vector = vector.unwrap();
                assert_eq!(vector.orig_value, value);
                assert_eq!(vector.vector, rank as f64);
                assert_eq!(vector.rank, rank);
                rank += 1;
            }
            let f = vector_processer.get_vector(&VectorOrigionalValue::String("f".to_string()));
            assert!(f.is_none());

            assert_eq!(final_status, TaskStatus::Complete);

            let values = vec![
                VectorOrigionalValue::String("f".to_string()),
                VectorOrigionalValue::String("g".to_string()),
                VectorOrigionalValue::String("h".to_string()),
                VectorOrigionalValue::String("i".to_string()),
                VectorOrigionalValue::String("j".to_string()),
            ];

            let mut rank = 0;
            for value in values {
                let vector = vector_processer2.get_vector(&value);
                assert!(vector.is_some());
                let vector = vector.unwrap();
                assert_eq!(vector.orig_value, value);
                assert_eq!(vector.vector, rank as f64);
                assert_eq!(vector.rank, rank);
                rank += 1;
            }
            let k = vector_processer.get_vector(&VectorOrigionalValue::String("k".to_string()));
            assert!(k.is_none());

            assert_eq!(final_status, TaskStatus::Complete);
            assert_eq!(final_status2, TaskStatus::Complete);
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn single_string_axis_query_errors() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            vector_processer.start_impl(&helper_functions::MocksRunAthenaError);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }
            match final_status {
                TaskStatus::Errored(VectorCalculationError::AthenaQueryError(_)) => assert!(true),
                _ => assert!(false),
            }
        }
        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn two_string_axis_one_errors() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            let axis_name2 = "test_axis2";
            let table_name2 = "test_table2";
            let s3_file_name2 = "s3_file_name2";
            let field_definition2 =
                helper_functions::get_standard_field_definition("Test2", "field_name2");
            let mut vector_processer2 =
                VectorProcesser::new(axis_name2, table_name2, s3_file_name2, field_definition2);

            vector_processer.start_impl(&helper_functions::MocksRunAthenaError);
            vector_processer2.start_impl(&helper_functions::StringMocks2);

            let mut final_status = TaskStatus::Pending;
            let mut final_status2 = TaskStatus::Pending;
            let mut one_done = false;
            let mut two_done = false;
            loop {
                if !one_done {
                    let status = vector_processer.check_status();
                    if status != TaskStatus::Pending && status != TaskStatus::Processing {
                        final_status = status;
                        one_done = true;
                    }
                }
                if !two_done {
                    let status2 = vector_processer2.check_status();
                    if status2 != TaskStatus::Pending && status2 != TaskStatus::Processing {
                        final_status2 = status2;
                        two_done = true;
                    }
                }
                if one_done && two_done {
                    break;
                }
            }
            match final_status {
                TaskStatus::Errored(VectorCalculationError::AthenaQueryError(_)) => assert!(true),
                _ => assert!(false),
            }

            let values = vec![
                VectorOrigionalValue::String("f".to_string()),
                VectorOrigionalValue::String("g".to_string()),
                VectorOrigionalValue::String("h".to_string()),
                VectorOrigionalValue::String("i".to_string()),
                VectorOrigionalValue::String("j".to_string()),
            ];

            let mut rank = 0;
            for value in values {
                let vector = vector_processer2.get_vector(&value);
                assert!(vector.is_some());
                let vector = vector.unwrap();
                assert_eq!(vector.orig_value, value);
                assert_eq!(vector.vector, rank as f64);
                assert_eq!(vector.rank, rank);
                rank += 1;
            }
            let k = vector_processer.get_vector(&VectorOrigionalValue::String("k".to_string()));
            assert!(k.is_none());

            assert_eq!(final_status2, TaskStatus::Complete);
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn single_number_axis_is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            vector_processer.start_impl(&helper_functions::NumberFloatMocks);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }
            let values = vec![
                VectorOrigionalValue::F64(1.0),
                VectorOrigionalValue::F64(2.0),
                VectorOrigionalValue::F64(3.0),
                VectorOrigionalValue::F64(4.0),
                VectorOrigionalValue::F64(5.0),
            ];

            let mut rank = 0;
            for value in values {
                let vector = vector_processer.get_vector(&value);
                assert!(vector.is_some());
                let vector = vector.unwrap();
                assert_eq!(vector.orig_value, value);
                let vector_value = match vector.orig_value {
                    VectorOrigionalValue::F64(a) => a,
                    _ => panic!("Unexpected value"),
                };
                assert_eq!(vector.vector, vector_value);
                assert_eq!(vector.rank, rank);
                rank += 1;
            }
            let six = vector_processer.get_vector(&VectorOrigionalValue::F64(6.0));
            assert!(six.is_none());

            assert_eq!(final_status, TaskStatus::Complete);
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn single_integer_axis_is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            vector_processer.start_impl(&helper_functions::NumberIntMocks);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }
            let values = vec![
                VectorOrigionalValue::U64(1),
                VectorOrigionalValue::U64(2),
                VectorOrigionalValue::U64(3),
                VectorOrigionalValue::U64(4),
                VectorOrigionalValue::U64(5),
            ];

            let mut rank = 0;
            for value in values {
                let vector = vector_processer.get_vector(&value);
                assert!(vector.is_some());
                let vector = vector.unwrap();
                assert_eq!(vector.orig_value, value);
                let vector_value = match vector.orig_value {
                    VectorOrigionalValue::U64(a) => a,
                    _ => panic!("Unexpected value"),
                } as f64;
                assert_eq!(vector.vector, vector_value);
                assert_eq!(vector.rank, rank);
                rank += 1;
            }
            let six = vector_processer.get_vector(&VectorOrigionalValue::U64(6));
            assert!(six.is_none());

            assert_eq!(final_status, TaskStatus::Complete);
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn start_upload_fails() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            vector_processer.start_impl(&helper_functions::MocksStartUploadError);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }

            match final_status {
                TaskStatus::Errored(VectorCalculationError::GetS3UploadStreamError(_)) => {
                    assert!(true)
                }
                _ => assert!(false),
            }
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn write_upload_fails() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            vector_processer.start_impl(&helper_functions::MocksWriteUploadError);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }

            match final_status {
                TaskStatus::Errored(VectorCalculationError::WriteUploadError(_)) => assert!(true),
                _ => assert!(false),
            }
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn finish_upload_fails() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);

            vector_processer.start_impl(&helper_functions::MocksFinishUploadError);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }

            match final_status {
                TaskStatus::Errored(VectorCalculationError::WriteUploadError(_)) => assert!(true),
                _ => assert!(false),
            }
        }
    }

    mod get_statistics_vector {
        use super::*;

        #[test]
        fn is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);

            for i in 0..10 {
                let vector = Vector::new(VectorOrigionalValue::F64(i as f64), i as f64, i);
                vector_processer
                    .vectors
                    .insert(vector.orig_value.clone(), vector);
            }

            let stats = vector_processer.get_statistics_vector();
            assert_eq!(stats.len(), 10);
            for i in 0..10 {
                assert_eq!(stats[i], i as f64);
            }
        }
    }

    mod get_max_value {
        use super::*;

        #[test]
        fn is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);

            for i in 0..10 {
                let vector = Vector::new(VectorOrigionalValue::F64(i as f64), i as f64, i);
                vector_processer
                    .vectors
                    .insert(vector.orig_value.clone(), vector);
            }

            let max = vector_processer.get_max_vector();
            assert!(max.is_some());
            let max = max.unwrap();
            assert_eq!(max.orig_value, VectorOrigionalValue::F64(9.0));
            assert_eq!(max.vector, 9.0);
            assert_eq!(max.rank, 9);
        }

        #[test]
        fn is_none() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);

            let max = vector_processer.get_max_vector();
            assert!(max.is_none());
        }
    }
    mod run_sync {
        use super::*;

        #[tokio::test]
        async fn is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);

            let result = vector_processer
                .run_sync_impl(&helper_functions::StringMocks1)
                .await;
            assert_eq!(result, TaskStatus::Complete);
            assert_eq!(vector_processer.max_rank, 4);
        }

        #[tokio::test]
        async fn query_error() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);

            let result = vector_processer
                .run_sync_impl(&helper_functions::MocksRunAthenaError)
                .await;
            match result {
                TaskStatus::Errored(VectorCalculationError::AthenaQueryError(_)) => assert!(true),
                _ => assert!(false),
            }
        }

        #[tokio::test]
        async fn get_upload_stream_fails() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);

            let result = vector_processer
                .run_sync_impl(&helper_functions::MocksStartUploadError)
                .await;
            match result {
                TaskStatus::Errored(VectorCalculationError::GetS3UploadStreamError(_)) => {
                    assert!(true)
                }
                _ => assert!(false),
            }
        }

        #[tokio::test]
        async fn write_upload_fails() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let s3_file_name = "s3_file_name";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, s3_file_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);

            let result = vector_processer
                .run_sync_impl(&helper_functions::MocksWriteUploadError)
                .await;
            match result {
                TaskStatus::Errored(VectorCalculationError::WriteUploadError(_)) => assert!(true),
                _ => assert!(false),
            }
        }
    }
}
