use glyphx_core::{
    aws::{
        athena_manager::RunQueryError,
        s3_manager::{GetUploadStreamError, UploadStreamFinishError, UploadStreamWriteError},
    },
    GlyphxError, GlyphxErrorData,
};
use serde::{Deserialize, Serialize};

use serde_json::to_value;

#[derive(Debug, Clone, GlyphxError, PartialEq, Serialize, Deserialize)]
#[error_definition("vector_processer")]
pub enum VectorCalculationError {
    IntializationError(GlyphxErrorData),
    ThreadDisconnected(GlyphxErrorData),
    AthenaQueryError(GlyphxErrorData),
    GetS3UploadStreamError(GlyphxErrorData),
    WriteUploadError(GlyphxErrorData),
}
unsafe impl Sync for VectorCalculationError {}
impl From<RunQueryError> for VectorCalculationError {
    fn from(error: RunQueryError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCalculationError::AthenaQueryError(error_data)
    }
}

impl From<GetUploadStreamError> for VectorCalculationError {
    fn from(error: GetUploadStreamError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while getting the S3 upload stream.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCalculationError::GetS3UploadStreamError(error_data)
    }
}
impl From<UploadStreamWriteError> for VectorCalculationError {
    fn from(error: UploadStreamWriteError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while writing to the S3 upload stream.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCalculationError::WriteUploadError(error_data)
    }
}

impl From<UploadStreamFinishError> for VectorCalculationError {
    fn from(error: UploadStreamFinishError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while writing to the S3 upload stream.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCalculationError::WriteUploadError(error_data)
    }
}
