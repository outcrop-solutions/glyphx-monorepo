use super::{AthenaManagerOps, AthenaManagerOpsImpl};
use derive_builder::Builder;
#[derive(Builder)]
#[builder(pattern = "owned")]
pub struct AthenaManagerConstructorOptions {
    #[builder(setter(into))]
    pub catalog: String,
    #[builder(setter(into))]
    pub database: String,
    #[builder(default = "Box::new(AthenaManagerOpsImpl)")]
    pub operations: Box<dyn AthenaManagerOps>,
}
