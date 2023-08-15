use cgmath::{vec2, Vector2};
#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
pub struct Vertex {
    position: [f32; 3],
    color_code: u32,
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
                    offset: std::mem::size_of::<[f32;3]>() as wgpu::BufferAddress,
                    shader_location: 1,
                    format: wgpu::VertexFormat::Uint32,
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

fn remove_duplicate_verticies(vertexs: &Vec<cgmath::Vector3<f32>>, indexes: &mut Vec<u32> ) -> Vec<cgmath::Vector3<f32>>  {
  let mut vertex_number = 0;
  let mut new_vertexs: Vec<cgmath::Vector3<f32>> = Vec::new();
  let mut dup_vertextes: Vec<usize> = Vec::new();
  while vertex_number < vertexs.len() {
    let vertex = vertexs[vertex_number];
      if dup_vertextes.contains(&vertex_number) {
        vertex_number += 1;
        continue;
      }
    let mut sub_vertex_number = vertex_number + 1;
    while sub_vertex_number < vertexs.len() {

      let sub_vertex = vertexs[sub_vertex_number];
      if vertex == sub_vertex {
        dup_vertextes.push(sub_vertex_number);
        let mut index_number = 0;
        while index_number < indexes.len() {
          if indexes[index_number] == sub_vertex_number as u32 {
            indexes[index_number] = vertex_number as u32;
          } else if indexes[index_number] > sub_vertex_number as u32 {
            indexes[index_number] -= 1;
          }
          index_number += 1;
        }
      }
      sub_vertex_number += 1;
    }

    new_vertexs.push(vertex);
    vertex_number += 1;
  }

  new_vertexs
}

pub fn build_x_oriented_glyph(
    start_x: f32,
    end_x: f32,
    y_pos: f32,
    z_pos: f32,
    width: f32,
    color_code: u32,
) -> ([Vertex; 8], [u16; 36]) {
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

    let vertex_data = [
        Vertex {
            position: [start_x, y_pos, z_offset],
            color_code,
        }, //0
        Vertex {
            position: [end_x, y_pos, z_offset],
            color_code,
        }, //1
        Vertex {
            position: [end_x, y_offset, z_offset],
            color_code,
        }, //2
        Vertex {
            position: [start_x, y_offset, z_offset],
            color_code,
        }, //3
        Vertex {
            position: [start_x, y_offset, z_pos],
            color_code,
        }, //4
        Vertex {
            position: [end_x, y_offset, z_pos],
            color_code,
        }, //5
        Vertex {
            position: [end_x, y_pos, z_pos],
            color_code,
        }, //6
        Vertex {
            position: [start_x, y_pos, z_pos],
            color_code,
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

pub fn build_y_oriented_glyph(
    start_y: f32,
    end_y: f32,
    x_pos: f32,
    z_pos: f32,
    width: f32,
    color_code: u32,
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
            color_code,
        }, //0
        Vertex {
            position: [x_offset, start_y, z_offset],
            color_code,
        }, //1
        Vertex {
            position: [x_offset, end_y, z_offset],
            color_code,
        }, //2
        Vertex {
            position: [x_pos, end_y, z_offset],
            color_code,
        }, //3
        Vertex {
            position: [x_pos, end_y, z_pos],
            color_code,
        }, //4
        Vertex {
            position: [x_offset, end_y, z_pos],
            color_code,
        }, //5
        Vertex {
            position: [x_offset, start_y, z_pos],
            color_code,
        }, //6
        Vertex {
            position: [x_pos, start_y, z_pos],
            color_code,
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
    color_code: u32,
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
            color_code,
        }, //0
        Vertex {
            position: [x_offset, start_y, z_offset],
            color_code,
        }, //1
        Vertex {
            position: [x_offset, end_y, z_offset],
            color_code,
        }, //2
        Vertex {
            position: [x_pos, end_y, z_offset],
            color_code,
        }, //3
        // bottom (0, 0, -1)
        Vertex {
            position: [x_pos, end_y, z_pos],
            color_code,
        }, //4
        Vertex {
            position: [x_offset, end_y, z_pos],
            color_code,
        }, //5
        Vertex {
            position: [x_offset, start_y, z_pos],
            color_code,
        }, //6
        Vertex {
            position: [x_pos, start_y, z_pos],
            color_code,
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

#[cfg(test)]
pub mod remove_duplicate_verticies {
    use super::*;
    #[test]
    fn removes_duplicates() {
        let vertex_buffer = vec![cgmath::Vector3::new(0.0, 0.0, 0.0), cgmath::Vector3::new(0.0, 0.0, 0.0), cgmath::Vector3::new(0.0, 0.0, 1.0)];
        let mut index_buffer = vec![0, 1, 2];
        let clean_vertexes = remove_duplicate_verticies(&vertex_buffer, &mut index_buffer);
        assert_eq!(clean_vertexes.len(), 2);
        assert_eq!(index_buffer.len(), 3);
        assert_eq!(clean_vertexes[0], cgmath::Vector3::new(0.0, 0.0, 0.0));
        assert_eq!(clean_vertexes[1], cgmath::Vector3::new(0.0, 0.0, 1.0));
        assert_eq!(index_buffer[0], 0);
        assert_eq!(index_buffer[1], 0);
        assert_eq!(index_buffer[2], 1);
    }
}
