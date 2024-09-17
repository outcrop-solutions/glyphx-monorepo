use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AddStatisticData {
     AddStatistic(Vec<u8>),
}
