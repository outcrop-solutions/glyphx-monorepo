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

#[cfg(test)]
mod constructor {
    use super::*;

    #[test]
    fn is_ok() {
        let field_name = "test";
        let result = FromJsonValueError::new(field_name);
        match result {
            FromJsonValueError::JsonValidationError(error_data) => {
                assert_eq!(error_data.message, format!("{} is null", field_name));
                let d = error_data.data.unwrap();
                let field = d["fieldName"].as_str().unwrap();
                assert_eq!(field, field_name);
                assert!(error_data.inner_error.is_none());
            }
        }
    }
}
