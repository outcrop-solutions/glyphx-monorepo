use super::StatsManager;
use crate::model::pipeline::glyphs::ranked_glyph_data::RankedGlyphData;
use model_common::Glyph;
use crate::model::state::AddGlyphError;
use super::ModelVectors;
use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;

use bincode::deserialize;
use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug, Clone)]
pub struct GlyphManager {
    stats_manager: Rc<RefCell<StatsManager>>,
    ranked_glyph_data: Option<RankedGlyphData>,
    x_model_vectors: Rc<RefCell<ModelVectors>>,
    z_model_vectors: Rc<RefCell<ModelVectors>>,
}

impl  GlyphManager {

    pub fn new(x_model_vectors: Rc<RefCell<ModelVectors>>, z_model_vectors: Rc<RefCell<ModelVectors>>, stats_manager: Rc<RefCell<StatsManager>>) -> GlyphManager {
        GlyphManager {
            stats_manager,
            ranked_glyph_data: None,
            x_model_vectors,
            z_model_vectors,
        }
    }
    fn get_ranked_glyph_data(&mut self) -> Result<&mut RankedGlyphData, AddGlyphError> {
        if self.ranked_glyph_data.is_none() {
            let x_stats = self.stats_manager.as_ref().borrow().get_stats("x")?;
            let z_stats = self.stats_manager.as_ref().borrow().get_stats("z")?;
            self.ranked_glyph_data = Some(RankedGlyphData::new(
                x_stats.max_rank as usize,
                z_stats.max_rank as usize,
            ));
        }
        Ok(self.ranked_glyph_data.as_mut().unwrap())
    }

    pub fn add_glyph(&mut self, glyph_bytes: Vec<u8>) -> Result<(), AddGlyphError> {
        let glyph = deserialize::<Glyph>(&glyph_bytes)?;
        let x_vector = &self.x_model_vectors.as_ref().borrow().get_value(glyph.x_value)?; 
        // let x_vector = x_vector.as_ref();
        // let x_vector = x_vector.borrow();
        // let x_vector = x_vector.get_value(glyph.x_value)?;
        //I am commenting on this a lot because it is confusing.
        //In WebGPU Y is up and Z is depth.  So we are flipping the Y and Z values here so that
        //everything makes sense downstream.
        let z_vector = self.z_model_vectors.as_ref().borrow().get_value(glyph.y_value)?;

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
}
