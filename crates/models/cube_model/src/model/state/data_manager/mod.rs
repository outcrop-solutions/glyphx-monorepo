mod camera_manager;
mod glyph_manager;
mod stats_manager;

use super::{
    AddGlyphError, AddStatsError, DeserializeVectorError, GetStatsError, GlyphInstanceData,
    GlyphVertexData, ModelVectors, RankedGlyphData, SelectedGlyph,
};
pub use camera_manager::CameraManager;
pub use glyph_manager::GlyphManager;
pub use stats_manager::StatsManager;

use model_common::{Glyph, Stats};

use std::cell::RefCell;
use std::rc::Rc;

pub struct DataManager {
    x_vectors: Rc<RefCell<ModelVectors>>,
    z_vectors: Rc<RefCell<ModelVectors>>,
    stats_manager: Rc<RefCell<StatsManager>>,
    glyph_manager: GlyphManager,
}

impl DataManager {
    pub fn new() -> DataManager {
        //let glyph_manager =  GlyphManager::new(&x_vectors, &y_vectors, &stats_manager);
        let rc_x_vectors = Rc::new(RefCell::new(ModelVectors::new()));
        let rc_y_vectors = Rc::new(RefCell::new(ModelVectors::new()));
        let rc_stats_manager = Rc::new(RefCell::new(StatsManager::new()));
        let glyph_manager = GlyphManager::new(
            rc_x_vectors.clone(),
            rc_y_vectors.clone(),
            rc_stats_manager.clone(),
        );

        DataManager {
            x_vectors: rc_x_vectors,
            z_vectors: rc_y_vectors,
            stats_manager: rc_stats_manager,
            glyph_manager,
        }
    }

    pub fn add_x_vector(&mut self, vector_bytes: Vec<u8>) -> Result<(), DeserializeVectorError> {
        self.x_vectors.borrow_mut().deserialize(vector_bytes)
    }

    pub fn add_z_vector(&mut self, vector_bytes: Vec<u8>) -> Result<(), DeserializeVectorError> {
        self.z_vectors.borrow_mut().deserialize(vector_bytes)
    }

    pub fn add_stats(&mut self, stats_bytes: Vec<u8>) -> Result<Stats, AddStatsError> {
        self.stats_manager.borrow_mut().add_stats(stats_bytes)
    }

    pub fn get_stats(&self, axis: &str) -> Result<Stats, GetStatsError> {
        self.stats_manager.borrow().get_stats(axis)
    }

    pub fn add_glyph(&mut self, glyph_bytes: Vec<u8>) -> Result<Glyph, AddGlyphError> {
        self.glyph_manager.add_glyph(glyph_bytes)
    }

    pub fn add_ranked_glyph(&mut self, glyph: GlyphVertexData) -> Result<(), AddGlyphError> {
        self.glyph_manager.add_new_ranked_glyph(glyph)?;
        Ok(())
    }

    pub fn get_glyphs(&self) -> Option<&RankedGlyphData> {
        self.glyph_manager.new_get_glyphs()
    }

    pub fn get_raw_glyphs(&self) -> &Vec<GlyphInstanceData> {
        self.glyph_manager.get_raw_glyphs()
    }

    pub fn get_vector_len(&self, axis: &str) -> usize {
        match axis {
            "x" => self.x_vectors.borrow().len(),
            "z" => self.z_vectors.borrow().len(),
            _ => 0,
        }
    }

    pub fn get_stats_len(&self) -> usize {
        self.stats_manager.borrow().len()
    }

    pub fn get_glyph_len(&self) -> usize {
        self.glyph_manager.len()
    }

    pub fn clear_glyphs(&mut self) {
        self.glyph_manager.clear();
        //If we are clearning glyphs then we must also clear the hit detection data
    }
     pub fn clear_all_data(&mut self) {
        self.glyph_manager.clear();
        self.x_vectors.borrow_mut().clear();
        self.z_vectors.borrow_mut().clear();
        self.stats_manager.borrow_mut().clear();
     }

    pub fn get_glyph_description(&self, glyph_id: u32) -> Option<SelectedGlyph> {
        self.glyph_manager.get_glyph_description(glyph_id)
    }

    pub fn get_x_vectors(&self) -> Rc<RefCell<ModelVectors>> {
        self.x_vectors.clone()
    }

    pub fn get_z_vectors(&self) -> Rc<RefCell<ModelVectors>> {
        self.z_vectors.clone()
    }
}

#[cfg(test)]
mod unit_tests {

    use super::*;
    use bincode::serialize;
    use model_common::{
        vectors::{Vector, VectorOrigionalValue},
        Glyph, Stats,
    };
    mod contructor {
        use super::*;

        #[test]
        fn is_ok() {
            let data_manager = DataManager::new();
            assert_eq!(data_manager.get_vector_len("x"), 0);
            assert_eq!(data_manager.get_vector_len("z"), 0);
            assert_eq!(data_manager.get_stats_len(), 0);
            assert_eq!(data_manager.get_glyph_len(), 0);
        }
    }
    mod add_x_vector {
        use super::*;

        #[test]
        fn is_ok() {
            let mut data_manager = DataManager::new();
            let vector = Vector::new(VectorOrigionalValue::U64(0), 0.0, 0);
            let vector_bytes = serialize(&vector).unwrap();
            data_manager.add_x_vector(vector_bytes).unwrap();
            let x_vectors = data_manager.x_vectors.borrow();
            assert_eq!(x_vectors.len(), 1);
        }

        #[test]
        fn is_err() {
            let mut data_manager = DataManager::new();
            let vector_bytes = vec![0, 1, 2, 3];
            let result = data_manager.add_x_vector(vector_bytes);
            assert!(result.is_err());
            let err = result.unwrap_err();
            match err {
                DeserializeVectorError::DeserializeError(_) => (),
                _ => panic!("Expected BincodeError"),
            }

            let x_vectors = data_manager.x_vectors.borrow();
            assert_eq!(x_vectors.len(), 0);
        }
    }

    mod add_z_vector {
        use super::*;

        #[test]
        fn is_ok() {
            let mut data_manager = DataManager::new();
            let vector = Vector::new(VectorOrigionalValue::U64(0), 0.0, 0);
            let vector_bytes = serialize(&vector).unwrap();
            data_manager.add_z_vector(vector_bytes).unwrap();
            let z_vectors = data_manager.z_vectors.borrow();
            assert_eq!(z_vectors.len(), 1);
        }

        #[test]
        fn is_err() {
            let mut data_manager = DataManager::new();
            let vector_bytes = vec![0, 1, 2, 3];
            let result = data_manager.add_z_vector(vector_bytes);
            assert!(result.is_err());
            let err = result.unwrap_err();
            match err {
                DeserializeVectorError::DeserializeError(_) => (),
                _ => panic!("Expected BincodeError"),
            }

            let z_vectors = data_manager.z_vectors.borrow();
            assert_eq!(z_vectors.len(), 0);
        }
    }

    mod add_stats {
        use super::*;

        #[test]
        fn is_ok() {
            let mut data_manager = DataManager::new();
            let mut stats = Stats::default();
            stats.axis = "x".to_string();
            let stats_bytes = serialize(&stats).unwrap();
            let result = data_manager.add_stats(stats_bytes);
            assert!(result.is_ok());
            let stats_manager = data_manager.stats_manager.borrow();
            assert!(stats_manager.get_stats("x").is_ok());
        }

        #[test]
        fn is_err() {
            let mut data_manager = DataManager::new();
            let stats = vec![0, 1, 2, 3];
            let result = data_manager.add_stats(stats);
            assert!(result.is_err());
            let err = result.unwrap_err();
            match err {
                AddStatsError::DeserializationError(_) => (),
                _ => panic!("Expected BincodeError"),
            }
            let stats_manager = data_manager.stats_manager.borrow();
            assert!(stats_manager.get_stats("x").is_err());
        }
    }

    mod add_glyph {
        use super::*;

        #[test]
        fn is_ok() {
            let mut data_manager = DataManager::new();
            let vector = Vector::new(VectorOrigionalValue::U64(0), 0.0, 0);

            let result = data_manager.add_x_vector(serialize(&vector).unwrap());
            assert!(result.is_ok());

            let result = data_manager.add_z_vector(serialize(&vector).unwrap());
            assert!(result.is_ok());

            let mut stats = Stats::default();
            stats.axis = "x".to_string();
            stats.max_rank = 1;

            let result = data_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());

            stats.axis = "y".to_string();
            let result = data_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());

            let glyph = Glyph {
                x_value: 0.0,
                y_value: 0.0,
                z_value: 0.0,
                row_ids: vec![0],
            };

            let result = data_manager.add_glyph(serialize(&glyph).unwrap());
            assert!(result.is_ok());

            let glyph_data = data_manager.get_glyphs();
            assert!(glyph_data.is_none());
        }

        #[test]
        fn is_err() {
            let mut data_manager = DataManager::new();
            let vector = Vector::new(VectorOrigionalValue::U64(0), 0.0, 0);

            let result = data_manager.add_x_vector(serialize(&vector).unwrap());
            assert!(result.is_ok());

            let result = data_manager.add_z_vector(serialize(&vector).unwrap());
            assert!(result.is_ok());

            let mut stats = Stats::default();
            stats.axis = "x".to_string();
            stats.max_rank = 1;

            let result = data_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());

            stats.axis = "y".to_string();
            let result = data_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());

            let glyph_bytes = vec![0, 1, 2, 3];
            let result = data_manager.add_glyph(glyph_bytes);
            assert!(result.is_err());
            let err = result.unwrap_err();
            match err {
                AddGlyphError::DeserializationError(_) => (),
                _ => panic!("Expected BincodeError"),
            }

            let glyph_data = data_manager.get_glyphs();
            assert!(glyph_data.is_none());
        }
    }

    mod clear {
        use super::*;

        #[test]
        fn is_ok() {
            let mut data_manager = DataManager::new();
            let vector = Vector::new(VectorOrigionalValue::U64(0), 0.0, 0);

            let result = data_manager.add_x_vector(serialize(&vector).unwrap());
            assert!(result.is_ok());

            let result = data_manager.add_z_vector(serialize(&vector).unwrap());
            assert!(result.is_ok());

            let mut stats = Stats::default();
            stats.axis = "x".to_string();
            stats.max_rank = 1;

            let result = data_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());

            stats.axis = "y".to_string();
            let result = data_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());

            let glyph = Glyph {
                x_value: 0.0,
                y_value: 0.0,
                z_value: 0.0,
                row_ids: vec![0],
            };

            let result = data_manager.add_glyph(serialize(&glyph).unwrap());
            assert!(result.is_ok());

            data_manager.clear_glyphs();

            let gm = data_manager.get_glyphs();
            assert!(gm.is_none());
        }
    }
}
