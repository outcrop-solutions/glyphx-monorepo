use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AddGlyphData {
     AddGlyph(Vec<u8>),
}
