use serde::{Deserialize, Serialize};
use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};

#[derive(Debug, Clone, Serialize, Deserialize, GlyphxCoreError)]
#[error_definition("ModelConfiguration")]
pub enum FromJsonError {
    FieldNotFound(GlyphxErrorData),
    TypeMismatch(GlyphxErrorData),
    InvalidFormat(GlyphxErrorData),
}
