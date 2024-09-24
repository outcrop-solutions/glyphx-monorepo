use derive_builder::Builder;
use super::{S3ManagerOpsImpl, S3ManagerOps};

#[derive(Builder)]
#[builder(pattern = "owned")]
pub struct S3ManagerContructorOptions {
    #[builder(setter(into))]
    pub bucket: String,
    #[builder(default = "Box::new(S3ManagerOpsImpl)")]
    pub dependencies: Box<dyn S3ManagerOps>,
}
