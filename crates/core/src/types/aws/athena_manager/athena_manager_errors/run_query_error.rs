use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
use serde::{Serialize, Deserialize};
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

///Error that are returned from calls to run_query or related methods.  In most cases this just
///aggregate errors from start_query, get_query_status and get_query_results.
#[derive(Debug, Clone, Serialize, Deserialize, GlyphxError)]
#[error_definition("AthenaManager")]
pub enum RunQueryError {
    ///If the query_id does not point to a valid query this is returned.
    QueryDoesNotExist(GlyphxErrorData),
    ///The database does not exist or the query was maformed.
    DatabaseDoesNotExist(GlyphxErrorData),
    ///If AWS throttled our query do to execution limits, this error will be returned.
    RequestWasThrottled(GlyphxErrorData),
    ///If a query does not complete during the time_out interval, than this error will be returned.
    QueryTimedOut(GlyphxErrorData),
    ///If a query fails, this error will be returned.
    QueryFailed(GlyphxErrorData),
    ///If a query is cancelled, this error will be returned.
    QueryCancelled(GlyphxErrorData),
    ///If any other error occurs while trying to run a query, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}
