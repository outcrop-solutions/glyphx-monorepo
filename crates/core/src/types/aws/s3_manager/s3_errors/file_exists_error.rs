use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

/// The file_exists method returns Ok(()) if the file exists.  
/// If it does not exist or an error occurres, then this error is returned.
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("S3Manager")]
pub enum FileExistsError {
    /// is retruned if the file does not exist.
    FileDoesNotExist(GlyphxErrorData),
    /// is returned for all other error conditions.
    UnexpectedError(GlyphxErrorData),
}
