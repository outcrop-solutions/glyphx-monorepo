//!MongoDb was kind enough to mark everything as non 
///exhaustive, so we cannot reallyu create any unit tests for our connection or errors (we cannot
///create our own ErrorKind variants).  The only way to test this is through the creation of
///integration tests and hitting a live mongodb intance.  This is not ideal, but it is what it is.
use glyphx_core::{GlyphxError, GlyphxErrorData};
use mongodb::error::ErrorKind;
use serde::{Deserialize, Serialize};
use serde_json::json;
use glyphx_core::aws::secret_manager::GetSecretsValueError;
use glyphx_core::SecretBoundError;
#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("MongoDbConnection")]
pub enum MongoDbConnectionConstructionError {
    AuthenticationError(GlyphxErrorData),
    ServerSelectionError(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
    SecretBoundError(GlyphxErrorData),
}

impl From<ErrorKind> for MongoDbConnectionConstructionError {
    fn from(error: ErrorKind) -> Self {
       match &error {
           ErrorKind::Authentication { message, .. } => {
               let outer_message = "An error occurred while trying to authenticate to the mongodb database.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : message});
               MongoDbConnectionConstructionError::AuthenticationError(GlyphxErrorData::new(
                   outer_message,
                   None,
                    Some(inner_error),
                ))
           }
           ErrorKind::ServerSelection { message, .. } => {
               let outer_message = "An error occurred while trying select the server.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : message});
               MongoDbConnectionConstructionError::ServerSelectionError(GlyphxErrorData::new(
                   outer_message,
                   None,
                    Some(inner_error),
                ))
           },
           ErrorKind::IncompatibleServer { message, .. } => {
               let outer_message = "An error occurred while trying select the server.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : message});
               MongoDbConnectionConstructionError::ServerSelectionError(GlyphxErrorData::new(
                   outer_message,
                   None,
                    Some(inner_error),
                ))
           }
           ErrorKind::DnsResolve { message, .. } => {
               let outer_message = "An error occurred while trying select the server.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : message});
               MongoDbConnectionConstructionError::ServerSelectionError(GlyphxErrorData::new(
                   outer_message,
                   None,
                    Some(inner_error),
                ))
           },
           _ => {
               let outer_message = "An unexpected error occurred while trying to connect to a mongodb database.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : error.to_string()});
               MongoDbConnectionConstructionError::UnexpectedError(GlyphxErrorData::new(
                   outer_message,
                   None,
                    Some(inner_error),
                ))
            }
        }
    }
}


impl From<GetSecretsValueError> for MongoDbConnectionConstructionError {
    fn from(error: GetSecretsValueError) -> Self {

      let error_data = &error.get_glyphx_error_data();
      let error_type = &error.parse_error_type();
      let inner_error = serde_json::to_value(&error).unwrap();
      let mut data = error_data.data.clone().unwrap(); 
      data["ErrorType"] = json!(error_type);
      let message = "An error occurred while getting the secret value.  See the inner exception for additional information".to_string();
      Self::SecretBoundError(GlyphxErrorData::new(message, Some(data), Some(inner_error)))
    }
}

impl SecretBoundError for MongoDbConnectionConstructionError { }
