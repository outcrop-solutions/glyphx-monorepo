use glyphx_core::aws::athena_manager::ConstructorError as AthenaManagerConstructorError;
use glyphx_core::{GlyphxErrorData, GlyphxError};
use glyphx_core::aws::secret_manager::GetSecretsValueError;
use serde::{Deserialize, Serialize};
use glyphx_core::SecretBoundError;
use serde_json::json;

#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("AthenaConnection")]
pub enum ConstructorError {
    SecretBoundError(GlyphxErrorData),
    DatabaseDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

impl ConstructorError {
    pub fn from_athena_manager_constructor_error(err: AthenaManagerConstructorError) -> Self {
        match err {
            AthenaManagerConstructorError::DatabaseDoesNotExist(err) => Self::DatabaseDoesNotExist(err),
            AthenaManagerConstructorError::UnexpectedError(err) => Self::UnexpectedError(err),
            AthenaManagerConstructorError::SecretBoundError(err) => Self::SecretBoundError(err),
        }
    } 
}

impl From<GetSecretsValueError> for ConstructorError {
    fn from(err: GetSecretsValueError) -> Self {

      let error_data = &err.get_glyphx_error_data();
      let error_type = &err.parse_error_type();
      let inner_error = serde_json::to_value(&err).unwrap();
      let mut data = error_data.data.clone().unwrap(); 
      data["ErrorType"] = json!(error_type);
      let message = "An error occurred while getting the secret value.  See the inner exception for additional information".to_string();
      Self::SecretBoundError(GlyphxErrorData::new(message, Some(data), Some(inner_error)))
    }
}

impl SecretBoundError for ConstructorError { }
