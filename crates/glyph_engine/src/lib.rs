#[macro_use]
pub mod macros;
pub mod errors;
pub mod types;
pub mod vector_processer;

use crate::GlyphEngineResults;

use glyphx_common::{AthenaConnection, Heartbeat, S3Connection};
use model_common::{Stats, Glyph};

use glyphx_core::{
    aws::{
        athena_manager::AthenaQueryStatus,
        athena_stream_iterator::AthenaStreamIterator,
        s3_manager::GetUploadStreamError,
        upload_stream::{UploadStream, UploadStreamFinishError, UploadStreamWriteError},
    },
    error,
    utility_functions::file_functions::{
        get_glyph_file_name, get_stats_file_name, get_vector_file_name,
    },
    ErrorTypeParser, GlyphxErrorData, Singleton,
};
use glyphx_database::{
    GlyphxDataModel, MongoDbConnection, ProcessStatus, ProcessTrackingModel, UpdateDocumentError,
    UpdateProcessTrackingModelBuilder,
};

use async_trait::async_trait;
use bincode::serialize;
use bson::{doc, DateTime};
use im::OrdSet;
use mockall::automock;
use model_common::vectors::{Vector, VectorOrigionalValue};
use serde_json::{to_value, Value};
use statrs::statistics::*;

pub use errors::*;
use types::vectorizer_parameters::{FieldDefinition, VectorizerParameters};
pub use types::*;

use vector_processer::{TaskStatus, VectorProcesser, VectorValueProcesser};

macro_rules! process_error {
    //In this pattern, the error will be passed to the $function_name as the first argument.
    //The $functions_arguments will be passed as the second argument.
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident ($functions_arguments:expr ); $operations: ident; $self: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.err().unwrap();
            let error = $error_type::$function_name(error, $functions_arguments);
            error.error();
            $self.process_error(&error, $operations).await;
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $operations: ident; $self: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.err().unwrap();
            error.error();
            $self.process_error(&error, $operations).await;
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
    fn stop_heartbeat(&self, heartbeat: &mut Heartbeat) -> ();
    fn get_vector_processer(
        &self,
        axis: &str,
        data_table_name: &str,
        field_definition: &FieldDefinition,
        output_file_name: &str,
    ) -> Box<dyn VectorValueProcesser>;
    async fn start_athena_query(
        &self,
        athena_connection: &AthenaConnection,
        query: &str,
    ) -> Result<String, GlyphEngineProcessError>;
    async fn check_query_status(
        &self,
        athena_connection: &AthenaConnection,
        query_id: &str,
    ) -> Result<AthenaQueryStatus, GlyphEngineProcessError>;
    async fn get_query_results(
        &self,
        query_id: &str,
        athena_connection: &AthenaConnection,
    ) -> Result<AthenaStreamIterator, GlyphEngineProcessError>;
    async fn get_upload_stream(
        &self,
        file_name: &str,
        s3_connection: &S3Connection,
    ) -> Result<UploadStream, GetUploadStreamError>;

    async fn write_to_upload_stream(
        &self,
        upload_stream: &mut UploadStream,
        bytes: Option<Vec<u8>>,
    ) -> Result<(), UploadStreamWriteError>;

    async fn finish_upload_stream(
        &self,
        upload_stream: &mut UploadStream,
    ) -> Result<(), UploadStreamFinishError>;

    async fn add_process_tracking_error(
        &self,
        process_id: &str,
        error: &GlyphEngineProcessError,
    ) -> Result<(), UpdateDocumentError>;

    async fn complete_process_tracking(
        &self,
        process_id: &str,
        process_result: ProcessStatus,
        process_value: Option<Value>,
    ) -> Result<(), UpdateDocumentError>;
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
        output_file_name: &str,
    ) -> Box<dyn VectorValueProcesser> {
        let field_processor = VectorProcesser::new(
            axis,
            data_table_name,
            output_file_name,
            field_definition.clone(),
        );
        Box::new(field_processor)
    }

    async fn start_athena_query(
        &self,
        athena_connection: &AthenaConnection,
        query: &str,
    ) -> Result<String, GlyphEngineProcessError> {
        handle_error!(let query_id = athena_connection .get_athena_manager() .start_query(&query, None) .await; GlyphEngineProcessError::from_start_query_error(&query), error);

        Ok(query_id)
    }
    async fn check_query_status(
        &self,
        athena_connection: &AthenaConnection,
        query_id: &str,
    ) -> Result<AthenaQueryStatus, GlyphEngineProcessError> {
        handle_error!(let query_status = athena_connection.get_athena_manager().get_query_status(query_id).await; GlyphEngineProcessError::from_get_query_status_error(&query_id), error);

        match query_status {
            AthenaQueryStatus::Failed(error) => {
                let message = format!("An error occurred while running the query.  See the inner error for additional information");
                let data = serde_json::json!({ query_id: query_id });
                let string_error = format!("{:?}", error);
                let inner_error = serde_json::to_value(string_error).unwrap();
                let error_data = GlyphxErrorData::new(message, Some(data), Some(inner_error));
                return Err(GlyphEngineProcessError::QueryProcessingError(error_data));
            }
            AthenaQueryStatus::Cancelled => {
                let message = format!("The query was cancelled by another process.  I have no additional information to provide");
                let data = serde_json::json!({ query_id: query_id });
                let error_data = GlyphxErrorData::new(message, Some(data), None);
                return Err(GlyphEngineProcessError::QueryProcessingError(error_data));
            }
            AthenaQueryStatus::Unknown => {
                let message = format!("Athena returned an unknown status.  I have no additional information to provide");
                let data = serde_json::json!({ query_id: query_id });
                let error_data = GlyphxErrorData::new(message, Some(data), None);
                return Err(GlyphEngineProcessError::QueryProcessingError(error_data));
            }
            _ => {}
        };

        Ok(query_status)
    }

    async fn get_query_results(
        &self,
        query_id: &str,
        athena_connection: &AthenaConnection,
    ) -> Result<AthenaStreamIterator, GlyphEngineProcessError> {
        let results = athena_connection
            .get_athena_manager()
            .get_paged_query_results(query_id, Some(1000))
            .await;
        if results.is_err() {
            let error = results.err().unwrap();
            let error = GlyphEngineProcessError::from_get_query_pager_error(error, query_id);
            error.error();
            return Err(error);
        }
        let results = Box::new(results.unwrap());

        let iterator = AthenaStreamIterator::new(
            results,
            query_id,
            "foo",
            athena_connection.get_database_name(),
        );
        Ok(iterator)
    }

    async fn get_upload_stream(
        &self,
        file_name: &str,
        s3_connection: &S3Connection,
    ) -> Result<UploadStream, GetUploadStreamError> {
        s3_connection
            .get_s3_manager()
            .get_upload_stream(file_name)
            .await
    }

    async fn write_to_upload_stream(
        &self,
        upload_stream: &mut UploadStream,
        bytes: Option<Vec<u8>>,
    ) -> Result<(), UploadStreamWriteError> {
        upload_stream.write(bytes).await
    }

    async fn finish_upload_stream(
        &self,
        upload_stream: &mut UploadStream,
    ) -> Result<(), UploadStreamFinishError> {
        upload_stream.finish().await
    }

    async fn add_process_tracking_error(
        &self,
        process_id: &str,
        error: &GlyphEngineProcessError,
    ) -> Result<(), UpdateDocumentError> {
        let filter = doc! {"process_id": process_id};
        let error_json = to_value(&error).unwrap();
        let add_error_result =
            ProcessTrackingModel::add_process_error_by_filter(&filter, &error_json).await;
        if add_error_result.is_ok() {
            Ok(())
        } else {
            return Err(add_error_result.err().unwrap());
        }
    }

    async fn complete_process_tracking(
        &self,
        process_id: &str,
        process_result: ProcessStatus,
        process_value: Option<Value>,
    ) -> Result<(), UpdateDocumentError> {
        let filter = doc! {"process_id": process_id};
        let mut builder = UpdateProcessTrackingModelBuilder::default();
        builder.process_status(process_result);
        if process_value.is_some() {
            let value = process_value.unwrap();
            builder.process_result(value);
        }
        builder.process_end_time(DateTime::now());
        let update_document = builder.build().unwrap();
        let update_process_tracking_result =
            ProcessTrackingModel::update_document_by_filter(&filter, &update_document).await;
        if update_process_tracking_result.is_ok() {
            Ok(())
        } else {
            return Err(update_process_tracking_result.err().unwrap());
        }
    }

    fn stop_heartbeat(&self, heartbeat: &mut Heartbeat) -> () {
        heartbeat.stop();
    }
}

pub struct GlyphEngine {
    parameters: VectorizerParameters,
    heartbeat: Heartbeat,
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
        let (heartbeat, s3_connection, athena_connection, _mongo_connection) =
            Self::init(operations).await?;
        Ok(GlyphEngine {
            parameters: parameters.clone(),
            heartbeat,
            s3_connection,
            athena_connection,
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
    //NOTE: This function is not used anymore because of the limitations of neon.  However I
    //am keeping it here for future reference.
    fn _check_axis_task_status(
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

    fn get_vector_file_names(&self) -> (String, String) {
        let x_file_name = format!(
            "{}/{}",
            &self.parameters.output_file_prefix,
            get_vector_file_name(
                &self.parameters.workspace_id,
                &self.parameters.project_id,
                &self.parameters.model_hash,
                "x"
            )
        );
        let y_file_name = format!(
            "{}/{}",
            &self.parameters.output_file_prefix,
            get_vector_file_name(
                &self.parameters.workspace_id,
                &self.parameters.project_id,
                &self.parameters.model_hash,
                "y"
            )
        );

        (x_file_name, y_file_name)
    }
    ///Will create our vector tables for the given field definition.
    async fn process_vectors<T: GlyphEngineOperations>(
        &self,
        x_field_definition: &FieldDefinition,
        x_file_name: &str,
        y_field_definition: &FieldDefinition,
        y_file_name: &str,

        operations: &T,
    ) -> Result<
        (Box<dyn VectorValueProcesser>, Box<dyn VectorValueProcesser>),
        GlyphEngineProcessError,
    > {
        let mut x_field_processor = operations.get_vector_processer(
            "x",
            &self.parameters.data_table_name,
            &x_field_definition,
            &x_file_name,
        );

        let mut y_field_processor = operations.get_vector_processer(
            "y",
            &self.parameters.data_table_name,
            &y_field_definition,
            &y_file_name,
        );

        let task_status = x_field_processor.run_sync().await;
        match task_status {
            TaskStatus::Errored(_) => {
                return Err(GlyphEngineProcessError::from_task_status_error(
                    task_status,
                    x_field_processor.get_axis_name(),
                ));
            }
            _ => {}
        }
        let task_status = y_field_processor.run_sync().await;
        match task_status {
            TaskStatus::Errored(_) => {
                return Err(GlyphEngineProcessError::from_task_status_error(
                    task_status,
                    y_field_processor.get_axis_name(),
                ));
            }
            _ => {}
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

        let query_id = operations
            .start_athena_query(self.athena_connection, &query)
            .await?;
        Ok(query_id)
    }

    fn get_vector(
        &self,
        result: &Value,
        field_name: &str,
        vector_processor: &Box<dyn VectorValueProcesser>,
    ) -> Result<Vector, GlyphEngineProcessError> {
        let value = result.get(field_name);
        if value.is_none() {
            let message = format!(
                "The field {} was not found in the query results",
                field_name
            );
            let data = serde_json::json!({ field_name: field_name });
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            return Err(GlyphEngineProcessError::DataProcessingError(error_data));
        }
        let value = value.unwrap();
        //There may not be a determinant way to determine the number type using serde_json::Value.
        //So, we will have to check for each type.
        let orig_value: VectorOrigionalValue;
        let backup_value: VectorOrigionalValue;
        if value.is_f64() {
            let value = value.as_f64().unwrap();
            orig_value = VectorOrigionalValue::F64(value);
            backup_value = VectorOrigionalValue::U64(value as u64);
        } else if value.is_u64() {
            let value = value.as_u64().unwrap();
            orig_value = VectorOrigionalValue::U64(value);
            backup_value = VectorOrigionalValue::F64(value as f64);
        } else if value.is_string() {
            let value = value.as_str().unwrap();
            orig_value = VectorOrigionalValue::String(value.to_string());
            backup_value = VectorOrigionalValue::String(value.to_string());
        } else {
            let message = format!(
                "The field {} was not a number or string in the query results",
                field_name
            );
            let data = serde_json::json!({ field_name: field_name });
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            return Err(GlyphEngineProcessError::DataProcessingError(error_data));
        }

        let mut vector = vector_processor.get_vector(&orig_value);
        if vector.is_none() {
            vector = vector_processor.get_vector(&backup_value);
            if vector.is_none() {
                let message = format!(
                    "The value {:?} was not found in the vector table for the field {}",
                    orig_value, field_name
                );

                let data = serde_json::json!({ field_name: field_name });
                let error_data = GlyphxErrorData::new(message, Some(data), None);
                return Err(GlyphEngineProcessError::DataProcessingError(error_data));
            }
        }
        Ok(vector.unwrap().clone())
    }

    fn get_z_value(
        &self,
        result: &Value,
        z_field_name: &str,
    ) -> Result<f64, GlyphEngineProcessError> {
        let value = result.get(z_field_name);
        if value.is_none() {
            let message = format!(
                "The field {} was not found in the query results",
                z_field_name
            );
            let data = serde_json::json!({ z_field_name: z_field_name });
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            return Err(GlyphEngineProcessError::DataProcessingError(error_data));
        }
        let value = value.unwrap();
        if !value.is_number() {
            let message = format!(
                "The field {} was not a number in the query results",
                z_field_name
            );
            let data = serde_json::json!({ z_field_name: z_field_name });
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            return Err(GlyphEngineProcessError::DataProcessingError(error_data));
        }
        Ok(value.as_f64().unwrap())
    }

    fn get_row_ids(&self, result: &Value) -> Result<Vec<usize>, GlyphEngineProcessError> {
        let value = result.get("rowids");
        if value.is_none() {
            let message = format!("The field rowids was not found in the query results");
            let data = serde_json::json!({});
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            return Err(GlyphEngineProcessError::DataProcessingError(error_data));
        }
        let value = value.unwrap();
        if !value.is_string() {
            let message = format!("The field rowids was not a string in the query results");
            let data = serde_json::json!({});
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            return Err(GlyphEngineProcessError::DataProcessingError(error_data));
        }
        let value = value.as_str().unwrap();
        let values: Vec<&str> = value.split("|").collect();
        let mut return_value: Vec<usize> = Vec::new();
        for v in values {
            let result = v.parse::<usize>();
            if result.is_err() {
                let message =
                    format!("The field rowids was not a pipe delimited string of integers");
                let data = serde_json::json!({"value": value, "bad_value": v});
                let error_data = GlyphxErrorData::new(message, Some(data), None);
                return Err(GlyphEngineProcessError::DataProcessingError(error_data));
            }
            return_value.push(result.unwrap());
        }
        Ok(return_value)
    }

    fn build_glyph(
        &self,
        result: &Value,
        x_field_name: &str,
        y_field_name: &str,
        z_field_name: &str,
        x_vector_processer: &Box<dyn VectorValueProcesser>,
        y_vector_processer: &Box<dyn VectorValueProcesser>,
    ) -> Result<Glyph, GlyphEngineProcessError> {
        let x_field_name = format!("x_{}", x_field_name);
        let y_field_name = format!("y_{}", y_field_name);
        let z_field_name = format!("z_{}", z_field_name);

        let x_vector = self.get_vector(result, &x_field_name, x_vector_processer)?;
        let y_vector = self.get_vector(result, &y_field_name, y_vector_processer)?;
        let z_value = self.get_z_value(result, &z_field_name)?;
        let rowids = self.get_row_ids(result)?;
        let glyph = Glyph::new(x_vector.vector, y_vector.vector, z_value, rowids);
        Ok(glyph)
    }

    fn serialize_glyph(&self, glyph: &Glyph) -> Vec<u8> {
        let glyph_binary_size = glyph.get_binary_size();
        let mut ser_glyph: Vec<u8> = Vec::with_capacity(8 + glyph_binary_size);
        //We are including the size of the glyph so that when we write this to a file we
        //will be able to determine the size of the glyph when we read it back in.
        ser_glyph.append(serialize(&glyph_binary_size).unwrap().as_mut());
        ser_glyph.append(serialize(glyph).unwrap().as_mut());
        ser_glyph
    }
    async fn process_query_results<T: GlyphEngineOperations>(
        &self,
        file_name: &str,
        results_iterator: &mut AthenaStreamIterator,
        x_field_name: &str,
        y_field_name: &str,
        z_field_name: &str,
        x_vector_processer: &Box<dyn VectorValueProcesser>,
        y_vector_processer: &Box<dyn VectorValueProcesser>,
        operations: &T,
    ) -> Result<Vec<f64>, GlyphEngineProcessError> {
        //Ok this is a bit of a hack, but I needed something which could hold our value that has to
        //the Ord trait -- f64 does not hold this.  To keep things moving, I am just going
        //to resuse VectorOrigionalValue, it is alread setup for OrdSet.
        let mut unique_values = OrdSet::<VectorOrigionalValue>::new();
        handle_error!(let upload_stream = operations.get_upload_stream(file_name, &self.s3_connection).await; GlyphEngineProcessError::from_get_upload_stream_error(file_name), error);
        //our handle_error macro will not let us create a mutable reference
        let mut upload_stream = upload_stream;
        loop {
            handle_error!(let result = results_iterator.next().await; GlyphEngineProcessError::from_athena_stream_iterator_error(), error);
            if result.is_none() {
                break;
            }
            let result = result.unwrap();
            let glyph = self.build_glyph(
                &result,
                x_field_name,
                y_field_name,
                z_field_name,
                x_vector_processer,
                y_vector_processer,
            )?;
            let z_value = VectorOrigionalValue::F64(glyph.z_value.clone());
            if !unique_values.contains(&z_value) {
                unique_values.insert(z_value);
            }
            let ser_glyph = self.serialize_glyph(&glyph);
            handle_error!(let _result = operations.write_to_upload_stream(&mut upload_stream, Some(ser_glyph)).await; GlyphEngineProcessError::from_upload_stream_write_error(file_name), error);
        }
        handle_error!(let _result = operations.finish_upload_stream(&mut upload_stream).await; GlyphEngineProcessError::from_upload_stream_finish_error(file_name), error);

        let vector_for_statistics = unique_values
            .iter()
            .map(|x| match x {
                VectorOrigionalValue::F64(y) => *y,
                _ => 0.0,
            })
            .collect();
        Ok(vector_for_statistics)
    }
    fn get_stats_for_axis(&self, axis_name: &str, max_rank: u64, data: Vec<f64>) -> Stats {
        let mut stats_generator = statrs::statistics::Data::new(data);
        Stats {
            axis: axis_name.to_string(),
            min: stats_generator.min(),
            max: stats_generator.max(),
            mean: stats_generator.mean().unwrap_or_else(|| f64::NAN),
            median: stats_generator.median(),
            variance: stats_generator.variance().unwrap_or_else(|| f64::NAN),
            standard_deviation: stats_generator.std_dev().unwrap_or_else(|| f64::NAN),
            entropy: stats_generator.entropy().unwrap_or_else(|| f64::NAN),
            skewness: stats_generator.skewness().unwrap_or_else(|| f64::NAN),
            pct_0: stats_generator.percentile(0),
            pct_5: stats_generator.percentile(5),
            pct_10: stats_generator.percentile(10),
            pct_15: stats_generator.percentile(15),
            pct_20: stats_generator.percentile(20),
            pct_25: stats_generator.percentile(25),
            pct_30: stats_generator.percentile(30),
            pct_33: stats_generator.percentile(33),
            pct_35: stats_generator.percentile(35),
            pct_40: stats_generator.percentile(40),
            pct_45: stats_generator.percentile(45),
            pct_50: stats_generator.percentile(50),
            pct_55: stats_generator.percentile(55),
            pct_60: stats_generator.percentile(60),
            pct_65: stats_generator.percentile(65),
            pct_67: stats_generator.percentile(67),
            pct_70: stats_generator.percentile(70),
            pct_75: stats_generator.percentile(75),
            pct_80: stats_generator.percentile(80),
            pct_85: stats_generator.percentile(85),
            pct_90: stats_generator.percentile(90),
            pct_95: stats_generator.percentile(95),
            pct_99: stats_generator.percentile(99),
            max_rank,
        }
    }

    async fn write_stats<T: GlyphEngineOperations>(
        &self,
        stats: &Stats,
        upload_stream: &mut UploadStream,
        operations: &T,
    ) -> Result<(), GlyphEngineProcessError> {
        let stats_binary_size = stats.get_binary_size();
        let mut ser_stats: Vec<u8> = Vec::with_capacity(8 + stats_binary_size);
        //We are including the size of the stats so that when we write this to a file we
        //will be able to determine the size of the stats when we read it back in.
        ser_stats.append(serialize(&stats_binary_size).unwrap().as_mut());
        ser_stats.append(serialize(stats).unwrap().as_mut());
        handle_error!(let _result = operations.write_to_upload_stream(upload_stream, Some(ser_stats)).await; GlyphEngineProcessError::from_upload_stream_write_error("stats"), error);
        Ok(())
    }

    async fn calculate_statistics<T: GlyphEngineOperations>(
        &self,
        x_field_processor: &Box<dyn VectorValueProcesser>,
        y_field_processor: &Box<dyn VectorValueProcesser>,
        z_stats_vector: Vec<f64>,
        operations: &T,
    ) -> Result<String, GlyphEngineProcessError> {
        let max_x_rank = x_field_processor.get_max_rank() as u64;
        let x_stats =
            self.get_stats_for_axis("x", max_x_rank , x_field_processor.get_statistics_vector());
        let max_y_rank = y_field_processor.get_max_rank() as u64;
        let y_stats =
            self.get_stats_for_axis("y", max_y_rank, y_field_processor.get_statistics_vector());
        let z_stats = self.get_stats_for_axis("z", 0, z_stats_vector);

        let stats_file_name = format!(
            "{}/{}",
            self.parameters.output_file_prefix,
            get_stats_file_name(
                &self.parameters.workspace_id,
                &self.parameters.project_id,
                &self.parameters.model_hash
            )
        );
        handle_error!(let upload_stream = operations.get_upload_stream(&stats_file_name, &self.s3_connection).await; GlyphEngineProcessError::from_get_upload_stream_error(&stats_file_name), error);
        let mut upload_stream = upload_stream;

        self.write_stats(&x_stats, &mut upload_stream, operations)
            .await?;
        self.write_stats(&y_stats, &mut upload_stream, operations)
            .await?;
        self.write_stats(&z_stats, &mut upload_stream, operations)
            .await?;
        handle_error!(let _result = operations.finish_upload_stream(&mut upload_stream).await; GlyphEngineProcessError::from_upload_stream_finish_error(&stats_file_name), error);
        Ok(stats_file_name)
    }
    async fn process_error<T: GlyphEngineOperations>(
        &mut self,
        error: &GlyphEngineProcessError,
        operations: &T,
    ) {
        let process_id = self.heartbeat.get_process_id();
        let add_error_result = operations
            .add_process_tracking_error(&process_id, &error)
            .await;

        if add_error_result.is_ok() {
            let err_value = to_value(&error).unwrap();
            let update_process_tracking_result = operations
                .complete_process_tracking(&process_id, ProcessStatus::Failed, Some(err_value))
                .await;
            if update_process_tracking_result.is_err() {
                //This is our main error handler.  If it is failing, we should log it so we have
                //something to maybe help trouble shoot.
                error!("An error occurred while trying to update the process tracking document.  Here is the error: {:?}", update_process_tracking_result.err().unwrap());
            }
        } else {
            //This is our main error handler.  If it is failing, we should log it so we have
            //something to maybe help trouble shoot.
            error!("An error occurred while trying to update the process tracking document.  Here is the error: {:?}", add_error_result.err().unwrap());
        }
        //No matter what, we need to stop the heartbeat
        operations.stop_heartbeat(&mut self.heartbeat);
    }

    async fn process_impl<T: GlyphEngineOperations>(
        &mut self,
        operations: &T,
    ) -> Result<GlyphEngineResults, GlyphEngineProcessError> {
        //Get our field definitions
        process_error!(let x_field_definition = self.parameters.get_field_definition("xaxis"); GlyphEngineProcessError::from_get_field_definition_error("xaxis"); operations; self);
        process_error!(let y_field_definition = self.parameters.get_field_definition("yaxis"); GlyphEngineProcessError::from_get_field_definition_error("yaxis");operations; self );
        process_error!(let z_field_definition = self.parameters.get_field_definition("zaxis"); GlyphEngineProcessError::from_get_field_definition_error("zaxis"); operations; self);

        //1. Kick off the main query.  This runs offline on AWS and we need it to finish before we
        //   can do anything else.  Here we can start the query, then go and get our vector tables
        process_error!(let query_id = self.start_query( &x_field_definition, &y_field_definition, &z_field_definition, operations,).await;operations; self);
        //1. Build the vector/rank tables tables and upload them to S3. -- 1 for each vertex (X and
        //   Y)

        let (x_file_name, y_file_name) = self.get_vector_file_names();

        let mut status: AthenaQueryStatus;
        process_error!( let vectors = self.process_vectors(&x_field_definition, &x_file_name, &y_field_definition, &y_file_name, operations).await;operations;self);
        let (x_field_processor, y_field_processor) = vectors;

        loop {
            process_error!(let local_status = operations.check_query_status(self.athena_connection, &query_id).await;operations;self);
            status = local_status;
            if status != AthenaQueryStatus::Queued && status != AthenaQueryStatus::Running {
                break;
            }
        }

        if status != AthenaQueryStatus::Succeeded {
            let message = format!(
                "The query did not complete successfully.  The status was {:?}",
                status
            );
            let data =
                serde_json::json!({ "query_id": query_id, "status": format!("{:?}", status) });
            let inner_error = match status {
                AthenaQueryStatus::Failed(error) => {
                    let string_error = format!("{:?}", error);
                    Some(serde_json::to_value(string_error).unwrap())
                }
                _ => None,
            };
            let error_data = GlyphxErrorData::new(message, Some(data), inner_error);

            return Err(GlyphEngineProcessError::QueryProcessingError(error_data));
        }

        let glyph_file_name = format!(
            "{}/{}",
            self.parameters.output_file_prefix,
            get_glyph_file_name(
                &self.parameters.workspace_id,
                &self.parameters.project_id,
                &self.parameters.model_hash
            )
        );

        process_error!(let iterator_results = operations.get_query_results(&query_id, &self.athena_connection).await; operations; self);
        let mut results_iterator = iterator_results;

        process_error!(let z_stats_vector = self.process_query_results( &glyph_file_name, &mut results_iterator, &x_field_definition.get_field_display_name(), &y_field_definition.get_field_display_name(), &z_field_definition.get_field_display_name(), &x_field_processor, &y_field_processor, operations,).await; operations; self);

        process_error!(let stats_file_name = self.calculate_statistics(&x_field_processor, &y_field_processor, z_stats_vector, operations).await; operations; self);

        let results = GlyphEngineResults {
            x_axis_vectors_file_name: x_file_name,
            y_axis_vectors_file_name: y_file_name,
            glyphs_file_name: glyph_file_name,
            statistics_file_name: stats_file_name,
        };

        let json_results = to_value(&results).unwrap();
        let complete_process_tracking_result = operations
            .complete_process_tracking(
                &self.heartbeat.get_process_id(),
                ProcessStatus::Completed,
                Some(json_results),
            )
            .await;
        if complete_process_tracking_result.is_err() {
            let error = complete_process_tracking_result.err().unwrap();
            error!("An error occurred while trying to update the process tracking document. GlyphEngine has completed.  Here is the error: {:?}", error);
        }
        operations.stop_heartbeat(&mut self.heartbeat);
        Ok(results)
    }
    pub async fn process(&mut self) -> Result<GlyphEngineResults, GlyphEngineProcessError> {
        self.process_impl(&GlyphEngineOperationsImpl).await
    }
}

#[cfg(test)]
pub mod glyph_engine {

    use super::*;

    use once_cell::sync::Lazy;
    use serde_json::json;

    use glyphx_core::aws::athena_stream_iterator::{
        test_objects::MockStream, ColumnInfo, ColumnNullable, Datum, GetQueryResultsError,
        GetQueryResultsOutput, ResultSet, ResultSetMetadata, Row, SdkError,
    };

    static mut S3_CONNECTION_INSTANCE: Lazy<Option<S3Connection>> =
        Lazy::new(|| Some(S3Connection::default()));

    static mut ATHENA_CONNECTION_INSTANCE: Lazy<Option<AthenaConnection>> =
        Lazy::new(|| Some(AthenaConnection::default()));

    static mut MONGO_CONNECTION_INSTANCE: Lazy<Option<MongoDbConnection>> =
        Lazy::new(|| Some(MongoDbConnection::default()));

    static mut HEARTBEAT_INSTANCE: Lazy<Option<Heartbeat>> =
        Lazy::new(|| Some(Heartbeat::default()));

    static X_FIELD_NAME: &str = "x_field1";
    static Y_FIELD_NAME: &str = "y_field2";
    static Z_FIELD_NAME: &str = "z_field3";

    static INPUT: Lazy<Value> = Lazy::new(|| {
        json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "output_file_prefix" : "test",
            "model_hash" : "test_hash",
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

    static RESULT_SET: Lazy<Value> = Lazy::new(|| {
        json!([
            {
                X_FIELD_NAME: 1.0,
                Y_FIELD_NAME: 2.0,
                Z_FIELD_NAME: 3.0,
                "rowids": "1"
            },
            {
                X_FIELD_NAME: 4.0,
                Y_FIELD_NAME: 5.0,
                Z_FIELD_NAME: 6.0,
                "rowids": "2"
            },
            {
                X_FIELD_NAME: 7.0,
                Y_FIELD_NAME: 8.0,
                Z_FIELD_NAME: 9.0,
                "rowids": "3|34"
            },
            {
                X_FIELD_NAME: 10.0,
                Y_FIELD_NAME: 11.0,
                Z_FIELD_NAME: 12.0,
                "rowids": "4"
            },
            {
                X_FIELD_NAME: 13.0,
                Y_FIELD_NAME: 14.0,
                Z_FIELD_NAME: 15.0,
                "rowids": "5|56"
            },
            {
                X_FIELD_NAME: 16.0,
                Y_FIELD_NAME: 17.0,
                Z_FIELD_NAME: 18.0,
                "rowids": "6"
            },
            {
                X_FIELD_NAME: 19.0,
                Y_FIELD_NAME: 20.0,
                Z_FIELD_NAME: 21.0,
                "rowids": "7"
            },
            {
                X_FIELD_NAME: 22.0,
                Y_FIELD_NAME: 23.0,
                Z_FIELD_NAME: 24.0,
                "rowids": "8"
            },
            {
                X_FIELD_NAME: 25.0,
                Y_FIELD_NAME: 26.0,
                Z_FIELD_NAME: 27.0,
                "rowids": "9"
            },
            {
                X_FIELD_NAME: 28.0,
                Y_FIELD_NAME: 29.0,
                Z_FIELD_NAME: 30.0,
                "rowids": "10|100"
            }
        ])
    });

    fn get_result_set_metadata() -> ResultSetMetadata {
        let column1 = ColumnInfo::builder()
            .name("rowids")
            .r#type("string")
            .nullable(ColumnNullable::NotNull)
            .build();

        let column2 = ColumnInfo::builder()
            .name(X_FIELD_NAME)
            .r#type("integer")
            .nullable(ColumnNullable::NotNull)
            .build();

        let column3 = ColumnInfo::builder()
            .name(Y_FIELD_NAME)
            .r#type("integer")
            .nullable(ColumnNullable::NotNull)
            .build();

        let column4 = ColumnInfo::builder()
            .name(Z_FIELD_NAME)
            .r#type("integer")
            .nullable(ColumnNullable::NotNull)
            .build();

        ResultSetMetadata::builder()
            .column_info(column1)
            .column_info(column2)
            .column_info(column3)
            .column_info(column4)
            .build()
    }

    fn get_row_data(row_number: usize) -> Row {
        let row = RESULT_SET.as_array().unwrap()[row_number].clone();
        let col1 = row["rowids"].as_str().unwrap();
        let col2 = row[X_FIELD_NAME].as_f64().unwrap().to_string();
        let col3 = row[Y_FIELD_NAME].as_f64().unwrap().to_string();
        let col4 = row[Z_FIELD_NAME].as_f64().unwrap().to_string();

        Row::builder()
            .data(Datum::builder().var_char_value(col1.to_string()).build())
            .data(Datum::builder().var_char_value(col2).build())
            .data(Datum::builder().var_char_value(col3).build())
            .data(Datum::builder().var_char_value(col4).build())
            .build()
    }

    fn get_header_row() -> Row {
        let col1 = "rowids";
        let col2 = X_FIELD_NAME;
        let col3 = Y_FIELD_NAME;
        let col4 = Z_FIELD_NAME;

        Row::builder()
            .data(Datum::builder().var_char_value(col1.to_string()).build())
            .data(Datum::builder().var_char_value(col2.to_string()).build())
            .data(Datum::builder().var_char_value(col3.to_string()).build())
            .data(Datum::builder().var_char_value(col4.to_string()).build())
            .build()
    }

    fn get_query_results_set() -> GetQueryResultsOutput {
        let metadata = get_result_set_metadata();
        let mut result_set = ResultSet::builder().result_set_metadata(metadata);
        result_set = result_set.rows(get_header_row());

        for i in 0..10 {
            let row = get_row_data(i);
            result_set = result_set.rows(row);
        }

        let result_set = result_set.build();

        GetQueryResultsOutput::builder()
            .result_set(result_set)
            .build()
    }

    fn get_setup_mocks() -> MockGlyphEngineOperations {
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
    }

    async fn get_glyph_engine() -> GlyphEngine {
        let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
        let mocks = get_setup_mocks();
        GlyphEngine::new_impl(&parameters, &mocks).await.unwrap()
    }

    fn get_mock_athena_stream_iterator(
        closure: Box<
            dyn FnMut(
                &mut MockStream,
            )
                -> Option<Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>>,
        >,
    ) -> AthenaStreamIterator {
        let mut mock_stream = MockStream::new(X_FIELD_NAME, Y_FIELD_NAME, Z_FIELD_NAME, 10);
        mock_stream.with_closure(closure);
        AthenaStreamIterator::new(Box::new(mock_stream), "1234", "test", "test")
    }

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

    mod constructor {
        use super::*;
        use glyphx_core::GlyphxErrorData;

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
        use vector_processer::{MockVectorValueProcesser, VectorCalculationError};

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
                .returning(|_, _, _, _| unsafe {
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        Box::new(vector_processer_mock2)
                    }
                })
                .times(2);

            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let x_file_name = "test_x_file";
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let y_file_name = "test_y_file";
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine
                .process_vectors(
                    &x_field_definition,
                    x_file_name,
                    &y_field_definition,
                    y_file_name,
                    &mocks,
                )
                .await;
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
                .returning(|_, _, _, _| unsafe {
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(1)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Errored(VectorCalculationError::AthenaQueryError(
                                GlyphxErrorData::new("An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),None, None)
                            )));
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        Box::new(vector_processer_mock2)
                    }
                })
                .times(2);

            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let x_file_name = "test_x_file";
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let y_file_name = "test_y_file";
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            let result = glyph_engine
                .process_vectors(
                    &x_field_definition,
                    x_file_name,
                    &y_field_definition,
                    y_file_name,
                    &mocks,
                )
                .await;

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
                .returning(|_, _, _, _| unsafe {
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_run_sync()
                            .return_const(TaskStatus::Complete)
                            .times(1);
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(1)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_run_sync()
                            .return_const(TaskStatus::Errored(VectorCalculationError::AthenaQueryError(
                                GlyphxErrorData::new("An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),None, None))))
                                .times(1);
                        Box::new(vector_processer_mock2)
                    }
                })
                .times(2);

            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let x_file_name = "test_x_file";
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let y_file_name = "test_y_file";
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            let result = glyph_engine
                .process_vectors(
                    &x_field_definition,
                    x_file_name,
                    &y_field_definition,
                    y_file_name,
                    &mocks,
                )
                .await;

            assert!(result.is_err());
            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::VectorProcessingError(_) => {}
                _ => panic!("Expected VectorProcessingError"),
            }
        }
    }
    mod start_query {
        use super::*;

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

            mocks
                .expect_start_athena_query()
                .returning(|_, _| Ok("1234".to_string()));

            let parameters = VectorizerParameters::from_json_string(&INPUT.to_string()).unwrap();
            let x_field_definition = parameters.get_field_definition("xaxis").unwrap();
            let y_field_definition = parameters.get_field_definition("yaxis").unwrap();
            let z_field_definition = parameters.get_field_definition("zaxis").unwrap();
            let glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            let result = glyph_engine
                .start_query(
                    &x_field_definition,
                    &y_field_definition,
                    &z_field_definition,
                    &mocks,
                )
                .await;

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

            let result = glyph_engine
                .start_query(
                    &x_field_definition,
                    &y_field_definition,
                    &z_field_definition,
                    &mocks,
                )
                .await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::QueryProcessingError(_) => {}
                _ => panic!("Expected QueryProcessingError"),
            }
        }
    }

    mod process_query_results {
        use super::*;
        use glyphx_core::aws::athena_stream_iterator::{
            ErrorMetadata, GetQueryResultsError, HttpResponse, InternalServerException, SdkBody,
            SdkError,
        };
        use vector_processer::build_vector_processer_from_json;

        #[tokio::test]
        async fn is_ok() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(10)
                .returning(|_, _| Ok(()));

            mocks
                .expect_finish_upload_stream()
                .times(1)
                .returning(|_| Ok(()));

            //2. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            //3. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //4. Mock out our vector processers
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                Y_FIELD_NAME.to_string(),
            );

            //5. Mock out our AthenaStream
            let mut athena_stream = get_mock_athena_stream_iterator(Box::new(move |stream| {
                if stream.state.counter == 0 {
                    Some(Ok(get_query_results_set()))
                } else {
                    Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                }
            }));

            let result = glyph_engine
                .process_query_results(
                    "test_file_name",
                    &mut athena_stream,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                    &mocks,
                )
                .await;

            assert!(result.is_ok());
            let result = result.unwrap();
            for i in 0..10 {
                assert_eq!(result[i], ((i + 1) * 3) as f64);
            }
        }

        #[tokio::test]
        async fn get_upload_stream_fails() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks.expect_get_upload_stream().times(1).returning(|_, _| {
                Err(GetUploadStreamError::UnexpectedError(GlyphxErrorData::new(
                    "An unexpected error occurred while getting the upload stream".to_string(),
                    None,
                    None,
                )))
            });

            mocks
                .expect_write_to_upload_stream()
                .times(0)
                .returning(|_, _| Ok(()));

            mocks
                .expect_finish_upload_stream()
                .times(0)
                .returning(|_| Ok(()));

            //2. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await;

            //3. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //4. Mock out our vector processers
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                Y_FIELD_NAME.to_string(),
            );

            //5. Mock out our AthenaStream
            let mut athena_stream = get_mock_athena_stream_iterator(Box::new(move |stream| {
                if stream.state.counter == 0 {
                    Some(Ok(get_query_results_set()))
                } else {
                    Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                }
            }));

            let result = glyph_engine
                .process_query_results(
                    "test_file_name",
                    &mut athena_stream,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                    &mocks,
                )
                .await;

            assert!(result.is_err());

            let result = result.err().unwrap();

            match result {
                GlyphEngineProcessError::DataProcessingError(_) => {}
                _ => panic!("Expected DataProcessingError"),
            }
        }

        #[tokio::test]
        async fn the_iterator_fails() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(10)
                .returning(|_, _| Ok(()));

            mocks
                .expect_finish_upload_stream()
                .times(0)
                .returning(|_| Ok(()));

            //2. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            //3. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //4. Mock out our vector processers
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                Y_FIELD_NAME.to_string(),
            );

            //5. Mock out our AthenaStream
            let mut athena_stream = get_mock_athena_stream_iterator(Box::new(move |stream| {
                if stream.state.counter == 0 {
                    Some(Ok(get_query_results_set()))
                } else {
                    let body = SdkBody::from("An error occurred".to_string());
                    let metadata = ErrorMetadata::builder()
                        .code("500")
                        .message("An error has occurred")
                        .build();
                    let internal_server_exception = InternalServerException::builder()
                        .message("An error has occurred")
                        .meta(metadata)
                        .build();

                    let query_response_error =
                        GetQueryResultsError::InternalServerException(internal_server_exception);
                    let raw: HttpResponse = HttpResponse::new(body);
                    let error: SdkError<GetQueryResultsError> =
                        SdkError::service_error(query_response_error, raw);
                    Some(Err(error))
                }
            }));

            let result = glyph_engine
                .process_query_results(
                    "test_file_name",
                    &mut athena_stream,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                    &mocks,
                )
                .await;

            assert!(result.is_err());

            let result = result.err().unwrap();

            match result {
                GlyphEngineProcessError::DataProcessingError(_) => {}
                _ => panic!("Expected DataProcessingError"),
            }
        }

        #[tokio::test]
        async fn write_to_upload_fails() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(1)
                .returning(|_, _| {
                    Err(UploadStreamWriteError::UnexpectedError(
                        GlyphxErrorData::new(
                            "An unexpected error occurred while writing to the upload stream"
                                .to_string(),
                            None,
                            None,
                        ),
                    ))
                });

            mocks
                .expect_finish_upload_stream()
                .times(0)
                .returning(|_| Ok(()));

            //2. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            //3. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //4. Mock out our vector processers
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                Y_FIELD_NAME.to_string(),
            );

            //5. Mock out our AthenaStream
            let mut athena_stream = get_mock_athena_stream_iterator(Box::new(move |stream| {
                if stream.state.counter == 0 {
                    Some(Ok(get_query_results_set()))
                } else {
                    Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                }
            }));

            let result = glyph_engine
                .process_query_results(
                    "test_file_name",
                    &mut athena_stream,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                    &mocks,
                )
                .await;

            assert!(result.is_err());

            let result = result.err().unwrap();

            match result {
                GlyphEngineProcessError::DataProcessingError(_) => {}
                _ => panic!("Expected DataProcessingError"),
            }
        }

        #[tokio::test]
        async fn finish_upload_stream_fails() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(10)
                .returning(|_, _| Ok(()));

            mocks.expect_finish_upload_stream().times(1).returning(|_| {
                Err(UploadStreamFinishError::UnexpectedError(
                    GlyphxErrorData::new(
                        "An unexpected error occurred while finishing the upload stream"
                            .to_string(),
                        None,
                        None,
                    ),
                ))
            });

            //2. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            //3. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //4. Mock out our vector processers
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                Y_FIELD_NAME.to_string(),
            );

            //5. Mock out our AthenaStream
            let mut athena_stream = get_mock_athena_stream_iterator(Box::new(move |stream| {
                if stream.state.counter == 0 {
                    Some(Ok(get_query_results_set()))
                } else {
                    Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                }
            }));

            let result = glyph_engine
                .process_query_results(
                    "test_file_name",
                    &mut athena_stream,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                    &mocks,
                )
                .await;

            assert!(result.is_err());

            let result = result.err().unwrap();

            match result {
                GlyphEngineProcessError::DataProcessingError(_) => {}
                _ => panic!("Expected DataProcessingError"),
            }
        }

        #[tokio::test]
        async fn build_glyph_fails() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(0)
                .returning(|_, _| Ok(()));

            mocks
                .expect_finish_upload_stream()
                .times(0)
                .returning(|_| Ok(()));

            //2. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();

            //3. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //4. Mock out our vector processers
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                Y_FIELD_NAME.to_string(),
            );

            //5. Mock out our AthenaStream
            let mut athena_stream = get_mock_athena_stream_iterator(Box::new(move |stream| {
                if stream.state.counter == 0 {
                    Some(Ok(get_query_results_set()))
                } else {
                    Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                }
            }));

            let result = glyph_engine
                .process_query_results(
                    "test_file_name",
                    &mut athena_stream,
                    //Sending a bad field name will
                    //cause build_glyph to fail.
                    //There is a cub module to more fully test out
                    //the build_glyph function
                    "field1_bad",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                    &mocks,
                )
                .await;

            assert!(result.is_err());

            let result = result.err().unwrap();

            match result {
                GlyphEngineProcessError::DataProcessingError(_) => {}
                _ => panic!("Expected DataProcessingError"),
            }
        }

        mod build_glyph {
            use super::*;

            #[tokio::test]
            async fn is_ok() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();
                let y_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("yaxis")
                    .unwrap();
                //3. Mock out our vector processers
                let x_vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let y_vector_processor = build_vector_processer_from_json(
                    "y",
                    "test_table",
                    "test_file",
                    y_field_definition.clone(),
                    RESULT_SET.clone(),
                    Y_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.build_glyph(
                    &value,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                );
                assert!(result.is_ok());
                let result = result.unwrap();
                assert_eq!(result.x_value, 4.0);
                assert_eq!(result.y_value, 8.0);
                assert_eq!(result.z_value, 12.0);
                assert_eq!(result.row_ids, vec![1, 2, 3]);
            }
            #[tokio::test]
            async fn get_x_vector_fails() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();
                let y_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("yaxis")
                    .unwrap();
                //3. Mock out our vector processers
                let x_vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let y_vector_processor = build_vector_processer_from_json(
                    "y",
                    "test_table",
                    "test_file",
                    y_field_definition.clone(),
                    RESULT_SET.clone(),
                    Y_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1_fail": 1.0,
                    "y_field2": 2.0,
                    "z_field3": 3.0,
                    "rowids": "1"
                });

                let result = glyph_engine.build_glyph(
                    &value,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                );
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field x_field1 was not found in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn get_y_vector_fails() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();
                let y_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("yaxis")
                    .unwrap();
                //3. Mock out our vector processers
                let x_vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let y_vector_processor = build_vector_processer_from_json(
                    "y",
                    "test_table",
                    "test_file",
                    y_field_definition.clone(),
                    RESULT_SET.clone(),
                    Y_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": 1.0,
                    "y_field2_fail": 2.0,
                    "z_field3": 3.0,
                    "rowids": "1"
                });

                let result = glyph_engine.build_glyph(
                    &value,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                );
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field y_field2 was not found in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn get_z_value_fails() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();
                let y_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("yaxis")
                    .unwrap();
                //3. Mock out our vector processers
                let x_vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let y_vector_processor = build_vector_processer_from_json(
                    "y",
                    "test_table",
                    "test_file",
                    y_field_definition.clone(),
                    RESULT_SET.clone(),
                    Y_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": 1.0,
                    "y_field2": 2.0,
                    "z_field3_fail": 3.0,
                    "rowids": "1"
                });

                let result = glyph_engine.build_glyph(
                    &value,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                );
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field z_field3 was not found in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn get_row_ids_fails() {
                let glyph_engine = get_glyph_engine().await;

                // Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();
                let y_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("yaxis")
                    .unwrap();
                //Mock out our vector processers
                let x_vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let y_vector_processor = build_vector_processer_from_json(
                    "y",
                    "test_table",
                    "test_file",
                    y_field_definition.clone(),
                    RESULT_SET.clone(),
                    Y_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": 1.0,
                    "y_field2": 2.0,
                    "z_field3": 3.0,
                    "rowids_fail": "1"
                });

                let result = glyph_engine.build_glyph(
                    &value,
                    "field1",
                    "field2",
                    "field3",
                    &x_vector_processor,
                    &y_vector_processor,
                );
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field rowids was not found in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }
        }

        mod get_vector {
            use super::*;

            #[tokio::test]
            async fn is_ok() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();

                //3. Mock out our vector processers
                let vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_vector(&value, "x_field1", &vector_processor);
                assert!(result.is_ok());
                let result = result.unwrap();
                assert_eq!(result.vector, 4.0);
                assert_eq!(result.rank, 1);
                assert_eq!(result.orig_value, VectorOrigionalValue::F64(4.0));
            }

            #[tokio::test]
            async fn field_is_not_in_value() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();

                //3. Mock out our vector processers
                let vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_vector(&value, "x_field1_bad", &vector_processor);
                assert!(result.is_err());
                let result = result.err().unwrap();

                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field x_field1_bad was not found in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn value_is_an_invalid_type() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();

                //3. Mock out our vector processers
                let vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": true,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_vector(&value, "x_field1", &vector_processor);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field x_field1 was not a number or string in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn value_is_not_in_the_vector_processer() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                //2. Build our field_definitions
                let x_field_definition = glyph_engine
                    .parameters
                    .get_field_definition("xaxis")
                    .unwrap();

                //3. Mock out our vector processers
                let vector_processor = build_vector_processer_from_json(
                    "x",
                    "test_table",
                    "test_file",
                    x_field_definition.clone(),
                    RESULT_SET.clone(),
                    X_FIELD_NAME.to_string(),
                );

                let value: Value = json!({
                    "x_field1": 444.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_vector(&value, "x_field1", &vector_processor);

                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                "The value F64(444.0) was not found in the vector table for the field x_field1",
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }
        }

        mod get_z_value {
            use super::*;

            #[tokio::test]
            async fn is_ok() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_z_value(&value, "z_field3");
                assert!(result.is_ok());
                let result = result.unwrap();
                assert_eq!(result, 12.0);
            }

            #[tokio::test]
            async fn field_not_in_results() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_z_value(&value, "z_field3_bad");
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field z_field3_bad was not found in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn z_is_not_a_number() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": "string",
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_z_value(&value, "z_field3");
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field z_field3 was not a number in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }
        }

        mod get_row_ids {
            use super::*;

            #[tokio::test]
            async fn is_ok() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|2|3"
                });

                let result = glyph_engine.get_row_ids(&value);
                assert!(result.is_ok());
                let result = result.unwrap();
                assert_eq!(result, vec![1, 2, 3]);
            }

            #[tokio::test]
            async fn field_is_not_in_the_result() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids_fail": "1|2|3"
                });

                let result = glyph_engine.get_row_ids(&value);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field rowids was not found in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn rowids_is_not_a_string() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": 123
                });

                let result = glyph_engine.get_row_ids(&value);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field rowids was not a string in the query results"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }

            #[tokio::test]
            async fn rowids_is_malformed() {
                //1. Get our glyph_engine
                let glyph_engine = get_glyph_engine().await;

                let value: Value = json!({
                    "x_field1": 4.0,
                    "y_field2": 8.0,
                    "z_field3": 12.0,
                    "rowids": "1|a|2|3"
                });

                let result = glyph_engine.get_row_ids(&value);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    GlyphEngineProcessError::DataProcessingError(error_data) => {
                        assert_eq!(
                            error_data.message,
                            "The field rowids was not a pipe delimited string of integers"
                        );
                    }
                    _ => panic!("Expected DataProcessingError"),
                }
            }
        }
    }
    mod process {
        use super::*;
        use glyphx_core::aws::athena_stream_iterator::{
            ErrorMetadata, GetQueryResultsError, HttpResponse, InternalServerException, SdkBody,
            SdkError,
        };
        use vector_processer::{MockVectorValueProcesser, VectorCalculationError};

        #[tokio::test]
        async fn is_ok() {
            let query_id = "12345".to_string();

            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();
            mocks
                .expect_start_athena_query()
                .times(1)
                .returning(move |_, _| Ok(query_id.clone()));

            static mut CALL_NUMBER: usize = 0;

            mocks
                .expect_get_vector_processer()
                .times(2)
                .returning(|_, _, _, _| unsafe {
                    //This is where we setup our vector processer moocks.  Add a get_vector
                    //expectation here so we can build our glyphs
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_get_vector()
                            .times(10)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 1))
                            });
                        vector_processer_mock1
                            .expect_get_statistics_vector()
                            .times(1)
                            .returning(|| {
                                vec![1.0, 3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0]
                            });
                        vector_processer_mock1
                            .expect_get_max_vector()
                            .times(0)
                            .return_const(Vector::new(VectorOrigionalValue::F64(10.0), 10.0, 9));
                        vector_processer_mock1.expect_get_max_rank().times(1).return_const(9 as usize);
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_get_vector()
                            .times(10)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 2))
                            });
                        vector_processer_mock2
                            .expect_get_statistics_vector()
                            .times(1)
                            .returning(|| {
                                vec![2.0, 5.0, 8.0, 11.0, 14.0, 17.0, 20.0, 23.0, 26.0, 29.0]
                            });
                        vector_processer_mock2
                            .expect_get_max_vector()
                            .times(0)
                            .return_const(Vector::new(VectorOrigionalValue::F64(10.0), 10.0, 9));
                        vector_processer_mock2.expect_get_max_rank().times(1).return_const(9 as usize);
                        Box::new(vector_processer_mock2)
                    }
                });

            mocks
                .expect_check_query_status()
                .times(1)
                .returning(move |_, _| Ok(AthenaQueryStatus::Succeeded));

            mocks.expect_get_query_results().times(1).returning(|_, _| {
                Ok(get_mock_athena_stream_iterator(Box::new(move |stream| {
                    if stream.state.counter == 0 {
                        Some(Ok(get_query_results_set()))
                    } else {
                        Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                    }
                })))
            });

            mocks
                .expect_get_upload_stream()
                .times(2)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_finish_upload_stream()
                .times(2)
                .returning(|_| Ok(()));

            mocks
                .expect_write_to_upload_stream()
                .times(13)
                .returning(|_, _| Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());

            //2. Get our glyph_engine
            let mut glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_ok());
            let result = result.unwrap();

            assert_eq!(
                result.x_axis_vectors_file_name,
                "test/1234/5678/output/test_hash-x-axis.vec"
            );

            assert_eq!(
                result.y_axis_vectors_file_name,
                "test/1234/5678/output/test_hash-y-axis.vec"
            );

            assert_eq!(
                result.glyphs_file_name,
                "test/1234/5678/output/test_hash.gly"
            );

            assert_eq!(
                result.statistics_file_name,
                "test/1234/5678/output/test_hash.sts"
            );
        }

        #[tokio::test]
        async fn no_x_axis() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());
            //2. Get our glyph_engine

            let mut input = INPUT.clone();

            input["xAxis"].take();

            let parameters = VectorizerParameters::from_json_string(&input.to_string()).unwrap();
            let mut glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::ConfigurationError(data) => {
                    assert_eq!(
                        data.message,
                        "Error getting field definition for axis xaxis"
                    )
                }
                _ => panic!("Expected ConfigurationError"),
            }
        }

        #[tokio::test]
        async fn no_y_axis() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());
            //2. Get our glyph_engine

            let mut input = INPUT.clone();

            input["yAxis"].take();

            let parameters = VectorizerParameters::from_json_string(&input.to_string()).unwrap();
            let mut glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::ConfigurationError(data) => {
                    assert_eq!(
                        data.message,
                        "Error getting field definition for axis yaxis"
                    )
                }
                _ => panic!("Expected ConfigurationError"),
            }
        }

        #[tokio::test]
        async fn no_z_axis() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());
            //2. Get our glyph_engine

            let mut input = INPUT.clone();

            input["zAxis"].take();

            let parameters = VectorizerParameters::from_json_string(&input.to_string()).unwrap();
            let mut glyph_engine = GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::ConfigurationError(data) => {
                    assert_eq!(
                        data.message,
                        "Error getting field definition for axis zaxis"
                    )
                }
                _ => panic!("Expected ConfigurationError"),
            }
        }

        #[tokio::test]
        async fn start_query_fails() {
            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();
            mocks
                .expect_start_athena_query()
                .times(1)
                .returning(move |_, _| {
                    Err(GlyphEngineProcessError::QueryProcessingError(
                        GlyphxErrorData::new(
                            "An Unexpected Error Occurred".to_string(),
                            None,
                            None,
                        ),
                    ))
                });

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());
            //2. Get our glyph_engine
            let mut glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::QueryProcessingError(data) => {
                    assert_eq!(data.message, "An Unexpected Error Occurred")
                }
                _ => panic!("Expected QueryProcessingError"),
            }
        }

        #[tokio::test]
        async fn process_vectors_fails() {
            let query_id = "12345".to_string();

            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();
            mocks
                .expect_start_athena_query()
                .times(1)
                .returning(move |_, _| Ok(query_id.clone()));

            static mut CALL_NUMBER: usize = 0;

            mocks
                .expect_get_vector_processer()
                .times(2)
                .returning(|_, _, _, _| unsafe {
                    //This is where we setup our vector processer moocks.  Add a get_vector
                    //expectation here so we can build our glyphs
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(1)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(0)
                            .returning(|| {
                                TaskStatus::Errored(VectorCalculationError::AthenaQueryError(
                                    GlyphxErrorData::new(
                                        "An Unexpected Error Occurred".to_string(),
                                        None,
                                        None,
                                    ),
                                ))
                            });
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Errored(
                                VectorCalculationError::AthenaQueryError(GlyphxErrorData::new(
                                    "An Unexpected Error Occurred".to_string(),
                                    None,
                                    None,
                                )),
                            ));
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());

                        vector_processer_mock2
                            .expect_run_sync()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        Box::new(vector_processer_mock2)
                    }
                });

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());

            //2. Get our glyph_engine
            let mut glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::VectorProcessingError(data) => {
                    assert_eq!(data.message, "An Error occurred while processing the vectors for axis :  x.  See the inner error for additional information")
                }
                _ => panic!("Expected VectorProcessingError"),
            }
        }

        #[tokio::test]
        async fn check_query_status_fails() {
            let query_id = "12345".to_string();

            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();
            mocks
                .expect_start_athena_query()
                .times(1)
                .returning(move |_, _| Ok(query_id.clone()));
            static mut CALL_NUMBER: usize = 0;

            mocks
                .expect_get_vector_processer()
                .times(2)
                .returning(|_, _, _, _| unsafe {
                    //This is where we setup our vector processer moocks.  Add a get_vector
                    //expectation here so we can build our glyphs
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_get_vector()
                            .times(0)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 1))
                            });
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_get_vector()
                            .times(0)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 2))
                            });
                        Box::new(vector_processer_mock2)
                    }
                });

            mocks
                .expect_check_query_status()
                .times(1)
                .returning(|_, _| {
                    Err(GlyphEngineProcessError::QueryProcessingError(
                        GlyphxErrorData::new(
                            "An Unexpected Error Occurred".to_string(),
                            None,
                            None,
                        ),
                    ))
                });

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());

            //2. Get our glyph_engine
            let mut glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::QueryProcessingError(data) => {
                    assert_eq!(data.message, "An Unexpected Error Occurred")
                }
                _ => panic!("Expected QueryProcessingError"),
            }
        }

        #[tokio::test]
        async fn process_query_results_fails() {
            let query_id = "12345".to_string();

            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();

            mocks
                .expect_start_athena_query()
                .times(1)
                .returning(move |_, _| Ok(query_id.clone()));

            static mut CALL_NUMBER: usize = 0;

            mocks
                .expect_get_vector_processer()
                .times(2)
                .returning(|_, _, _, _| unsafe {
                    //This is where we setup our vector processer moocks.  Add a get_vector
                    //expectation here so we can build our glyphs
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_get_vector()
                            .times(0)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 1))
                            });
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_get_vector()
                            .times(0)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 2))
                            });
                        Box::new(vector_processer_mock2)
                    }
                });

            mocks
                .expect_check_query_status()
                .times(1)
                .returning(move |_, _| Ok(AthenaQueryStatus::Succeeded));

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks.expect_get_query_results().times(1).returning(|_, _| {
                Ok(get_mock_athena_stream_iterator(Box::new(move |_| {
                    let body = SdkBody::from("An error occurred".to_string());
                    let metadata = ErrorMetadata::builder()
                        .code("500")
                        .message("An error has occurred")
                        .build();
                    let internal_server_exception = InternalServerException::builder()
                        .message("An error has occurred")
                        .meta(metadata)
                        .build();

                    let query_response_error =
                        GetQueryResultsError::InternalServerException(internal_server_exception);
                    let raw: HttpResponse = HttpResponse::new(body);
                    let error: SdkError<GetQueryResultsError> =
                        SdkError::service_error(query_response_error, raw);

                    Some(Err(error))
                })))
            });

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());

            //2. Get our glyph_engine
            let mut glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_err());

            let error = result.err().unwrap();

            match error {
                GlyphEngineProcessError::DataProcessingError(data) => {
                    assert_eq!(
                        data.message,
                        "An error occurred while iterating the query results, see the inner error for additional information"
                    )
                }
                _ => panic!("Expected ConfigurationError"),
            }
        }

        #[tokio::test]
        async fn calculate_stats_fails() {
            let query_id = "12345".to_string();

            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();
            mocks
                .expect_start_athena_query()
                .times(1)
                .returning(move |_, _| Ok(query_id.clone()));
            static mut CALL_NUMBER: usize = 0;

            mocks
                .expect_get_vector_processer()
                .times(2)
                .returning(|_, _, _, _| unsafe {
                    //This is where we setup our vector processer moocks.  Add a get_vector
                    //expectation here so we can build our glyphs
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_get_vector()
                            .times(10)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 1))
                            });
                        vector_processer_mock1
                            .expect_get_max_vector()
                            .times(0)
                            .return_const(Vector::new(VectorOrigionalValue::F64(10.0), 10.0, 9));
                        vector_processer_mock1
                            .expect_get_statistics_vector()
                            .times(1)
                            .returning(|| {
                                vec![1.0, 3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0]
                            });
                        vector_processer_mock1.expect_get_max_rank().times(1).return_const(9 as usize);
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_get_vector()
                            .times(10)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 2))
                            });
                        vector_processer_mock2
                            .expect_get_statistics_vector()
                            .times(1)
                            .returning(|| {
                                vec![2.0, 5.0, 8.0, 11.0, 14.0, 17.0, 20.0, 23.0, 26.0, 29.0]
                            });
                        vector_processer_mock2
                            .expect_get_max_vector()
                            .times(0)
                            .return_const(Vector::new(VectorOrigionalValue::F64(10.0), 10.0, 9));
                        vector_processer_mock2.expect_get_max_rank().times(1).return_const(9 as usize);
                        Box::new(vector_processer_mock2)
                    }
                });

            mocks
                .expect_check_query_status()
                .times(1)
                .returning(move |_, _| Ok(AthenaQueryStatus::Succeeded));

            mocks.expect_get_query_results().times(1).returning(|_, _| {
                Ok(get_mock_athena_stream_iterator(Box::new(move |stream| {
                    if stream.state.counter == 0 {
                        Some(Ok(get_query_results_set()))
                    } else {
                        Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                    }
                })))
            });

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks.expect_get_upload_stream().times(1).returning(|_, _| {
                Err(GetUploadStreamError::UnexpectedError(GlyphxErrorData::new(
                    "An UnexpectedError Has Occurred".to_string(),
                    None,
                    None,
                )))
            });
            mocks
                .expect_finish_upload_stream()
                .times(1)
                .returning(|_| Ok(()));

            mocks
                .expect_write_to_upload_stream()
                .times(10)
                .returning(|_, _| Ok(()));

            mocks
                .expect_add_process_tracking_error()
                .times(1)
                .return_const(Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| Ok(()));

            mocks.expect_stop_heartbeat().times(1).return_const(());
            //2. Get our glyph_engine
            let mut glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineProcessError::DataProcessingError(data) => {
                    assert_eq!(data.message, "An error occurred while getting the upload stream, see the inner error for additional information ")
                }
                _ => panic!("Expected UploadError"),
            }
        }
        #[tokio::test]
        async fn complete_process_traking_fails() {
            let query_id = "12345".to_string();

            //1. Mock out our GlyhEngineOperations
            let mut mocks = get_setup_mocks();
            mocks
                .expect_start_athena_query()
                .times(1)
                .returning(move |_, _| Ok(query_id.clone()));
            static mut CALL_NUMBER: usize = 0;

            mocks
                .expect_get_vector_processer()
                .times(2)
                .returning(|_, _, _, _| unsafe {
                    //This is where we setup our vector processer moocks.  Add a get_vector
                    //expectation here so we can build our glyphs
                    CALL_NUMBER += 1;
                    if CALL_NUMBER == 1 {
                        let mut vector_processer_mock1 = MockVectorValueProcesser::new();
                        vector_processer_mock1
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock1
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("x".to_string());
                        vector_processer_mock1
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock1
                            .expect_get_vector()
                            .times(10)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 1))
                            });
                        vector_processer_mock1
                            .expect_get_statistics_vector()
                            .times(1)
                            .returning(|| {
                                vec![1.0, 3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0]
                            });
                        vector_processer_mock1
                            .expect_get_max_vector()
                            .times(0)
                            .return_const(Vector::new(VectorOrigionalValue::F64(10.0), 10.0, 9));
                        vector_processer_mock1.expect_get_max_rank().times(1).return_const(9 as usize);
                        Box::new(vector_processer_mock1)
                    } else {
                        let mut vector_processer_mock2 = MockVectorValueProcesser::new();
                        vector_processer_mock2
                            .expect_start()
                            .times(0)
                            .return_const(());
                        vector_processer_mock2
                            .expect_get_axis_name()
                            .times(0)
                            .return_const("y".to_string());
                        vector_processer_mock2
                            .expect_check_status()
                            .times(0)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_run_sync()
                            .times(1)
                            .return_const(TaskStatus::Complete);
                        vector_processer_mock2
                            .expect_get_vector()
                            .times(10)
                            .returning(|_| {
                                Some(Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 2))
                            });
                        vector_processer_mock2
                            .expect_get_statistics_vector()
                            .times(1)
                            .returning(|| {
                                vec![2.0, 5.0, 8.0, 11.0, 14.0, 17.0, 20.0, 23.0, 26.0, 29.0]
                            });
                        vector_processer_mock2
                            .expect_get_max_vector()
                            .times(0)
                            .return_const(Vector::new(VectorOrigionalValue::F64(10.0), 10.0, 9));
                        vector_processer_mock2.expect_get_max_rank().times(1).return_const(9 as usize);
                        Box::new(vector_processer_mock2)
                    }
                });

            mocks
                .expect_check_query_status()
                .times(1)
                .returning(move |_, _| Ok(AthenaQueryStatus::Succeeded));

            mocks.expect_get_query_results().times(1).returning(|_, _| {
                Ok(get_mock_athena_stream_iterator(Box::new(move |stream| {
                    if stream.state.counter == 0 {
                        Some(Ok(get_query_results_set()))
                    } else {
                        Some(Ok(stream.get_query_results_set(Some(())))) //End the stream
                    }
                })))
            });

            mocks
                .expect_get_upload_stream()
                .times(2)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_finish_upload_stream()
                .times(2)
                .returning(|_| Ok(()));

            mocks
                .expect_write_to_upload_stream()
                .times(13)
                .returning(|_, _| Ok(()));

            mocks
                .expect_complete_process_tracking()
                .times(1)
                .returning(|_, _, _| {
                    Err(UpdateDocumentError::UnexpectedError(GlyphxErrorData::new(
                        "An UnexpectedError Has Occurred".to_string(),
                        None,
                        None,
                    )))
                });

            mocks.expect_stop_heartbeat().times(1).return_const(());

            //2. Get our glyph_engine
            let mut glyph_engine = get_glyph_engine().await; //  GlyphEngine::new_impl(&parameters, &mocks).await.unwrap();
            let result = glyph_engine.process_impl(&mocks).await;

            assert!(result.is_ok());

            let result = result.unwrap();

            assert_eq!(
                result.x_axis_vectors_file_name,
                "test/1234/5678/output/test_hash-x-axis.vec"
            );

            assert_eq!(
                result.y_axis_vectors_file_name,
                "test/1234/5678/output/test_hash-y-axis.vec"
            );

            assert_eq!(
                result.glyphs_file_name,
                "test/1234/5678/output/test_hash.gly"
            );

            assert_eq!(
                result.statistics_file_name,
                "test/1234/5678/output/test_hash.sts"
            );
        }
    }

    mod calculate_stats {
        use super::*;
        use vector_processer::build_vector_processer_from_json;

        #[tokio::test]
        async fn is_ok() {
            //1. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await;

            //2. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //3. Build our vector_processors
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            //4. Build our Z Vectors
            let z_vectors = vec![3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0, 30.0];

            //5. Build our mocks
            let mut mocks = MockGlyphEngineOperations::new();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(3)
                .returning(|_, _| Ok(()));

            mocks
                .expect_finish_upload_stream()
                .times(1)
                .returning(|_| Ok(()));

            let result = glyph_engine
                .calculate_statistics(&x_vector_processor, &y_vector_processor, z_vectors, &mocks)
                .await;

            assert!(result.is_ok());
            let result = result.unwrap();
            assert_eq!(result, "test/1234/5678/output/test_hash.sts");
        }

        #[tokio::test]
        async fn get_upload_stream_fails() {
            //1. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await;

            //2. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //3. Build our vector_processors
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            //4. Build our Z Vectors
            let z_vectors = vec![3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0, 30.0];

            //5. Build our mocks
            let mut mocks = MockGlyphEngineOperations::new();

            mocks.expect_get_upload_stream().times(1).returning(|_, _| {
                Err(GetUploadStreamError::UnexpectedError(GlyphxErrorData::new(
                    "An UnexpectedError Has Occurred".to_string(),
                    None,
                    None,
                )))
            });

            let result = glyph_engine
                .calculate_statistics(&x_vector_processor, &y_vector_processor, z_vectors, &mocks)
                .await;

            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineProcessError::DataProcessingError(data) => {
                    assert_eq!(data.message, "An error occurred while getting the upload stream, see the inner error for additional information ")
                }
                _ => panic!("Expected UploadError"),
            }
        }

        #[tokio::test]
        async fn write_to_upload_fails() {
            //1. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await;

            //2. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //3. Build our vector_processors
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            //4. Build our Z Vectors
            let z_vectors = vec![3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0, 30.0];

            //5. Build our mocks
            let mut mocks = MockGlyphEngineOperations::new();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(1)
                .returning(|_, _| {
                    Err(UploadStreamWriteError::UnexpectedError(
                        GlyphxErrorData::new(
                            "An Unexpected Error Has Occurred".to_string(),
                            None,
                            None,
                        ),
                    ))
                });

            let result = glyph_engine
                .calculate_statistics(&x_vector_processor, &y_vector_processor, z_vectors, &mocks)
                .await;

            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineProcessError::DataProcessingError(data) => {
                    assert_eq!(data.message, "An error occurred while writing to the upload stream, see the inner error for additional information ")
                }
                _ => panic!("Expected UploadError"),
            }
        }

        #[tokio::test]
        async fn finish_upload_stream_fails() {
            //1. Get our glyph_engine
            let glyph_engine = get_glyph_engine().await;

            //2. Build our field_definitions
            let x_field_definition = glyph_engine
                .parameters
                .get_field_definition("xaxis")
                .unwrap();

            let y_field_definition = glyph_engine
                .parameters
                .get_field_definition("yaxis")
                .unwrap();

            //3. Build our vector_processors
            let x_vector_processor = build_vector_processer_from_json(
                "x",
                "test_table",
                "test_file",
                x_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            let y_vector_processor = build_vector_processer_from_json(
                "y",
                "test_table",
                "test_file",
                y_field_definition.clone(),
                RESULT_SET.clone(),
                X_FIELD_NAME.to_string(),
            );

            //4. Build our Z Vectors
            let z_vectors = vec![3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0, 30.0];

            //5. Build our mocks
            let mut mocks = MockGlyphEngineOperations::new();

            mocks
                .expect_get_upload_stream()
                .times(1)
                .returning(|_, _| unsafe {
                    let client = S3_CONNECTION_INSTANCE.as_ref().unwrap().clone();
                    Ok(UploadStream::empty(client.get_s3_manager().get_client()))
                });

            mocks
                .expect_write_to_upload_stream()
                .times(3)
                .returning(|_, _| Ok(()));

            mocks.expect_finish_upload_stream().times(1).returning(|_| {
                Err(UploadStreamFinishError::UnexpectedError(
                    GlyphxErrorData::new(
                        "An Unexpected Error Has Occurred".to_string(),
                        None,
                        None,
                    ),
                ))
            });

            let result = glyph_engine
                .calculate_statistics(&x_vector_processor, &y_vector_processor, z_vectors, &mocks)
                .await;

            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GlyphEngineProcessError::DataProcessingError(data) => {
                    assert_eq!(data.message, "An error occurred while finishing the upload stream, see the inner error for additional information ")
                }
                _ => panic!("Expected UploadError"),
            }
        }

        mod get_stats_for_axis {
            use super::*;

            #[tokio::test]
            async fn is_ok() {
                let axis_name = "x";
                let vectors = vec![1.0, 3.0, 6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 27.0];
                let glyph_engine = get_glyph_engine().await;
                let result = glyph_engine.get_stats_for_axis(axis_name, 9, vectors);
                assert_eq!(result.axis, axis_name);
                assert_ne!(result.min, f64::NAN);
                assert_ne!(result.max, f64::NAN);
                assert_ne!(result.mean, f64::NAN);
                assert_ne!(result.median, f64::NAN);
                assert_ne!(result.variance, f64::NAN);
                assert_ne!(result.standard_deviation, f64::NAN);
                assert_ne!(result.entropy, f64::NAN);
                assert_ne!(result.skewness, f64::NAN);
                assert_ne!(result.pct_0, f64::NAN);
                assert_ne!(result.pct_5, f64::NAN);
                assert_ne!(result.pct_10, f64::NAN);
                assert_ne!(result.pct_15, f64::NAN);
                assert_ne!(result.pct_20, f64::NAN);
                assert_ne!(result.pct_25, f64::NAN);
                assert_ne!(result.pct_30, f64::NAN);
                assert_ne!(result.pct_33, f64::NAN);
                assert_ne!(result.pct_35, f64::NAN);
                assert_ne!(result.pct_40, f64::NAN);
                assert_ne!(result.pct_45, f64::NAN);
                assert_ne!(result.pct_50, f64::NAN);
                assert_ne!(result.pct_55, f64::NAN);
                assert_ne!(result.pct_60, f64::NAN);
                assert_ne!(result.pct_65, f64::NAN);
                assert_ne!(result.pct_67, f64::NAN);
                assert_ne!(result.pct_70, f64::NAN);
                assert_ne!(result.pct_75, f64::NAN);
                assert_ne!(result.pct_80, f64::NAN);
                assert_ne!(result.pct_85, f64::NAN);
                assert_ne!(result.pct_90, f64::NAN);
                assert_ne!(result.pct_95, f64::NAN);
                assert_ne!(result.pct_99, f64::NAN);
                assert_eq!(result.max_rank, 9);
            }
        }
    }
}
