use super::GetFieldDefinitionError;
use crate::types::vectorizer_parameters::field_definition::FromJsonError;
use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("VectorizerParameters")]
pub enum GetFieldDefinitionsError {
    AxisNotDefined(GlyphxErrorData),
    SupportingFieldNotDefined(GlyphxErrorData),
    JsonParsingError(GlyphxErrorData),
}
impl GetFieldDefinitionsError {
    pub fn from_from_json_error(input: FromJsonError) -> Self {
        let data = input.get_glyphx_error_data();
        Self::JsonParsingError(data.clone())
    }
    pub fn from_get_field_definition_error(input: GetFieldDefinitionError) -> Self {
        match input {
            GetFieldDefinitionError::AxisNotDefined(data) => Self::AxisNotDefined(data.clone()),
            GetFieldDefinitionError::SupportingFieldNotDefined(data) => {
                Self::SupportingFieldNotDefined(data.clone())
            }
            GetFieldDefinitionError::JsonParsingError(data) => Self::JsonParsingError(data.clone()),
        }
    }
}

#[cfg(test)]
mod from_from_json_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn is_ok() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = FromJsonError::FieldNotDefined(data);

        let result = GetFieldDefinitionsError::from_from_json_error(input);
        match result {
            GetFieldDefinitionsError::JsonParsingError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            }
            _ => panic!("Expected JsonParsingError"),
        }
    }
}

#[cfg(test)]
mod from_get_field_definition_error {
    use super::*;
    use serde_json::json;

    #[test]
    fn axis_not_defined() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = GetFieldDefinitionError::AxisNotDefined(data);

        let result = GetFieldDefinitionsError::from_get_field_definition_error(input);
        match result {
            GetFieldDefinitionsError::AxisNotDefined(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            }
            _ => panic!("Expected AxisNotDefined"),
        }
    }

    #[test]
    fn supporting_field_not_defined() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = GetFieldDefinitionError::SupportingFieldNotDefined(data);

        let result = GetFieldDefinitionsError::from_get_field_definition_error(input);
        match result {
            GetFieldDefinitionsError::SupportingFieldNotDefined(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            }
            _ => panic!("Expected SupportingFieldNotDefined"),
        }
    }

    #[test]
    fn json_parsing_error() {
        let message = "testMessage";
        let data = json!({"field": "test"});
        let inner_error = None;

        let data = GlyphxErrorData::new(message.to_string(), Some(data), inner_error);

        let input = GetFieldDefinitionError::JsonParsingError(data);

        let result = GetFieldDefinitionsError::from_get_field_definition_error(input);
        match result {
            GetFieldDefinitionsError::JsonParsingError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            }
            _ => panic!("Expected JsonParsingError"),
        }
    }
}
