use crate::assets::shape_vertex::ShapeVertex;
fn create_cylinder_normals() -> Vec<[f32; 3]> {
    vec![
        [0.0, 0.0, 0.0],
        [-0.0000, 1.0000, -0.0000],
        [-0.0000, -1.0000, -0.0000],
        [-0.0000, -0.0000, -1.0000],
        [0.1951, -0.0000, -0.9808],
        [0.3827, -0.0000, -0.9239],
        [0.5556, -0.0000, -0.8315],
        [0.7071, -0.0000, -0.7071],
        [0.8315, -0.0000, -0.5556],
        [0.9239, -0.0000, -0.3827],
        [0.9808, -0.0000, -0.1951],
        [1.0000, -0.0000, -0.0000],
        [0.9808, -0.0000, 0.1951],
        [0.9239, -0.0000, 0.3827],
        [0.8315, -0.0000, 0.5556],
        [0.7071, -0.0000, 0.7071],
        [0.5556, -0.0000, 0.8315],
        [0.3827, -0.0000, 0.9239],
        [0.1951, -0.0000, 0.9808],
        [-0.0000, -0.0000, 1.0000],
        [-0.1951, -0.0000, 0.9808],
        [-0.3827, -0.0000, 0.9239],
        [-0.5556, -0.0000, 0.8315],
        [-0.7071, -0.0000, 0.7071],
        [-0.8315, -0.0000, 0.5556],
        [-0.9239, -0.0000, 0.3827],
        [-0.9808, -0.0000, 0.1951],
        [-1.0000, -0.0000, -0.0000],
        [-0.9808, -0.0000, -0.1951],
        [-0.9239, -0.0000, -0.3827],
        [-0.8315, -0.0000, -0.5556],
        [-0.7071, -0.0000, -0.7071],
        [-0.5556, -0.0000, -0.8315],
        [-0.3827, -0.0000, -0.9239],
        [-0.1951, -0.0000, -0.9808],
    ]
}

fn create_normal_indices() -> Vec<usize> {
    vec![
        1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        3, 4, 3, 4, 5, 4, 5, 6, 5, 6, 7, 6, 7, 8, 7, 8, 9, 8, 9, 10, 9, 10, 11, 10, 11, 12, 11, 12,
        13, 12, 13, 14, 13, 14, 15, 14, 15, 16, 15, 16, 17, 16, 17, 18, 17, 18, 19, 18, 19, 20, 19,
        20, 21, 20, 21, 22, 21, 22, 23, 22, 23, 24, 23, 24, 25, 24, 25, 26, 25, 26, 27, 26, 27, 28,
        27, 28, 29, 28, 29, 30, 29, 30, 31, 30, 31, 32, 31, 32, 33, 32, 33, 34, 33, 34, 3, 34, 3,
        4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12,
        13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20,
        20, 21, 21, 21, 22, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25, 26, 26, 26, 27, 27, 27, 28,
        28, 28, 29, 29, 29, 30, 30, 30, 31, 31, 31, 32, 32, 32, 33, 33, 33, 34, 34, 34, 3, 3,
    ]
}

// Define a function to create the vertices of the cylinder
fn create_cylinder_vertices(height: f32, radius: f32) -> Vec<[f32; 3]> {
    let base_vertexes: Vec<[f32; 3]> = vec![
        //I am importing this from Blender from .obj format.
        //indexing is 1 based not 0 based so I am adding
        //a dummy vertex instead of updating the indexes.
        [0.0, 0.0, 0.0],
        //These are the sides of our cone.
        [0.000000, 0.000000, -0.500000],
        [0.000000, 1.000000, -0.500000],
        [0.097545, 0.000000, -0.490393],
        [0.097545, 1.000000, -0.490393],
        [0.191342, 0.000000, -0.461940],
        [0.191342, 1.000000, -0.461940],
        [0.277785, 0.000000, -0.415735],
        [0.277785, 1.000000, -0.415735],
        [0.353553, 0.000000, -0.353553],
        [0.353553, 1.000000, -0.353553],
        [0.415735, 0.000000, -0.277785],
        [0.415735, 1.000000, -0.277785],
        [0.461940, 0.000000, -0.191342],
        [0.461940, 1.000000, -0.191342],
        [0.490393, 0.000000, -0.097545],
        [0.490393, 1.000000, -0.097545],
        [0.500000, 0.000000, 0.000000],
        [0.500000, 1.000000, 0.000000],
        [0.490393, 0.000000, 0.097545],
        [0.490393, 1.000000, 0.097545],
        [0.461940, 0.000000, 0.191342],
        [0.461940, 1.000000, 0.191342],
        [0.415735, 0.000000, 0.277785],
        [0.415735, 1.000000, 0.277785],
        [0.353553, 0.000000, 0.353553],
        [0.353553, 1.000000, 0.353553],
        [0.277785, 0.000000, 0.415735],
        [0.277785, 1.000000, 0.415735],
        [0.191342, 0.000000, 0.461940],
        [0.191342, 1.000000, 0.461940],
        [0.097545, 0.000000, 0.490393],
        [0.097545, 1.000000, 0.490393],
        [-0.000000, 0.000000, 0.500000],
        [-0.000000, 1.000000, 0.500000],
        [-0.097545, 0.000000, 0.490393],
        [-0.097545, 1.000000, 0.490393],
        [-0.191342, 0.000000, 0.461940],
        [-0.191342, 1.000000, 0.461940],
        [-0.277785, 0.000000, 0.415735],
        [-0.277785, 1.000000, 0.415735],
        [-0.353554, 0.000000, 0.353553],
        [-0.353554, 1.000000, 0.353553],
        [-0.415735, 0.000000, 0.277785],
        [-0.415735, 1.000000, 0.277785],
        [-0.461940, 0.000000, 0.191341],
        [-0.461940, 1.000000, 0.191341],
        [-0.490393, 0.000000, 0.097545],
        [-0.490393, 1.000000, 0.097545],
        [-0.500000, 0.000000, -0.000000],
        [-0.500000, 1.000000, -0.000000],
        [-0.490393, 0.000000, -0.097546],
        [-0.490393, 1.000000, -0.097546],
        [-0.461940, 0.000000, -0.191342],
        [-0.461940, 1.000000, -0.191342],
        [-0.415734, 0.000000, -0.277786],
        [-0.415734, 1.000000, -0.277786],
        [-0.353553, 0.000000, -0.353554],
        [-0.353553, 1.000000, -0.353554],
        [-0.277784, 0.000000, -0.415735],
        [-0.277784, 1.000000, -0.415735],
        [-0.191341, 0.000000, -0.461940],
        [-0.191341, 1.000000, -0.461940],
        [-0.097544, 0.000000, -0.490393],
        [-0.097544, 1.000000, -0.490393],
        [0.000000, 0.000000, -0.500000],
        [0.000000, 1.000000, -0.500000],
        [0.097545, 0.000000, -0.490393],
        [0.097545, 1.000000, -0.490393],
        [0.191342, 0.000000, -0.461940],
        [0.191342, 1.000000, -0.461940],
        [0.277785, 0.000000, -0.415735],
        [0.277785, 1.000000, -0.415735],
        [0.353553, 0.000000, -0.353553],
        [0.353553, 1.000000, -0.353553],
        [0.415735, 0.000000, -0.277785],
        [0.415735, 1.000000, -0.277785],
        [0.461940, 0.000000, -0.191342],
        [0.461940, 1.000000, -0.191342],
        [0.490393, 0.000000, -0.097545],
        [0.490393, 1.000000, -0.097545],
        [0.500000, 0.000000, 0.000000],
        [0.500000, 1.000000, 0.000000],
        [0.490393, 0.000000, 0.097545],
        [0.490393, 1.000000, 0.097545],
        [0.461940, 0.000000, 0.191342],
        [0.461940, 1.000000, 0.191342],
        [0.415735, 0.000000, 0.277785],
        [0.415735, 1.000000, 0.277785],
        [0.353553, 0.000000, 0.353553],
        [0.353553, 1.000000, 0.353553],
        [0.277785, 0.000000, 0.415735],
        [0.277785, 1.000000, 0.415735],
        [0.191342, 0.000000, 0.461940],
        [0.191342, 1.000000, 0.461940],
        [0.097545, 0.000000, 0.490393],
        [0.097545, 1.000000, 0.490393],
        [-0.000000, 0.000000, 0.500000],
        [-0.000000, 1.000000, 0.500000],
        [-0.097545, 0.000000, 0.490393],
        [-0.097545, 1.000000, 0.490393],
        [-0.191342, 0.000000, 0.461940],
        [-0.191342, 1.000000, 0.461940],
        [-0.277785, 0.000000, 0.415735],
        [-0.277785, 1.000000, 0.415735],
        [-0.353554, 0.000000, 0.353553],
        [-0.353554, 1.000000, 0.353553],
        [-0.415735, 0.000000, 0.277785],
        [-0.415735, 1.000000, 0.277785],
        [-0.461940, 0.000000, 0.191341],
        [-0.461940, 1.000000, 0.191341],
        [-0.490393, 0.000000, 0.097545],
        [-0.490393, 1.000000, 0.097545],
        [-0.500000, 0.000000, -0.000000],
        [-0.500000, 1.000000, -0.000000],
        [-0.490393, 0.000000, -0.097546],
        [-0.490393, 1.000000, -0.097546],
        [-0.461940, 0.000000, -0.191342],
        [-0.461940, 1.000000, -0.191342],
        [-0.415734, 0.000000, -0.277786],
        [-0.415734, 1.000000, -0.277786],
        [-0.353553, 0.000000, -0.353554],
        [-0.353553, 1.000000, -0.353554],
        [-0.277784, 0.000000, -0.415735],
        [-0.277784, 1.000000, -0.415735],
        [-0.191341, 0.000000, -0.461940],
        [-0.191341, 1.000000, -0.461940],
        [-0.097544, 0.000000, -0.490393],
        [-0.097544, 1.000000, -0.490393],
    ];
    let mut vertices: Vec<[f32; 3]> = Vec::new();
    //our radius is .5 so we need to adjust our scale.
    let x_z_scale = 0.5 / radius;
    //Our height is 1, so we need to adjust our height
    let y_scale = 1.0 / height;
    for vertex in base_vertexes.iter() {
        vertices.push([
            vertex[0] / x_z_scale,
            vertex[1] / y_scale,
            vertex[2] / x_z_scale,
        ]);
    }
    vertices
}

/// Creates the indices for the sides and caps of the cylinder.
/// Like the vertexes, I am brining these in from Blender.
/// since it is a small set that will not change, I am not
/// going to bother with a function to load them.  This will
/// make wasm integration simpler.
fn create_cylinder_indices() -> Vec<usize> {
    vec![
        38, 22, 54, 31, 47, 15, 6, 4, 2, 2, 64, 6, 62, 60, 58, 58, 56, 54, 54, 52, 50, 50, 48, 54,
        46, 44, 38, 42, 40, 38, 38, 36, 34, 34, 32, 30, 30, 28, 26, 26, 24, 22, 22, 20, 18, 18, 16,
        22, 14, 12, 10, 10, 8, 6, 6, 64, 62, 62, 58, 6, 54, 48, 46, 44, 42, 38, 38, 34, 22, 30, 26,
        22, 22, 16, 14, 14, 10, 22, 6, 58, 54, 54, 46, 38, 34, 30, 22, 22, 10, 6, 6, 54, 22, 63, 1,
        3, 3, 5, 7, 7, 9, 11, 11, 13, 7, 15, 17, 19, 19, 21, 15, 23, 25, 31, 27, 29, 31, 31, 33,
        35, 35, 37, 39, 39, 41, 43, 43, 45, 47, 47, 49, 51, 51, 53, 55, 55, 57, 63, 59, 61, 63, 63,
        3, 15, 7, 13, 15, 15, 21, 23, 25, 27, 31, 31, 35, 47, 39, 43, 47, 47, 51, 63, 57, 59, 63,
        3, 7, 15, 15, 23, 31, 35, 39, 47, 51, 55, 63, 63, 15, 47, 66, 67, 65, 68, 69, 67, 70, 71,
        69, 72, 73, 71, 74, 75, 73, 76, 77, 75, 78, 79, 77, 80, 81, 79, 82, 83, 81, 84, 85, 83, 86,
        87, 85, 88, 89, 87, 90, 91, 89, 92, 93, 91, 94, 95, 93, 96, 97, 95, 98, 99, 97, 100, 101,
        99, 102, 103, 101, 104, 105, 103, 106, 107, 105, 108, 109, 107, 110, 111, 109, 112, 113,
        111, 114, 115, 113, 116, 117, 115, 118, 119, 117, 120, 121, 119, 122, 123, 121, 124, 125,
        123, 126, 127, 125, 128, 65, 127, 66, 68, 67, 68, 70, 69, 70, 72, 71, 72, 74, 73, 74, 76,
        75, 76, 78, 77, 78, 80, 79, 80, 82, 81, 82, 84, 83, 84, 86, 85, 86, 88, 87, 88, 90, 89, 90,
        92, 91, 92, 94, 93, 94, 96, 95, 96, 98, 97, 98, 100, 99, 100, 102, 101, 102, 104, 103, 104,
        106, 105, 106, 108, 107, 108, 110, 109, 110, 112, 111, 112, 114, 113, 114, 116, 115, 116,
        118, 117, 118, 120, 119, 120, 122, 121, 122, 124, 123, 124, 126, 125, 126, 128, 127, 128,
        66, 65,
    ]
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
pub fn create_cylinder(height: f32, radius: f32) -> Vec<ShapeVertex> {
    let vertices = create_cylinder_vertices(height, radius);
    let indices = create_cylinder_indices();

    let normal_vertices = create_cylinder_normals();
    let normal_indices = create_normal_indices();

    reconcile_shape_vertices(vertices, indices, normal_vertices, normal_indices)
}
