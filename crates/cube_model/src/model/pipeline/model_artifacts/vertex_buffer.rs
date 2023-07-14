use bytemuck;

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
pub const VERTICES: &[Vertex] = &[
    // Front face
    Vertex {
        position: [-0.5, -0.5, 0.5],
        color: [1.0, 0.0, 0.0],
    }, // Vertex 0
    Vertex {
        position: [0.5, -0.5, 0.5],
        color: [1.0, 1.0, 0.0],
    }, // Vertex 1
    Vertex {
        position: [0.5, 0.5, 0.5],
        color: [1.0, 1.0, 1.0],
    }, // Vertex 2
    Vertex {
        position: [-0.5, 0.5, 0.5],
        color: [0.0, 0.0, 0.0],
    }, // Vertex 3
    // Back face
    Vertex {
        position: [-0.5, -0.5, -0.5],
        color: [1.0, 0.0, 0.0],
    }, // Vertex 4
    Vertex {
        position: [0.5, -0.5, -0.5],
        color: [1.0, 0.0, 0.0],
    }, // Vertex 5
    Vertex {
        position: [0.5, 0.5, -0.5],
        color: [1.0, 0.0, 0.0],
    }, // Vertex 6
    Vertex {
        position: [-0.5, 0.5, -0.5],
        color: [1.0, 0.0, 0.0],
    }, // Vertex 7
];

pub const INDICES: &[u16] = &[
    0, 1, 
    1, 2, 
    2, 3, 
    3, 0, 
    1, 5, 
    5, 6, 
    6, 2,  
    7, 6,  
    5, 4,  
    4, 0, 
    3, 7, 
    7, 4, 
];
