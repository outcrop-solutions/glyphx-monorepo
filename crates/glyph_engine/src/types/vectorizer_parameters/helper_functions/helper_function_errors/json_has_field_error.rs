use glyphx_core::GlyphxErrorData;
use glyphx_core::GlyphxError;

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("VectorizerParameters")]
pub enum JsonHasFieldError {
    JsonValidationError(GlyphxErrorData),
}
