use serde::{Deserialize, Serialize};
use serde_json::{json, to_value};

use crate::types::vectorizer_parameters::GetFieldDefinitionError;
use crate::vector_processer::TaskStatus;

use glyphx_core::{GlyphxError, GlyphxErrorData};

#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("GlyphEngineProcess")]
pub enum GlyphEngineProcessError {
   ConfigurationError(GlyphxErrorData),
   VectorProcessingError(GlyphxErrorData),
}

impl GlyphEngineProcessError {
    pub fn from_get_field_definition_error(error: GetFieldDefinitionError, axis_name: &str) -> Self {
       let error_data = json!({axis_name: axis_name});
       let message = format!("Error getting field definition for axis {}", axis_name);
       let inner_error = to_value(error).unwrap();

       let error_data = GlyphxErrorData::new(message, Some(error_data), Some(inner_error));
       Self::ConfigurationError(error_data)
    }

    pub fn from_task_status_error(task_status: TaskStatus, axis_name: &str) -> Self {
        let inner_error = match task_status {
            TaskStatus::Errored(error) => error, 
            _ => panic!("TaskStatus is not an error"),
        };

        let message = format!("An Error occurred while processing the vectors for axis :  {}.  See the inner error for additional information", axis_name);
        let data = json!({axis_name: axis_name});

        let error_data = GlyphxErrorData::new(message, Some(data), Some(to_value(inner_error).unwrap()));

        Self::VectorProcessingError(error_data)
    }

}


