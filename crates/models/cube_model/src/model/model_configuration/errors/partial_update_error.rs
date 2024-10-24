use super::FromJsonError;

use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, GlyphxCoreError)]
#[error_definition("ModelConfiguration")]
pub enum PartialUpdateError {
    FieldNotFound(GlyphxErrorData),
    TypeMismatch(GlyphxErrorData),
    InvalidFormat(GlyphxErrorData),
    InvalidJson(GlyphxErrorData),
    NullValue(GlyphxErrorData),
}

impl From<FromJsonError> for PartialUpdateError {
    fn from(error: FromJsonError) -> Self {
        match error {
            FromJsonError::FieldNotFound(data) => PartialUpdateError::FieldNotFound(data),
            FromJsonError::TypeMismatch(data) => PartialUpdateError::TypeMismatch(data),
            FromJsonError::InvalidFormat(data) => PartialUpdateError::InvalidFormat(data),
        }
    }
}
