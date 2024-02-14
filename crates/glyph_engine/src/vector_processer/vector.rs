use super::VectorOrigionalValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Vector {
    pub orig_value: VectorOrigionalValue,
    pub vector: f64,
    pub rank: u64,
    #[serde(skip, default="Option::default")]
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
     pub fn get_binary_size(&self) -> usize {
         28 + match &self.orig_value {                    // 4 bytes for the enum variant.
            VectorOrigionalValue::String(s) => s.len(),  // 8 bytes for the vector f64 
             _ => 0,                                     // 8 bytes for the rank u64 
                                                         // 8 bytes for the orig value if it is a number or the length of the
          }                                              //   string if it is a string.
        
     }
}

