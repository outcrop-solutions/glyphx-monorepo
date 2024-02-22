use serde::{Deserialize, Serialize};
use crate::{GlyphxError, GlyphxErrorData, aws::athena_manager::GlyphxGetQueryResultsError};
use serde_json::{json, to_value};
use crate as glyphx_core;

#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("AthenaStreamIterator")]
pub enum AthenaStreamIteratorError {
    GetQueryResultsError(GlyphxErrorData),
}

impl From<GlyphxGetQueryResultsError> for AthenaStreamIteratorError {
    fn from(error: GlyphxGetQueryResultsError) -> Self {
        let message = "An error occurred while getting the query results, see the inner error for additional information ".to_string();
        let data = json!({});
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, Some(data), Some(inner_error));
        Self::GetQueryResultsError(error_data)
    }
}
