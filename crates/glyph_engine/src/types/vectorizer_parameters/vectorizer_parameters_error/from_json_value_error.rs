use glyphx_core::GlyphxErrorData;
use glyphx_core::GlyphxError;

use serde_json::json;

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("VectorizerParameters")]
pub enum FromJsonValueError {
    JsonValidationError(GlyphxErrorData),
}

impl FromJsonValueError {
    pub fn new(field_name: &str ) -> Self {
        let message = format!("{} is null", field_name).to_string();
        let data = json!({"fieldName" : field_name});
        let error_data = GlyphxErrorData::new(message, Some(data), None);
        Self::JsonValidationError(error_data)
    }
}
