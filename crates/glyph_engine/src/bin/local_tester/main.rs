mod s3_manager;
mod s3_connection;
use glyph_engine::{
    errors::*,
    types::vectorizer_parameters::{FieldDefinition, VectorizerParameters},
    vector_processer::{TaskStatus, VectorProcesser, VectorValueProcesser},
    GlyphEngine, GlyphEngineOperations, GlyphEngineOperationsImpl,
};

use glyphx_common::{
    AthenaConnection, Heartbeat, IHeartbeat, S3Connection, 
    S3ConnectionConstructorOptionsBuilder, S3ConnectionOps,
};

use glyphx_common::types::s3_connection_errors::ConstructorError;
use model_common::{Glyph, Stats};

use s3_manager::TestingS3Manager;


use async_trait::async_trait;
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
use serde_json::Value;
use tokio::main;

pub struct GlyphEngineOperationsStruct;

static mut S3_CONNECTION: Option<S3Connection> = None;
#[async_trait]
impl GlyphEngineOperations for GlyphEngineOperationsStruct {
    async fn build_s3_connection(&self) -> Result<&'static S3Connection, GlyphEngineInitError> {
        let s3_connection_options = S3ConnectionConstructorOptionsBuilder::default()
            .bucket_name("test_bucket".to_string())
            .build()
            .unwrap();
        let connection = S3Connection::new::<ConstructorError>(s3_connection_options).await?;
        unsafe {
            S3_CONNECTION = Some(connection);
            Ok(S3_CONNECTION.as_ref().unwrap())
        }
    }
    async fn build_athena_connection(
        &self,
    ) -> Result<&'static AthenaConnection, GlyphEngineInitError> {
        GlyphEngineOperationsImpl.build_athena_connection().await
    }
    async fn build_mongo_connection(
        &self,
    ) -> Result<&'static MongoDbConnection, GlyphEngineInitError> {
        GlyphEngineOperationsImpl.build_mongo_connection().await
    }
    async fn build_heartbeat(&self) -> Result<Box<dyn IHeartbeat>, GlyphEngineInitError> {
        GlyphEngineOperationsImpl.build_heartbeat().await
    }
    fn stop_heartbeat(&self, heartbeat: &mut Box<dyn IHeartbeat>) -> () {
        GlyphEngineOperationsImpl.stop_heartbeat(heartbeat)
    }
    fn get_vector_processer(
        &self,
        axis: &str,
        data_table_name: &str,
        field_definition: &FieldDefinition,
        output_file_name: &str,
    ) -> Box<dyn VectorValueProcesser> {
        GlyphEngineOperationsImpl.get_vector_processer(
            axis,
            data_table_name,
            field_definition,
            output_file_name,
        )
    }
    async fn start_athena_query(
        &self,
        athena_connection: &AthenaConnection,
        query: &str,
    ) -> Result<String, GlyphEngineProcessError> {
        GlyphEngineOperationsImpl
            .start_athena_query(athena_connection, query)
            .await
    }

    async fn check_query_status(
        &self,
        athena_connection: &AthenaConnection,
        query_id: &str,
    ) -> Result<AthenaQueryStatus, GlyphEngineProcessError> {
        GlyphEngineOperationsImpl
            .check_query_status(athena_connection, query_id)
            .await
    }

    async fn get_query_results(
        &self,
        query_id: &str,
        athena_connection: &AthenaConnection,
    ) -> Result<AthenaStreamIterator, GlyphEngineProcessError> {
        GlyphEngineOperationsImpl
            .get_query_results(query_id, athena_connection)
            .await
    }

    async fn get_upload_stream(
        &self,
        file_name: &str,
        s3_connection: &S3Connection,
    ) -> Result<UploadStream, GetUploadStreamError> {
        GlyphEngineOperationsImpl
            .get_upload_stream(file_name, s3_connection)
            .await
    }

    async fn write_to_upload_stream(
        &self,
        upload_stream: &mut UploadStream,
        bytes: Option<Vec<u8>>,
    ) -> Result<(), UploadStreamWriteError> {
        GlyphEngineOperationsImpl
            .write_to_upload_stream(upload_stream, bytes)
            .await
    }

    async fn finish_upload_stream(
        &self,
        upload_stream: &mut UploadStream,
    ) -> Result<(), UploadStreamFinishError> {
        GlyphEngineOperationsImpl
            .finish_upload_stream(upload_stream)
            .await
    }

    async fn add_process_tracking_error(
        &self,
        process_id: &str,
        error: &GlyphEngineProcessError,
    ) -> Result<(), UpdateDocumentError> {
        GlyphEngineOperationsImpl
            .add_process_tracking_error(process_id, error)
            .await
    }

    async fn complete_process_tracking(
        &self,
        process_id: &str,
        process_result: ProcessStatus,
        process_value: Option<Value>,
    ) -> Result<(), UpdateDocumentError> {
        GlyphEngineOperationsImpl
            .complete_process_tracking(process_id, process_result, process_value)
            .await
    }
}

#[main]
async fn main() {
    println!("Hello, world!");
}
