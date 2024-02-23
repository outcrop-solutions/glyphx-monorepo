use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VectorOrigionalValue {
    String(String),
    F64(f64),
    U64(u64),
    Empty,
}

impl PartialEq for VectorOrigionalValue {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (VectorOrigionalValue::String(a), VectorOrigionalValue::String(b)) => a == b,
            (VectorOrigionalValue::F64(a), VectorOrigionalValue::F64(b)) => a == b,
            (VectorOrigionalValue::U64(a), VectorOrigionalValue::U64(b)) => a == b,
            (VectorOrigionalValue::Empty, VectorOrigionalValue::Empty) => true,
            _ => false,
        }
    }
}

impl Eq for VectorOrigionalValue {}

impl PartialOrd for VectorOrigionalValue {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match (self, other) {
            (VectorOrigionalValue::String(a), VectorOrigionalValue::String(b)) => a.partial_cmp(b),
            (VectorOrigionalValue::F64(a), VectorOrigionalValue::F64(b)) => a.partial_cmp(b),
            (VectorOrigionalValue::U64(a), VectorOrigionalValue::U64(b)) => a.partial_cmp(b),
            (VectorOrigionalValue::Empty, VectorOrigionalValue::Empty) => {
                Some(std::cmp::Ordering::Equal)
            }
            _ => None,
        }
    }
}

impl Ord for VectorOrigionalValue {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        match (self, other) {
            (VectorOrigionalValue::String(a), VectorOrigionalValue::String(b)) => a.cmp(b),
            (VectorOrigionalValue::F64(a), VectorOrigionalValue::F64(b)) => {
                a.partial_cmp(b).unwrap()
            }
            (VectorOrigionalValue::U64(a), VectorOrigionalValue::U64(b)) => a.cmp(b),
            (VectorOrigionalValue::Empty, VectorOrigionalValue::Empty) => std::cmp::Ordering::Equal,
            _ => std::cmp::Ordering::Less,
        }
    }
}
