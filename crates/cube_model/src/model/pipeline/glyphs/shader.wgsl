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

struct GlyphUniformData {
    min_x: f32,
    max_x: f32,
    min_interp_x: f32,
    max_interp_x: f32,
    //y values
    min_y: f32,
    max_y: f32,
    min_interp_y: f32,
    max_interp_y: f32,
    //z values
    min_z: f32,
    max_z: f32,
    min_interp_z: f32,
    max_interp_z: f32,
    //other values
    x_z_offset: f32,
    min_glyph_height: f32,
    flags: u32,
    padding: u32,
};

struct Flags {
	x_log: bool,
	x_desc: bool,
	y_log: bool,
	y_desc: bool,
	z_log: bool,
	z_desc: bool,
	flip_color: bool,
	glyphs_selected: bool,
};

@group(0) @binding(0) 
var<uniform> camera: CameraUniform;


@group(1) @binding(0) 
var<uniform> color_table_buffer: ColorTable; 

@group(2) @binding(0)
var<uniform> light: LightUniform;

@group(3) @binding(0)
var<uniform> glyph_uniform_data: GlyphUniformData;

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

fn parse_flags(flags: u32) -> Flags {
    var res: Flags;
    res.x_log = ((flags >> 31u) & 1u) != 0u;
    res.x_desc = ((flags >> 30u) & 1u) != 0u;
    res.y_log = ((flags >> 23u) & 1u) != 0u;
    res.y_desc = ((flags >> 22u) & 1u) != 0u;
    res.z_log = ((flags >> 15u) & 1u) != 0u;
    res.z_desc = ((flags >> 14u) & 1u) != 0u;
    res.flip_color = ((flags >> 7u) & 1u) != 0u;
    res.glyphs_selected = ((flags >> 6u) & 1u) != 0u;
    return res;
}

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
    let normal_v4 = vec4<f32>(model.normal, 0.0);
    let rotated_normal = camera.view_proj * normal_v4;
    out.world_normal = vec3<f32>(rotated_normal.x, rotated_normal.y, rotated_normal.z);

    out.color_code = color;
    out.clip_position = camera.view_proj * vec4<f32>(out.world_position[0], out.world_position[1], out.world_position[2], 1.0);
    out.flags = model.flags; 
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    var alpha = 1.0;
    if ( in.flags != 1u) {
    	alpha = 0.15;
    }
    let color = color_table_buffer.color_table[in.color_code];
    let ambient_strength = light.light_intensity;
    let ambient_color = light.light_color * ambient_strength;

    let light_dir = normalize( light.light_pos - in.world_position);
    let view_dir = normalize(camera.view_pos.xyz - in.world_position);
    let half_dir = reflect(-light_dir, in.world_position);

    let diffuse_strength = max(dot(in.world_normal, light_dir), 0.0);
    let diffuse_color = light.light_color * diffuse_strength;

    let specular_strength = pow(max(dot(in.world_normal, half_dir), 0.0), 32.0);
    let specular_color = specular_strength * light.light_color;

    //A second light
    let light_dir2 = normalize(vec3<f32>(-2.0, -8.0, -8.0) - in.world_position);
    let view_dir2 = normalize(camera.view_pos.xyz - in.world_position);
    let half_dir2 = reflect(-light_dir2, in.world_position);

    let diffuse_strength2 = max(dot(in.world_normal, light_dir2), 0.0);
    let diffuse_color2 = light.light_color * diffuse_strength2;

    let specular_strength2 = pow(max(dot(in.world_normal, half_dir2), 0.0), 32.0);
    let specular_color2 = specular_strength2 * light.light_color;
	

    let result = (ambient_color + diffuse_color +  specular_color+ specular_color2) * color.xyz;
    //TODO: The light needs some work as it relates to the glyphs.  It is making them all yellow
    return vec4<f32>(result, alpha);
    //return vec4<f32>(color[0], color[1], color[2], alpha);
}
 
