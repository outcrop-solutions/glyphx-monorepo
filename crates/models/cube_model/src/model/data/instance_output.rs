use model_common::ShapeVertex;

use bytemuck::{Pod, Zeroable};

#[repr(C)]
#[derive(Copy, Clone, Debug, Pod, Zeroable)]
pub struct InstanceOutput {
    pub glyph_id: u32,
    pub vertex_data: ShapeVertex,
    pub x_rank: u32,
    pub z_rank: u32,
    pub x_id: u32,
    pub z_id: u32,
    pub flags: u32,
}
