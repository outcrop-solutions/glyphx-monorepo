use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

/// This enum holds the possible errors that can be returned by the upload streams finish
/// function.
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("UploadStream")]
pub enum UploadStreamFinishError {
    ///Indicates that the enternal buffer was empty and no previous writes had occurred.  
    ///There is no data to write to AWS S3.
    NoDataToWrite(GlyphxErrorData),
    ///Indicates that an unexpected error occurred while trying to complete the multipart upload.
    ///this could have occurred as an returned by flush or the complete_multipart_upload call.
    UnexpectedError(GlyphxErrorData),
    ///Indicates that the upload stream has been previously aborted and cannot be finished.
    Aborted(GlyphxErrorData),
    ///Indicates that the upload stream has been previously finished and cannot be finished again.
    Finished(GlyphxErrorData),
}
