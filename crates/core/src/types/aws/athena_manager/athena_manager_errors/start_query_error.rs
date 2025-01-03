use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
use serde::{Deserialize, Serialize};
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

///Errors that are returned from our start_query method.
#[derive(Debug, Clone, Serialize, Deserialize, GlyphxError)]
#[error_definition("AthenaManager")]
pub enum StartQueryError {
    ///If the databse does not exist or the query is malformed, this error will be returned.
    DatabaseDoesNotExist(GlyphxErrorData),
    ///If AWS throttled our query do to execution limits, this error will be returned.
    RequestWasThrottled(GlyphxErrorData),
    ///If any other error occurs while trying to start a query, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}

