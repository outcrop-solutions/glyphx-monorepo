// Vertex shader

struct CameraUniform {
    view_proj: mat4x4<f32>,
};

@group(0) @binding(0) 
var<uniform> camera: CameraUniform;

struct ColorTable {
    color_table: array<vec4<f32>, 64>,
};

@group(1) @binding(0) 
var<uniform> color_table_buffer: ColorTable; 

struct FieldUniformData {
	field_type: u32,
	field_min_value: f32,
	field_max_value: f32,
	padding: u32,
};

struct GlyphUniformData {
	x: FieldUniformData,
	y: FieldUniformData,
	z: FieldUniformData,
	min_x: f32,
	max_x: f32,
	min_y: f32,
	max_y: f32,
	min_z: f32,
	max_z: f32,
};

@group(2) @binding(0)
var<uniform> glyph_uniform_data: GlyphUniformData;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) color_code: u32,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) position: vec3<f32>,
    @location(1) color_code: u32,
};

@vertex
fn vs_main(
    model: VertexInput,
) -> VertexOutput {
    let min_x = glyph_uniform_data.min_x;
    var out: VertexOutput;
    out.position = model.position;
    out.color_code = model.color_code;
    out.clip_position = camera.view_proj * vec4<f32>(model.position, 1.0);
    return out;
}

// Fragment shader

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
   // return vec4<f32>(0.0,0.0,0.0, 1.0);
    let color = color_table_buffer.color_table[in.color_code];
    return vec4<f32>(color);
}
 
