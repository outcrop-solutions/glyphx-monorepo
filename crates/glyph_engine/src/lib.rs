pub mod errors;
pub mod types;
pub mod vector_processer;

use glyphx_common::{AthenaConnection, Heartbeat, S3Connection};
use glyphx_core::{ErrorTypeParser, Singleton};
use glyphx_database::MongoDbConnection;

use async_trait::async_trait;
use mockall::automock;

pub use errors::*;
use types::vectorizer_parameters::{FieldDefinition, VectorizerParameters};
pub use types::*;

use vector_processer::{TaskStatus, VectorProcesser, VectorValueProcesser};

/// This macro is used to handle functions that return Result<T, E>  in a consistent way.
/// If a code block returns the Result::Err(E) variant, the emited code will unwrap the error
/// and convert it to the supplied error type using the From trait.  There is also an
/// optional log level parameter which will log the error at the specified level.  Some exmaples of
/// using this macro are:
///handle_error! (let x = foo(1,2,5); Error, fatal)
///handle_error! (let x = foo(1,2,5); Error)
///handle_error!(let x_field_definition = self.parameters.get_field_definition("xaxis"); GlyphEngineProcessError::from_get_field_definition_error("xaxis"), error);
///If the call to foo is an error, the error will be converted to an Error and returned.  If the log
///level is specified, the error will also be logged at the specified level.
///The macro will also unwrap the result of the call to foo and assign it to the variable x.  If the
///call to foo is successful, the variable x will be assigned the result of the call to foo.
macro_rules! handle_error {
    //In this pattern, the error will be passed to the $function_name as the first argument.
    //The $functions_arguments will be passed as the second argument.
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident ($functions_arguments:expr ), $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::$function_name(error, $functions_arguments);
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident ($functions_arguments:expr )) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::$function_name(error, $functions_arguments);
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $error_type: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::from(error);
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    //glyphx_error! (let x = foo(1,2,5); Error, fatal)
    (let $var_name:ident = $express : expr; $error_type: ident, $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::from(error);
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
}

/// This macro is used to handle the unwraping of Result<T, E> in a standard way.
/// This macro is similar to handle_error except that it does not convert the error to a different
/// type.  If a code block returns the Result::Err(E)variant, the emitted core will unwrap the
/// error and return it.  There is also an optional log level parameter which will log the error
/// at the specified level.  Some exmaples of using this macro are:
///glyphx_error! (let x = foo(1,2,5); fatal)
///glyphx_error! (let x = foo(1,2,5); )
///If the call to foo is an error, the error will be returned.  If the log level is specified, the
///error will also be logged at the specified level.
///The macro will also unwrap the result of the call to foo and assign it to the variable x.  If the
///call to foo is successful, the variable x will be assigned the result of the call to foo.
macro_rules! pass_error {
    (let $var_name:ident = $express : expr; ) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
}

#[automock]
#[async_trait]
trait GlyphEngineOperations {
    async fn build_s3_connection(&self) -> Result<&'static S3Connection, GlyphEngineInitError>;
    async fn build_athena_connection(
        &self,
    ) -> Result<&'static AthenaConnection, GlyphEngineInitError>;
    async fn build_mongo_connection(
        &self,
    ) -> Result<&'static MongoDbConnection, GlyphEngineInitError>;
    async fn build_heartbeat(&self) -> Result<Heartbeat, GlyphEngineInitError>;
    fn get_vector_processer(
        &self,
        axis: &str,
        data_table_name: &str,
        field_definition: &FieldDefinition,
    ) -> Box<dyn VectorValueProcesser>;

    async fn start_athena_query(&self, athena_connection: &AthenaConnection, query: &str) -> Result<String, GlyphEngineProcessError>;
}

struct GlyphEngineOperationsImpl;

#[async_trait]
impl GlyphEngineOperations for GlyphEngineOperationsImpl {
    async fn build_s3_connection(&self) -> Result<&'static S3Connection, GlyphEngineInitError> {
        handle_error!(let s3_connection = S3Connection::build_singleton().await; GlyphEngineInitError);
        Ok(s3_connection)
    }
    async fn build_athena_connection(
        &self,
    ) -> Result<&'static AthenaConnection, GlyphEngineInitError> {
        handle_error!(let athena_connection = AthenaConnection::build_singleton().await; GlyphEngineInitError);
        Ok(athena_connection)
    }
    async fn build_mongo_connection(
        &self,
    ) -> Result<&'static MongoDbConnection, GlyphEngineInitError> {
        handle_error!(let mongo_db_connection = MongoDbConnection::build_singleton().await; GlyphEngineInitError);
        Ok(mongo_db_connection)
    }
    async fn build_heartbeat(&self) -> Result<Heartbeat, GlyphEngineInitError> {
        //1 minute heartbeat
        let mut heartbeat = Heartbeat::new("GlyphEngine".to_string(), 60000);
        handle_error!(let _result = heartbeat.start().await; GlyphEngineInitError);
        Ok(heartbeat)
    }
    fn get_vector_processer(
        &self,
        axis: &str,
        data_table_name: &str,
        field_definition: &FieldDefinition,
    ) -> Box<dyn VectorValueProcesser> {
        let field_processor =
            VectorProcesser::new(axis, data_table_name, "Fixme", field_definition.clone());
        Box::new(field_processor)
    }

    async fn start_athena_query(&self, athena_connection: &AthenaConnection,  query: &str) -> Result<String, GlyphEngineProcessError> {
        handle_error!(let query_id = 
            athena_connection
            .get_athena_manager()
            .start_query(&query, None)
            .await;
        GlyphEngineProcessError::from_start_query_error(&query), error);
    
    Ok(query_id)
    }
}
pub struct GlyphEngine {
    parameters: VectorizerParameters,
    heartbeat: Heartbeat,
    mongo_connection: &'static MongoDbConnection,
    athena_connection: &'static AthenaConnection,
    s3_connection: &'static S3Connection,
}

impl GlyphEngine {
    //We are assuming that the function which calls GlyphEngine has already checked that the parameters are valid and loaded them from a JSON string.
    pub async fn new(
        parameters: &VectorizerParameters,
    ) -> Result<GlyphEngine, GlyphEngineInitError> {
        Self::new_impl(parameters, &GlyphEngineOperationsImpl).await
    }

    async fn new_impl<T: GlyphEngineOperations>(
        parameters: &VectorizerParameters,
        operations: &T,
    ) -> Result<GlyphEngine, GlyphEngineInitError> {
        let (heartbeat, s3_connection, athena_connection, mongo_connection) =
            Self::init(operations).await?;
        Ok(GlyphEngine {
            parameters: parameters.clone(),
            heartbeat,
            s3_connection,
            athena_connection,
            mongo_connection,
        })
    }

    async fn init<T: GlyphEngineOperations>(
        operations: &T,
    ) -> Result<
        (
            Heartbeat,
            &'static S3Connection,
            &'static AthenaConnection,
            &'static MongoDbConnection,
        ),
        GlyphEngineInitError,
    > {
        pass_error!(let s3_connection = operations.build_s3_connection().await; error);
        pass_error!(let athena_connection = operations.build_athena_connection().await; error);
        pass_error!(let mongo_db_connection = operations.build_mongo_connection().await; error);
        pass_error!(let heartbeat = operations.build_heartbeat().await; error);
        Ok((
            heartbeat,
            s3_connection,
            athena_connection,
            mongo_db_connection,
        ))
    }
    fn check_axis_task_status(
        field_processer: &mut Box<dyn VectorValueProcesser>,
    ) -> Result<bool, GlyphEngineProcessError> {
        let status = field_processer.check_status();
        let result = match status {
            TaskStatus::Errored(_) => Err(GlyphEngineProcessError::from_task_status_error(
                status,
                field_processer.get_axis_name(),
            )),
            TaskStatus::Complete => Ok(true),
            //Pending or running just let it keep doing its thing
            _ => Ok(false),
        };
        result
    }
    ///Will create our vector tables for the given field definition.
    fn process_vectors<T: GlyphEngineOperations>(
        &self,
        x_field_definition: &FieldDefinition,
        y_field_definition: &FieldDefinition,
        operations: &T,
    ) -> Result<
        (Box<dyn VectorValueProcesser>, Box<dyn VectorValueProcesser>),
        GlyphEngineProcessError,
    > {
        let mut x_field_processor = operations.get_vector_processer(
            "x",
            &self.parameters.data_table_name,
            &x_field_definition,
        );
        let mut y_field_processor = operations.get_vector_processer(
            "y",
            &self.parameters.data_table_name,
            &y_field_definition,
        );

        x_field_processor.start();
        y_field_processor.start();
        let mut x_is_done = false;
        let mut y_is_done = false;
        loop {
            if !x_is_done {
                x_is_done = Self::check_axis_task_status(&mut x_field_processor)?;
            }
            if !y_is_done {
                y_is_done = Self::check_axis_task_status(&mut y_field_processor)?;
            }
            if x_is_done && y_is_done {
                break;
            }
        }
        Ok((x_field_processor, y_field_processor))
    }

    async fn start_query<T: GlyphEngineOperations>(
        &self,
        x_axis_definition: &FieldDefinition,
        y_axis_definition: &FieldDefinition,
        z_axis_definition: &FieldDefinition,
        operations: &T,
    ) -> Result<String, GlyphEngineProcessError> {
        let (x_field_name, _, x_raw_query) = x_axis_definition.get_query_parts();
        let (y_field_name, _, y_raw_query) = y_axis_definition.get_query_parts();
        let (z_field_name, _, z_raw_query) = z_axis_definition.get_query_parts();
        let database_name = self.athena_connection.get_database_name();
        let filter = &self.parameters.filter;
        let filter = match filter {
            Some(filter) => format!("WHERE {}", filter),
            None => "".to_string(),
        };
        let query = format!(
            r#"
    WITH temp as (
        SELECT glyphx_id__ as rowid, 
        {} as groupedXColumn, 
        {} as groupedYColumn, 
        "{}"
        FROM "{}"."{}" 
        {}
    )  
    SELECT array_join(array_agg(rowid), '|') as "rowids", 
    groupedXColumn as "x_{}", 
    groupedYColumn as "y_{}", 
    {} as "z_{}"
    FROM temp 
    GROUP BY groupedXColumn, groupedYColumn;
"#,
            x_raw_query,
            y_raw_query,
            z_field_name,
            database_name,
            self.parameters.data_table_name,
            filter,
            x_field_name,
            y_field_name,
            z_raw_query,
            z_field_name
        );

        let query_id = operations.start_athena_query(self.athena_connection, &query).await?;
        Ok(query_id)
    }

    async fn process_impl<T: GlyphEngineOperations>(
        &self,
        operations: &T,
    ) -> Result<(), GlyphEngineProcessError> {
        //Get our field definitions
        handle_error!(let x_field_definition = self.parameters.get_field_definition("xaxis"); GlyphEngineProcessError::from_get_field_definition_error("xaxis"), error);
        handle_error!(let y_field_definition = self.parameters.get_field_definition("yaxis"); GlyphEngineProcessError::from_get_field_definition_error("yaxis"), error);
        handle_error!(let z_field_definition = self.parameters.get_field_definition("zaxis"); GlyphEngineProcessError::from_get_field_definition_error("zaxis"), error);

        //1. Kick off the main query.  This runs offline on AWS and we need it to finish before we
        //   can do anything else.  Here we can start the query, then go and get our vector tables
        let query_id = self
            .start_query(
                &x_field_definition,
                &y_field_definition,
                &z_field_definition,
                operations,
            )
            .await?;
        //1. Build the vector/rank tables tables and upload them to S3. -- 1 for each vertex (X and
        //   Y)
        let (x_field_processor, y_field_processor) =
            self.process_vectors(&x_field_definition, &y_field_definition, operations)?;

        Ok(())
    }
    pub async fn process(&self) -> Result<(), GlyphEngineProcessError> {
        self.process_impl(&GlyphEngineOperationsImpl).await
    }
}

#[cfg(test)]
mod glyph_engine {
    use super::*;
    use once_cell::sync::Lazy;

    static mut S3_CONNECTION_INSTANCE: Lazy<Option<S3Connection>> =
        Lazy::new(|| Some(S3Connection::default()));
    static mut ATHENA_CONNECTION_INSTANCE: Lazy<Option<AthenaConnection>> =
        Lazy::new(|| Some(AthenaConnection::default()));
    static mut MONGO_CONNECTION_INSTANCE: Lazy<Option<MongoDbConnection>> =
        Lazy::new(|| Some(MongoDbConnection::default()));
    static mut HEARTBEAT_INSTANCE: Lazy<Option<Heartbeat>> =
        Lazy::new(|| Some(Heartbeat::default()));
    mod constructor {

        use glyphx_core::GlyphxErrorData;

        use super::*;

        #[tokio::test]
        async fn is_ok() {
            let parameters = VectorizerParameters::default();
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));

            let result = GlyphEngine::new_impl(&parameters, &mocks).await;
            assert!(result.is_ok());
        }

        #[tokio::test]
        async fn s3_connections_errors() {
            let parameters = VectorizerParameters::default();
            let mut mocks = MockGlyphEngineOperations::new();
            mocks.expect_build_s3_connection().returning(|| {
                Err(GlyphEngineInitError::S3ConnectionError(
                    GlyphxErrorData::new(
                        "An error occurred while establishing the S3 Connection".to_string(),
                        None,
                        None,
                    ),
                ))
            });
            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(0);
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(0);
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }))
                .times(0);

            let result = GlyphEngine::new_impl(&parameters, &mocks).await;
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineInitError::S3ConnectionError(_) => {}
                _ => panic!("Expected S3ConnectionError"),
            }
        }

        #[tokio::test]
        async fn athena_connections_errors() {
            let parameters = VectorizerParameters::default();
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(1);

            mocks
                .expect_build_athena_connection()
                .returning(|| {
                    Err(GlyphEngineInitError::AthenaConnectionError(
                        GlyphxErrorData::new(
                            "An error occurred while establishing the Athena Connection"
                                .to_string(),
                            None,
                            None,
                        ),
                    ))
                })
                .times(1);
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(0);
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }))
                .times(0);

            let result = GlyphEngine::new_impl(&parameters, &mocks).await;
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineInitError::AthenaConnectionError(_) => {}
                _ => panic!("Expected AthenaConnectionError"),
            }
        }

        #[tokio::test]
        async fn mongodb_connections_errors() {
            let parameters = VectorizerParameters::default();
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(1);

            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(1);

            mocks
                .expect_build_mongo_connection()
                .returning(|| {
                    Err(GlyphEngineInitError::MongoDbConnectionError(
                        GlyphxErrorData::new(
                            "An error occurred while establishing the MongoDb Connection"
                                .to_string(),
                            None,
                            None,
                        ),
                    ))
                })
                .times(1);
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }))
                .times(0);

            let result = GlyphEngine::new_impl(&parameters, &mocks).await;
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineInitError::MongoDbConnectionError(_) => {}
                _ => panic!("Expected MongoDbConnectionError"),
            }
        }

        #[tokio::test]
        async fn heartbeat_errors() {
            let parameters = VectorizerParameters::default();
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(1);

            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(1);

            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }))
                .times(1);

            mocks
                .expect_build_heartbeat()
                .returning(|| {
                    Err(GlyphEngineInitError::HeartbeatError(GlyphxErrorData::new(
                        "An error occurred while creating the hesrtbeat".to_string(),
                        None,
                        None,
                    )))
                })
                .times(1);

            let result = GlyphEngine::new_impl(&parameters, &mocks).await;
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineInitError::HeartbeatError(_) => {}
                _ => panic!("Expected HeartbeatError"),
            }
        }
    }

    mod process_vectors {
        use super::*;
        use glyphx_core::GlyphxErrorData;
        use serde_json::{json, Value};
        use vector_processer::{MockVectorValueProcesser, VectorCaclulationError};

        static INPUT: Lazy<Value> = Lazy::new(|| {
            json!({
                "workspace_id": "1234",
                "project_id": "5678",
                "data_table_name": "my_table",
                "xAxis" : {
                    "fieldDisplayName": "field1",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field1"
                    }
                },
                "yAxis" : {
                    "fieldDisplayName": "field2",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field2"
                    }
                },
                "zAxis" : {
                    "fieldDisplayName": "field3",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "accumulated",
                        "accumulator" : "sum",
                        "accumulatedFieldDefinition" : {
                            "fieldType": "standard",
                            "fieldName": "field3"
                        }
                    }
                },
                "supportingFields" : [
                {
                    "fieldDisplayName": "field4",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field4"
                    }
                }]
            })
        });
        #[tokio::test]
        async fn is_ok() {
            static mut CALL_NUMBER: i32 = 0;
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));
            mocks
                .expect_get_vector_processer()
                .returning(|_, _, _| unsafe {
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(1)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(1)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        Box::new(vector_processer_mock2)
                    }
                })
                .times(2);

            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result =
                glyph_engine.process_vectors(&x_field_definition, &y_field_definition, &mocks);
            assert!(result.is_ok());
        }

        #[tokio::test]
        async fn x_axis_fails() {
            static mut CALL_NUMBER: i32 = 0;
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));
            mocks
                .expect_get_vector_processer()
                .returning(|_, _, _| unsafe {
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(1)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(1)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(1)
                            .return_const(TaskStatus::Errored(VectorCaclulationError::AthenaQueryError(
                                GlyphxErrorData::new("An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),None, None)
                            )));
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(1)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .return_const(TaskStatus::Complete);
                        Box::new(vector_processer_mock2)
                    }
                })
                .times(2);

            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result =
                glyph_engine.process_vectors(&x_field_definition, &y_field_definition, &mocks);
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineProcessError::VectorProcessingError(_) => {}
                _ => panic!("Expected VectorProcessingError"),
            }
        }

        #[tokio::test]
        async fn y_axis_fails() {
            static mut CALL_NUMBER: i32 = 0;
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));
            mocks
                .expect_get_vector_processer()
                .returning(|_, _, _| unsafe {
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(1)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .return_const(TaskStatus::Complete)
                            .times(1);
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(1)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(1)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .return_const(TaskStatus::Errored(VectorCaclulationError::AthenaQueryError(
                                GlyphxErrorData::new("An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),None, None))))
                                .times(1);
                        Box::new(vector_processer_mock2)
                    }
                })
                .times(2);

            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result =
                glyph_engine.process_vectors(&x_field_definition, &y_field_definition, &mocks);
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineProcessError::VectorProcessingError(_) => {}
                _ => panic!("Expected VectorProcessingError"),
            }
        }
        //TODO: This goes into the process function once we are ready to test that
        // #[tokio::test]
        // async fn x_axis_is_not_defined() {
        //     static mut CALL_NUMBER: i32 = 0;
        //     let mut mocks = MockGlyphEngineOperations::new();
        //     mocks
        //         .expect_build_s3_connection()
        //         .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
        //     mocks
        //         .expect_build_athena_connection()
        //         .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
        //     mocks
        //         .expect_build_mongo_connection()
        //         .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
        //     mocks
        //         .expect_build_heartbeat()
        //         .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));
        //     mocks
        //         .expect_get_vector_processer()
        //         .times(0);

        //     let mut input = INPUT.clone();
        //     input["xAxis"].take();
        //     let parameters = VectorizerParameters::from_json_string(&input.to_string()).unwrap();
        //     let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
        //     let result = glyph_engine.process_vectors(&mocks);
        //     assert!(result.is_err());
        //     let error = result.err().unwrap();
        //     match error {
        //         GlyphEngineProcessError::ConfigurationError(_) => {}
        //         _ => panic!("Expected ConfigurationError"),
        //     }
        // }

        //TODO: This goes into the process function once we are ready to test that
        // #[tokio::test]
        // async fn y_axis_is_not_defined() {
        //     static mut CALL_NUMBER: i32 = 0;
        //     let mut mocks = MockGlyphEngineOperations::new();
        //     mocks
        //         .expect_build_s3_connection()
        //         .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
        //     mocks
        //         .expect_build_athena_connection()
        //         .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
        //     mocks
        //         .expect_build_mongo_connection()
        //         .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
        //     mocks
        //         .expect_build_heartbeat()
        //         .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));
        //     mocks
        //         .expect_get_vector_processer()
        //         .times(0);

        //     let mut input = INPUT.clone();
        //     input["yAxis"].take();
        //     let parameters = VectorizerParameters::from_json_string(&input.to_string()).unwrap();
        //     let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
        //     let result = glyph_engine.process_vectors(&mocks);
        //     assert!(result.is_err());
        //     let error = result.err().unwrap();
        //     match error {
        //         GlyphEngineProcessError::ConfigurationError(_) => {}
        //         _ => panic!("Expected ConfigurationError"),
        //     }
        // }
    }
    mod start_query {
        use super::*;
        use glyphx_core::GlyphxErrorData;
        use serde_json::{json, Value};

        static INPUT: Lazy<Value> = Lazy::new(|| {
            json!({
                "workspace_id": "1234",
                "project_id": "5678",
                "data_table_name": "my_table",
                "xAxis" : {
                    "fieldDisplayName": "field1",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field1"
                    }
                },
                "yAxis" : {
                    "fieldDisplayName": "field2",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field2"
                    }
                },
                "zAxis" : {
                    "fieldDisplayName": "field3",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "accumulated",
                        "accumulator" : "sum",
                        "accumulatedFieldDefinition" : {
                            "fieldType": "standard",
                            "fieldName": "field3"
                        }
                    }
                },
                "supportingFields" : [
                {
                    "fieldDisplayName": "field4",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field4"
                    }
                }]
            })
        });

        #[tokio::test]
        async fn is_ok() {
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));

            mocks.expect_start_athena_query().returning(|_, _| {
                Ok("1234".to_string())
                   });
            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let z_field_definition = parameters.get_field_definition("zaxis").unwrap();
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result =
                glyph_engine.start_query(&x_field_definition, &y_field_definition, &z_field_definition, &mocks).await;
            assert!(result.is_ok());
            let query_id = result.unwrap();
            assert_eq!(query_id, "1234");
        }

        #[tokio::test]
        async fn start_query_fails() {
            let mut mocks = MockGlyphEngineOperations::new();
            mocks
                .expect_build_s3_connection()
                .returning(|| Ok(unsafe { &S3_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_athena_connection()
                .returning(|| Ok(unsafe { &ATHENA_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_mongo_connection()
                .returning(|| Ok(unsafe { &MONGO_CONNECTION_INSTANCE.as_ref().unwrap() }));
            mocks
                .expect_build_heartbeat()
                .returning(|| Ok(unsafe { HEARTBEAT_INSTANCE.as_ref().unwrap().clone() }));

            mocks.expect_start_athena_query().returning(|_, _| {
                Err(GlyphEngineProcessError::QueryProcessingError(
                    GlyphxErrorData::new(
                        "An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),
                        None,
                        None
                    )
                   )
                  )
                });
            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let z_field_definition = parameters.get_field_definition("zaxis").unwrap();
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result =
                glyph_engine.start_query(&x_field_definition, &y_field_definition, &z_field_definition, &mocks).await;
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineProcessError::QueryProcessingError(_) => {}
                _ => panic!("Expected QueryProcessingError"),
            }
        }
    }
}
