use aws_sdk_athena::types::AthenaError;
#[derive(Debug, Clone)]
pub enum AthenaQueryStatus {
    Queued,
    Running,
    Succeeded,
    Failed(AthenaError),
    Cancelled,
    Unknown,
}
