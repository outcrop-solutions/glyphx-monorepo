struct VertexInput {
    @location(0) key: f32,
    @location(1) position: vec3<f32>,
    //Even though color is included in the buffer, we don't need it here.  We can add it when we reconcile the buffers on the cpu side.
    
};



struct VertexOutput {
     @location(0) key: f32,
     @location(1) vertexes: array<vec3<f32>>,
     @location(2) indexes: array<u32>,
};

@compute
@workgroup_size(1)
fn main(glyph: VertexInput) -> VertexOutput {
	var out: VertexOutput;
	out.key = glyph.key;
	
}
