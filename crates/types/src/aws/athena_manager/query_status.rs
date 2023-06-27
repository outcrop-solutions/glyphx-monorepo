#[derive(Debug, Clone)]
pub enum AthenaQueryStatus {
    Queued,
    Running,
    Succeeded,
    Failed,
    Cancelled,
    Unknown,
}
