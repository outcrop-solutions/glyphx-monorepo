//! Holds our Stucts and Traits used for working with AWS Assets.
/// traits and structures for working with S3.
pub mod s3_manager;
/// Our poor mans stream for uploading files to S3.
pub mod upload_stream;
/// Our types for working with S3.
pub mod types;
/// Our S3Manager Struct which is the primary interface for working with S3.
pub use s3_manager::S3Manager;
