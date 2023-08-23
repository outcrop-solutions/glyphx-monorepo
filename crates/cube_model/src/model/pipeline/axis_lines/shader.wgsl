// Vertex shader

struct CameraUniform {
    view_pos: vec4<f32>,
    view_proj: mat4x4<f32>,
};

@group(0) @binding(0) 
var<uniform> camera: CameraUniform;

struct ColorTable {
    color_table: array<vec4<f32>, 64>,
};

@group(1) @binding(0) 
var<uniform> color_table_buffer: ColorTable; 


struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) color_code: u32,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) color_code: u32,
};

@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    var out: VertexOutput;
    out.color_code = model.color_code;
    out.clip_position = camera.view_proj * vec4<f32>(model.position[1]- f32(4.8),  model.position[2], model.position[0] - f32(4.8) , 1.0);
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let color = color_table_buffer.color_table[in.color_code];
    return vec4<f32>(color);
    //return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
 
