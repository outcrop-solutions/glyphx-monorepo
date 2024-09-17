use crate::assets::shape_vertex::ShapeVertex;

fn create_normal_vertices() -> Vec<[f32; 3]> {
    vec![
        [0.0, 0.0, 0.0],
        [0.2591, -0.7359, -0.6255],
        [0.5436, -0.6395, -0.5436],
        [0.7063, 0.0487, -0.7063],
        [0.2965, 0.6321, -0.7159],
        [0.3998, 0.8248, -0.3998],
        [0.6255, -0.7359, -0.2591],
        [0.7688, -0.6395, -0.0000],
        [0.9988, 0.0487, -0.0000],
        [0.7159, 0.6321, -0.2965],
        [0.5654, 0.8248, -0.0000],
        [0.6255, -0.7359, 0.2591],
        [0.5436, -0.6395, 0.5436],
        [0.7063, 0.0487, 0.7063],
        [0.7159, 0.6321, 0.2965],
        [0.3998, 0.8248, 0.3998],
        [0.2591, -0.7359, 0.6255],
        [-0.0000, -0.6395, 0.7688],
        [-0.0000, 0.0487, 0.9988],
        [0.2965, 0.6321, 0.7159],
        [-0.0000, 0.8248, 0.5654],
        [-0.2591, -0.7359, 0.6255],
        [-0.5436, -0.6395, 0.5436],
        [-0.7063, 0.0487, 0.7063],
        [-0.2965, 0.6321, 0.7159],
        [-0.3998, 0.8248, 0.3998],
        [-0.6255, -0.7359, 0.2591],
        [-0.7688, -0.6395, -0.0000],
        [-0.9988, 0.0487, -0.0000],
        [-0.7159, 0.6321, 0.2965],
        [-0.5654, 0.8248, -0.0000],
        [-0.6255, -0.7359, -0.2591],
        [-0.5436, -0.6395, -0.5436],
        [-0.7063, 0.0487, -0.7063],
        [-0.7159, 0.6321, -0.2965],
        [-0.3998, 0.8248, -0.3998],
        [-0.2591, -0.7359, -0.6255],
        [-0.0000, -0.6395, -0.7688],
        [-0.0000, 0.0487, -0.9988],
        [-0.2965, 0.6321, -0.7159],
        [-0.0000, 0.8248, -0.5654],
        [-0.0000, 1.0000, -0.0000],
    ]
}

fn create_normal_indices() -> Vec<u32> {
    vec![
        1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10,
        10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18,
        18, 18, 19, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25,
        26, 26, 26, 27, 27, 27, 28, 28, 28, 29, 29, 29, 30, 30, 30, 31, 31, 31, 32, 32, 32, 33, 33,
        33, 34, 34, 34, 35, 35, 35, 36, 36, 36, 37, 37, 37, 38, 38, 38, 39, 39, 39, 40, 40, 40, 41,
        41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41,
        1, 1, 1, 4, 4, 4, 6, 6, 6, 9, 9, 9, 11, 11, 11, 14, 14, 14, 16, 16, 16, 19, 19, 19, 21, 21,
        21, 24, 24, 24, 26, 26, 26, 29, 29, 29, 31, 31, 31, 34, 34, 34, 36, 36, 36, 39, 39, 39,
    ]
}
///Like other shapes, I am hardcoding the models in code directly to save us the hassle of
///publishing the models and fetching them with reqwest.  This function defines the verticies for a
///cube centered at 0, 0, 0.
fn create_shape_vertices(width: f32, height: f32) -> Vec<[f32; 3]> {
    let vertices = vec![
        //Don't forget our models indexes from
        //1 not 0
        [0.0, 0.0, 0.0],
        [0.000000, 0.040000, 0.000000],
        [0.000000, 0.690000, 0.000000],
        [0.000000, 0.270000, -0.270598],
        [0.191342, 0.500000, -0.461940],
        [0.000000, 0.595000, -0.457311],
        [0.132026, 0.690000, -0.318738],
        [0.191342, 0.270000, -0.191342],
        [0.461940, 0.500000, -0.191342],
        [0.323367, 0.595000, -0.323367],
        [0.318738, 0.690000, -0.132026],
        [0.270598, 0.270000, -0.000000],
        [0.461940, 0.500000, 0.191342],
        [0.457311, 0.595000, -0.000000],
        [0.318738, 0.690000, 0.132026],
        [0.191342, 0.270000, 0.191342],
        [0.191342, 0.500000, 0.461940],
        [0.323367, 0.595000, 0.323367],
        [0.132026, 0.690000, 0.318738],
        [0.000000, 0.270000, 0.270598],
        [-0.191342, 0.500000, 0.461940],
        [0.000000, 0.595000, 0.457311],
        [-0.132026, 0.690000, 0.318738],
        [-0.191342, 0.270000, 0.191342],
        [-0.461940, 0.500000, 0.191342],
        [-0.323367, 0.595000, 0.323367],
        [-0.318738, 0.690000, 0.132026],
        [-0.270598, 0.270000, 0.000000],
        [-0.461940, 0.500000, -0.191342],
        [-0.457311, 0.595000, 0.000000],
        [-0.318738, 0.690000, -0.132026],
        [-0.191342, 0.270000, -0.191342],
        [-0.191342, 0.500000, -0.461940],
        [-0.323367, 0.595000, -0.323367],
        [-0.132026, 0.690000, -0.318738],
    ];
    // let x_z_scale = width / 2.0;
    // let y_scale = height - 2.0;
    // let mut vertices = Vec::new();
    // for vertex in base_vertices {
    //     vertices.push([
    //         vertex[0] * x_z_scale,
    //         if vertex[1] >= 1.0 {
    //             vertex[1] + y_scale
    //         } else {
    //             vertex[1]
    //         },
    //         vertex[2] * x_z_scale,
    //     ]);
    // }
    vertices
}

///This function will return the indicies to draw a cube.  Like our other assets, this function
///will hardcode the index data to save us the hassle of publishing the models and fetching them
///from the web.
fn create_shape_indices() -> Vec<u32> {
    vec![
        7, 3, 4, 7, 4, 8, 8, 4, 9, 4, 6, 9, 9, 6, 10, 11, 7, 8, 11, 8, 12, 12, 8, 13, 8, 10, 13,
        13, 10, 14, 15, 11, 12, 15, 12, 16, 16, 12, 17, 12, 14, 17, 17, 14, 18, 19, 15, 16, 19, 16,
        20, 20, 16, 21, 16, 18, 21, 21, 18, 22, 23, 19, 20, 23, 20, 24, 24, 20, 25, 20, 22, 25, 25,
        22, 26, 27, 23, 24, 27, 24, 28, 28, 24, 29, 24, 26, 29, 29, 26, 30, 31, 27, 28, 31, 28, 32,
        32, 28, 33, 28, 30, 33, 33, 30, 34, 3, 31, 32, 3, 32, 4, 4, 32, 5, 32, 34, 5, 5, 34, 6, 2,
        6, 34, 6, 2, 10, 10, 2, 14, 14, 2, 18, 18, 2, 22, 22, 2, 26, 26, 2, 30, 30, 2, 34, 7, 1, 3,
        4, 5, 6, 11, 1, 7, 8, 9, 10, 15, 1, 11, 12, 13, 14, 19, 1, 15, 16, 17, 18, 23, 1, 19, 20,
        21, 22, 27, 1, 23, 24, 25, 26, 31, 1, 27, 28, 29, 30, 3, 1, 31, 32, 33, 34,
    ]
}

fn reconcile_shape_vertices(
    vertices: &Vec<[f32; 3]>,
    indices: &Vec<u32>,
    normals: &Vec<[f32; 3]>,
    normal_indices: &Vec<u32>,
) -> Vec<ShapeVertex> {
    let mut shape_vertices = Vec::new();
    let mut i = 0;
    while i < indices.len() {
        let vertex = vertices[indices[i] as usize];
        let normal = normals[normal_indices[i] as usize];
        shape_vertices.push(ShapeVertex {
            position_vertex: vertex,
            color: 0,
            normal,
        });
        i += 1;
    }
    shape_vertices
}

pub fn create_charm(width: f32, height: f32) -> Vec<ShapeVertex> {
    let vertices = create_shape_vertices(width, height);
    let indices = create_shape_indices();

    let normals = create_normal_vertices();
    let normal_indices = create_normal_indices();
    reconcile_shape_vertices(&vertices, &indices, &normals, &normal_indices)
}