use cgmath::{vec2, Vector2};
#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
pub struct Vertex {
    position: [f32; 3],
    color: [f32; 3],
}

impl Vertex {
    pub fn desc() -> wgpu::VertexBufferLayout<'static> {
        wgpu::VertexBufferLayout {
            array_stride: std::mem::size_of::<Vertex>() as wgpu::BufferAddress,
            step_mode: wgpu::VertexStepMode::Vertex,
            attributes: &[
                wgpu::VertexAttribute {
                    offset: 0,
                    shader_location: 0,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: std::mem::size_of::<[f32; 3]>() as wgpu::BufferAddress,
                    shader_location: 1,
                    format: wgpu::VertexFormat::Float32x3,
                },
            ],
        }
    }
}
/// A glyph is a 3D block that is used to represent vecotorized data in 3D space.
/// When translating a glyph in X,Y,Z space, the glyph will be built with triangles.
/// A simple glyph is drawn with 12 triangles made up of 8 verticies.  At higher resolutions
/// this is suboptimal as the glyph will appear to be pixelated.  To improve the resolution we
/// can subdivde the glyph into smaller blocks.  This is done by specifying the block_density
/// parameter and a layering strategy.  The layering strategy determines how the blocks are
/// arranged.  A layered strategy will subdivude the glyph along its long access and stack the
/// blocks evenly on it -- this is a good strategy for long thin glyphs. A cubic strategy will
/// subdivide the glyph into a cubic grid -- this is a good strategy for glyphs that are more
/// square.

pub fn build_long_plane(
    length_density: u16,
    width_density: u16,
    length: f32,
    width: f32,
) -> (Vec<Vector2<f32>>, Vec<u32>) {
    //width density is fixed
    //length denisty assumes the full width of the axis which is 2 (-1.0 to 1.0)
    //This plane is in 2D oriented around X,Y.  To keep our coordinate system consistent,
    //we will set our origin at -1.0, -1.0.  Later steps in the algorithm will translate
    //this origin to the actual x,y,z.

    let x_orig = -1.0;
    let x_end = x_orig + length;
    let y_orig = -1.0;
    let y_end = y_orig + width;

    let x_step_size = length / length_density as f32;
    let y_step_size = width / width_density as f32;

    let mut current_y_step = 0;
    let mut current_x_step = 0;
    let mut current_vertex_count: i64 = -1;

    let mut vertex_buffer: Vec<Vector2<f32>> = Vec::new();
    let mut index_buffer: Vec<u32> = Vec::new();

    while current_y_step <= width_density {
        let mut current_y = y_orig + (current_y_step as f32 * y_step_size);
        if current_y > y_end {
            current_y = y_end;
        }
        while current_x_step <= length_density {
            current_vertex_count += 1;
            let mut current_x = x_orig + (current_x_step as f32 * x_step_size);
            if current_x > x_end {
                current_x = x_end;
            }
            vertex_buffer.push(Vector2::new(current_x, current_y));
            if current_y_step > 0 {
                if current_x_step != 0 {
                    //The right edge or middle
                    index_buffer.push(current_vertex_count as u32 - 1);
                    index_buffer.push(current_vertex_count as u32);
                    index_buffer.push(current_vertex_count as u32 - (length_density as u32 + 1));
                }
                if current_x_step != length_density {
                    //The left edge or a middle
                    index_buffer.push(current_vertex_count as u32 - (length_density as u32 + 1));
                    index_buffer.push(current_vertex_count as u32);
                    index_buffer.push(current_vertex_count as u32 - length_density as u32);
                }
            }

            current_x_step += 1;
        }
        current_y_step += 1;
        current_x_step = 0;
    }
    (vertex_buffer, index_buffer)
}

pub fn build_end_plane(density: u16, width: f32) -> (Vec<Vector2<f32>>, Vec<u32>) {
    build_long_plane(density, density, width, width)
}
pub fn build_x_oriented_glyph(
    start_x: f32,
    end_x: f32,
    y_pos: f32,
    z_pos: f32,
    width: f32,
    color: &[f32; 3],
) -> (Vec<Vertex>, Vec<u32>) {
    const LENGTH_DENSITY:u16 = 4000;
    let (long_plane_vertex_buffer, long_plane_index_buffer) =
        build_long_plane(LENGTH_DENSITY, 10, end_x - start_x, width);
    let (end_plane_vertex_buffer, end_plane_index_buffer) = build_end_plane(1, width);

    let long_vertex_count = long_plane_vertex_buffer.len();
    let long_vertex_cull_trigger = long_vertex_count - LENGTH_DENSITY as usize;
    //four long sides plus 2 ends
    let vertex_size = (long_plane_index_buffer.len() * 4) + (end_plane_index_buffer.len() * 2);
    let index_size = (long_plane_index_buffer.len() * 4) + (end_plane_index_buffer.len() * 4);

    //These are a fixed size so we can preallocate.  One thing that we will want to look at is the
    //overlap of verticies -- there will be duplicates.  We can prune those out later.
    let mut vertex_buffer: Vec<cgmath::Vector3<f32>> = Vec::with_capacity(vertex_size);
    let mut index_buffer: Vec<u32> = Vec::with_capacity(index_size);

    //build the bottom -- x,y,z
    let x_offset = start_x - -1.0;
    let y_offset = y_pos - -1.0;
    for x_and_y in &long_plane_vertex_buffer {
        vertex_buffer.push(cgmath::Vector3::new(
            x_and_y.x + x_offset,
            x_and_y.y + y_offset,
            z_pos,
        ));
    }
    for index in &long_plane_index_buffer {
        index_buffer.push(*index);
    }

    //build the top x,y, z + width
    let z_offset = z_pos + width;
    let index_offset = vertex_buffer.len() as u32;
    let current_vertex_number = 0;
    for x_and_y in &long_plane_vertex_buffer {
        vertex_buffer.push(cgmath::Vector3::new(
            x_and_y.x + x_offset,
            x_and_y.y + y_offset,
            z_offset,
        ));
    }
    for index in &long_plane_index_buffer {
        index_buffer.push(index + index_offset);
    }

    //build the back x, y_pos, z=y
    let index_offset = vertex_buffer.len() as u32;
    for x_and_y in &long_plane_vertex_buffer {
        vertex_buffer.push(cgmath::Vector3::new(
            x_and_y.x + x_offset,
            y_pos,
            x_and_y.y + z_offset,
        ));
    }
    for index in &long_plane_index_buffer {
        index_buffer.push(*index + index_offset);
    }

    //build the front x, y_pos, z=y
    let y_offset = y_pos + width;
    let index_offset = vertex_buffer.len() as u32;
    for x_and_y in &long_plane_vertex_buffer {
        vertex_buffer.push(cgmath::Vector3::new(
            x_and_y.x + x_offset,
            y_offset,
            x_and_y.y + z_offset,
        ));
    }
    for index in &long_plane_index_buffer {
        index_buffer.push(*index + index_offset);
    }

    //build the left
    let index_offset = vertex_buffer.len() as u32;
    for x_and_y in &end_plane_vertex_buffer {
        vertex_buffer.push(cgmath::Vector3::new(
            start_x,
            x_and_y.x + y_offset,
            x_and_y.y + z_offset,
        ));
    }
    for index in &end_plane_index_buffer {
        index_buffer.push(*index + index_offset);
    }

    //build the right
    let index_offset = vertex_buffer.len() as u32;
    for x_and_y in &end_plane_vertex_buffer {
        vertex_buffer.push(cgmath::Vector3::new(
            end_x,
            x_and_y.x + y_offset,
            x_and_y.y + z_offset,
        ));
    }
    for index in &end_plane_index_buffer {
        index_buffer.push(*index + index_offset);
    }
    //This enumeration is temporary until I get the color buffer stoodup
    let mut vertex_data: Vec<Vertex> = Vec::with_capacity(vertex_buffer.len());
    for vertex in vertex_buffer {
        vertex_data.push(Vertex {
            position: [vertex.x, vertex.y, vertex.z],
            color: *color,
        });
    }

    let y_offset = if y_pos < 0.0 {
        y_pos + width
    } else {
        y_pos - width
    };
    let z_offset = if z_pos < 0.0 {
        z_pos + width
    } else {
        z_pos - width
    };

    (vertex_data, index_buffer)
}

pub fn build_y_oriented_glyph(
    start_y: f32,
    end_y: f32,
    x_pos: f32,
    z_pos: f32,
    width: f32,
    color: &[f32; 3],
) -> ([Vertex; 8], [u16; 36]) {
    let x_offset = if x_pos < 0.0 {
        x_pos + width
    } else {
        x_pos - width
    };
    let z_offset = if z_pos < 0.0 {
        z_pos + width
    } else {
        z_pos - width
    };

    let vertex_data = [
        Vertex {
            position: [x_pos, start_y, z_offset],
            color: *color,
        }, //0
        Vertex {
            position: [x_offset, start_y, z_offset],
            color: *color,
        }, //1
        Vertex {
            position: [x_offset, end_y, z_offset],
            color: *color,
        }, //2
        Vertex {
            position: [x_pos, end_y, z_offset],
            color: *color,
        }, //3
        Vertex {
            position: [x_pos, end_y, z_pos],
            color: *color,
        }, //4
        Vertex {
            position: [x_offset, end_y, z_pos],
            color: *color,
        }, //5
        Vertex {
            position: [x_offset, start_y, z_pos],
            color: *color,
        }, //6
        Vertex {
            position: [x_pos, start_y, z_pos],
            color: *color,
        }, //7
    ];

    let index_data: [u16; 36] = [
        0, 1, 2, 2, 3, 0, // top
        4, 5, 6, 6, 7, 4, // bottom
        6, 5, 2, 2, 1, 6, // right
        0, 3, 4, 4, 7, 0, // left
        5, 4, 3, 3, 2, 5, // front
        1, 0, 7, 7, 6, 1, // back
    ];

    (vertex_data, index_data)
}

pub fn build_z_oriented_glyph(
    z_pos: f32,
    z_offset: f32,
    x_pos: f32,
    start_y: f32,
    width: f32,
    color: &[f32; 3],
) -> ([Vertex; 8], [u16; 36]) {
    let x_offset = if x_pos < 0.0 {
        x_pos + width
    } else {
        x_pos - width
    };
    let end_y = if start_y < 0.0 {
        start_y + width
    } else {
        start_y - width
    };

    //I know that there is overlap with these verticies, but I can't figure out why when I combine
    //some of them it causes the glyph to not render correctly.  Take for instance, vertex 12. It
    //is the same as 1, but if I change 12 to one then the left side does not render correctly.  So
    //for now, we will just do things long hand
    let vertex_data = [
        // top (0, 0, 1)
        Vertex {
            position: [x_pos, start_y, z_offset],
            color: *color,
        }, //0
        Vertex {
            position: [x_offset, start_y, z_offset],
            color: *color,
        }, //1
        Vertex {
            position: [x_offset, end_y, z_offset],
            color: *color,
        }, //2
        Vertex {
            position: [x_pos, end_y, z_offset],
            color: *color,
        }, //3
        // bottom (0, 0, -1)
        Vertex {
            position: [x_pos, end_y, z_pos],
            color: *color,
        }, //4
        Vertex {
            position: [x_offset, end_y, z_pos],
            color: *color,
        }, //5
        Vertex {
            position: [x_offset, start_y, z_pos],
            color: *color,
        }, //6
        Vertex {
            position: [x_pos, start_y, z_pos],
            color: *color,
        }, //7
    ];

    let index_data: [u16; 36] = [
        0, 1, 2, 2, 3, 0, // top
        4, 5, 6, 6, 7, 4, // bottom
        6, 5, 2, 2, 1, 6, // right
        0, 3, 4, 4, 7, 0, // left
        5, 4, 3, 3, 2, 5, // front
        1, 0, 7, 7, 6, 1, // back
    ];

    (vertex_data, index_data)
}

#[cfg(test)]
pub mod build_long_plane {
    use super::*;
    #[test]
    fn build_1_by_1() {
        let (vertex_buffer, index_buffer) = build_long_plane(1, 1, 2.0, 2.0);
        assert_eq!(vertex_buffer.len(), 4);
        assert_eq!(index_buffer.len(), 6);
        assert_eq!(vertex_buffer[0], vec2(-1.0, -1.0));
        assert_eq!(vertex_buffer[1], vec2(1.0, -1.0));
        assert_eq!(vertex_buffer[2], vec2(-1.0, 1.0));
        assert_eq!(vertex_buffer[3], vec2(1.0, 1.0));
        assert_eq!(index_buffer[0], 0);
        assert_eq!(index_buffer[1], 2);
        assert_eq!(index_buffer[2], 1);
        assert_eq!(index_buffer[3], 2);
        assert_eq!(index_buffer[4], 3);
        assert_eq!(index_buffer[5], 1);
    }
    #[test]
    fn build_2_by_1() {
        let (vertex_buffer, index_buffer) = build_long_plane(2, 1, 2.0, 2.0);
        assert_eq!(vertex_buffer.len(), 6);
        assert_eq!(index_buffer.len(), 12);
        assert_eq!(vertex_buffer[0], vec2(-1.0, -1.0));
        assert_eq!(vertex_buffer[1], vec2(0.0, -1.0));
        assert_eq!(vertex_buffer[2], vec2(1.0, -1.0));
        assert_eq!(vertex_buffer[3], vec2(-1.0, 1.0));
        assert_eq!(vertex_buffer[4], vec2(0.0, 1.0));
        assert_eq!(vertex_buffer[5], vec2(1.0, 1.0));
        //Our first square
        assert_eq!(index_buffer[0], 0);
        assert_eq!(index_buffer[1], 3);
        assert_eq!(index_buffer[2], 1);
        assert_eq!(index_buffer[3], 3);
        assert_eq!(index_buffer[4], 4);
        assert_eq!(index_buffer[5], 1);
        //Our second square
        assert_eq!(index_buffer[6], 1);
        assert_eq!(index_buffer[7], 4);
        assert_eq!(index_buffer[8], 2);
        assert_eq!(index_buffer[9], 4);
        assert_eq!(index_buffer[10], 5);
        assert_eq!(index_buffer[11], 2);
    }

    #[test]
    fn build_2_by_2() {
        let (vertex_buffer, index_buffer) = build_long_plane(2, 2, 2.0, 2.0);
        assert_eq!(vertex_buffer.len(), 9);
        assert_eq!(index_buffer.len(), 24);
        //Our first square
        assert_eq!(vertex_buffer[0], vec2(-1.0, -1.0));
        assert_eq!(vertex_buffer[1], vec2(0.0, -1.0));
        assert_eq!(vertex_buffer[2], vec2(1.0, -1.0));
        assert_eq!(vertex_buffer[3], vec2(-1.0, 0.0));
        assert_eq!(vertex_buffer[4], vec2(0.0, 0.0));
        assert_eq!(vertex_buffer[5], vec2(1.0, 0.0));
        assert_eq!(vertex_buffer[6], vec2(-1.0, 1.0));
        assert_eq!(vertex_buffer[7], vec2(0.0, 1.0));
        assert_eq!(vertex_buffer[8], vec2(1.0, 1.0));
        assert_eq!(index_buffer[0], 0);
        assert_eq!(index_buffer[1], 3);
        assert_eq!(index_buffer[2], 1);
        assert_eq!(index_buffer[3], 3);
        assert_eq!(index_buffer[4], 4);
        assert_eq!(index_buffer[5], 1);
        //Our second square
        assert_eq!(index_buffer[6], 1);
        assert_eq!(index_buffer[7], 4);
        assert_eq!(index_buffer[8], 2);
        assert_eq!(index_buffer[9], 4);
        assert_eq!(index_buffer[10], 5);
        assert_eq!(index_buffer[11], 2);
        //Our third square
        assert_eq!(index_buffer[12], 3);
        assert_eq!(index_buffer[13], 6);
        assert_eq!(index_buffer[14], 4);
        assert_eq!(index_buffer[15], 6);
        assert_eq!(index_buffer[16], 7);
        assert_eq!(index_buffer[17], 4);
        //Our fourth square
        assert_eq!(index_buffer[18], 4);
        assert_eq!(index_buffer[19], 7);
        assert_eq!(index_buffer[20], 5);
        assert_eq!(index_buffer[21], 7);
        assert_eq!(index_buffer[22], 8);
        assert_eq!(index_buffer[23], 5);
    }
}
