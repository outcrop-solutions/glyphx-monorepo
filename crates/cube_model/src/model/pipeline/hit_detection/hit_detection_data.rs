use bytemuck;
use serde::{Deserialize, Serialize};

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct HitDetectionData {
    //all three points of the triangle
    pub verticies: [ [f32;3]; 3],
    pub glyph_id: u32,
    pub x_rank: u32,
    pub z_rank: u32,
}

impl Eq for HitDetectionData {}

impl PartialEq for HitDetectionData {
    fn eq(&self, other: &Self) -> bool {
        self.verticies == other.verticies && self.glyph_id == other.glyph_id && self.x_rank == other.x_rank && self.z_rank == other.z_rank
    }
}
