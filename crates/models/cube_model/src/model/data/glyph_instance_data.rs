use bytemuck;

#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
pub struct GlyphInstanceData {
    pub glyph_id: u32,
    pub x_value: f32,
    pub x_rank: u32,
    pub y_value: f32,
    pub z_value: f32,
    pub z_rank: u32,
    //We may change this to a flag later
    //for now it is a u32 to keep our size in good shape
    pub glyph_selected: u32,
    pub padding: [u32; 5],
}

impl GlyphInstanceData {
    pub fn new(
        glyph_id: u32,
        x_value: f32,
        x_rank: u32,
        y_value: f32,
        z_value: f32,
        z_rank: u32,
        glyph_selected: u32,
    ) -> Self {
        Self {
            glyph_id,
            x_value,
            x_rank,
            y_value,
            z_value,
            z_rank,
            glyph_selected,
            padding: [0; 5],
        }
    }
}
