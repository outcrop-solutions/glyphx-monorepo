use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

/// Errors that are returend from our AthenaManager::new method.
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("AthenaManager")]
pub enum ConstructorError {
    ///as part of the construction process, the new method will check to see if the database exists
    ///in the supplied catalog. If it does not, this error will be returned.
    DatabaseDoesNotExist(GlyphxErrorData),
    ///any other errors that occur while trying to contruct an AthenaManager will return
    ///UnexpectedError.
    UnexpectedError(GlyphxErrorData),
}
