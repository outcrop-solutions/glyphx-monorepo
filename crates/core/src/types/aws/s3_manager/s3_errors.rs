//! This module holds the error types that are returned by the S3Manager
//! functions.  All of the errors hold a GlyphxErrorData object.
mod bucket_exists_error;
mod constructor_error;
mod file_exists_error;
mod get_file_information_error;
mod get_object_stream_error;
mod get_signed_upload_url_error;
mod get_upload_stream_error;
mod list_objects_error;
mod remove_object_error;
mod upload_object_error;

pub use bucket_exists_error::BucketExistsError;
pub use constructor_error::ConstructorError;
pub use file_exists_error::FileExistsError;
pub use get_file_information_error::GetFileInformationError;
pub use get_object_stream_error::GetObjectStreamError;
pub use get_signed_upload_url_error::GetSignedUploadUrlError;
pub use get_upload_stream_error::GetUploadStreamError;
pub use list_objects_error::ListObjectsError;
pub use remove_object_error::RemoveObjectError;
pub use upload_object_error::UploadObjectError;
