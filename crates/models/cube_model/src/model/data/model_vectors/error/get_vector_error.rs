use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, GlyphxCoreError)]
#[error_definition("ModelVectors")]
pub enum GetVectorError {
    VectorDoesNotExists(GlyphxErrorData)
}
