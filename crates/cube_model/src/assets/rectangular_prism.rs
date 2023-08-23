use crate::assets::shape_vertex::ShapeVertex;

fn create_normal_vertices() -> Vec<[f32; 3]> {
    vec![
        [0.0, 0.0, 0.0],
        [-0.0000, -1.0000, -0.0000],
        [-0.0000, 1.0000, -0.0000],
        [0.7071, -0.0000, 0.7071],
        [-0.0000, -0.0000, 1.0000],
        [0.7071, -0.0000, -0.7071],
        [1.0000, -0.0000, -0.0000],
        [-0.7071, -0.0000, -0.7071],
        [-0.0000, -0.0000, -1.0000],
        [-0.7071, -0.0000, 0.7071],
        [-1.0000, -0.0000, -0.0000],
    ]
}

fn create_normal_indices() -> Vec<u32> {
    vec![
        1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10,
        10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10,
    ]
}
///Like other shapes, I am hardcoding the models in code directly to save us the hassle of
///publishing the models and fetching them with reqwest.  This function defines the verticies for a
///cube centered at 0, 0, 0.
fn create_rectangular_prism_vertices(width: f32, height: f32) -> Vec<[f32; 3]> {
    let base_vertices = vec![
        //Don't forget our models indexes from
        //1 not 0
        [0.0, 0.0, 0.0],
        [1.804095, 2.000000, 0.000000],
        [2.000000, 2.000000, 0.195905],
        [2.000000, 0.000000, 0.195905],
        [1.804095, 0.000000, 0.000000],
        [2.000000, 2.000000, 1.804095],
        [1.804095, 2.000000, 2.000000],
        [1.804095, 0.000000, 2.000000],
        [2.000000, 0.000000, 1.804095],
        [0.195905, 2.000000, 2.000000],
        [0.000000, 2.000000, 1.804095],
        [0.000000, 0.000000, 1.804095],
        [0.195905, 0.000000, 2.000000],
        [0.000000, 2.000000, 0.195905],
        [0.195905, 2.000000, 0.000000],
        [0.195905, 0.000000, 0.000000],
        [0.000000, 0.000000, -0.195905],
    ];
    let x_z_scale = width / 2.0;
    let y_scale = height - 2.0;
    let mut vertices = Vec::new();
    for vertex in base_vertices {
        vertices.push([
            vertex[0] * x_z_scale,
            if vertex[1] >= 1.0 {
                vertex[1] + y_scale
            } else {
                vertex[1]
            },
            vertex[2] * x_z_scale,
        ]);
    }
    vertices
}

///This function will return the indicies to draw a cube.  Like our other assets, this function
///will hardcode the index data to save us the hassle of publishing the models and fetching them
///from the web.
fn create_rectangular_prism_indices() -> Vec<u32> {
    vec![
        8, 4, 16, 10, 14, 2, 4, 2, 1, 1, 15, 4, 8, 6, 5, 5, 3, 8, 12, 10, 9, 9, 7, 12, 14, 16, 15,
        13, 11, 16, 16, 11, 12, 12, 7, 8, 8, 3, 4, 4, 15, 16, 16, 12, 8, 2, 5, 6, 6, 9, 10, 10, 13,
        14, 14, 1, 2, 2, 6, 10, 4, 3, 2, 1, 14, 15, 8, 7, 6, 5, 2, 3, 12, 11, 10, 9, 6, 7, 14, 13,
        16, 13, 10, 11,
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

pub fn create_rectangular_prism(width: f32, height: f32) -> Vec<ShapeVertex> {
    let vertices = create_rectangular_prism_vertices(width, height);
    let indices = create_rectangular_prism_indices();

    let normals = create_normal_vertices();
    let normal_indices = create_normal_indices();
    reconcile_shape_vertices(&vertices, &indices, &normals, &normal_indices)
}
