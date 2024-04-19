use super::ModelVectors;
use super::StatsManager;
use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;
use crate::model::pipeline::glyphs::ranked_glyph_data::RankedGlyphData;
use crate::model::state::AddGlyphError;
use model_common::Glyph;

use bincode::deserialize;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug, Clone)]
pub struct GlyphManager {
    stats_manager: Rc<RefCell<StatsManager>>,
    ranked_glyph_data: Option<RankedGlyphData>,
    x_model_vectors: Rc<RefCell<ModelVectors>>,
    z_model_vectors: Rc<RefCell<ModelVectors>>,
}

impl GlyphManager {
    pub fn new(
        x_model_vectors: Rc<RefCell<ModelVectors>>,
        z_model_vectors: Rc<RefCell<ModelVectors>>,
        stats_manager: Rc<RefCell<StatsManager>>,
    ) -> GlyphManager {
        GlyphManager {
            stats_manager,
            ranked_glyph_data: None,
            x_model_vectors,
            z_model_vectors,
        }
    }
    fn get_ranked_glyph_data(&mut self) -> Result<&mut RankedGlyphData, AddGlyphError> {
        if self.ranked_glyph_data.is_none() {
            let x_stats = self.stats_manager.borrow().get_stats("x")?;
            let z_stats = self.stats_manager.borrow().get_stats("z")?;
            self.ranked_glyph_data = Some(RankedGlyphData::new(
                x_stats.max_rank as usize,
                z_stats.max_rank as usize,
            ));
        }
        Ok(self.ranked_glyph_data.as_mut().unwrap())
    }

    pub fn add_glyph(&mut self, glyph_bytes: Vec<u8>) -> Result<(), AddGlyphError> {
        let glyph = deserialize::<Glyph>(&glyph_bytes)?;
        let x_vector = &self
            .x_model_vectors
            .as_ref()
            .borrow()
            .get_value(glyph.x_value)?;
        //I am commenting on this a lot because it is confusing.
        //In WebGPU Y is up and Z is depth.  So we are flipping the Y and Z values here so that
        //everything makes sense downstream.
        let z_vector = self
            .z_model_vectors
            .as_ref()
            .borrow()
            .get_value(glyph.y_value)?;

        let ranked_glyph_data = self.get_ranked_glyph_data()?;
        ranked_glyph_data.add(
            x_vector.rank as usize,
            z_vector.rank as usize,
            //Ok here we are flipping y and z, this make things make sense downstream as we
            //actually render the glyphs.
            GlyphInstanceData {
                glyph_id: 0,
                x_value: glyph.x_value as f32,
                y_value: glyph.z_value as f32,
                z_value: glyph.y_value as f32,
                glyph_selected: 0,
            },
        )?;

        Ok(())
    }

    pub fn get_x_vector_len(&self) -> usize {
        self.x_model_vectors.as_ref().borrow().len()
    }

    pub fn get_z_vector_len(&self) -> usize {
        self.z_model_vectors.as_ref().borrow().len()
    }

    pub fn get_glyphs(&self) -> Option<&RankedGlyphData> {
        self.ranked_glyph_data.as_ref()
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    mod contructor {
        use super::*;
        use model_common::vectors::{Vector, VectorOrigionalValue};

        #[test]
        fn is_ok() {
            let x_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let z_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let stats_manager = Rc::new(RefCell::new(StatsManager::new()));
            let gm = GlyphManager::new(
                x_model_vectors.clone(),
                z_model_vectors.clone(),
                stats_manager.clone(),
            );
            assert_eq!(gm.get_x_vector_len(), 0);
            assert_eq!(gm.get_z_vector_len(), 0);
            assert!(gm.ranked_glyph_data.is_none());

            let vector = Vector::new(VectorOrigionalValue::U64(0), 0.0, 0);
            let _ = x_model_vectors.borrow_mut().insert_vector(vector.clone());
            let _ = z_model_vectors.borrow_mut().insert_vector(vector.clone());
            assert_eq!(gm.get_x_vector_len(), 1);
            assert_eq!(gm.get_z_vector_len(), 1);
        }
    }

    mod get_ranked_glyph_data {
        use super::*;
        use bincode::serialize;
        use model_common::Stats;

        #[test]
        fn is_ok() {
            let x_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let z_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let stats_manager = Rc::new(RefCell::new(StatsManager::new()));
            let mut x_stats = Stats::default();
            x_stats.max_rank = 10;
            x_stats.axis = "x".to_string();

            let mut z_stats = Stats::default();
            z_stats.max_rank = 100;
            z_stats.axis = "y".to_string();

            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&x_stats).unwrap());
            assert!(result.is_ok());
            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&z_stats).unwrap());
            assert!(result.is_ok());
            let mut gm = GlyphManager::new(
                x_model_vectors.clone(),
                z_model_vectors.clone(),
                stats_manager.clone(),
            );

            let ranked_glyph_data = gm.get_ranked_glyph_data();
            assert!(ranked_glyph_data.is_ok());
            let ranked_glyph_data = ranked_glyph_data.unwrap();
            assert_eq!(ranked_glyph_data.get_x_rank_size(), 10);
            assert_eq!(ranked_glyph_data.get_z_rank_size(), 100);
        }

        #[test]
        fn multiple_calls_return_the_same_object() {
            let x_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let z_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let stats_manager = Rc::new(RefCell::new(StatsManager::new()));
            let mut x_stats = Stats::default();
            x_stats.max_rank = 10;
            x_stats.axis = "x".to_string();

            let mut z_stats = Stats::default();
            z_stats.max_rank = 100;
            z_stats.axis = "y".to_string();

            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&x_stats).unwrap());
            assert!(result.is_ok());
            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&z_stats).unwrap());
            assert!(result.is_ok());
            let mut gm = GlyphManager::new(
                x_model_vectors.clone(),
                z_model_vectors.clone(),
                stats_manager.clone(),
            );

            let ranked_glyph_data = gm.get_ranked_glyph_data().unwrap();
            assert_eq!(ranked_glyph_data.get_x_rank_size(), 10);
            assert_eq!(ranked_glyph_data.get_z_rank_size(), 100);

            x_stats.max_rank = 20;
            z_stats.max_rank = 200;
            let result = stats_manager
                .borrow_mut()
                .swap_stats(serialize(&x_stats).unwrap());
            assert!(result.is_ok());
            let result = stats_manager
                .borrow_mut()
                .swap_stats(serialize(&z_stats).unwrap());
            assert!(result.is_ok());

            let ranked_glyph_data = gm.get_ranked_glyph_data().unwrap();
            assert_eq!(ranked_glyph_data.get_x_rank_size(), 10);
            assert_eq!(ranked_glyph_data.get_z_rank_size(), 100);
        }

        #[test]
        fn x_stats_are_undefined() {
            let x_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let z_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let stats_manager = Rc::new(RefCell::new(StatsManager::new()));

            let mut z_stats = Stats::default();
            z_stats.max_rank = 100;
            z_stats.axis = "y".to_string();

            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&z_stats).unwrap());
            assert!(result.is_ok());
            let mut gm = GlyphManager::new(
                x_model_vectors.clone(),
                z_model_vectors.clone(),
                stats_manager.clone(),
            );

            let ranked_glyph_data = gm.get_ranked_glyph_data();
            assert!(ranked_glyph_data.is_err());
            let err = ranked_glyph_data.err().unwrap();
            match err {
                AddGlyphError::StatisticsNotInitialized(_) => {}
                _ => panic!("Expected StatsNotFound"),
            }
        }
        #[test]
        fn z_stats_are_undefined() {
            let x_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let z_model_vectors = Rc::new(RefCell::new(ModelVectors::new()));
            let stats_manager = Rc::new(RefCell::new(StatsManager::new()));

            let mut x_stats = Stats::default();
            x_stats.max_rank = 100;
            x_stats.axis = "x".to_string();

            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&x_stats).unwrap());
            assert!(result.is_ok());
            let mut gm = GlyphManager::new(
                x_model_vectors.clone(),
                z_model_vectors.clone(),
                stats_manager.clone(),
            );

            let ranked_glyph_data = gm.get_ranked_glyph_data();
            assert!(ranked_glyph_data.is_err());
            let err = ranked_glyph_data.err().unwrap();
            match err {
                AddGlyphError::StatisticsNotInitialized(_) => {}
                _ => panic!("Expected StatsNotFound"),
            }
        }
    }

    mod add_glyph {
        use super::*;
        use crate::model::pipeline::glyphs::ranked_glyph_data::{Rank, RankDirection};
        use bincode::serialize;
        use model_common::{
            vectors::{Vector, VectorOrigionalValue},
            Stats,
        };

        use super::GlyphManager;

        fn get_glyph_manager() -> GlyphManager {
            let mut x_vectors = ModelVectors::new();
            let mut z_vectors = ModelVectors::new();

            for i in 0..10 {
                let vector = Vector::new(VectorOrigionalValue::U64(i), i as f64, i);
                let _ = x_vectors.insert_vector(vector.clone());
                let _ = z_vectors.insert_vector(vector.clone());
            }

            let x_model_vectors = Rc::new(RefCell::new(x_vectors));
            let z_model_vectors = Rc::new(RefCell::new(z_vectors));

            let stats_manager = Rc::new(RefCell::new(StatsManager::new()));
            let mut x_stats = Stats::default();
            x_stats.max_rank = 10;
            x_stats.axis = "x".to_string();

            let mut z_stats = Stats::default();
            z_stats.max_rank = 100;
            z_stats.axis = "y".to_string();

            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&x_stats).unwrap());
            assert!(result.is_ok());
            let result = stats_manager
                .borrow_mut()
                .add_stats(serialize(&z_stats).unwrap());
            assert!(result.is_ok());
            GlyphManager::new(
                x_model_vectors.clone(),
                z_model_vectors.clone(),
                stats_manager.clone(),
            )
        }

        #[test]
        fn is_ok() {
            let mut gm = get_glyph_manager();
            let glyph = Glyph {
                x_value: 0.0,
                y_value: 0.0,
                z_value: 0.0,
                row_ids: vec![0],
            };

            let result = gm.add_glyph(serialize(&glyph).unwrap());
            assert!(result.is_ok());

            let glyph = Glyph {
                x_value: 1.0,
                y_value: 1.0,
                z_value: 1.0,
                row_ids: vec![1],
            };

            let result = gm.add_glyph(serialize(&glyph).unwrap());
            assert!(result.is_ok());

            let mut count = 0;
            gm.get_glyphs().unwrap()
                .iter(Rank::X, RankDirection::Ascending)
                .for_each(|r| count += r.len());
            assert_eq!(count, 2);
        }

        #[test]
        fn deserialization_fails() {
            let mut gm = get_glyph_manager();
            let glyph = Glyph {
                x_value: 0.0,
                y_value: 0.0,
                z_value: 0.0,
                row_ids: vec![0],
            };

            let mut bin_glyph = serialize(&glyph).unwrap();
            bin_glyph.pop();

            let result = gm.add_glyph(bin_glyph);
            assert!(result.is_err());
            let err = result.err().unwrap();
            match err {
                AddGlyphError::DeserializationError(_) => {}
                _ => panic!("Expected BincodeError"),
            }
        }

        #[test]
        fn x_vector_does_not_exist() {
            let mut gm = get_glyph_manager();
            let glyph = Glyph {
                x_value: 1000.0,
                y_value: 0.0,
                z_value: 0.0,
                row_ids: vec![0],
            };

            let bin_glyph = serialize(&glyph).unwrap();

            let result = gm.add_glyph(bin_glyph);
            assert!(result.is_err());
            let err = result.err().unwrap();
            match err {
                AddGlyphError::VectorNotFound(_) => {}
                _ => panic!("Expected BincodeError"),
            }
        }

        #[test]
        fn z_vector_does_not_exist() {
            let mut gm = get_glyph_manager();
            let glyph = Glyph {
                x_value: 0.0,
                y_value: 10000.0,
                z_value: 0.0,
                row_ids: vec![0],
            };

            let bin_glyph = serialize(&glyph).unwrap();

            let result = gm.add_glyph(bin_glyph);
            assert!(result.is_err());
            let err = result.err().unwrap();
            match err {
                AddGlyphError::VectorNotFound(_) => {}
                _ => panic!("Expected BincodeError"),
            }
        }

        #[test]
        fn glyph_instance_data_errors() {
            let mut gm = get_glyph_manager();
            let mut bad_stats = Stats::default();
            bad_stats.max_rank = 1;
            bad_stats.axis = "x".to_string();
           let _  = gm.stats_manager.borrow_mut().swap_stats(serialize(&bad_stats).unwrap());

            let glyph = Glyph {
                x_value: 2.0,
                y_value: 2.0,
                z_value: 2.0,
                row_ids: vec![0],
            };

            let result = gm.add_glyph(serialize(&glyph).unwrap());
            assert!(result.is_err());
            let err = result.err().unwrap();
            match err {
                AddGlyphError::RankOutOfRange(_) => {}
                _ => panic!("Expected BincodeError"),
            }

        }
    }
}
