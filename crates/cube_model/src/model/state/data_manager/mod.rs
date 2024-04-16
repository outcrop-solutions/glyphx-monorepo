mod glyph_manager;
mod stats_manager;


use super::DeserializeVectorError;
use super::AddStatsError;
use super::ModelVectors;
use super::AddGlyphError;

pub use glyph_manager::GlyphManager;
pub use stats_manager::StatsManager;

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
        let dm = DataManager {
            x_vectors: rc_x_vectors,
            z_vectors: rc_y_vectors,
            stats_manager: rc_stats_manager,
            glyph_manager,
        };
        dm
    }

    pub fn add_x_vector(&mut self, vector_bytes: Vec<u8>) -> Result<(), DeserializeVectorError> {
        let res = self.x_vectors.borrow_mut().deserialize(vector_bytes);
        if res.is_err() {
            return Err(res.err().unwrap());
        }
        Ok(())
    }

    pub fn add_z_vector(&mut self, vector_bytes: Vec<u8>) -> Result<(), DeserializeVectorError> {
        let res = self.z_vectors.borrow_mut().deserialize(vector_bytes);
        if res.is_err() {
            return Err(res.err().unwrap());
        }
        Ok(())
    }

    pub fn add_stats(&mut self, stats_bytes: Vec<u8>) -> Result<(), AddStatsError> {
        self.stats_manager.borrow_mut().add_stats(stats_bytes)
    }

     pub fn add_glyph(&mut self, glyph_bytes: Vec<u8>) -> Result<(), AddGlyphError> {
        self.glyph_manager.add_glyph(glyph_bytes)
     }
}

#[cfg(test)]
mod unit_tests {

    use super::*;
    use bincode::serialize;
    use model_common::vectors::{Vector, VectorOrigionalValue};

    #[test]
    fn test_data_manager() {
        let mut dm = DataManager::new();
        assert_eq!(dm.x_vectors.as_ref().borrow().len(), 0);
        let v = Vector::new(VectorOrigionalValue::U64(1), 0.0, 0);
        let b = serialize(&v).unwrap();
        let result = dm.add_x_vector(b);
        assert!(result.is_ok());
        assert_eq!(dm.x_vectors.as_ref().borrow().len(), 1);
        let g = &dm.glyph_manager;
        assert_eq!(g.get_x_vector_len(), 1);
    }
}
