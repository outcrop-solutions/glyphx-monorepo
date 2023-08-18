use crate::assets::shape_vertex::ShapeVertex;
/// This function will create our cone verticies.  
/// I have chosen to include the model by hand into this function
/// instead of loading the mesh from a .obj file.  The reason I am
/// doing this is to reduce the complexity of having to load the
/// mesh in wasm.  If it is already in the code then we do have nothing
/// to load and the number of vertexes is not that large
fn create_cone_normal_vertices() -> Vec<[f32; 3]> {
    let mut base_normals = vec![
        [0.0, 0.0, 0.0],
        [-0.0000, -0.5033, -0.8641],
        [-0.0000, 1.0000, -0.0000],
        [0.1685, -0.5033, -0.8475],
        [0.3306, -0.5033, -0.7984],
        [0.4800, -0.5033, -0.7185],
        [0.6110, -0.5033, -0.6110],
        [0.7185, -0.5033, -0.4800],
        [0.7984, -0.5033, -0.3306],
        [0.8475, -0.5033, -0.1685],
        [0.8641, -0.5033, -0.0000],
        [0.8475, -0.5033, 0.1685],
        [0.7984, -0.5033, 0.3306],
        [0.7185, -0.5033, 0.4800],
        [0.6110, -0.5033, 0.6110],
        [0.4800, -0.5033, 0.7185],
        [0.3306, -0.5033, 0.7984],
        [0.1685, -0.5033, 0.8475],
        [-0.0000, -0.5033, 0.8641],
        [-0.1685, -0.5033, 0.8475],
        [-0.3306, -0.5033, 0.7984],
        [-0.4800, -0.5033, 0.7185],
        [-0.6110, -0.5033, 0.6111],
        [-0.7185, -0.5033, 0.4800],
        [-0.7984, -0.5033, 0.3306],
        [-0.8475, -0.5033, 0.1685],
        [-0.8641, -0.5033, -0.0000],
        [-0.8475, -0.5033, -0.1685],
        [-0.7984, -0.5033, -0.3306],
        [-0.7185, -0.5033, -0.4800],
        [-0.6110, -0.5033, -0.6110],
        [-0.4800, -0.5033, -0.7185],
        [-0.3306, -0.5033, -0.7984],
        [-0.1685, -0.5033, -0.8475],
        [-0.0000, -1.0000, -0.0000],
    ];
    base_normals
}

fn create_normal_indices() -> Vec<usize> {
    vec![
        1, 2, 3, 3, 2, 4, 4, 2, 5, 5, 2, 6, 6, 2, 7, 7, 2, 8, 8, 2, 9, 9, 2, 10, 1, 2, 11, 1, 2,
        12, 1, 2, 13, 1, 2, 14, 1, 2, 15, 1, 2, 16, 1, 2, 17, 1, 2, 18, 1, 2, 19, 1, 2, 20, 2, 2,
        21, 2, 2, 22, 2, 2, 23, 2, 2, 24, 2, 2, 25, 2, 2, 26, 2, 2, 27, 2, 2, 28, 2, 2, 29, 2, 2,
        30, 3, 2, 31, 3, 2, 32, 3, 2, 33, 3, 2, 1, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3,
        34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3,
        34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3,
        34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34, 3, 3, 34,
    ]
}
fn create_cone_vertices(height: f32, radius: f32) -> Vec<[f32; 3]> {
    let base_vertices = vec![
        [0.0, 0.0, 0.0],
        [0.000000, 0.000000, -0.500000],
        [0.097545, 0.000000, -0.490393],
        [0.191342, 0.000000, -0.461940],
        [0.277785, 0.000000, -0.415735],
        [0.353553, 0.000000, -0.353553],
        [0.415735, 0.000000, -0.277785],
        [0.461940, 0.000000, -0.191342],
        [0.490393, 0.000000, -0.097545],
        [0.500000, 0.000000, 0.000000],
        [0.000000, 1.000000, 0.000000],
        [0.490393, 0.000000, 0.097545],
        [0.461940, 0.000000, 0.191342],
        [0.415735, 0.000000, 0.277785],
        [0.353553, 0.000000, 0.353553],
        [0.277785, 0.000000, 0.415735],
        [0.191342, 0.000000, 0.461940],
        [0.097545, 0.000000, 0.490393],
        [-0.000000, 0.000000, 0.500000],
        [-0.097545, 0.000000, 0.490393],
        [-0.191342, 0.000000, 0.461940],
        [-0.277785, 0.000000, 0.415735],
        [-0.353554, 0.000000, 0.353553],
        [-0.415735, 0.000000, 0.277785],
        [-0.461940, 0.000000, 0.191341],
        [-0.490393, 0.000000, 0.097545],
        [-0.500000, 0.000000, -0.000000],
        [-0.490393, 0.000000, -0.097546],
        [-0.461940, 0.000000, -0.191342],
        [-0.415734, 0.000000, -0.277786],
        [-0.353553, 0.000000, -0.353554],
        [-0.277784, 0.000000, -0.415735],
        [-0.191341, 0.000000, -0.461940],
        [-0.097544, 0.000000, -0.490393],
    ];
    let x_z_scale = 0.5 / radius;
    let height_scale = 1.0 / height;
    let mut vertices: Vec<[f32; 3]> = Vec::new();
    let mut i = 0;
    while i < base_vertices.len() {
        let vertex = base_vertices[i];
        if i != 10 {
            vertices.push([vertex[0] / x_z_scale, vertex[1], vertex[2] / x_z_scale]);
        } else {
            vertices.push([vertex[0], vertex[1]/ height_scale, vertex[2] ]);
        }
        i += 1;
    }

    vertices
}

///These indicies are hand imported from the model that was created in blender
fn create_cone_indices() -> Vec<usize> {
    let indices: Vec<usize> = vec![
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

fn reconcile_shape_vertices(
    vertices: Vec<[f32; 3]>,
    indices: Vec<usize>,
    normal_vertices: Vec<[f32; 3]>,
    normal_indices: Vec<usize>,
) -> Vec<ShapeVertex> {
    let mut shape_vertices: Vec<ShapeVertex> = Vec::new();
    let mut i = 0;
    while i < indices.len() {
        let index = indices[i];
        let vertex = vertices[index];
        let normal_index = normal_indices[i];
        let normal_vertex = normal_vertices[normal_index];
        shape_vertices.push(ShapeVertex {
            position_vertex: vertex,
            normal: normal_vertex,
            color: 0,
        });
        i += 1;
    }
    shape_vertices
}
pub fn create_cone(height: f32, radius: f32) -> Vec<ShapeVertex> {
    let vertices = create_cone_vertices(height, radius);
    let indices = create_cone_indices();

    let normal_vertices = create_cone_normal_vertices();
    let normal_indices = create_normal_indices();

    reconcile_shape_vertices(vertices, indices, normal_vertices, normal_indices)
}
