//! Contains our structures for working with file information.
use aws_sdk_s3::primitives::DateTime;
/// This structure holds information about a file in 
/// S3.
#[derive(Debug)]
pub struct S3FileInfo {
    pub file_name: String,
    pub file_size: i64,
    pub last_modified: DateTime,
}
