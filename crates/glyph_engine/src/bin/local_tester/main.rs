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

#[main]
async fn main() {
    println!("Hello, world!");
}
