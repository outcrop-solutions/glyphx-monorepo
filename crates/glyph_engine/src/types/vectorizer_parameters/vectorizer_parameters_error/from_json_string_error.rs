use super::FromJsonValueError;
use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("VectorizerParameters")]
pub enum FromJsonStringError {
    JsonParseError(GlyphxErrorData),
    JsonValidationError(GlyphxErrorData),
}

impl FromJsonStringError {
    pub fn from_json_value_error(input: FromJsonValueError) -> Self {
        match input {
            FromJsonValueError::JsonValidationError(data) => Self::JsonValidationError(data),
        }
    }
}
