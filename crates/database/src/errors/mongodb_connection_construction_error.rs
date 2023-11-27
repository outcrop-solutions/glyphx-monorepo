//!MongoDb was kind enough to mark everything as non 
///exhaustive, so we cannot reallyu create any unit tests for our connection or errors (we cannot
///create our own ErrorKind variants).  The only way to test this is through the creation of
///integration tests and hitting a live mongodb intance.  This is not ideal, but it is what it is.
use glyphx_core::{GlyphxError, GlyphxErrorData};
use mongodb::error::ErrorKind;
use serde_json::json;

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("MongoDbConnection")]
pub enum MongoDbConnectionConstructionError {
    AuthenticationError(GlyphxErrorData),
    ServerSelectionError(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

impl From<&Box<ErrorKind>> for MongoDbConnectionConstructionError {
    fn from(error: &Box<ErrorKind>) -> Self {
       match error.as_ref() {
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


