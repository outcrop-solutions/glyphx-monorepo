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
    x_y_offset: f32,
    z_offset: f32,
    _padding: vec2<u32>,
};

@group(2) @binding(0)
var<uniform> glyph_uniform_data: GlyphUniformData;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) color_code: u32,
};

struct InstanceInput {
    @location(2) glyph_id: u32,
    @location(3) x_value: f32,
    @location(4) y_value: f32,
    @location(5) z_value: f32,
    @location(6) flags: u32,
};


struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) position: vec3<f32>,
    @location(1) color_code: u32,
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
    let x_pos = linear_interpolation(
        instance.x_value,
        glyph_uniform_data.min_x,
        glyph_uniform_data.max_x,
        min_x,
        max_x,
    ) - min_x + glyph_uniform_data.x_y_offset - f32(4.8);

    let min_y = glyph_uniform_data.min_interp_y;
    let max_y = glyph_uniform_data.max_interp_y;
    let y_pos = linear_interpolation(
        instance.y_value,
        glyph_uniform_data.min_y,
        glyph_uniform_data.max_y,
        min_y,
        max_y,
    ) - min_y + glyph_uniform_data.x_y_offset - f32(4.8);

    let min_z = glyph_uniform_data.min_interp_z;
    let max_z = glyph_uniform_data.max_interp_z;
    //Z is pined to -1 and scaled
    var z_vec = model.position[2];
    if z_vec > min_z {
        let z_pos = linear_interpolation(
            instance.z_value,
            glyph_uniform_data.min_z,
            glyph_uniform_data.max_z,
            min_z,
            max_z,
        );
        z_vec = z_pos;
    }

    z_vec = z_vec + glyph_uniform_data.z_offset;
    let color = floor(linear_interpolation(
        instance.z_value,
        glyph_uniform_data.min_z,
        glyph_uniform_data.max_z,
        f32(0.0),
        f32(60.0),
    ));
    var out: VertexOutput;
    out.position = vec3<f32>(model.position[0] + x_pos, model.position[1] + y_pos, z_vec);
    out.color_code = u32(color);
    //out.clip_position = camera.view_proj * vec4<f32>(out.position[0], out.position[1], out.position[2], 1.0);
    out.clip_position = camera.view_proj * vec4<f32>(out.position[1], out.position[2], out.position[0], 1.0);
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
   // return vec4<f32>(0.0,0.0,0.0, 1.0);
    let color = color_table_buffer.color_table[in.color_code];
    return vec4<f32>(color);
}
 
