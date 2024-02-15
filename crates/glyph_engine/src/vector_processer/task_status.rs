use super::VectorCaclulationError;

#[derive(Debug, Clone, PartialEq)]
pub enum TaskStatus {
    Pending,
    Processing,
    Complete,
    Errored(VectorCaclulationError),
}
