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
    flags: u32,
    padding: u32,
};

struct VertexData {
    position: array<f32, 3>,
    normal: array<f32, 3>,
    color_code: u32,
};

struct InstanceInput {
    glyph_id: u32,
    x_value: f32,
    x_rank: u32,
    y_value: f32,
    z_value: f32,
    z_rank: u32,
    flags: u32,
    padding: array<u32,5>,
};

struct InstanceOutput {
    glyph_id: u32,
    vertex_data: VertexData,
    x_rank: u32,
    z_rank: u32,
    x_id: u32,
    z_id: u32,
    flags: u32,

};

struct Flags {
	x_log: bool,
	x_desc: bool,
	y_log: bool,
	y_desc: bool,
	z_log: bool,
	z_desc: bool,
};


@group(0) @binding(0) 
var<storage> vertex_buffer: array<VertexData>; 

@group(1) @binding(0)
var<storage> instance_buffer: array<InstanceInput>;

@group(2) @binding(0)
var<uniform> glyph_uniform_data: GlyphUniformData;
 
@group(3) @binding(0)
var<storage, read_write> instance_output_buffer: array<InstanceOutput>;

fn parse_flags(flags: u32) -> Flags {
    var res: Flags;
    res.x_log = ((flags >> 31u) & 1u) != 0u;
    res.x_desc = ((flags >> 30u) & 1u) != 0u;
    res.y_log = ((flags >> 23u) & 1u) != 0u;
    res.y_desc = ((flags >> 22u) & 1u) != 0u;
    res.z_log = ((flags >> 15u) & 1u) != 0u;
    res.z_desc = ((flags >> 14u) & 1u) != 0u;
    return res;
}

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
fn log_interpolation(
    data_value: f32,
    min_data_value: f32,
    max_data_value: f32,
    min_interpolated_value: f32,
    max_interpolated_value: f32
) -> f32 {
    // Handle edge case
    if (min_data_value == max_data_value) {
        return max_interpolated_value;
    }

    // Calculate logarithmic values
    let log_data_value = log(data_value);
    let log_min_data_value = log(min_data_value);
    let log_max_data_value = log(max_data_value);

    // Ensure the result falls within the interpolation range
    var res = linear_interpolation(
        log_data_value,
        log_min_data_value,
        log_max_data_value,
        min_interpolated_value,
        max_interpolated_value
    );

    // Clamp the result within the interpolated value range
    res = clamp(res, min_interpolated_value, max_interpolated_value);

    return res;
}

fn interpolate_value( is_log: bool, is_desc: bool, 
    data_value: f32,
    min_data_value: f32,
    max_data_value: f32,
    min_interpolated_value: f32,
    max_interpolated_value: f32
) -> f32 {
     var min =  min_data_value ;
     var max =  max_data_value ;
     if is_desc {
	min = max_data_value;
	max = min_data_value;
     }
     if is_log {
	 return log_interpolation(
	     data_value,
	     min,
	     max,
	     min_interpolated_value,
	     max_interpolated_value,
	 );
     } else {
	 return linear_interpolation(
	     data_value,
	     min,
	     max,
	     min_interpolated_value,
	     max_interpolated_value,
	 );
     }
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
    let flags = parse_flags(glyph_uniform_data.flags);

    let instance = instance_buffer[index_y];
    let model = vertex_buffer[index_x];
    let interp_x = interpolate_value(
	flags.x_log,
	flags.x_desc,
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

    let interp_z = interpolate_value(
        flags.z_log,
	flags.z_desc,
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
        let interp_value = interpolate_value(
	    flags.y_log,
	    flags.y_desc,
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

    let color = floor(interpolate_value(
	flags.y_log,
	flags.y_desc,
        instance.y_value,
        glyph_uniform_data.min_y,
        glyph_uniform_data.max_y,
        f32(0.0),
        f32(60.0),
    ));

    var out_index = index_y * size_of_x + index_x;
    var out_data: InstanceOutput;
    out_data.glyph_id = instance.glyph_id;
    out_data.x_rank = instance.x_rank;
    out_data.z_rank = instance.z_rank;
    out_data.x_id = index_x;
    out_data.z_id = index_y;
    out_data.flags = instance.flags;
    var vertex_data: VertexData;
    vertex_data.position = array<f32, 3>(x_pos, y_vec, z_pos);
    vertex_data.normal = array<f32,3>(model.normal[0], model.normal[1], model.normal[2]);
    vertex_data.color_code = u32(color);
    out_data.vertex_data = vertex_data;
    instance_output_buffer[out_index] = out_data;
}

