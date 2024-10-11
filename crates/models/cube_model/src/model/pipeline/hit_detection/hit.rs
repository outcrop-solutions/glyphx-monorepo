use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hit {
    pub glyph_id: u32,
    pub shift_pressed: bool,
}
