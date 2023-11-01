use glyphx_core::GlyphxErrorData;
use glyphx_core::GlyphxError;
use crate::types::vectorizer_parameters::field_definition::FromJsonError;

#[derive(Debug, Clone, GlyphxError)]
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


