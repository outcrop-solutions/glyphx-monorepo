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

struct LightUniform {
    light_pos: vec3<f32>,
    light_intensity: f32,
    light_color: vec3<f32>,
    _padding2: u32,
};
struct ColorTable {
    color_table: array<vec4<f32>, 64>,
};


@group(0) @binding(0) 
var<uniform> camera: CameraUniform;


@group(1) @binding(0) 
var<uniform> color_table_buffer: ColorTable; 

@group(2) @binding(0)
var<uniform> light: LightUniform;

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
    @location(1) world_normal: vec3<f32>,
    @location(2) color_code: u32,
    @location(3) flags: u32,
};


@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    let x_pos = model.position[0];
    let y_pos = model.position[1];
    let z_pos = model.position[2];
    let color = model.color_code;
    var out: VertexOutput;

    //apply our perspective camera
    out.world_position = vec3<f32>(x_pos + camera.x_offset, y_pos + camera.y_offset, z_pos + camera.z_offset);

    //move the normals based on instance buffer
    out.world_normal = vec3<f32>(model.normal);

    out.color_code = color;
    out.clip_position = camera.view_proj * vec4<f32>(out.world_position[0], out.world_position[1], out.world_position[2], 1.0);
    out.flags = model.flags;
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
   // return vec4<f32>(0.0,0.0,0.0, 1.0);
    let color = color_table_buffer.color_table[in.color_code];
    let ambient_strength = light.light_intensity;
    let ambient_color = light.light_color * ambient_strength;

    let light_dir = normalize(light.light_pos - in.world_position);
    let view_dir = normalize(camera.view_pos.xyz - in.world_position);
    let half_dir = normalize(view_dir + light_dir);

    let diffuse_strength = max(dot(in.world_normal, light_dir), 0.0);
    let diffuse_color = light.light_color * diffuse_strength;

    let specular_strength = pow(max(dot(in.world_normal, half_dir), 0.0), 32.0);
    let specular_color = specular_strength * light.light_color;

    let result = (ambient_color + diffuse_color + specular_color) * color.xyz;
    //TODO: The light needs some work as it relates to the glyphs.  It is making them all yellow
    //return vec4<f32>(result, 1.0);
    return vec4<f32>(color);
}
 
