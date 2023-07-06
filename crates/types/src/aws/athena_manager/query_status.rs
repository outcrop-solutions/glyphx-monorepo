use aws_sdk_athena::types::AthenaError;
///This enum represents the available states of an Athena Query.

#[derive(Debug, Clone)]
pub enum AthenaQueryStatus {
    ///The query has been submitted to Athena, but has not yet started.
    Queued,
    ///The query is currently executing.
    Running,
    ///The query has completed successfully.
    Succeeded,
    ///The query has failed. Additional information is included
    Failed(AthenaError),
    ///The query was cancelled.
    Cancelled,
    ///The query status is unknown.
    Unknown,
}
