use super::{AddGlyphError, GlyphIdManager, StatsManager};
use crate::model::{
    data::{
        GlyphDescription, GlyphInstanceData, ModelVectors, RankedGlyphData, RankedGlyphDataError,
        SelectedGlyph,
    },
    GlyphVertexData,
};

use model_common::Glyph;

use bincode::deserialize;
use std::{cell::RefCell, rc::Rc};

#[derive(Debug, Clone)]
pub struct GlyphManager {
    stats_manager: Rc<RefCell<StatsManager>>,
    raw_glyphs: Vec<GlyphInstanceData>,
    new_ranked_glyph_data: Option<RankedGlyphData>,
    x_model_vectors: Rc<RefCell<ModelVectors>>,
    z_model_vectors: Rc<RefCell<ModelVectors>>,
    total_glyphs: usize,
    glyph_id_manager: GlyphIdManager,
}

impl GlyphManager {
    pub fn new(
        x_model_vectors: Rc<RefCell<ModelVectors>>,
        z_model_vectors: Rc<RefCell<ModelVectors>>,
        stats_manager: Rc<RefCell<StatsManager>>,
    ) -> GlyphManager {
        GlyphManager {
            stats_manager,
            new_ranked_glyph_data: None,
            x_model_vectors,
            z_model_vectors,
            total_glyphs: 0,
            raw_glyphs: Vec::new(),
            glyph_id_manager: GlyphIdManager::new(),
        }
    }

    fn get_new_ranked_glyph_data(&mut self) -> Result<&mut RankedGlyphData, AddGlyphError> {
        if self.new_ranked_glyph_data.is_none() {
            let x_stats = self.stats_manager.borrow().get_stats("x")?;
            let z_stats = self.stats_manager.borrow().get_stats("z")?;
            self.new_ranked_glyph_data = Some(RankedGlyphData::new(
                x_stats.max_rank as u32,
                z_stats.max_rank as u32,
            ));
        }
        Ok(self.new_ranked_glyph_data.as_mut().unwrap())
    }

    pub fn add_new_ranked_glyph(
        &mut self,
        glyph: GlyphVertexData,
    ) -> Result<(), RankedGlyphDataError> {
        let ranked_glyph_data = self.get_new_ranked_glyph_data().unwrap();
        ranked_glyph_data.add(glyph)?;
        Ok(())
    }

    ///Builds our glyphs from the raw data consumed from the glyph_engine.
    ///These glyphs are then processed by the compute pipeline and then
    ///converted to verticies to be processed by the Glyph Pipeline in the
    ///rendering engine.
    pub fn add_glyph(&mut self, glyph_bytes: Vec<u8>) -> Result<Glyph, AddGlyphError> {
        let glyph = deserialize::<Glyph>(&glyph_bytes)?;
        let retval = glyph.clone();
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

        //let ranked_glyph_data = self.get_ranked_glyph_data()?;
        let raw_glyphs = &mut self.raw_glyphs;
        let glyph_id = raw_glyphs.len() as u32;
        raw_glyphs.push(
            //Ok here we are flipping y and z, this make things make sense downstream as we
            //actually render the glyphs.
            GlyphInstanceData::new(
                glyph_id,
                glyph.x_value as f32,
                x_vector.rank as u32,
                glyph.z_value as f32,
                glyph.y_value as f32,
                z_vector.rank as u32,
                0,
            ),
        );
        self.glyph_id_manager
            .add_glyph_id_data(glyph_id, glyph.row_ids);
        self.total_glyphs += 1;
        Ok(retval)
    }

    pub fn new_get_glyphs(&self) -> Option<&RankedGlyphData> {
        self.new_ranked_glyph_data.as_ref()
    }

    pub fn get_raw_glyphs(&self) -> &Vec<GlyphInstanceData> {
        &self.raw_glyphs
    }

    pub fn len(&self) -> usize {
        self.total_glyphs
    }

    ///Clears the glyph data from the ranked managers.  It is Expected
    ///that raw glyphs will remain in place until a new model is loaded.
    ///which the front end should handle.
    pub fn clear(&mut self) {
        self.new_ranked_glyph_data = None;
        //self.total_glyphs = 0;
    }

    pub fn get_glyph_description(&self, glyph_id: u32) -> Option<SelectedGlyph> {
        let glyph = self.raw_glyphs.get(glyph_id as usize)?;
        let x_vector = self
            .x_model_vectors
            .as_ref()
            .borrow()
            .get_value(glyph.x_value as f64)
            .ok()?;
        let y_vector = self
            .z_model_vectors
            .as_ref()
            .borrow()
            .get_value(glyph.z_value as f64)
            .ok()?;
        Some(SelectedGlyph::new(
            glyph_id,
            self.glyph_id_manager
                .get_glyph_id_data(glyph_id)
                .unwrap()
                .row_ids
                .clone(),
            //This flips y and z back to client facing
            GlyphDescription::new(
                x_vector.orig_value.clone(),
                y_vector.orig_value.clone(),
                glyph.y_value as f64,
            ),
        ))
    }
}

#[cfg(test)]
impl GlyphManager {
    pub fn get_z_vector_len(&self) -> usize {
        self.z_model_vectors.as_ref().borrow().len()
    }
    pub fn get_x_vector_len(&self) -> usize {
        self.x_model_vectors.as_ref().borrow().len()
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    mod helper_methods {
        use super::*;

        use model_common::{
            vectors::{Vector, VectorOrigionalValue},
            Stats,
        };

        use bincode::serialize;

        pub fn get_glyph_manager() -> GlyphManager {
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
    }

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
            assert!(gm.new_ranked_glyph_data.is_none());

            let vector = Vector::new(VectorOrigionalValue::U64(0), 0.0, 0);
            let _ = x_model_vectors.borrow_mut().insert_vector(vector.clone());
            let _ = z_model_vectors.borrow_mut().insert_vector(vector.clone());
            assert_eq!(gm.get_x_vector_len(), 1);
            assert_eq!(gm.get_z_vector_len(), 1);
        }
    }

    mod new_get_ranked_glyph_data {
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

            let ranked_glyph_data = gm.get_new_ranked_glyph_data();
            assert!(ranked_glyph_data.is_ok());
            let ranked_glyph_data = ranked_glyph_data.unwrap();
            assert_eq!(ranked_glyph_data.get_x_rank_size(), 11);
            assert_eq!(ranked_glyph_data.get_z_rank_size(), 101);
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

            let ranked_glyph_data = gm.get_new_ranked_glyph_data().unwrap();
            assert_eq!(ranked_glyph_data.get_x_rank_size(), 11);
            assert_eq!(ranked_glyph_data.get_z_rank_size(), 101);

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

            let ranked_glyph_data = gm.get_new_ranked_glyph_data().unwrap();
            assert_eq!(ranked_glyph_data.get_x_rank_size(), 11);
            assert_eq!(ranked_glyph_data.get_z_rank_size(), 101);
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

            let ranked_glyph_data = gm.get_new_ranked_glyph_data();
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

            let ranked_glyph_data = gm.get_new_ranked_glyph_data();
            assert!(ranked_glyph_data.is_err());
            let err = ranked_glyph_data.err().unwrap();
            match err {
                AddGlyphError::StatisticsNotInitialized(_) => {}
                _ => panic!("Expected StatsNotFound"),
            }
        }
    }

    mod add_glyph {
        use super::{helper_methods::get_glyph_manager, *};
        use bincode::serialize;

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

            //Adding a glyph does not create the ranked_glyph_data object
            //that is added after the fact by calling add_new_ranked_glyph
            let new_ranked_glyph_data = gm.new_get_glyphs();
            assert!(new_ranked_glyph_data.is_none());
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
    }

    mod add_new_ranked_glyph {
        use super::*;
        use helper_methods::get_glyph_manager;

        use crate::assets::shape_vertex::ShapeVertex;
        #[test]
        fn is_ok() {
            let mut gm = get_glyph_manager();
            let glyph = GlyphVertexData::new(
                0,
                ShapeVertex {
                    position_vertex: [1.0, 2.0, 3.0],
                    normal: [4.0, 5.0, 6.0],
                    color: 7,
                },
                0,
                0,
                15,
            );

            let result = gm.add_new_ranked_glyph(glyph);
            assert!(result.is_ok());
            let new_ranked_glyph_data = gm.new_get_glyphs();
            assert!(new_ranked_glyph_data.is_some());
            let new_ranked_glyph_data = new_ranked_glyph_data.unwrap();
            assert_eq!(new_ranked_glyph_data.get_number_of_glyphs(), 1);
        }

        #[test]
        fn is_err() {
            let mut gm = get_glyph_manager();
            //x_rank is out of bounds
            let glyph = GlyphVertexData::new(
                0,
                ShapeVertex {
                    position_vertex: [1.0, 2.0, 3.0],
                    normal: [4.0, 5.0, 6.0],
                    color: 7,
                },
                100,
                0,
                15,
            );

            let result = gm.add_new_ranked_glyph(glyph);
            assert!(result.is_err());
            let err = result.err().unwrap();
            let err_value = match err {
                RankedGlyphDataError::InvalidXRank(value) => value,
                _ => 99999,
            };
            assert_eq!(err_value, 100);
        }
    }

    mod accessors {
        use super::*;
        use bincode::serialize;
        use helper_methods::get_glyph_manager;

        #[test]
        fn get_x_vector_len() {
            let gm = get_glyph_manager();
            assert_eq!(gm.get_x_vector_len(), 10);
        }

        #[test]
        fn get_z_vector_len() {
            let gm = get_glyph_manager();
            assert_eq!(gm.get_z_vector_len(), 10);
        }

        #[test]
        fn len() {
            let mut gm = get_glyph_manager();
            let glyph = Glyph {
                x_value: 0.0,
                y_value: 0.0,
                z_value: 0.0,
                row_ids: vec![0],
            };

            let result = gm.add_glyph(serialize(&glyph).unwrap());
            assert!(result.is_ok());
            assert_eq!(gm.len(), 1);
        }
    }

    mod clear {
        use super::*;
        use crate::assets::shape_vertex::ShapeVertex;

        use bincode::serialize;
        use helper_methods::get_glyph_manager;

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

            let glyph = GlyphVertexData::new(
                0,
                ShapeVertex {
                    position_vertex: [1.0, 2.0, 3.0],
                    normal: [4.0, 5.0, 6.0],
                    color: 7,
                },
                0,
                0,
                15,
            );

            let result = gm.add_new_ranked_glyph(glyph);
            assert!(result.is_ok());

            assert_eq!(gm.len(), 1);
            let ranked_glyph_data = gm.new_get_glyphs();
            assert!(ranked_glyph_data.is_some());
            let ranked_glyph_data = ranked_glyph_data.unwrap();
            assert_eq!(ranked_glyph_data.get_number_of_glyphs(), 1);

            gm.clear();
            assert_eq!(gm.len(), 1);

            let ranked_glyph_data = gm.new_get_glyphs();
            assert!(ranked_glyph_data.is_none());
        }
    }
}
