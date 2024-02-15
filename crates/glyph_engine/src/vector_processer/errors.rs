use serde::{Deserialize, Serialize};
use glyphx_core::{aws::{s3_manager::{GetUploadStreamError, UploadStreamWriteError, UploadStreamFinishError},  athena_manager::RunQueryError}, GlyphxError, GlyphxErrorData};

use serde_json::to_value;

#[derive(Debug, Clone, GlyphxError, PartialEq, Serialize, Deserialize)]
#[error_definition("vector_processer")]
pub enum VectorCaclulationError {
    IntializationError(GlyphxErrorData),
    ThreadDisconnected(GlyphxErrorData),
    AthenaQueryError(GlyphxErrorData),
    GetS3UploadStreamError(GlyphxErrorData),
    WriteUploadError(GlyphxErrorData),
}

impl From<RunQueryError> for VectorCaclulationError {
    fn from(error: RunQueryError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCaclulationError::AthenaQueryError(error_data)
    }
}

impl From<GetUploadStreamError> for VectorCaclulationError {
    fn from(error: GetUploadStreamError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while getting the S3 upload stream.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCaclulationError::GetS3UploadStreamError(error_data)
    }
}
impl From<UploadStreamWriteError> for VectorCaclulationError {
    fn from(error: UploadStreamWriteError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while writing to the S3 upload stream.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCaclulationError::WriteUploadError(error_data)
    }
}

impl From<UploadStreamFinishError> for VectorCaclulationError {
    fn from(error: UploadStreamFinishError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while writing to the S3 upload stream.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCaclulationError::WriteUploadError(error_data)
    }
}
