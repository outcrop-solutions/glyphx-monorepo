use glyphx_core::{GlyphxError, GlyphxErrorData};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, GlyphxError)]
#[error_definition("MongoDbConnection")]
pub enum MongoDbInitializationError {
    ClientNotInitialized(GlyphxErrorData),
    DatabaseNotInitialized(GlyphxErrorData),
}
