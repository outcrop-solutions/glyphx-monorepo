use serde::{Deserialize, Serialize};
use serde_json::{json, to_value};

use crate::types::vectorizer_parameters::GetFieldDefinitionError;
use crate::vector_processer::TaskStatus;

use glyphx_core::{
    aws::{
        athena_manager::{
            AthenaStreamIteratorError, GetQueryPagerError, GetQueryStatusError, StartQueryError,
        },
        s3_manager::{GetUploadStreamError, UploadStreamFinishError, UploadStreamWriteError},
    },
    GlyphxError, GlyphxErrorData,
};

#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("GlyphEngineProcess")]
pub enum GlyphEngineProcessError {
    ConfigurationError(GlyphxErrorData),
    VectorProcessingError(GlyphxErrorData),
    QueryProcessingError(GlyphxErrorData),
    DataProcessingError(GlyphxErrorData),
}

impl GlyphEngineProcessError {
    pub fn from_get_field_definition_error(
        error: GetFieldDefinitionError,
        axis_name: &str,
    ) -> Self {
        let error_data = json!({ axis_name: axis_name });
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
        let data = json!({ axis_name: axis_name });

        let error_data =
            GlyphxErrorData::new(message, Some(data), Some(to_value(inner_error).unwrap()));

        Self::VectorProcessingError(error_data)
    }

    pub fn from_start_query_error(error: StartQueryError, query: &str) -> Self {
        let message = "An error occurred while starting the query, see the inner error for additional information ".to_string();
        let data = json!({ query: query });
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, Some(data), Some(inner_error));
        Self::QueryProcessingError(error_data)
    }

    pub fn from_get_query_status_error(error: GetQueryStatusError, query_id: &str) -> Self {
        let message = "An error occurred while checking the query status, see the inner error for additional information ".to_string();
        let data = json!({ query_id: query_id });
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, Some(data), Some(inner_error));
        Self::QueryProcessingError(error_data)
    }
    pub fn from_get_query_pager_error(error: GetQueryPagerError, query_id: &str) -> Self {
        let message = "An error occurred while getting the query results, see the inner error for additional information ".to_string();
        let data = json!({ query_id: query_id });
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, Some(data), Some(inner_error));
        Self::QueryProcessingError(error_data)
    }

    pub fn from_athena_stream_iterator_error(error: AthenaStreamIteratorError) -> Self {
        let message = "An error occurred while iterating the query results, see the inner error for additional information ".to_string();
        let data = None;
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, data, Some(inner_error));
        Self::DataProcessingError(error_data)
    }

    pub fn from_get_upload_stream_error(error: GetUploadStreamError, file_name: &str) -> Self {
        let message = "An error occurred while getting the upload stream, see the inner error for additional information ".to_string();
        let data = Some(json!({ file_name: file_name }));
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, data, Some(inner_error));
        Self::DataProcessingError(error_data)
    }

    pub fn from_upload_stream_write_error(error: UploadStreamWriteError, file_name: &str) -> Self {
        let message = "An error occurred while writing to the upload stream, see the inner error for additional information ".to_string();
        let data = Some(json!({ file_name: file_name }));
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, data, Some(inner_error));
        Self::DataProcessingError(error_data)
    }

    pub fn from_upload_stream_finish_error(
        error: UploadStreamFinishError,
        file_name: &str,
    ) -> Self {
        let message = "An error occurred while finishing the upload stream, see the inner error for additional information ".to_string();
        let data = Some(json!({ file_name: file_name }));
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message, data, Some(inner_error));
        Self::DataProcessingError(error_data)
    }
}
