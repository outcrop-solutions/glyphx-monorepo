
use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;

use serde::{Deserialize, Serialize};
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

///Errors that are returned from our get_query_pager method.
#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("AthenaManager")]
pub enum GetQueryPagerError {
    ///If the query_id does not point to a valid query this is returned.
    QueryDoesNotExist(GlyphxErrorData),
    ///If a query fails this error is returned.
    QueryFailed(GlyphxErrorData),
    ///If a query is cancelled this error is returned.
    QueryCancelled(GlyphxErrorData),
    ///If you are attempting to get a pager on a query which is still running this error is returned.
    QueryNotFinished(GlyphxErrorData),
    ///If any other error occurs while trying to get a query pager, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}
