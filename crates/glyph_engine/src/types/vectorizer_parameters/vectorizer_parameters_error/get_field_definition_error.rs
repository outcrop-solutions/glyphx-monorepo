use serde::{Deserialize, Serialize};

use glyphx_core::GlyphxErrorData;
use glyphx_core::GlyphxError;
use crate::types::vectorizer_parameters::field_definition::FromJsonError;

#[derive(Debug, Clone, GlyphxError, Deserialize, Serialize)]
#[error_definition("VectorizerParameters")]
pub enum GetFieldDefinitionError {
      AxisNotDefined(GlyphxErrorData),
      SupportingFieldNotDefined(GlyphxErrorData),
      JsonParsingError(GlyphxErrorData),
      
}
impl GetFieldDefinitionError {
    pub fn from_from_json_error(input:  FromJsonError ) -> Self {
        let data = input.get_glyphx_error_data();
        Self::JsonParsingError(data.clone())
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

        let result = GetFieldDefinitionError::from_from_json_error(input);
        match result {
            GetFieldDefinitionError::JsonParsingError(error_data) => {
                assert_eq!(error_data.message, message);
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "test");
                assert!(error_data.inner_error.is_none());
            },
            _ => panic!("Expected JsonParsingError"),
        }
    }
}
