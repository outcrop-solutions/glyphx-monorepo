use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AddVectorData {
     XAxis(Vec<u8>),
     YAxis(Vec<u8>),
}
