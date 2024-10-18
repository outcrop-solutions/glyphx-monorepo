mod error;

pub use error::*;

use glyphx_core_error::GlyphxErrorData;
use model_common::{vectors::Vector, VectorOrigionalValue};

use bincode::deserialize;
use std::collections::BTreeMap;
use ordered_float::OrderedFloat;
use serde_json::json;

///This is similar to the vector objects creted in the glyph_engine crate except, this struct
///provides a reverse lookup converting the vector to an origional value.
#[derive(Debug, Clone)]
pub struct ModelVectors {
    vectors: BTreeMap<OrderedFloat<f64>, Vector>,
}

impl ModelVectors {
    pub fn new() -> Self {
        ModelVectors {
            vectors: BTreeMap::new(),
        }
    }

    ///Expects data to be all of the bytes representing a vector.
    pub fn deserialize(&mut self, data: Vec<u8>) -> Result<(), DeserializeVectorError> {
        let vector = deserialize::<Vector>(&data);
        if vector.is_err() {
            let error = vector.err().unwrap();
            return Err(DeserializeVectorError::from(error));
        }

        let vector = vector.unwrap();
        let insert_result = self.insert_vector(vector);
        if insert_result.is_err() {
            let error = insert_result.err().unwrap();
            return Err(DeserializeVectorError::from(error));
        }
        Ok(())
    }
    pub fn insert_vector(&mut self, vector: Vector) -> Result<(), InsertVectorError> {
        let ordered_vector = OrderedFloat(vector.vector);
        let v = self.vectors.get(&ordered_vector);
        //we do not want duplicate vectors
        if v.is_some() {
            let data = json!({"vector": vector.vector});
            let error = GlyphxErrorData::new("Vector already exists".to_string(), Some(data), None);
            return Err(InsertVectorError::VectorAlreadyExists(error));
        }
        self.vectors.insert(ordered_vector, vector);
        Ok(())
    }

    pub fn get_value(&self, vector: f64) -> Result<Vector, GetVectorError> {
        let ordered_vector = OrderedFloat(vector);
        let v = self.vectors.get(&ordered_vector);
        if v.is_none() {
            let data = json!({ "vector": vector });
            let error =
                GlyphxErrorData::new("Vector does not exists".to_string(), Some(data), None);
            return Err(GetVectorError::VectorDoesNotExists(error));
        }
        let v = v.unwrap();
        Ok(v.clone())
    }

    pub fn get_vector( &self, vector_origional_value: VectorOrigionalValue ) -> Option<f64> {
        let found = self.vectors.iter().find(|(_k, v)| {
            
            if vector_origional_value.is_string() {
                if !v.orig_value.is_string() {
                    return false;
                }
                let comp_value = vector_origional_value.get_string().unwrap();
                let orig_value = v.orig_value.get_string().unwrap();
                comp_value == orig_value
            } else if vector_origional_value.is_f64() {
                if !v.orig_value.is_f64() {
                    return false;
                }
                let comp_value = vector_origional_value.get_f64().unwrap();
                let orig_value = v.orig_value.get_f64().unwrap();
                comp_value == orig_value
            } else if vector_origional_value.is_u64() {
                if !v.orig_value.is_u64() {
                    return false;
                }
                let comp_value = vector_origional_value.get_u64().unwrap();
                let orig_value = v.orig_value.get_u64().unwrap();
                comp_value == orig_value
            } else {
                false
            }
        });

        if found.is_none() {
             None   
        } else {
            let v = *found.unwrap().0.as_ref();
            Some(v)
        }

    }
    pub fn len(&self) -> usize {
        self.vectors.len()
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;
    use model_common::vectors::VectorOrigionalValue;
    mod insert_vector {
        use super::*;

        #[test]
        fn is_ok() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);
            let result = model_vectors.insert_vector(vector);
            assert!(result.is_ok());
            let result2 = model_vectors.insert_vector(vector2);
            assert!(result2.is_ok());
            assert_eq!(model_vectors.vectors.len(), 2);
        }

        #[test]
        fn duplicate_vectors() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 1.0, 1);
            let result = model_vectors.insert_vector(vector);
            assert!(result.is_ok());
            let result2 = model_vectors.insert_vector(vector2);
            assert!(result2.is_err());
            let error = result2.err().unwrap();
            match error {
                InsertVectorError::VectorAlreadyExists(_) => (),
                _ => panic!("Expected VectorAlreadyExists error"),
            }
            assert_eq!(model_vectors.vectors.len(), 1);
        }
    }

    mod get_value {
        use super::*;

        #[test]
        fn is_ok() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_value(1.0);
            assert!(result.is_ok());
            let v = result.unwrap();
            assert_eq!(v.vector, 1.0);
            assert_eq!(v.rank, 0);
            match v.orig_value {
                VectorOrigionalValue::F64(value) => assert_eq!(value, 1.0),
                _ => panic!("Expected F64"),
            };

            let result = model_vectors.get_value(2.0);
            assert!(result.is_ok());
            let v = result.unwrap();
            assert_eq!(v.vector, 2.0);
            assert_eq!(v.rank, 1);
            match v.orig_value {
                VectorOrigionalValue::F64(value) => assert_eq!(value, 2.0),
                _ => panic!("Expected F64"),
            }
        }

        #[test]
        fn vector_does_not_exist() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_value(3.0);
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                GetVectorError::VectorDoesNotExists(_) => (),
                _ => panic!("Expected VectorDoesNotExists error"),
            }
        }
    }

    mod get_vector {
        use super::*;

        #[test]
        fn f64_is_ok() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::F64(1.0));
            assert!(result.is_some());
            let v = result.unwrap();
            assert_eq!(v, 1.0);

            let result = model_vectors.get_vector(VectorOrigionalValue::F64(2.0));
            assert!(result.is_some());
            let v = result.unwrap();
            assert_eq!(v, 2.0);
        }

        #[test]
        fn f64_vector_does_not_exist() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::F64(3.0));
            assert!(result.is_none());
        }

        #[test]
        fn f64_vector_does_not_exist_on_u64() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::U64(1), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::U64(2), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::F64(1.0));
            assert!(result.is_none());
        }

        #[test]
        fn u64_is_ok() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::U64(1), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::U64(2), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::U64(1));
            assert!(result.is_some());
            let v = result.unwrap();
            assert_eq!(v, 1.0);

            let result = model_vectors.get_vector(VectorOrigionalValue::U64(2));
            assert!(result.is_some());
            let v = result.unwrap();
            assert_eq!(v, 2.0);
        }

        #[test]
        fn u64_vector_does_not_exist() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::U64(1), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::U64(2), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::U64(3));
            assert!(result.is_none());
        }
        #[test]
        fn u64_vector_does_not_exist_on_f64() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::U64(1));
            assert!(result.is_none());
        }

        #[test]
        fn string_is_ok() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::String("String 1".to_string()), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::String("String 2".to_string()), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::String("String 1".to_string()));
            assert!(result.is_some());
            let v = result.unwrap();
            assert_eq!(v, 1.0);

            let result = model_vectors.get_vector(VectorOrigionalValue::String("String 2".to_string()));
            assert!(result.is_some());
            let v = result.unwrap();
            assert_eq!(v, 2.0);
        }

        #[test]
        fn string_vector_does_not_exist() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::String("String 1".to_string()), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::String("String 2".to_string()), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::String("String 3".to_string()));
            assert!(result.is_none());
        }
        #[test]
        fn string_vector_does_not_exist_on_f64() {
            let mut model_vectors = ModelVectors::new();
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);
            model_vectors.insert_vector(vector).unwrap();
            model_vectors.insert_vector(vector2).unwrap();
            let result = model_vectors.get_vector(VectorOrigionalValue::String("String 1".to_string()));
            assert!(result.is_none());
        }
    }
    mod deserialize_vector {
        use super::*;
        use bincode::serialize;

        #[test]
        fn is_ok() {
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);

            let ser_vector = serialize(&vector).unwrap();
            let ser_vector2 = serialize(&vector2).unwrap();

            let mut model_vectors = ModelVectors::new();
            let result = model_vectors.deserialize(ser_vector);
            assert!(result.is_ok());
            let result = model_vectors.deserialize(ser_vector2);
            assert!(result.is_ok());
            assert_eq!(model_vectors.vectors.len(), 2);

            let result = model_vectors.get_value(1.0);
            assert!(result.is_ok());
            let v = result.unwrap();
            assert_eq!(v.vector, 1.0);
            assert_eq!(v.rank, 0);
            match v.orig_value {
                VectorOrigionalValue::F64(value) => assert_eq!(value, 1.0),
                _ => panic!("Expected F64"),
            };

        
        }

        #[test]
        fn duplicate_vectors() {
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);
            let vector2 = Vector::new(VectorOrigionalValue::F64(2.0), 2.0, 1);

            let ser_vector = serialize(&vector).unwrap();
            let ser_vector2 = serialize(&vector2).unwrap();
            let ser_vector3 = serialize(&vector2).unwrap();

            let mut model_vectors = ModelVectors::new();
            let result = model_vectors.deserialize(ser_vector);
            assert!(result.is_ok());
            let result = model_vectors.deserialize(ser_vector2);
            assert!(result.is_ok());
            let result = model_vectors.deserialize(ser_vector3);
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                DeserializeVectorError::VectorAlreadyExists(_) => (),
                _ => panic!("Expected VectorAlreadyExists error"),
            };
            assert_eq!(model_vectors.vectors.len(), 2);

        }

        #[test]
        fn deserialization_fails() {
            let vector = Vector::new(VectorOrigionalValue::F64(1.0), 1.0, 0);

            let mut ser_vector = serialize(&vector).unwrap();
            //Remove the last byte to cause an error
            ser_vector.pop();

            let mut model_vectors = ModelVectors::new();
            let result = model_vectors.deserialize(ser_vector);
            assert!(result.is_err());
            let error = result.err().unwrap();
            match error {
                DeserializeVectorError::DeserializeError(data) => {
                    let d = data.data.unwrap();
                    let error_kind = d["ErrorKind"].as_str().unwrap();
                    assert_eq!(error_kind, "Io");
                },
                _ => panic!("Expected DeserializeError error"),
            };


        }
    }
}
