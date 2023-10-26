use crate::aws::athena_manager::athena_manager_errors::ConstructorError as AthenaManagerConstructorError;
use crate::error::GlyphxErrorData;

#[derive(Debug, Clone)]
pub enum ConstructorError {
    DatabaseDoesNotExist(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

impl ConstructorError {
    pub fn from_athena_manager_constructor_error(err: AthenaManagerConstructorError) -> Self {
        match err {
            AthenaManagerConstructorError::DatabaseDoesNotExist(err) => Self::DatabaseDoesNotExist(err),
            AthenaManagerConstructorError::UnexpectedError(err) => Self::UnexpectedError(err),
        }
    } 
}
