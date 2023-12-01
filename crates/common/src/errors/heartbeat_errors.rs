use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;
use glyphx_database::errors::InsertDocumentError;
use serde_json::{Value, to_value };

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("Heartbeat")]
pub enum HeartbeatError {
    CreateProcessTracingError(GlyphxErrorData),
}


impl From<InsertDocumentError> for HeartbeatError {
    fn from(error: InsertDocumentError) -> Self {
        let inner_error = to_value(error).unwrap(); 
        let message = "An error occurred while creating a process tracking record.  See the inner error for additional details.";
        let glyphx_error_data = GlyphxErrorData::new(message.to_string(), None, Some(inner_error));
        HeartbeatError::CreateProcessTracingError(glyphx_error_data)
    }
}

#[cfg(test)]
mod from_insert_document_error {
    use super::*;
    use serde_json::json;
    #[test]
    fn is_ok() {
        let inner_message = "An Error Occurred";
        let inner_data = json!({"inner" : "data"}); 
        let inner_glyphx_data = GlyphxErrorData::new(inner_message.to_string(), Some(inner_data), None);
        let inner_error = InsertDocumentError::AuthenticationError(inner_glyphx_data);
        let heartbeat_error = HeartbeatError::from(inner_error);
        match heartbeat_error {
            HeartbeatError::CreateProcessTracingError(glyphx_error_data) => {
                assert_eq!(glyphx_error_data.message, "An error occurred while creating a process tracking record.  See the inner error for additional details.");
                assert_eq!(glyphx_error_data.data, None);
                let inner_error = glyphx_error_data.inner_error.unwrap();
                let inner_error = inner_error["AuthenticationError"].as_object().unwrap();
                println!("inner_error: {:?}", inner_error);
                let inner_data = &inner_error["data"];
                let inner = &inner_data["inner"].as_str().unwrap();
                assert_eq!(inner, &"data");
                let inner_msg = &inner_error["message"].as_str().unwrap();
                assert_eq!(inner_msg, inner_msg);
            },
            _ => panic!("Expected HeartbeatError::CreateProcessTracingError")
        }
    }
}
