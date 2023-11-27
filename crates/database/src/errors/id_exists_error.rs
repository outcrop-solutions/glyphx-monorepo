use glyphx_core::{GlyphxError, GlyphxErrorData};
use mongodb::error::ErrorKind;
use serde_json::json;
use super::FindOneError;
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("MongoDbOperationError")]
pub enum IdExistsError {
    AuthenticationError(GlyphxErrorData),
    InvalidQuery(GlyphxErrorData),
    InvalidId(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}


impl IdExistsError {
    pub fn from_find_one_error(error: FindOneError, collection: &str, operation: &str) -> Self {
        let error_data = error.get_glyphx_error_data();
        let msg = error_data.message.clone();
       let mut data = None;
       if error_data.data.is_some() {
           let mut d = error_data.data.clone().unwrap();
           d["collection"] = json!(collection);
           d["operation"] = json!(operation);
           data = Some(d);
       }
       let inner_error = error_data.inner_error.clone();
        let glyphx_error_data = GlyphxErrorData::new(msg, data, inner_error);
        match error {
            FindOneError::AuthenticationError(_) => IdExistsError::AuthenticationError(glyphx_error_data),
            FindOneError::InvalidQuery(_) => IdExistsError::InvalidQuery(glyphx_error_data),
            FindOneError::UnexpectedError(_) => IdExistsError::UnexpectedError(glyphx_error_data),
            FindOneError::InvalidId(_) => IdExistsError::InvalidId(glyphx_error_data),
       }
   }
   pub fn from_mongo_db_error(error: &ErrorKind, collection: &str, operation: &str) -> Self {
       let data = json!({"collection" : collection, "operation" : operation});
       match error {
           ErrorKind::Authentication { message, .. } => {
               let outer_message = "An error occurred while trying to authenticate to the mongodb database.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : message});
               IdExistsError::AuthenticationError(GlyphxErrorData::new(
                   outer_message,
                   Some(data),
                    Some(inner_error),
                ))
           }
           ErrorKind::InvalidArgument { message, .. } => {
               let outer_message = "An error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : message});
               IdExistsError::InvalidQuery(GlyphxErrorData::new(
                   outer_message,
                   Some(data),
                    Some(inner_error),
                ))
           }
           _ => {
               let outer_message = "An unexpected error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : error.to_string()});
               IdExistsError::UnexpectedError(GlyphxErrorData::new(
                   outer_message,
                   Some(data),
                    Some(inner_error),
                ))
            }
        }
    }
}
