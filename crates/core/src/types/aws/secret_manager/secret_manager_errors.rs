use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;
use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("SecretManager")]
pub enum GetSecretsValueError {
    SecretNotDefined(GlyphxErrorData),
    InvalidJson(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),

}

