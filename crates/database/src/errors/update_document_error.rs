use super::FindOneError;
use glyphx_core::{GlyphxError, GlyphxErrorData};
use mongodb::error::ErrorKind;
use serde_json::json;

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("MongoDbOperationError")]
pub enum UpdateDocumentError {
    AuthenticationError(GlyphxErrorData),
    InvalidQuery(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
    DocumentSerializationError(GlyphxErrorData),
    UpdateFailure(GlyphxErrorData),
    DocumentValidationFailure(GlyphxErrorData),
}

impl UpdateDocumentError {
    pub fn from_mongo_db_error(error: &ErrorKind, collection: &str, operation: &str) -> Self {
        let data = json!({"collection" : collection, "operation" : operation});
        match error {
            ErrorKind::BsonSerialization(err) => {
                let outer_message = "An error occurred while trying to serialize a document to bson.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : err.to_string()});
                UpdateDocumentError::DocumentSerializationError(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
            ErrorKind::Authentication { message, .. } => {
                let outer_message = "An error occurred while trying to authenticate to the mongodb database.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : message});
                UpdateDocumentError::AuthenticationError(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
            ErrorKind::InvalidArgument { message, .. } => {
                let outer_message = "An error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : message});
                UpdateDocumentError::InvalidQuery(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
            _ => {
                let outer_message = "An unexpected error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : error.to_string()});
                UpdateDocumentError::UnexpectedError(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
        }
    }

    pub fn from_bson_error(
        input: mongodb::bson::ser::Error,
        collection: &str,
        operation: &str,
    ) -> Self {
        let data = json!({"collection" : collection, "operation" : operation});
        let outer_message = "An error occurred while trying to serialize a document to bson.  See the inner error for additional information".to_string();
        let inner_error = json!({"message" : input.to_string()});
        Self::DocumentSerializationError(glyphx_core::GlyphxErrorData::new(
            outer_message,
            Some(data),
            Some(inner_error),
        ))
    }

    pub fn from_find_one_error(input: &FindOneError, collection: &str, operation: &str) -> Self {
        let mut error_data = input.get_glyphx_error_data().clone();
        error_data.data = Some(json!({"collection" : collection, "operation" : operation}));
        match input {
            FindOneError::AuthenticationError(_) => {
                Self::AuthenticationError(error_data)
            }
            FindOneError::InvalidQuery(_) => Self::InvalidQuery(error_data),
            FindOneError::UnexpectedError(_) => Self::UnexpectedError(error_data),
        }
    }
}
