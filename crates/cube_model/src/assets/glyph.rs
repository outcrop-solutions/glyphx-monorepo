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
pub fn build_x_oriented_glyph(
    start_x: f32,
    end_x: f32,
    y_pos: f32,
    z_pos: f32,
    width: f32,
    color: &[f32; 3],
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
            color: *color,
        }, //0
        Vertex {
            position: [end_x, y_pos, z_offset],
            color: *color,
        }, //1
        Vertex {
            position: [end_x, y_offset, z_offset],
            color: *color,
        }, //2
        Vertex {
            position: [start_x, y_offset, z_offset],
            color: *color,
        }, //3
        Vertex {
            position: [start_x, y_offset, z_pos],
            color: *color,
        }, //4
        Vertex {
            position: [end_x, y_offset, z_pos],
            color: *color,
        }, //5
        Vertex {
            position: [end_x, y_pos, z_pos],
            color: *color,
        }, //6
        Vertex {
            position: [start_x, y_pos, z_pos],
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
