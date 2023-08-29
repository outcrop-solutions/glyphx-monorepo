// Vertex shader

struct CameraUniform {
    view_pos: vec4<f32>,
    view_proj: mat4x4<f32>,
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
    _padding: vec2<u32>,
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
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) color_code: u32,
};

struct InstanceInput {
    @location(3) glyph_id: u32,
    @location(4) x_value: f32,
    @location(5) y_value: f32,
    @location(6) z_value: f32,
    @location(7) flags: u32,
};


struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_position: vec3<f32>,
    @location(1) world_normal: vec3<f32>,
    @location(2) color_code: u32,
};

fn linear_interpolation(
    data_value: f32,
    min_data_value: f32,
    max_data_value: f32,
    min_interpolated_value: f32,
    max_interpolated_value: f32
) -> f32 {
    if min_data_value == max_data_value {
        return max_interpolated_value;
    }

    let res = min_interpolated_value + ((max_interpolated_value - min_interpolated_value) * (data_value - min_data_value)) / (max_data_value - min_data_value);

    return res;
}

@vertex
fn vs_main(
    model: VertexInput,
    instance: InstanceInput,
) -> VertexOutput {
    let min_x = glyph_uniform_data.min_interp_x;
    let max_x = glyph_uniform_data.max_interp_x;

    let interp_x = linear_interpolation(
	instance.x_value,
	glyph_uniform_data.min_x,
	glyph_uniform_data.max_x,
	min_x,
	max_x,
    );

    let distance_x = interp_x - min_x;
    let x_pos = model.position[0] + distance_x + glyph_uniform_data.x_z_offset; 
    let x_offset = x_pos - model.position[0];

    let min_z = glyph_uniform_data.min_interp_z;
    let max_z = glyph_uniform_data.max_interp_z;

    let interp_z = linear_interpolation(
        instance.z_value,
        glyph_uniform_data.min_z,
        glyph_uniform_data.max_z,
        min_z,
        max_z,
    );
     let distance_z = interp_z - min_z; 
     let z_pos = model.position[2] + distance_z + glyph_uniform_data.x_z_offset;
     let z_offset = z_pos - model.position[2];

    let min_y = glyph_uniform_data.min_interp_y;
    let max_y = glyph_uniform_data.max_interp_y;
    //y is pined to min_y and scaled
    var y_vec = model.position[1];
    var y_offset = 0.0;
    //Our inbound glyph should be the max size of the graph, but there will be some beveling on the 
    //bottom that we do not want to mess with.  We may need to use that as our midpoint and minimum size
    if y_vec > min_y {
        let interp_value = linear_interpolation(
            instance.y_value,
            glyph_uniform_data.min_y,
            glyph_uniform_data.max_y,
            min_y,
            max_y,
        );
        let distance = max_y - interp_value;
        y_vec = y_vec - distance + glyph_uniform_data.min_glyph_height;
        y_offset = distance;
    }

    let color = floor(linear_interpolation(
        instance.y_value,
        glyph_uniform_data.min_y,
        glyph_uniform_data.max_y,
        f32(0.0),
        f32(60.0),
    ));
    var out: VertexOutput;
    out.world_position = vec3<f32>(x_pos, y_vec, z_pos);
//move the normals based on instance buffer
    out.world_normal = vec3<f32>(model.normal);
    out.color_code = u32(floor(color));
    out.clip_position = camera.view_proj * vec4<f32>(out.world_position[0], out.world_position[1], out.world_position[2], 1.0);
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
   // return vec4<f32>(0.0,0.0,0.0, 1.0);
    let color = color_table_buffer.color_table[in.color_code];
    let ambient_strength = light.light_intensity;
    let ambient_color = light.light_color * ambient_strength;

    //return vec4<f32>(color);
    //return vec4<f32>(1.0, 0.0, 0.0, 1.0);
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
 
