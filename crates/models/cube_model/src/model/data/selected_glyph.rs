use super::GlyphDescription;

use serde_json::{Value, json};

pub struct SelectedGlyph {
    pub glyph_id: u32,
    pub row_ids: Vec<usize>,
    pub desc: GlyphDescription,
}

impl SelectedGlyph {
    pub fn new(glyph_id: u32, row_ids: Vec<usize>, desc: GlyphDescription) -> Self {
        Self {
            glyph_id,
            row_ids,
            desc,
        }
    }

    pub fn to_json(&self) -> Value {
        let mut row_ids = Vec::new();
        for row_id in &self.row_ids {
            row_ids.push(Value::Number((*row_id).into()));
        }
        let desc = &self.desc.to_json();
        json!({"glyph_id": self.glyph_id, "row_ids": row_ids, "desc": desc} )
    }
}

