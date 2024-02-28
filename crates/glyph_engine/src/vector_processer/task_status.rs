use super::VectorCalculationError;

#[derive(Debug, Clone, PartialEq)]
pub enum TaskStatus {
    Pending,
    Processing,
    Complete,
    Errored(VectorCalculationError),
}
