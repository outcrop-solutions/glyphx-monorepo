//! This module holds the error types that can be returned by the upload stream.
use crate::types::error::GlyphxErrorData;

/// This enum holds the possible errors that can be returned by the upload streams constructor
/// (::new) function.
#[derive(Debug)]
pub enum UploadStreamConstructorError {
    ///Indicates that an unexpected error occurred while trying to start the multipart upload
    UnexpectedError(GlyphxErrorData),
}

/// This enum holds the possible errors that can be returned by the upload streams write
/// function.
#[derive(Debug)]
pub enum UploadStreamWriteError {
    ///Indicates that an unexpected error occurred while trying to write a part of the multipart upload
    ///to AWS S3.
    UnexpectedError(GlyphxErrorData),
    ///Indicates that the upload stream has been previously aborted and cannot be written to.
    Aborted(GlyphxErrorData),
    ///Indicates that the upload stream has been previously finished and cannot be written to.
    Finished(GlyphxErrorData),
}

/// This enum holds the possible errors that can be returned by the upload streams finish
/// function.
#[derive(Debug)]
pub enum UploadStreamFinishError {
    ///Indicates that the enternal buffer was empty and no previous writes had occurred.  
    ///There is no data to write to AWS S3.
    NoDataToWrite(GlyphxErrorData),
    ///Indicates that an unexpected error occurred while trying to complete the multipart upload. 
    ///this could have occurred as an returned by flush or the complete_multipart_upload call.
    UnexpectedError(GlyphxErrorData),
    ///Indicates that the upload stream has been previously aborted and cannot be finished.
    Aborted(GlyphxErrorData),
    ///Indicates that the upload stream has been previously finished and cannot be finished again.
    Finished(GlyphxErrorData),
}
