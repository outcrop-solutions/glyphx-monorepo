use bytemuck;
use crate::assets::glyph::{Vertex, build_x_oriented_glyph, build_y_oriented_glyph, build_z_oriented_glyph};

pub struct VertexData {
    pub verticies: Vec<Vertex>,
    pub indicies: Vec<u16>,
}

impl VertexData {
    pub fn get_verticies(&self) -> &[Vertex] {
        &self.verticies
    }

    pub fn get_indicies(&self) -> &[u16] {
        &self.indicies
    }

    pub fn new() -> VertexData {
        let mut verticies: Vec<Vertex> = Vec::new();
        let mut indicies: Vec<u16> = Vec::new();
        let (x_verticies, x_indicies) = build_x_oriented_glyph(0.9, -0.9, -1.0, -1.0, 0.01, &[1.0, 0.0, 0.0]);
        verticies.extend(x_verticies);
        indicies.extend(x_indicies);

        let (y_verticies, y_indicies) = build_y_oriented_glyph(0.9,-0.9, -1.0, -1.0, 0.01, &[0.0, 1.0, 0.0]);

        let offset = verticies.len() as u16;
        verticies.extend(y_verticies);
        indicies.extend(y_indicies.iter().map(|x| x + offset));

        let (z_verticies, z_indicies) = build_z_oriented_glyph(0.0,1.0 , -1.0, -1.0, 0.21, &[1.0, 0.0, 1.0]);
        verticies.extend(z_verticies);
        let offset = verticies.len() as u16;
        indicies.extend(z_indicies.iter().map(|x| x + offset));


        VertexData {
            verticies,
            indicies,
        }
    }
}
