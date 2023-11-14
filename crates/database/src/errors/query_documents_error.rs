use glyphx_core::{GlyphxError, GlyphxErrorData};
use mongodb::error::ErrorKind;
use serde_json::json;

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("MongoDbOperationError")]
pub enum QueryDocumentsError {
    AuthenticationError(GlyphxErrorData),
    InvalidQuery(GlyphxErrorData),
    InvalidPageNumber(GlyphxErrorData),
    InvalidPageSize(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

impl QueryDocumentsError {
    pub fn from_mongo_db_error(error: &ErrorKind, collection: &str, operation: &str) -> Self {
        let data = json!({"collection" : collection, "operation" : operation});
        match error {
            ErrorKind::Authentication { message, .. } => {
                let outer_message = "An error occurred while trying to authenticate to the mongodb database.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : message});
                Self::AuthenticationError(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
            ErrorKind::InvalidArgument { message, .. } => {
                let outer_message = "An error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : message});
                Self::InvalidQuery(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
            _ => {
                let outer_message = "An unexpected error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : error.to_string()});
                Self::UnexpectedError(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
        }
    }
}
