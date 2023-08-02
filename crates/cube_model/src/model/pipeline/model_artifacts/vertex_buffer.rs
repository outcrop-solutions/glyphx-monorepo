use crate::assets::color::build_color_table;
use crate::assets::glyph::{
    build_x_oriented_glyph, build_y_oriented_glyph, build_z_oriented_glyph, Vertex,
};
use bytemuck;
use rand::Rng;

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
        let (x_verticies, x_indicies) =
            build_x_oriented_glyph(-1.0, 1.0, -1.0, -1.0, 0.01, &[1.0, 0.0, 0.0]);
        verticies.extend(x_verticies);
        indicies.extend(x_indicies);

        let (y_verticies, y_indicies) =
            build_y_oriented_glyph(-1.0, 1.0, -1.0, -1.0, 0.01, &[0.0, 1.0, 0.0]);

        let offset = verticies.len() as u16;
        verticies.extend(y_verticies);
        indicies.extend(y_indicies.iter().map(|x| x + offset));

        let (z_verticies, z_indicies) =
            build_z_oriented_glyph(-1.0, -0.3, -1.0, -1.0, 0.01, &[0.0, 0.0, 1.0]);
        let offset = verticies.len() as u16;
        verticies.extend(z_verticies);
        indicies.extend(z_indicies.iter().map(|x| x + offset));

        let color_table = build_color_table([0.0, 255.0, 255.0, 1.0], [255.0, 0.0, 0.0, 1.0], 60);
        let mut x = -0.9;
        let glyph_off = 0.1;
        let glyph_size = 0.015;

        let mut rng = rand::thread_rng();
        while x <= 1.0 {
            let mut y = -0.9;
            while y <= 1.0 {
                let random_number: f32 = rng.gen_range(0.0..=0.6);
                let mapped_number: f32 = -1.0 + random_number * 0.7; // Map [0, 0.7] to [-1, -0.3]
                let color = color_table[(random_number*100.0).floor() as usize];
                let (z_verticies, z_indicies) = build_z_oriented_glyph(
                    -1.0,
                    mapped_number as f32,
                    x,
                    y,
                    glyph_size,
                    &[color[0], color[1], color[2]],
                );
                let offset = verticies.len() as u16;
                verticies.extend(z_verticies);
                indicies.extend(z_indicies.iter().map(|x| x + offset));
                y += glyph_off;
            }
            x += glyph_off;
        }
        VertexData {
            verticies,
            indicies,
        }
    }
}
