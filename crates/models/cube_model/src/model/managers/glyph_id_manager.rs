use crate::model::data::GlyphIdData;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlyphIdManager {
    glyph_id_data: Vec<GlyphIdData>,
}

impl GlyphIdManager {
    pub fn new() -> Self {
        Self {
            glyph_id_data: Vec::new(),
        }
    }

    pub fn add_glyph_id_data(&mut self, glyph_id: u32, row_ids: Vec<usize>) {
        self.glyph_id_data.push(GlyphIdData::new(glyph_id, row_ids));
    }

    pub fn get_glyph_id_data(&self, glyph_id: u32) -> Option<GlyphIdData> {
        if glyph_id as usize >= self.glyph_id_data.len() {
            return None;
        }
        Some(self.glyph_id_data[glyph_id as usize].clone())
    }

    pub fn clear(&mut self) {
        self.glyph_id_data.clear();
    }
}
