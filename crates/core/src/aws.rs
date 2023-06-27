//! Holds our Stucts and Traits used for working with AWS Assets.
/// traits and structures for working with S3.
#[cfg(feature = "s3_manager")]
pub mod s3_manager;
/// Our poor mans stream for uploading files to S3.
#[cfg(feature = "s3_manager")]
pub mod upload_stream;
/// Our S3Manager Struct which is the primary interface for working with S3.
#[cfg(feature = "s3_manager")]
pub use s3_manager::S3Manager;
#[cfg(feature = "athena_manager")] 
pub mod athena_manager;
#[cfg(feature = "athena_manager")] 
pub mod result_set_converter;

