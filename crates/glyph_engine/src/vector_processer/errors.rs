use glyphx_core::{aws::athena_manager::RunQueryError, GlyphxError, GlyphxErrorData};

use serde_json::to_value;

#[derive(Debug, Clone, GlyphxError, PartialEq)]
#[error_definition("vector_processer")]
pub enum VectorCaclulationError {
    IntializationError(GlyphxErrorData),
    ThreadDisconnected(GlyphxErrorData),
    AthenaQueryError(GlyphxErrorData),
}

impl From<RunQueryError> for VectorCaclulationError {
    fn from(error: RunQueryError) -> Self {
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new("An unexpected error occurred while running the vector query.  See the inner error for additional information".to_string(),None, Some(inner_error));
        VectorCaclulationError::AthenaQueryError(error_data)
    }
}

