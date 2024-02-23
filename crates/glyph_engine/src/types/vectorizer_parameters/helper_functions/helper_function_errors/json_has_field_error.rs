use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("VectorizerParameters")]
pub enum JsonHasFieldError {
    JsonValidationError(GlyphxErrorData),
}
