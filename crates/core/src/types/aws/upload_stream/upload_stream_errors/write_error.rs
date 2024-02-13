use serde::{Deserialize, Serialize};
use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;
///
/// This enum holds the possible errors that can be returned by the upload streams write
/// function.
#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("UploadStream")]
pub enum UploadStreamWriteError {
    ///Indicates that an unexpected error occurred while trying to write a part of the multipart upload
    ///to AWS S3.
    UnexpectedError(GlyphxErrorData),
    ///Indicates that the upload stream has been previously aborted and cannot be written to.
    Aborted(GlyphxErrorData),
    ///Indicates that the upload stream has been previously finished and cannot be written to.
    Finished(GlyphxErrorData),
}
