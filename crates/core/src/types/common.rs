#[cfg( feature="s3_connection" )]
pub mod s3_connection_errors;
#[cfg( feature="athena_connection" )]
pub mod athena_connection_errors;
use crate::aws::secret_manager::GetSecretsValueError;
use crate::ErrorTypeParser;
pub  trait SecretBoundError : From<GetSecretsValueError> + ErrorTypeParser + Sized + std::fmt::Debug{} 
