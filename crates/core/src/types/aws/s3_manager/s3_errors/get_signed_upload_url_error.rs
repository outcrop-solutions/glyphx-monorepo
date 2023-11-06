use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

/// This error is returned by the get_signed_upload_url function.
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("S3Manager")]
pub enum GetSignedUploadUrlError {
    /// Any error condition that is reported by AWS is wrapped by this error.
    UnexpectedError(GlyphxErrorData),
}
