use crate::error::GlyphxErrorData;
use crate::aws::s3_manager::ConstructorError as S3ManagerConstructorError;
//TODO: create a macro that will derive a glyphx_error that will create a json string implimenting
//std::fmt::Display
#[derive(Debug)]
pub enum ConstructorError {
   BucketDoesNotExistsError(GlyphxErrorData), 
   UnexpectedError(GlyphxErrorData),
}

impl ConstructorError {
    pub fn from_s3_manager_constructor_error(err: S3ManagerConstructorError) -> Self {
        match err {
            S3ManagerConstructorError::BucketDoesNotExist(err) => Self::BucketDoesNotExistsError(err),
            S3ManagerConstructorError::UnexpectedError(err) => Self::UnexpectedError(err),
        }
    } 
}
