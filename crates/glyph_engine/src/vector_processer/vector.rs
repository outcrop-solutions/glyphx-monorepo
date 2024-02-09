use super::VectorOrigionalValue;

#[derive(Debug, Clone)]
pub struct Vector {
    pub orig_value: VectorOrigionalValue,
    pub vector: f64,
    pub rank: u64,
    pub is_empty: Option<()>,
}

impl Vector {
    pub fn new(orig_value: VectorOrigionalValue, vector: f64, rank: u64) -> Self {
        Self {
            orig_value,
            vector,
            rank,
            is_empty: None,
        }
    }

    pub fn empty() -> Self {
        Self {
            orig_value: VectorOrigionalValue::Empty,
            vector: 0.0,
            rank: 0,
            is_empty: Some(()),
        }
    }
}
