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
    @location(2) @interpolate(flat) color_code: u32,
    @location(3) @interpolate(flat) flags: u32,
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

    //rotate our normals
    let rotation_matrix = mat3x3<f32>(camera.view_proj[0].xyz, camera.view_proj[1].xyz, camera.view_proj[2].xyz);
    let normal_v4 = vec4<f32>(model.normal, 0.0);
    let rotated_normal = normalize(model.normal * rotation_matrix);
    out.world_normal = rotated_normal.xyz;

    out.color_code = color;
    out.clip_position = camera.view_proj * vec4<f32>(out.world_position[0], out.world_position[1], out.world_position[2], 1.0);
    out.flags = model.flags;
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
    var alpha = 1.0;
    var color = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    if in.flags == 0u {
        alpha = 0.15;
	if in.color_code > 60u {
	    let color_code = in.color_code - 60u;
	    color = color_table_buffer.color_table[color_code];
	} else {
	    color = color_table_buffer.color_table[in.color_code];
	}
	return vec4<f32>(color.xyz, alpha);
    }


    if in.color_code > 60u {
	//For our second material (the edges) the compute shader is adding 
	//60 to it so that we know we need to adjust the shading.
        let color_code = in.color_code - 60u;
        //color = color_table_buffer.color_table[color_code];
        color = vec4<f32>(0.0, 0.0, 0.0, 1.0);
        alpha = 0.25;
    } else {
        color = color_table_buffer.color_table[in.color_code];
    }

    let ambient_color = light.light_color * light.light_intensity;

    let lights = get_lights(light.light_pos);

    var result = ambient_color;
    result = result + calculate_lighting(lights[0], in, camera, light);
    result = result + calculate_lighting(lights[1], in, camera, light);
    result = result + calculate_lighting(lights[2], in, camera, light);
    result = result + calculate_lighting(lights[3], in, camera, light);
    result = result * color.xyz;

    return vec4<f32>(result, alpha);
//return color;
}
 
