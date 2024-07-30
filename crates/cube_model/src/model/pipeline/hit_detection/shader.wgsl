struct CameraUniform {
    view_pos: vec4<f32>,
    view_proj: mat4x4<f32>,
    y_offset: f32,
    x_offset: f32,
    z_offset: f32,
};

//Hits are in 2d space
struct HitUniform {
	x_pos: f32,
	y_pos: f32,
	_padding: vec2<f32>
}

struct InputData {
	verticies: array<array<f32,3>,3>, 
        glyph_id: u32,
	x_rank: u32,
	z_rank: u32,
}

struct OutputData {
     glyph_id: u32,
     x_rank: u32,
     z_rank: u32,
     is_selected: u32,
     vertex1_raw_x: f32,
     vertex1_raw_y: f32,
     vertex1_raw_z: f32,
     vertex1_raw_y_2d: f32,
     vertex1_raw_z_2d: f32,
     vertex1_raw_w_2d: f32,
     vertex1_y_2d: f32,
     vertex1_z_2d: f32,
     vertex1_2d: array<f32, 2>,
     vertex2_raw_x: f32,
     vertex2_raw_y: f32,
     vertex2_raw_z: f32,
     vertex2_raw_y_2d: f32,
     vertex2_raw_z_2d: f32,
     vertex2_y_2d: f32,
     vertex2_z_2d: f32,
     vertex2_2d: array<f32, 2>,
     vertex3_raw_x: f32,
     vertex3_raw_y: f32,
     vertex3_raw_z: f32,
     vertex3_raw_y_2d: f32,
     vertex3_raw_z_2d: f32,
     vertex3_y_2d: f32,
     vertex3_z_2d: f32,
     vertex3_2d: array<f32, 2>,
     hit_point_x: f32,
     hit_point_y: f32,
}

@group(0) @binding(0)
var<storage> input_buffer: array<InputData>;

@group(1) @binding(0)
var<uniform> hit_uniform_buffer : HitUniform;

@group(2) @binding(0) 
var<uniform> camera_uniform : CameraUniform;

@group(3) @binding(0) 
var<storage, read_write> output_buffer: array<OutputData>;

struct Vertex2d {
	raw: vec4<f32>,
	converted: vec3<f32>,
}

//This is not my own work I got it from Google Gemini: https://gemini.google.com/app/39b573bdda1a84c1
fn convert_3d_point_to_2d(input: vec4<f32>) -> Vertex2d {
    let ndc_coordinates = vec4<f32>(input.xy / input.w, input.z, input.w);

    //in range: 0.81
    var scale_factor = input.z / (input.x + input.z);
//    if ndc_coordinates.y < 0.0 {
//        scale_factor = 1.1;
//    }
    let depth_factor = 1.0;
    let aspect_ratio = 1500.0 / 1000.0;
    let x = (ndc_coordinates.x + 1.0) * 0.5 * 1500.0 * depth_factor;
    let y = (ndc_coordinates.y + 1.0) * 0.5 * 1000.0 * depth_factor;
    let converted_vertex = vec3<f32>(x, y, ndc_coordinates.z);
    var out_vertex: Vertex2d;
    out_vertex.raw = ndc_coordinates;
    out_vertex.converted = converted_vertex;
    return out_vertex;
}

struct Vertex3d {
	raw: vec3<f32>,
	converted: vec3<f32>,
	vertex2d: Vertex2d,
}
fn calculate_vertex_position(vertex: array<f32, 3>) -> Vertex3d {
    let out_vertex = vec3<f32>(vertex[0] + camera_uniform.x_offset, vertex[1] + camera_uniform.y_offset, vertex[2] + camera_uniform.z_offset);
    let out_clip_position = camera_uniform.view_proj * vec4<f32>(out_vertex[0], out_vertex[1], out_vertex[2], 1.0);
    let vertex2d = convert_3d_point_to_2d(out_clip_position);
    var output_vertex: Vertex3d;
    output_vertex.raw = out_vertex;
    output_vertex.converted = out_clip_position.xyz;
    output_vertex.vertex2d = vertex2d;
    return output_vertex;
}
//This uses a barycentric coordinate technique to determine whether or not our hit point is within the triangle.
//This is not my own work I got it from Google Gemini: https://gemini.google.com/app/39b573bdda1a84c1
fn is_point_in_triangle(point: vec2<f32>, input_vertex1_full: vec3<f32>, input_vertex2_full: vec3<f32>, input_vertex3_full: vec3<f32>) -> bool {
    let input_vertex1 = vec2<f32>(input_vertex1_full[0], input_vertex1_full[1]);
    let input_vertex2 = vec2<f32>(input_vertex2_full[0], input_vertex2_full[1]);
    let input_vertex3 = vec2<f32>(input_vertex3_full[0], input_vertex3_full[1]);
    let vertex0 = input_vertex2 - input_vertex1;
    let vertex1 = input_vertex3 - input_vertex1;
    let vertex2 = point - input_vertex1;

    let dot00 = dot(vertex0, vertex0);
    let dot01 = dot(vertex0, vertex1);
    let dot11 = dot(vertex1, vertex1);
    let dot20 = dot(vertex2, vertex0);
    let dot21 = dot(vertex2, vertex1);

    let inv_denom = 1.0 / (dot00 * dot11 - dot01 * dot01);
    let u = (dot11 * dot20 - dot01 * dot21) * inv_denom;
    let v = (dot00 * dot21 - dot01 * dot20) * inv_denom;

    return (u >= 0.0) && (v >= 0.0) && (u + v <= 1.0);
}


@compute 
@workgroup_size(16, 1)
fn main(
    @builtin(global_invocation_id) global_id: vec3<u32>,
    @builtin(num_workgroups) num_workgroups: vec3<u32>,
    @builtin(workgroup_id) workgroup_id: vec3<u32>,
    @builtin(local_invocation_id) local_id: vec3<u32>,
) {

    //Workgroup deminsions 
    let workgroup_size = 16u;  //u32
    let num_workgroups = num_workgroups.x;

    //Get our vector size
    let vector_size = arrayLength(&input_buffer);

    //calculate the index
    let index = workgroup_id.x * workgroup_size + local_id.x;

    let input_data = input_buffer[index];
     //Apply the camera to our vertexes to move them to their place in space
    let first_vertex_full = calculate_vertex_position(input_data.verticies[0]);
    let first_vertex = first_vertex_full.vertex2d.converted;
    let second_vertex_full = calculate_vertex_position(input_data.verticies[1]);
    let second_vertex = second_vertex_full.vertex2d.converted;
    let third_vertex_full = calculate_vertex_position(input_data.verticies[2]);
    let third_vertex = third_vertex_full.vertex2d.converted;

    let hit_point = vec2<f32>(hit_uniform_buffer.x_pos, hit_uniform_buffer.y_pos);

    let is_hitpoint_in_triangle = is_point_in_triangle(hit_point, first_vertex, second_vertex, third_vertex);
    var is_selected = 0u;
    if is_hitpoint_in_triangle == true {
        is_selected = 1u;
    }

    var out_data: OutputData;
    out_data.glyph_id = input_data.glyph_id;
    out_data.x_rank = input_data.x_rank;
    out_data.z_rank = input_data.z_rank;
    out_data.is_selected = is_selected;
     //Firsy vertex
    out_data.vertex1_raw_x = first_vertex_full.converted[0];
    out_data.vertex1_raw_y = first_vertex_full.converted[1];
    out_data.vertex1_raw_z = first_vertex_full.converted[2];
    out_data.vertex1_raw_y_2d = first_vertex_full.vertex2d.raw[1];
    out_data.vertex1_raw_z_2d = first_vertex_full.vertex2d.raw[2];
    out_data.vertex1_raw_w_2d = first_vertex_full.vertex2d.raw[3];
    out_data.vertex1_y_2d = first_vertex_full.vertex2d.converted[1];
    out_data.vertex1_z_2d = first_vertex_full.vertex2d.converted[2];
    out_data.vertex1_2d = array<f32, 2>(first_vertex_full.vertex2d.converted[0], first_vertex_full.vertex2d.converted[1]);
     //Second vertex
    out_data.vertex2_raw_x = second_vertex_full.converted[0];
    out_data.vertex2_raw_y = second_vertex_full.converted[1];
    out_data.vertex2_raw_z = second_vertex_full.converted[2];
    out_data.vertex2_raw_y_2d = second_vertex_full.vertex2d.raw[1];
    out_data.vertex2_raw_z_2d = second_vertex_full.vertex2d.raw[2];
    out_data.vertex2_y_2d = second_vertex_full.vertex2d.converted[1];
    out_data.vertex2_z_2d = second_vertex_full.vertex2d.converted[2];
    out_data.vertex2_2d = array<f32, 2>(second_vertex_full.vertex2d.converted[0], second_vertex_full.vertex2d.converted[1]);
    //Third vertex
    out_data.vertex3_raw_x = third_vertex_full.converted[0];
    out_data.vertex3_raw_y = third_vertex_full.converted[1];
    out_data.vertex3_raw_z = third_vertex_full.converted[2];
    out_data.vertex3_raw_y_2d = third_vertex_full.vertex2d.raw[1];
    out_data.vertex3_raw_z_2d = third_vertex_full.vertex2d.raw[2];
    out_data.vertex3_y_2d = third_vertex_full.vertex2d.converted[1];
    out_data.vertex3_z_2d = third_vertex_full.vertex2d.converted[2];
    out_data.vertex3_2d = array<f32, 2>(third_vertex_full.vertex2d.converted[0], third_vertex_full.vertex2d.converted[1]);
    out_data.hit_point_x = hit_point.x;
    out_data.hit_point_y = hit_point.y;
    output_buffer[index] = out_data;
}
