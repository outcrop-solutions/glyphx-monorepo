use serde::{Deserialize, Serialize};
use crate::traits::EnumDataModelField;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ProcessStatus {
    Running,
    Completed,
    Failed,
    Cancelled,
}

impl EnumDataModelField for ProcessStatus {
    fn get_validation_variants() -> Vec<String> {
        vec![
            "Running".to_string(),
            "Completed".to_string(),
            "Failed".to_string(),
            "Cancelled".to_string(),
        ]
    }

    fn from_str(value: &str) -> Self {
        match value {
            "Running" => ProcessStatus::Running,
            "Completed" => ProcessStatus::Completed,
            "Failed" => ProcessStatus::Failed,
            "Cancelled" => ProcessStatus::Cancelled,
            _ => ProcessStatus::Running,
        }
    }
}
