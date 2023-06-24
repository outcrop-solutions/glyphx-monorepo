//! This module holds the error types that are returned by the S3Manager
//! functions.  All of the errors hold a GlyphxErrorData object.
use crate::error::GlyphxErrorData;

/// This error is returned  by the new function.
#[derive(Debug)]
pub enum ConstructorError {
    /// As part of the construction process, the S3Manager will check to see if 
    /// the bucket exists.  If it does not, a BucketDoesNotExist error is
    /// returned.
    BucketDoesNotExist(GlyphxErrorData),
    ///Is returned for all other error conditions.
    UnexpectedError(GlyphxErrorData),
}

/// The bucket_exists method returns Ok(()) if the bucket exists.  
/// If it does not exist or an error occurres, then this error is returned.
#[derive(Debug)]
pub enum BucketExistsError {
    /// is retruned if the bucket does not exist.
    BucketDoesNotExist(GlyphxErrorData),
    /// is returned for all other error conditions.
    UnexpectedError(GlyphxErrorData),
}

/// The file_exists method returns Ok(()) if the file exists.  
/// If it does not exist or an error occurres, then this error is returned.
#[derive(Debug)]
pub enum FileExistsError {
    /// is retruned if the file does not exist.
    FileDoesNotExist(GlyphxErrorData),
    /// is returned for all other error conditions.
    UnexpectedError(GlyphxErrorData),
}
///This list_objects method returns the list of objects and this error should an error condition
///arise.
#[derive(Debug)]
pub enum ListObjectsError {
    ///If AWS reports that the bucket is no longer available, this error is returned.
    BucketDoesNotExist(GlyphxErrorData),
    ///Handles all other error conditions.
    UnexpectedError(GlyphxErrorData),
}

/// This error is returned by the get_file_information function when the S3Manager is unable to find the information for the 
/// requested file.
#[derive(Debug)]
pub enum GetFileInformationError {
    ///Is returned when the file or bucket cannot be found.  This error does not 
    ///differentiate between the two conditions.
    KeyDoesNotExist(GlyphxErrorData),
    ///Is returned for all other error conditions.
    UnexpectedError(GlyphxErrorData),
}

/// This error is returned by the get_signed_upload_url function.
#[derive(Debug)]
pub enum GetSignedUploadUrlError {
    /// Any error condition that is reported by AWS is wrapped by this error.
    UnexpectedError(GlyphxErrorData),
}


/// This error is returned by the get_object_stream function.
#[derive(Debug)]
pub enum GetObjectStreamError {
    /// Is returned when the object exists but is not currently available.
    ObjectUnavailable(GlyphxErrorData),
    /// Is returned when the object does not exist.
    KeyDoesNotExist(GlyphxErrorData),
    /// Is returned for all other error conditions.
    UnexpectedError(GlyphxErrorData),
}

/// This error is returned by the get_upload_stream function.
#[derive(Debug)]
pub enum GetUploadStreamError {
    /// Any error condition that is reported by AWS is wrapped by this error.
    UnexpectedError(GlyphxErrorData),
}

/// This error is returned by our delete_object function.
#[derive(Debug)]
pub enum RemoveObjectError {
    /// Is returned for all error conditions.
    UnexpectedError(GlyphxErrorData),
}
