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

#[cfg(test)]
mod tests {
 use super::*;

 mod serialization {
     use super::*;
     use bincode::{serialize, deserialize};

     #[test]
     fn serialize_vector() {
         let vector = Vector::new(VectorOrigionalValue::String("test me I am longer".to_string()), 63.0, 99);
         let vector2 = Vector::new(VectorOrigionalValue::F64(6363.063), 63.0, 99);
         let  result = serialize(&vector).unwrap();
         let len = result.len();
         let result2 = serialize(&vector2).unwrap();
         let len2 = result2.len();
         let new_vec = deserialize::<Vector>(&result).unwrap();
         eprintln!("{:?}", result);
         assert!(true);
     }

     #[test]
     fn deserialize_vector() {
     }
 }
}
