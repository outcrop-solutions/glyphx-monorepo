// Vertex shader

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
    let pos = vec3(model.position.x + camera.x_offset, model.position.y + camera.y_offset, model.position.z + camera.z_offset);
    let normal = vec3(model.normal.x, model.normal.y, model.normal.z);
    out.color_code = model.color_code;
    out.world_position = pos;

    //rotate our normals
    let rotation_matrix = mat3x3<f32>(camera.view_proj[0].xyz, camera.view_proj[1].xyz, camera.view_proj[2].xyz);
    let normal_v4 = vec4<f32>(model.normal, 0.0);
    let rotated_normal = normalize(model.normal * rotation_matrix);
    out.world_normal = rotated_normal.xyz;

    out.clip_position = camera.view_proj * vec4<f32>(pos, 1.0);
    return out;
}

const SPECULAR_TINT: vec3<f32> = vec3<f32>(0.9, 0.95, 1.0);
const SPECULAR_EXPONENT: f32 = 32.0;

// Calculate lighting for a single light position
fn calculate_lighting(light_pos: vec3<f32>, in: VertexOutput, camera: CameraUniform, light: LightUniform) -> vec3<f32> {
    let light_dir = normalize(light_pos - in.world_position);
    let view_dir = normalize(camera.view_pos.xyz - in.world_position);
    let half_dir = normalize(view_dir + light_dir);

    let diffuse_strength = max(dot(in.world_normal, light_dir), 0.0);
    let diffuse_color = light.light_color * diffuse_strength;

    let specular_strength = pow(max(dot(in.world_normal, half_dir), 0.0), SPECULAR_EXPONENT);
    let specular_color = specular_strength * light.light_color * SPECULAR_TINT;

    return diffuse_color + specular_color;
}

fn get_lights(light_pos: vec3<f32>) -> array<vec3<f32>, 4> {
    return array<vec3<f32>, 4>(
        light_pos,
        vec3<f32>(-light_pos.x, light_pos.y, light_pos.z),
        vec3<f32>(light_pos.x, light_pos.y, -light_pos.z),
        vec3<f32>(-light_pos.x, light_pos.y, -light_pos.z)
    );
}
// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let color = color_table_buffer.color_table[in.color_code];
    let ambient_color = light.light_color * light.light_intensity;

    let lights = get_lights(light.light_pos);

    var result = ambient_color;
    result = result + calculate_lighting(lights[0], in, camera, light);
    result = result + calculate_lighting(lights[1], in, camera, light);
    result = result + calculate_lighting(lights[2], in, camera, light);
    result = result + calculate_lighting(lights[3], in, camera, light);
    result = result * color.xyz;

    return vec4<f32>(result, 1.0);

}
 
