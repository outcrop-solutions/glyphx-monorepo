use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, GlyphxCoreError)]
#[error_definition("ModelConfiguration")]
pub enum FromJsonError {
    FieldNotFound(GlyphxErrorData),
    TypeMismatch(GlyphxErrorData),
    InvalidFormat(GlyphxErrorData),
}
