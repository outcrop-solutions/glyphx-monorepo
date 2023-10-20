///!Holds our Stucts and Enums used for working with AWS Assets.

/// enums and structures for working with S3.
#[cfg(feature = "s3_manager")]
pub mod s3_manager;
/// enums and structures of rworking with our upload stream.
#[cfg(feature = "upload_stream")]
pub mod upload_stream;
/// enums and structures for working with Athena.
#[cfg(feature="athena_manager")]
pub mod athena_manager;
#[cfg(feature="secret_manager")]
pub mod secret_manager;
