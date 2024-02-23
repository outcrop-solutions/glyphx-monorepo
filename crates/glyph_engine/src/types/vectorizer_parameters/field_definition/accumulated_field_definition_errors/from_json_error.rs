use crate::types::vectorizer_parameters::field_definition::{
    DateFieldDefinitionFromJsonError, StandardFieldDefinitionFromJsonError,
};
use crate::types::vectorizer_parameters::helper_functions::JsonHasFieldError;
use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("AccumualtedFieldDefinition")]

pub enum FromJsonError {
    FieldNotDefined(GlyphxErrorData),
    InvalidFieldDefinitionType(GlyphxErrorData),
    StandardFieldDefinitionFromJsonError(GlyphxErrorData),
    DateFieldDefinitionFromJsonError(GlyphxErrorData),
}

impl FromJsonError {
    pub fn from_json_has_field_error(input: JsonHasFieldError) -> Self {
        match input {
            JsonHasFieldError::JsonValidationError(data) => Self::FieldNotDefined(data),
        }
    }

    pub fn from_standard_field_from_json_error(
        input: StandardFieldDefinitionFromJsonError,
    ) -> Self {
        match input {
            StandardFieldDefinitionFromJsonError::FieldNotDefined(data) => {
                Self::StandardFieldDefinitionFromJsonError(data)
            }
        }
    }

    pub fn from_date_field_from_json_error(input: DateFieldDefinitionFromJsonError) -> Self {
        match input {
            DateFieldDefinitionFromJsonError::FieldNotDefined(data) => {
                Self::DateFieldDefinitionFromJsonError(data)
            }
        }
    }
}

#[cfg(test)]
mod from_json_has_field_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn from_json_validation_error() {
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
            _ => panic!("Expected FieldNotDefined"),
        }
    }
}

#[cfg(test)]
mod from_standard_field_from_json_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn from_json_validation_error() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = StandardFieldDefinitionFromJsonError::FieldNotDefined(data);

        let result = FromJsonError::from_standard_field_from_json_error(input);
        match result {
            FromJsonError::StandardFieldDefinitionFromJsonError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            }
            _ => panic!("Expected FieldNotDefined"),
        }
    }
}

#[cfg(test)]
mod from_date_field_from_json_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn from_json_validation_error() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = DateFieldDefinitionFromJsonError::FieldNotDefined(data);

        let result = FromJsonError::from_date_field_from_json_error(input);
        match result {
            FromJsonError::DateFieldDefinitionFromJsonError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            }
            _ => panic!("Expected FieldNotDefined"),
        }
    }
}
