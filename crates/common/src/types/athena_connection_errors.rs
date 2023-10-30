use glyphx_core::aws::athena_manager::ConstructorError as AthenaManagerConstructorError;
use glyphx_core::GlyphxErrorData;

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
