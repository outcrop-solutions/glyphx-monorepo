use crate::types::vectorizer_parameters::helper_functions::JsonHasFieldError;
use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("StandardFieldDefinition")]
pub enum FromJsonError {
    FieldNotDefined(GlyphxErrorData),
}

impl FromJsonError {
    pub fn from_json_has_field_error(input: JsonHasFieldError) -> Self {
        match input {
            JsonHasFieldError::JsonValidationError(data) => Self::FieldNotDefined(data),
        }
    }
}

#[cfg(test)]
mod from_json_has_field_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn is_ok() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = JsonHasFieldError::JsonValidationError(data);

        let result = FromJsonError::from_json_has_field_error(input);
        match result {
            FromJsonError::FieldNotDefined(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            }
            #[allow(unreachable_patterns)]
            _ => panic!("Expected FieldNotDefined"),
        }
    }
}
