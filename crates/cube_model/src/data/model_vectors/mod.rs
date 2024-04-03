mod error;

pub use error::*;

use model_common::vectors::Vector;
use glyphx_core_error::GlyphxErrorData;

use im::OrdMap;
use ordered_float::OrderedFloat;
use serde_json::json;

///This is similar to the vector objects creted in the glyph_engine crate except, this struct
///provides a reverse lookup converting the vector to an origional value. 
#[derive(Debug, Clone )]
pub struct ModelVectors {
    vectors : OrdMap<OrderedFloat<f64>, Vector>,
}

impl ModelVectors {
    pub fn new() -> Self {
        ModelVectors {
            vectors: OrdMap::new(),
        }
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
            let data = json!({"vector": vector});
            let error = GlyphxErrorData::new("Vector does not exists".to_string(), Some(data), None);
            return Err(GetVectorError::VectorDoesNotExists(error));
        }
        let v = v.unwrap();
        Ok(v.clone())
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

    mod get_vector {
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
}
