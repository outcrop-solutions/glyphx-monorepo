use serde::{Deserialize, Serialize};
use serde_json::{json, to_value};

use crate::types::vectorizer_parameters::GetFieldDefinitionError;
use glyphx_core::{GlyphxError, GlyphxErrorData};

#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("GlyphEngineProcess")]
pub enum GlyphEngineProcessError {
   ConfigurationError(GlyphxErrorData),
}

impl GlyphEngineProcessError {
    pub fn from_get_field_definition_error(error: GetFieldDefinitionError, axis_name: &str) -> Self {
       let error_data = json!({axis_name: axis_name});
       let message = format!("Error getting field definition for axis {}", axis_name);
       let inner_error = to_value(error).unwrap();

       let error_data = GlyphxErrorData::new(message, Some(error_data), Some(inner_error));
       Self::ConfigurationError(error_data)
    }
}


