use serde::{Deserialize, Serialize};

//A Single Glyph Id, maps to one of more rows in the underlying data view.
//This information is not used during the rendering processes, but is
//used to identify selcted glyphs when the user clicks on the screen.
//This structure holds this mapping, so that we do not have to strip it
//off before sending the data to the GPU.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlyphIdData {
    pub glyph_id: u32,
    pub row_ids: Vec<usize>,
}

impl GlyphIdData {
    pub fn new(glyph_id: u32, row_ids: Vec<usize>) -> Self {
        Self { glyph_id, row_ids }
    }
}
