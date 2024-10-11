// Vertex shader -- since we are using a compute shader to caluclate 
// the values of the verticies, all we really need to do in this 
// shader is apply, the camera, color, lighting and glyph selection
// effects. Filtering, interpolation, direction etc are handled by 
// the compute shader

struct CameraUniform {
    view_pos: vec4<f32>,
    view_proj: mat4x4<f32>,
    y_offset: f32,
    x_offset: f32,
    z_offset: f32,
};

@group(0) @binding(0) 
var<uniform> camera: CameraUniform;

struct VertexInput {
    @location(0) glyph_id: u32,
    @location(1) position: vec3<f32>,
    @location(2) normal: vec3<f32>,
    @location(3) color_code: u32,
    @location(4) x_rank: u32,
    @location(5) z_rank: u32,
    @location(6) flags: u32,
};


struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_position: vec3<f32>,
    @location(1) @interpolate(flat) glyph_id: u32,
};


@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    let x_pos = model.position[0];
    let y_pos = model.position[1];
    let z_pos = model.position[2];
    var out: VertexOutput;
    out.glyph_id = model.glyph_id;
    //apply our perspective camera
    out.world_position = vec3<f32>(x_pos + camera.x_offset, y_pos + camera.y_offset, z_pos + camera.z_offset);


    out.clip_position = camera.view_proj * vec4<f32>(out.world_position[0], out.world_position[1], out.world_position[2], 1.0);
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
     let color = vec4<f32>(
        f32(in.glyph_id & 0xFFu) / 255.0,       // Red channel
        f32((in.glyph_id >> 8u) & 0xFFu) / 255.0, // Green channel
        f32((in.glyph_id >> 16u) & 0xFFu) / 255.0, // Blue channel
        1.0
    ); 
    return color;
}
 
