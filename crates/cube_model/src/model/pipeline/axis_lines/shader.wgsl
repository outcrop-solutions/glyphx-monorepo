// Vertex shader

struct CameraUniform {
    view_pos: vec4<f32>,
    view_proj: mat4x4<f32>,
};

struct LightUniform {
    light_pos: vec3<f32>,
    _padding: u32,
    light_color: vec3<f32>,
    _padding2: u32,
};
@group(0) @binding(0) 
var<uniform> camera: CameraUniform;

struct ColorTable {
    color_table: array<vec4<f32>, 64>,
};

@group(1) @binding(0) 
var<uniform> color_table_buffer: ColorTable; 

@group(2) @binding(0)
var<uniform> light: LightUniform;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) color_code: u32,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_position: vec3<f32>,
    @location(1) world_normal: vec3<f32>,
    @location(2) color_code: u32,
};

@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    var out: VertexOutput;
    out.color_code = model.color_code;
    out.world_position = model.position;
    out.world_normal = model.normal;

    //out.clip_position = camera.view_proj * vec4<f32>(model.position[0]- f32(4.8),  model.position[1] - f32(4.8), model.position[2], 1.0);
    //out.clip_position = camera.view_proj * vec4<f32>(model.position[1]- f32(4.8),  model.position[2], model.position[0] - f32(4.8) , 1.0);
    out.clip_position = camera.view_proj * vec4<f32>(model.position, 1.0);
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let color = color_table_buffer.color_table[in.color_code];
   // We don't need (or want) much ambient light, so 0.1 is fine
    let ambient_strength = 0.5;
    let ambient_color = light.light_color * ambient_strength;

    //return vec4<f32>(color);
    //return vec4<f32>(1.0, 0.0, 0.0, 1.0);
    let light_dir = normalize(light.light_pos- in.world_position);
    let view_dir = normalize(camera.view_pos.xyz - in.world_position);
    let half_dir = normalize(view_dir + light_dir);

    let diffuse_strength = max(dot(in.world_normal, light_dir), 0.0);
    let diffuse_color = light.light_color * diffuse_strength;

    let specular_strength = pow(max(dot(in.world_normal, half_dir), 0.0), 32.0);
    let specular_color = specular_strength * light.light_color;

    let result = (ambient_color + diffuse_color + specular_color) * color.xyz;

    return vec4<f32>(result, 1.0);
}
 
