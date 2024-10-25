use crate::types::vectorizer_parameters::field_definition::accumulated_field_definition_errors::FromJsonError as AccumulatorFieldDefinitionFromJsonError;
use crate::types::vectorizer_parameters::field_definition::date_field_definition_errors::FromJsonError as DateFieldDefinitionFromJsonError;
use crate::types::vectorizer_parameters::field_definition::standard_field_definition_errors::FromJsonError as StandardFieldDefinitionFromJsonError;
use crate::types::vectorizer_parameters::helper_functions::JsonHasFieldError;
use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;

use serde_json::{from_str, Value};
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("FieldDefinition")]
pub enum FromJsonError {
    FieldNotDefined(GlyphxErrorData),
    InvalidFieldType(GlyphxErrorData),
    InvalidFieldDefinitionType(GlyphxErrorData),
    StandardFieldDefinitionError(GlyphxErrorData),
    DateFieldDefinitionError(GlyphxErrorData),
    AccumulatorFieldDefinitionError(GlyphxErrorData),
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
                FromJsonError::StandardFieldDefinitionError(data)
            }
        }
    }

    pub fn from_date_field_from_json_error(input: DateFieldDefinitionFromJsonError) -> Self {
        match input {
            DateFieldDefinitionFromJsonError::FieldNotDefined(data) => {
                FromJsonError::DateFieldDefinitionError(data)
            }
        }
    }

    pub fn from_accumulated_field_from_json_error(
        input: AccumulatorFieldDefinitionFromJsonError,
    ) -> Self {
        match &input {
            AccumulatorFieldDefinitionFromJsonError::FieldNotDefined(data) => {
                Self::reformat_accumlator_error(&input, data, "FieldNotDefined")
            }
            AccumulatorFieldDefinitionFromJsonError::InvalidFieldDefinitionType(data) => {
                Self::reformat_accumlator_error(&input, data, "InvalidFieldDefinitionType")
            }
            AccumulatorFieldDefinitionFromJsonError::StandardFieldDefinitionFromJsonError(data) => {
                Self::reformat_accumlator_error(
                    &input,
                    data,
                    "StandardFieldDefinitionFromJsonError",
                )
            }
            AccumulatorFieldDefinitionFromJsonError::DateFieldDefinitionFromJsonError(data) => {
                Self::reformat_accumlator_error(&input, data, "DateFieldDefinitionFromJsonError")
            }
        }
    }

    fn reformat_accumlator_error(
        input: &AccumulatorFieldDefinitionFromJsonError,
        data: &GlyphxErrorData,
        error_type: &str,
    ) -> FromJsonError {
        let j: Value = from_str(&input.to_string()).unwrap();
        let d = data.clone();
        let mut d = d.data.unwrap();
        d["errorType"] = error_type.into();
        let glyphx_error_data = GlyphxErrorData::new(data.message.clone(), Some(d), Some(j));
        FromJsonError::AccumulatorFieldDefinitionError(glyphx_error_data)
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
            _ => panic!("Expected FieldNotDefined"),
        }
    }
}

#[cfg(test)]
mod from_standard_field_from_json_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn is_ok() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = StandardFieldDefinitionFromJsonError::FieldNotDefined(data);

        let result = FromJsonError::from_standard_field_from_json_error(input);
        match result {
            FromJsonError::StandardFieldDefinitionError(error_data) => {
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
    fn is_ok() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = DateFieldDefinitionFromJsonError::FieldNotDefined(data);

        let result = FromJsonError::from_date_field_from_json_error(input);
        match result {
            FromJsonError::DateFieldDefinitionError(error_data) => {
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
mod from_accumulated_field_from_json_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn field_not_defined() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = AccumulatorFieldDefinitionFromJsonError::FieldNotDefined(data);

        let result = FromJsonError::from_accumulated_field_from_json_error(input);
        match result {
            FromJsonError::AccumulatorFieldDefinitionError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                let error_type = d["errorType"].as_str().unwrap();
                assert_eq!(error_type, "FieldNotDefined");
                assert!(error_data.inner_error.is_some());
            }
            _ => panic!("Expected FieldNotDefined"),
        }
    }

    #[test]
    fn invalid_field_definition_type() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = AccumulatorFieldDefinitionFromJsonError::InvalidFieldDefinitionType(data);

        let result = FromJsonError::from_accumulated_field_from_json_error(input);
        match result {
            FromJsonError::AccumulatorFieldDefinitionError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                let error_type = d["errorType"].as_str().unwrap();
                assert_eq!(error_type, "InvalidFieldDefinitionType");
                assert!(error_data.inner_error.is_some());
            }
            _ => panic!("Expected FieldNotDefined"),
        }
    }

    #[test]
    fn standard_field_definition_from_json_error() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input =
            AccumulatorFieldDefinitionFromJsonError::StandardFieldDefinitionFromJsonError(data);

        let result = FromJsonError::from_accumulated_field_from_json_error(input);
        match result {
            FromJsonError::AccumulatorFieldDefinitionError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                let error_type = d["errorType"].as_str().unwrap();
                assert_eq!(error_type, "StandardFieldDefinitionFromJsonError");
                assert!(error_data.inner_error.is_some());
            }
            _ => panic!("Expected FieldNotDefined"),
        }
    }

    #[test]
    fn date_field_definition_from_json_error() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = AccumulatorFieldDefinitionFromJsonError::DateFieldDefinitionFromJsonError(data);

        let result = FromJsonError::from_accumulated_field_from_json_error(input);
        match result {
            FromJsonError::AccumulatorFieldDefinitionError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                let error_type = d["errorType"].as_str().unwrap();
                assert_eq!(error_type, "DateFieldDefinitionFromJsonError");
                assert!(error_data.inner_error.is_some());
            }
            _ => panic!("Expected FieldNotDefined"),
        }
    }
}
