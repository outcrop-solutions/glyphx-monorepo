use serde::{Deserialize, Serialize};
use glyphx_core::aws::secret_manager::GetSecretsValueError;
use glyphx_core::{GlyphxErrorData, GlyphxError};
use glyphx_core::aws::s3_manager::ConstructorError as S3ManagerConstructorError;
use serde_json::json;
use glyphx_core::SecretBoundError;
//TODO: create a macro that will derive a glyphx_error that will create a json string implimenting
//std::fmt::Display
#[derive(Debug, Clone, GlyphxError, Serialize, Deserialize)]
#[error_definition("S3Connection")]
pub enum ConstructorError {
   SecretBoundError(GlyphxErrorData),
   BucketDoesNotExist(GlyphxErrorData), 
   UnexpectedError(GlyphxErrorData),
}

impl ConstructorError {
    pub fn from_s3_manager_constructor_error(err: S3ManagerConstructorError) -> Self {
        match err {
            S3ManagerConstructorError::BucketDoesNotExist(err) => Self::BucketDoesNotExist(err),
            S3ManagerConstructorError::UnexpectedError(err) => Self::UnexpectedError(err),
            S3ManagerConstructorError::SecretBoundError(err) => Self::SecretBoundError(err),
        }
    } 
}

impl From<GetSecretsValueError> for ConstructorError {
    fn from(error: GetSecretsValueError) -> Self {

      let error_data = &error.get_glyphx_error_data();
      let error_type = &error.parse_error_type();
      let inner_error = serde_json::to_value(&error).unwrap();
      let mut data = error_data.data.clone().unwrap(); 
      data["ErrorType"] = json!(error_type);
      let message = "An error occurred while getting the secret value.  See the inner exception for additional information".to_string();
      Self::SecretBoundError(GlyphxErrorData::new(message, Some(data), Some(inner_error)))
    }
}

impl SecretBoundError for ConstructorError { }
