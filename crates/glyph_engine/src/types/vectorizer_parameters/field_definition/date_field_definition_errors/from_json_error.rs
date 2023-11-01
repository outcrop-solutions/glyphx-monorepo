use glyphx_core::GlyphxErrorData;
use glyphx_core::GlyphxError;
use crate::types::vectorizer_parameters::helper_functions::JsonHasFieldError;
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("DateFieldDefinition")]
pub enum FromJsonError {
    FieldNotDefined(GlyphxErrorData),    
}

impl FromJsonError {
   pub fn from_json_has_field_error( input: JsonHasFieldError) -> Self {
    match input {
        JsonHasFieldError::JsonValidationError(data) => Self::FieldNotDefined(data),
    }
   }
}


