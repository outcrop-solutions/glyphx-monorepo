use crate::error::GlyphxErrorData;

#[derive(Debug, Clone)]
pub enum ConstructorError {
    DatabaseDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug, Clone)]
pub enum StartQueryError {
    DatabaseDoesNotExist(GlyphxErrorData),
    RequestWasThrottled(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug, Clone)]
pub enum GetQueryStatusError {
    QueryDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug, Clone)]
pub enum GetQueryResultsError {
    QueryDoesNotExist(GlyphxErrorData),
    RequestWasThrottled(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

#[derive(Debug, Clone)]
pub enum RunQueryError {
    QueryDoesNotExist(GlyphxErrorData),
    DatabaseDoesNotExist(GlyphxErrorData),
    RequestWasThrottled(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
    QueryTimedOut(GlyphxErrorData),
    QueryFailed(GlyphxErrorData),
    QueryCancelled(GlyphxErrorData),
}
