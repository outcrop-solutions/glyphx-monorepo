///! Holds all of our error types for AthenaManager operations.
use crate::error::GlyphxErrorData;

/// Errors that are returend from our AthenaManager::new method.
#[derive(Debug, Clone)]
pub enum ConstructorError {
    ///as part of the construction process, the new method will check to see if the database exists
    ///in the supplied catalog. If it does not, this error will be returned.
    DatabaseDoesNotExist(GlyphxErrorData),
    ///any other errors that occur while trying to contruct an AthenaManager will return
    ///UnexpectedError.
    UnexpectedError(GlyphxErrorData),
}

///Errors that are returned from our start_query method.
#[derive(Debug, Clone)]
pub enum StartQueryError {
    ///If the databse does not exist or the query is malformed, this error will be returned.
    DatabaseDoesNotExist(GlyphxErrorData),
    ///If AWS throttled our query do to execution limits, this error will be returned.
    RequestWasThrottled(GlyphxErrorData),
    ///If any other error occurs while trying to start a query, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}

///Errors that are returned from our get_query_status method.
#[derive(Debug, Clone)]
pub enum GetQueryStatusError {
    ///If the query_id does not point to a valid query this is returned.
    QueryDoesNotExist(GlyphxErrorData),
    ///If any other error occurs while trying to get the query status, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}

///Errors that are returned from our get_query_results method.
#[derive(Debug, Clone)]
pub enum GetQueryResultsError {
    ///If the query_id does not point to a valid query this is returned.
    QueryDoesNotExist(GlyphxErrorData),
    ///If AWS throttled our query do to execution limits, this error will be returned.
    RequestWasThrottled(GlyphxErrorData),
    ///If any other error occurs while trying to get the query results, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}

///Error that are returned from calls to run_query or related methods.  In most cases this just
///aggregate errors from start_query, get_query_status and get_query_results.
#[derive(Debug, Clone)]
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

///Errors that are returned from our get_query_pager method.
#[derive(Debug, Clone)]
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

///Errors that are returned from our get_table_description method.
#[derive(Debug, Clone)]
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
