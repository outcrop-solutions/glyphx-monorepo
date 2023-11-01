use glyphx_core::GlyphxErrorData;
use glyphx_core::GlyphxError;
use crate::types::vectorizer_parameters::helper_functions::JsonHasFieldError;
use crate::types::vectorizer_parameters::field_definition::{StandardFieldDefinitionFromJsonError, DateFieldDefinitionFromJsonError};
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("AccumualtedFieldDefinition")]
pub enum FromJsonError {
    FieldNotDefined(GlyphxErrorData),    
    InvalidFieldDefinitionType(GlyphxErrorData),
    StandardFieldDefinitionFromJsonError(GlyphxErrorData),
    DateFieldDefinitionFromJsonError(GlyphxErrorData),
}

impl FromJsonError {
   pub fn from_json_has_field_error( input: JsonHasFieldError) -> Self {
    match input {
        JsonHasFieldError::JsonValidationError(data) => Self::FieldNotDefined(data),
    }
   }

   pub fn from_standard_field_from_json_error( input: StandardFieldDefinitionFromJsonError) -> Self {
    match input {
        StandardFieldDefinitionFromJsonError::FieldNotDefined(data) => Self::StandardFieldDefinitionFromJsonError(data),
    }
   }

   pub fn from_date_field_from_json_error( input: DateFieldDefinitionFromJsonError) -> Self {
    match input {
        DateFieldDefinitionFromJsonError::FieldNotDefined(data) => Self::DateFieldDefinitionFromJsonError(data),
    }
   }
}


