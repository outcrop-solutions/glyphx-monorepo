/// This function will create our cone verticies.  
/// I have chosen to include the model by hand into this function
/// instead of loading the mesh from a .obj file.  The reason I am
/// doing this is to reduce the complexity of having to load the
/// mesh in wasm.  If it is already in the code then we do have nothing
/// to load and the number of vertexes is not that large
fn create_cone_vertices(height: f32, radius: f32) -> Vec<[f32; 3]> {
    let base_vertices = vec![
        [0.0, 0.0, 0.0],
        [0.000000, -0.500000, 0.000000],
        [0.097545, -0.490393, 0.000000],
        [0.191342, -0.461940, 0.000000],
        [0.277785, -0.415735, 0.000000],
        [0.353553, -0.353553, 0.000000],
        [0.415735, -0.277785, 0.000000],
        [0.461940, -0.191342, 0.000000],
        [0.490393, -0.097545, 0.000000],
        [0.500000, 0.000000, 0.000000],
        [0.000000, 0.000000, 1.000000],
        [0.490393, 0.097545, 0.000000],
        [0.461940, 0.191342, 0.000000],
        [0.415735, 0.277785, 0.000000],
        [0.353553, 0.353553, 0.000000],
        [0.277785, 0.415735, 0.000000],
        [0.191342, 0.461940, 0.000000],
        [0.097545, 0.490393, 0.000000],
        [-0.000000, 0.500000, 0.000000],
        [-0.097545, 0.490393, 0.000000],
        [-0.191342, 0.461940, 0.000000],
        [-0.277785, 0.415735, 0.000000],
        [-0.353554, 0.353553, 0.000000],
        [-0.415735, 0.277785, 0.000000],
        [-0.461940, 0.191341, 0.000000],
        [-0.490393, 0.097545, 0.000000],
        [-0.500000, -0.000000, 0.000000],
        [-0.490393, -0.097546, 0.000000],
        [-0.461940, -0.191342, 0.000000],
        [-0.415734, -0.277786, 0.000000],
        [-0.353553, -0.353554, 0.000000],
        [-0.277784, -0.415735, 0.000000],
        [-0.191341, -0.461940, 0.000000],
        [-0.097544, -0.490393, 0.000000],
    ];
    let x_y_scale = 0.5 / radius;
    let height_scale = 1.0 / height;
    let mut vertices: Vec<[f32; 3]> = Vec::new();
    let mut i = 0;
    while i < base_vertices.len() {
        let vertex = base_vertices[i];
        if i != 10 {
            vertices.push([vertex[0] / x_y_scale, vertex[1] / x_y_scale, vertex[2]]);
        } else {
            vertices.push([vertex[0], vertex[1], vertex[2] / height_scale]);
        }
        i += 1;
    }

    vertices
}

///These indicies are hand imported from the model that was created in blender
fn create_cone_indices() -> Vec<u32> {
    let indices: Vec<u32> = vec![
        1, 10, 2, 2, 10, 3, 3, 10, 4, 4, 10, 5, 5, 10, 6, 6, 10, 7, 7, 10, 8, 8, 10, 9, 9, 10, 11,
        11, 10, 12, 12, 10, 13, 13, 10, 14, 14, 10, 15, 15, 10, 16, 16, 10, 17, 17, 10, 18, 18, 10,
        19, 19, 10, 20, 20, 10, 21, 21, 10, 22, 22, 10, 23, 23, 10, 24, 24, 10, 25, 25, 10, 26, 26,
        10, 27, 27, 10, 28, 28, 10, 29, 29, 10, 30, 30, 10, 31, 31, 10, 32, 32, 10, 33, 33, 10, 1,
        17, 25, 8, 33, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 4, 8, 9, 11, 11, 12, 8, 13, 14, 17, 15, 16,
        17, 17, 18, 19, 19, 20, 21, 21, 22, 23, 23, 24, 25, 25, 26, 27, 27, 28, 29, 29, 30, 33, 31,
        32, 33, 33, 2, 8, 4, 7, 8, 8, 12, 13, 14, 15, 17, 17, 19, 25, 21, 23, 25, 25, 27, 33, 30,
        31, 33, 2, 4, 8, 8, 13, 17, 19, 21, 25, 27, 29, 33, 33, 8, 25,
    ];
    indices
}

pub fn create_cone(height: f32, radius: f32 ) -> (Vec<[f32; 3]>, Vec<u32>) {
    let vertices = create_cone_vertices(height, radius);
    let indices = create_cone_indices();

    (vertices, indices)
}
