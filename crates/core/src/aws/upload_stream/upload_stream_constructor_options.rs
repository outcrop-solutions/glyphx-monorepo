use super::{UploadStreamOps, UploadStreamOpsImpl};
use aws_sdk_s3::Client;
use derive_builder::Builder;
#[derive(Builder)]
#[builder(pattern = "owned")]
pub struct UploadStreamConstructorOptions {
    #[builder(setter(into))]
    pub bucket_name: String,
    #[builder(setter(into))]
    pub file_name: String,
    pub client: Client,
    #[builder(default = "Box::new(UploadStreamOpsImpl)")]
    pub dependencies: Box<dyn UploadStreamOps>,
}
