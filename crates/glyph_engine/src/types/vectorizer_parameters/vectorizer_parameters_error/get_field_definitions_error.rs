use glyphx_core::GlyphxErrorData;
use glyphx_core::GlyphxError;
use crate::types::vectorizer_parameters::field_definition::FromJsonError;
use super::GetFieldDefinitionError;
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("VectorizerParameters")]
pub enum GetFieldDefinitionsError {
      AxisNotDefined(GlyphxErrorData),
      SupportingFieldNotDefined(GlyphxErrorData),
      JsonParsingError(GlyphxErrorData),
      
}
impl GetFieldDefinitionsError {
    pub fn from_from_json_error(input:  FromJsonError ) -> Self {
        let data = input.get_glyphx_error_data();
        Self::JsonParsingError(data.clone())
    }
    pub fn from_get_field_definition_error( input: GetFieldDefinitionError) -> Self {
       match input {
            GetFieldDefinitionError::AxisNotDefined(data) => Self::AxisNotDefined(data.clone()),
            GetFieldDefinitionError::SupportingFieldNotDefined(data) => Self::SupportingFieldNotDefined(data.clone()),
            GetFieldDefinitionError::JsonParsingError(data) => Self::JsonParsingError(data.clone()),

       }
    }
}


