use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

///Errors that are returned from our get_table_description method.
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("AthenaManager")]
pub enum GetTableDescriptionError {
    ///If the query does not exist when internally checking the status of the query, this error is
    ///returned.
    QueryDoesNotExist(GlyphxErrorData),
    ///If the database does not exist or the query was malformed, this error is returned.
    DatabaseDoesNotExist(GlyphxErrorData),
    ///If AWS throttled our query do to execution limits, this error will be returned.
    RequestWasThrottled(GlyphxErrorData),
    ///If a query does not complete during the time_out interval, than this error will be returned.
    QueryTimedOut(GlyphxErrorData),
    ///If a query fails, this error will be returned.
    QueryFailed(GlyphxErrorData),
    ///If a query is cancelled, this error will be returned.
    QueryCancelled(GlyphxErrorData),
    ///If the table does not exist, this error will be returned.
    TableDoesNotExist(GlyphxErrorData),
    ///If any other error occurs while trying to get the table description, this error will be
    UnexpectedError(GlyphxErrorData),
}
