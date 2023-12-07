use glyphx_core::{GlyphxErrorData, GlyphxError};
use glyphx_common::types::athena_connection_errors::ConstructorError as AthenaConstructorError;
use glyphx_common::errors::HeartbeatError;
use glyphx_common::types::s3_connection_errors::ConstructorError as S3ConstructorError;
use glyphx_database::MongoDbConnectionConstructionError;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("GlyphEngineInit")]
pub enum GlyphEngineInitError {
   AthenaConnectionError(GlyphxErrorData),
   HeartbeatError(GlyphxErrorData),
   S3ConnectionError(GlyphxErrorData),
   MongoDbConnectionError(GlyphxErrorData),
}
impl GlyphEngineInitError {
  fn internal_from<T: ErrorTypeParser + Serialize>(error: T, error_message: &str) -> GlyphxErrorData {

      let error_data = &error.get_glyphx_error_data();
      let error_type = &error.parse_error_type();
      let inner_error = serde_json::to_value(&error).unwrap();
      let mut data = error_data.data.clone().unwrap(); 
      data["ErrorType"] = json!(error_type);
      let message = error_message.to_string();
      GlyphxErrorData::new(message, Some(data), Some(inner_error))

  }
}

impl From<AthenaConstructorError> for GlyphEngineInitError {
   fn from(error: AthenaConstructorError) -> Self {
      Self::AthenaConnectionError(Self::internal_from(error, "An error occurred while constructing the AthenaConnection.  See the inner error for additional information"))
       
   }
}

impl From<S3ConstructorError> for GlyphEngineInitError {
   fn from(error: S3ConstructorError) -> Self {
      Self::S3ConnectionError(Self::internal_from(error, "An error occurred while constructing the S3Connection.  See the inner error for additional information"))
       
   }
}

impl From<HeartbeatError> for GlyphEngineInitError {
   fn from(error: HeartbeatError) -> Self {
      Self::HeartbeatError(Self::internal_from(error, "An error occurred while saving the processtracking document.  See the inner error for additional information"))
       
   }
}

impl From<MongoDbConnectionConstructionError> for GlyphEngineInitError {
   fn from(error: MongoDbConnectionConstructionError) -> Self {
      Self::MongoDbConnectionError(Self::internal_from(error, "An error occurred while creating the mongodb connection. See the inner error for additional information"))
       
   }
}
