use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

///Errors that are returned from our get_query_results method.
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("AthenaManager")]
pub enum GetQueryResultsError {
    ///If the query_id does not point to a valid query this is returned.
    QueryDoesNotExist(GlyphxErrorData),
    ///If AWS throttled our query do to execution limits, this error will be returned.
    RequestWasThrottled(GlyphxErrorData),
    ///If any other error occurs while trying to get the query results, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}
