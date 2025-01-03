use super::FindOneError;
use glyphx_core::{GlyphxError, GlyphxErrorData};
use mongodb::error::ErrorKind;
use serde_json::json;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("MongoDbOperationError")]
pub enum InsertDocumentError {
    AuthenticationError(GlyphxErrorData),
    InvalidQuery(GlyphxErrorData),
    InvalidId(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
    DocumentSerializationError(GlyphxErrorData),
    CreateFailure(GlyphxErrorData),
}

impl InsertDocumentError {
   pub fn from_mongo_db_error(error: &ErrorKind, collection: &str, operation: &str) -> Self {
       let data = json!({"collection" : collection, "operation" : operation});
       match error {
           ErrorKind::BsonSerialization(err) => {
               let outer_message = "An error occurred while trying to serialize a document to bson.  See the inner error for additional information".to_string();
               let inner_error = json!({"message" : err.to_string()});
               InsertDocumentError::DocumentSerializationError(GlyphxErrorData::new(
                   outer_message,
                   Some(data),
                    Some(inner_error),
                ))
            }
            ErrorKind::Authentication { message, .. } => {
                let outer_message = "An error occurred while trying to authenticate to the mongodb database.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : message});
                InsertDocumentError::AuthenticationError(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
            ErrorKind::InvalidArgument { message, .. } => {
                let outer_message = "An error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : message});
                InsertDocumentError::InvalidQuery(GlyphxErrorData::new(
                    outer_message,
                    Some(data),
                    Some(inner_error),
                ))
            }
            _ => {
                let outer_message = "An unexpected error occurred while trying to execute a mongodb query.  See the inner error for additional information".to_string();
                let inner_error = json!({"message" : error.to_string()});
                InsertDocumentError::UnexpectedError(GlyphxErrorData::new(
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
        let error_data = input.get_glyphx_error_data();
        let msg = error_data.message.clone();
        let mut data = None;
        if error_data.data.is_some() {
            let mut d = error_data.data.clone().unwrap();
            d["collection"] = json!(collection);
            d["operation"] = json!(operation);
            data = Some(d);
        }
        let inner_error = error_data.inner_error.clone();
        let error_data = GlyphxErrorData::new(msg, data, inner_error);
        match input {
            FindOneError::AuthenticationError(_) => {
                Self::AuthenticationError(error_data)
            }
            FindOneError::InvalidQuery(_) => Self::InvalidQuery(error_data),
            FindOneError::UnexpectedError(_) => Self::UnexpectedError(error_data),
            FindOneError::InvalidId(_) => Self::InvalidId(error_data),
        }
    }
}
