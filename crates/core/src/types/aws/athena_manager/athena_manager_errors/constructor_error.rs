use crate::aws::secret_manager::GetSecretsValueError;
use crate::types::error::GlyphxErrorData;
use crate::GlyphxError;
use serde_json::json;
use crate::SecretBoundError;
//This is a bit hackey, but I built our GlyphxError macro to import any types that it needs are
//part of derived code, fully pathed to glyphx_core.  This allows errors defined in external
//crates, i.e. common, to not have to worry about bringing structs and traits into scope.  This
//however, breaks errors defined in the core crate.  To get past this, I am aliasing crate to
//glyphx_core.
use crate as glyphx_core;

/// Errors that are returend from our AthenaManager::new method.
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("AthenaManager")]
pub enum ConstructorError {
    SecretBoundError(GlyphxErrorData),
    ///as part of the construction process, the new method will check to see if the database exists
    ///in the supplied catalog. If it does not, this error will be returned.
    DatabaseDoesNotExist(GlyphxErrorData),
    ///any other errors that occur while trying to contruct an AthenaManager will return
    ///UnexpectedError.
    UnexpectedError(GlyphxErrorData),
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
