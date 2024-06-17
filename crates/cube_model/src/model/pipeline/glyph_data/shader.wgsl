// Compute shader

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

struct VertexData {
    position: array<f32, 3>,
    normal: array<f32, 3>,
    color_code: u32,
};

struct InstanceInput {
    glyph_id: u32,
    x_value: f32,
    y_value: f32,
    z_value: f32,
    flags: u32,
};

struct InstanceOutput {
    glyph_id: u32,
    vertex_data: VertexData,

};


@group(0) @binding(0) 
var<storage> vertex_buffer: array<VertexData>; 

@group(1) @binding(0)
var<storage> instance_buffer: array<InstanceInput>;

@group(2) @binding(0)
var<uniform> glyph_uniform_data: GlyphUniformData;
 
@group(3) @binding(0)
var<storage, read_write> instance_output_buffer: array<InstanceOutput>;

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
    let workgroups_x = num_workgroups.x;
    let workgroups_y = num_workgroups.y;

    //Get our vector sizes
    let size_of_x = arrayLength(&vertex_buffer);
    let size_of_y = arrayLength(&instance_buffer);

    //calculate the index
    let index_x = workgroup_id.x * workgroup_size + local_id.x;
    let index_y = workgroup_id.y; // * workgroup_size + local_id.y;

    if index_x >= size_of_x || index_y >= size_of_y {
        return;
    }

    let min_x = glyph_uniform_data.min_interp_x;
    let max_x = glyph_uniform_data.max_interp_x;
    let instance = instance_buffer[index_y];
    let model = vertex_buffer[index_x];
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
        y_vec = interp_value; //y_vec - distance + glyph_uniform_data.min_glyph_height;
        y_offset = distance;
    }

    let color = floor(linear_interpolation(
        instance.y_value,
        glyph_uniform_data.min_y,
        glyph_uniform_data.max_y,
        f32(0.0),
        f32(60.0),
    ));

    var out_index = index_y * size_of_x + index_x;
    var out_data: InstanceOutput;
    out_data.glyph_id = instance.glyph_id;
    var vertex_data: VertexData;
    vertex_data.position = array<f32, 3>(x_pos, y_vec, z_pos);
    vertex_data.normal = array<f32,3>(model.normal[0], model.normal[1], model.normal[2]);
    vertex_data.color_code = u32(color);
    out_data.vertex_data = vertex_data;
    instance_output_buffer[out_index] = out_data;
}

