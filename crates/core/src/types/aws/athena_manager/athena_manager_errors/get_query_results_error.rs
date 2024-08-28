use aws_sdk_athena::operation::get_query_results::GetQueryResultsError as AwsGetQueryResultsError;
use aws_sdk_s3::error::ProvideErrorMetadata;
use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;
use serde_json::json;
use serde::{Deserialize, Serialize};
///Errors that are returned from our get_query_results method.
#[derive(Debug, Clone, GlyphxError, Deserialize, Serialize)]
#[error_definition("AthenaManager")]
pub enum GetQueryResultsError {
    ///If the query_id does not point to a valid query this is returned.
    QueryDoesNotExist(GlyphxErrorData),
    ///If AWS throttled our query do to execution limits, this error will be returned.
    RequestWasThrottled(GlyphxErrorData),
    ///If any other error occurs while trying to get the query results, this error will be returned.
    UnexpectedError(GlyphxErrorData),
}

impl GetQueryResultsError {
    pub fn from_aws_get_query_result_error(error: AwsGetQueryResultsError, catalog: &str, database: &str, query_id: &str ) -> Self {
            let message = error.message().unwrap().to_string();
            let data  = json!({"catalog": catalog, "database": database, "query_id": query_id    });
            let error_data = GlyphxErrorData::new(message, Some(data), None);
            match error {
                AwsGetQueryResultsError::InvalidRequestException(_) => {
                        Self::QueryDoesNotExist(error_data)
                        
                },
                AwsGetQueryResultsError::TooManyRequestsException(_) => {
                        Self::RequestWasThrottled(error_data )


                },
                AwsGetQueryResultsError::InternalServerException(_) => {
                        Self::UnexpectedError(error_data)

                },
                _ => {
                        Self::UnexpectedError(error_data )
                }
            }
    }
}
