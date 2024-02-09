mod errors;
mod task_status;
mod vector;
mod vector_origional_value;

pub use errors::*;
pub use task_status::*;
pub use vector::*;
pub use vector_origional_value::*;

use crate::types::vectorizer_parameters::FieldDefinition;
use glyphx_common::AthenaConnection;
use glyphx_core::{
    aws::athena_manager::RunQueryError, ErrorTypeParser, GlyphxErrorData, Singleton,
};

use async_trait::async_trait;
use im::OrdMap;
use log::error;
use mockall::automock;
use serde_json::{json, to_value, Value};
use std::sync::mpsc::{channel, Receiver, TryRecvError};
use tokio::task::{spawn, JoinHandle};

#[automock]
#[async_trait]
pub trait ThreadOperations {
    async fn run_athena_query(&self, query: &str) -> Result<Value, RunQueryError>;
}

struct ThreadOperationsImpl;

#[async_trait]
impl ThreadOperations for ThreadOperationsImpl {
    async fn run_athena_query(&self, query: &str) -> Result<Value, RunQueryError> {
        let athena_connection = AthenaConnection::get_instance();
        let athena_manager = athena_connection.get_athena_manager();
        athena_manager.run_query(&query, Some(300), None).await
    }
}

pub struct VectorProcesser {
    axis_name: String,
    table_name: String,
    field_definition: FieldDefinition,
    receiver: Option<Receiver<Result<Vector, VectorCaclulationError>>>,
    vectors: OrdMap<VectorOrigionalValue, Vector>,
    join_handle: Option<JoinHandle<()>>,
    task_status: TaskStatus,
}

impl VectorProcesser {
    pub fn new(axis_name: &str, table_name: &str, field_definition: FieldDefinition) -> Self {
        Self {
            axis_name: axis_name.to_string(),
            table_name: table_name.to_string(),
            field_definition,
            receiver: None,
            vectors: OrdMap::new(),
            join_handle: None,
            task_status: TaskStatus::Pending,
        }
    }

    pub fn start(&mut self) {
        self.start_impl(&ThreadOperationsImpl)
    }
    fn start_impl<T: ThreadOperations + Sync>(&mut self, thread_operations: &'static T) {
        let field_definition = self.field_definition.clone();
        let (field_name, field_value) = field_definition.get_query_parts();
        let table_name = self.table_name.clone();
        let (sender, receiver) = channel::<Result<Vector, VectorCaclulationError>>();
        self.receiver = Some(receiver);
        let thread_handle = spawn(async move {
            let query = format!(
                "SELECT DISTINCT {} FROM {} ORDER BY {}",
                field_value, table_name, field_name
            );
            let result = thread_operations.run_athena_query(&query).await;
            if result.is_err() {
                let error = result.err().unwrap();
                let error = VectorCaclulationError::from(error);
                error.error();
                //if sending fails we are really kind of screwed
                //we will do our best to try and log the error so that we
                //have something on the backend to help troubleshoot.
                let send_result = sender.send(Err(error));
                if send_result.is_err() {
                    let send_error = send_result.err().unwrap();
                    let error_string = format!("{:?}", send_error);
                    error!("{}", error_string);
                }

                return;
            }
            let result = result.unwrap();
            let mut rank = 0;
            for row in result.as_array().unwrap() {
                let value = row.get(&field_name).unwrap();
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
                let send_result = sender.send(Ok(vector));
                if send_result.is_err() {
                    let send_error = send_result.err().unwrap();
                    let error_string = format!("{:?}", send_error);
                    error!("{}", error_string);
                    return;
                }
                rank += 1;
            }
            sender.send(Ok(Vector::empty())).unwrap();
        });
        self.join_handle = Some(thread_handle);
    }

    pub fn check_status(&mut self) -> TaskStatus {
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
                TaskStatus::Errored(VectorCaclulationError::IntializationError(error_data));
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
                            VectorCaclulationError::IntializationError(error_data),
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
            }
        }
    }

    pub fn get_vector(&self, key: &VectorOrigionalValue) -> Option<&Vector> {
        self.vectors.get(key)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    mod helper_functions {
        use super::*;
        use crate::field_definition_type::FieldDefinitionType;
        use crate::types::vectorizer_parameters::{FieldDefinition, StandardFieldDefinition};
        use crate::FieldType;

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
        }
        pub struct MocksError;
        #[async_trait]
        impl ThreadOperations for MocksError {
            async fn run_athena_query(&self, _query: &str) -> Result<Value, RunQueryError> {
                let error_data = GlyphxErrorData::new(
                    "An unexpected error occurred while running the  query.".to_string(),
                    None,
                    None,
                );
                let error = RunQueryError::QueryFailed(error_data);
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
            }
        }
    }
    mod constructor {
        use super::*;

        #[test]
        fn is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let vector_processer = VectorProcesser::new(axis_name, table_name, field_definition);
            assert_eq!(vector_processer.axis_name, axis_name);
            assert_eq!(vector_processer.table_name, table_name);
            assert!(vector_processer.field_definition.is_standard());
            assert!(vector_processer.receiver.is_none());
            assert!(vector_processer.vectors.is_empty());
            assert!(vector_processer.join_handle.is_none());
            assert_eq!(vector_processer.task_status, TaskStatus::Pending);
        }
    }

    mod threading {
        use super::*;

        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn single_string_axis_is_ok() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, field_definition);

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
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, field_definition);

            let axis_name2 = "test_axis2";
            let table_name2 = "test_table2";
            let field_definition2 =
                helper_functions::get_standard_field_definition("Test2", "field_name2");
            let mut vector_processer2 =
                VectorProcesser::new(axis_name2, table_name2, field_definition2);

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
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, field_definition);

            vector_processer.start_impl(&helper_functions::MocksError);
            let final_status: TaskStatus;
            loop {
                let status = vector_processer.check_status();
                if status != TaskStatus::Pending && status != TaskStatus::Processing {
                    final_status = status;
                    break;
                }
            }
            match final_status {
                TaskStatus::Errored(VectorCaclulationError::AthenaQueryError(_)) => assert!(true),
                _ => assert!(false),
            }
        }
        #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
        async fn two_string_axis_one_errors() {
            let axis_name = "test_axis";
            let table_name = "test_table";
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, field_definition);

            let axis_name2 = "test_axis2";
            let table_name2 = "test_table2";
            let field_definition2 =
                helper_functions::get_standard_field_definition("Test2", "field_name2");
            let mut vector_processer2 =
                VectorProcesser::new(axis_name2, table_name2, field_definition2);

            vector_processer.start_impl(&helper_functions::MocksError);
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
                TaskStatus::Errored(VectorCaclulationError::AthenaQueryError(_)) => assert!(true),
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
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, field_definition);

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
            let field_definition =
                helper_functions::get_standard_field_definition("Test", "field_name");
            let mut vector_processer =
                VectorProcesser::new(axis_name, table_name, field_definition);

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
    }
}
