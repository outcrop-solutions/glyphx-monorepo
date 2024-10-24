use crate::model::data::InstanceOutput;

use model_common::ShapeVertex;

use bytemuck::{Pod, Zeroable};
use std::mem::size_of;
use wgpu::{BufferAddress, VertexAttribute, VertexBufferLayout, VertexFormat, VertexStepMode};

#[repr(C)]
#[derive(Debug, Copy, Clone, Pod, Zeroable)]
pub struct GlyphVertexData {
    pub glyph_id: u32,
    pub position: [f32; 3],
    pub normal: [f32; 3],
    pub color: u32,
    pub x_rank: u32,
    pub z_rank: u32,
    pub flags: u32,
}

impl GlyphVertexData {
    pub fn new(
        glyph_id: u32,
        position: ShapeVertex,
        x_rank: u32,
        z_rank: u32,
        flags: u32,
    ) -> GlyphVertexData {
        GlyphVertexData {
            glyph_id,
            position: position.position_vertex,
            normal: position.normal,
            color: position.color,
            x_rank,
            z_rank,
            flags,
        }
    }

    pub fn desc() -> VertexBufferLayout<'static> {
        VertexBufferLayout {
            array_stride: size_of::<GlyphVertexData>() as BufferAddress,
            step_mode: VertexStepMode::Vertex,
            attributes: &[
                //glyph_id
                VertexAttribute {
                    format: VertexFormat::Uint32,
                    offset: 0,
                    shader_location: 0,
                },
                //Position
                VertexAttribute {
                    format: VertexFormat::Float32x3,
                    offset: size_of::<u32>() as BufferAddress,
                    shader_location: 1,
                },
                //normal
                VertexAttribute {
                    format: VertexFormat::Float32x3,
                    offset: size_of::<u32>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress,
                    shader_location: 2,
                },
                //color
                VertexAttribute {
                    format: VertexFormat::Uint32,
                    offset: size_of::<u32>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress,
                    shader_location: 3,
                },
                //x_rank
                VertexAttribute {
                    format: VertexFormat::Uint32,
                    offset: size_of::<u32>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress
                        + size_of::<u32>() as BufferAddress,
                    shader_location: 4,
                },
                //z_rank
                VertexAttribute {
                    format: VertexFormat::Uint32,
                    offset: size_of::<u32>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress
                        + size_of::<u32>() as BufferAddress
                        + size_of::<u32>() as BufferAddress,
                    shader_location: 5,
                },
                //flags
                VertexAttribute {
                    format: VertexFormat::Uint32,
                    offset: size_of::<u32>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress
                        + size_of::<[f32; 3]>() as BufferAddress
                        + size_of::<u32>() as BufferAddress
                        + size_of::<u32>() as BufferAddress
                        + size_of::<u32>() as BufferAddress,
                    shader_location: 6,
                },
            ],
        }
    }
}

impl From<&InstanceOutput> for GlyphVertexData {
    fn from(instance_output: &InstanceOutput) -> Self {
        let glyph_id = instance_output.glyph_id;
        let position_data = instance_output.vertex_data;
        let x_rank = instance_output.x_rank;
        let z_rank = instance_output.z_rank;
        let flags = instance_output.flags;
        GlyphVertexData::new(glyph_id, position_data, x_rank, z_rank, flags)
    }
}
