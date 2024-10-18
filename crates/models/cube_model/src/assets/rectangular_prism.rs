use crate::model::data::ShapeVertex;

use cgmath::{Matrix4, Vector4};

fn create_normal_vertices() -> Vec<[f32; 3]> {
    vec![
        [0.0, 0.0, 0.0],
        [-0.0000, -1.0000, -0.0000],
        [-1.0000, -0.0000, -0.0000],
        [-0.0000, -0.0000, 1.0000],
        [-0.0000, 1.0000, -0.0000],
        [1.0000, -0.0000, -0.0000],
        [0.5774, 0.5774, -0.5774],
        [0.5774, -0.5774, -0.5774],
        [0.5774, 0.5774, 0.5774],
        [0.5774, -0.5774, 0.5774],
        [-0.5774, 0.5774, -0.5774],
        [-0.5774, -0.5774, -0.5774],
        [-0.5774, 0.5774, 0.5774],
        [-0.5774, -0.5774, 0.5774],
        [-0.7071, -0.7071, -0.0000],
        [-0.0000, -0.7071, -0.7071],
        [0.7071, -0.0000, -0.7071],
        [-0.7071, -0.0000, 0.7071],
        [0.7071, -0.0000, 0.7071],
        [-0.7071, -0.0000, -0.7071],
        [-0.0000, 0.7071, 0.7071],
        [0.7071, 0.7071, -0.0000],
        [-0.0000, -0.7071, 0.7071],
        [-0.7071, 0.7071, -0.0000],
        [-0.0000, 0.7071, -0.7071],
        [0.7071, -0.7071, -0.0000],
        [-0.0000, -0.0000, -1.0000],
    ]
}

fn create_normal_indices() -> Vec<u32> {
    vec![
        1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 26, 26, 26, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4,
        4, 5, 5, 5, 26, 26, 26,
    ]
}

fn create_normal_indices_edges() -> Vec<u32> {
    vec![
        6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 14, 14,
        14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 20, 21, 21, 21, 22,
        22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17,
        18, 18, 18, 19, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25,
        25,
    ]
}
fn scale_vertex_point(point: f32, scale: f32) -> f32 {
    let abs_point = point.abs();
    let pos_pct = abs_point / 1.0;
    let scaled_point = pos_pct * scale;
    if point < 0.0 {
        -scaled_point
    } else {
        scaled_point
    }
}

fn get_vertice_min_max(vertices: &Vec<[f32; 3]>) -> ([f32; 3], [f32; 3]) {
    let mut min = [f32::MAX; 3];
    let mut max = [f32::MIN; 3];
    for vertex in vertices {
        for i in 0..3 {
            if vertex[i] < min[i] {
                min[i] = vertex[i];
            }
            if vertex[i] > max[i] {
                max[i] = vertex[i];
            }
        }
    }
    (min, max)
}
///Like other shapes, I am hardcoding the models in code directly to save us the hassle of
///publishing the models and fetching them with reqwest.  This function defines the verticies for a
///cube centered at 0, 0, 0.
fn create_rectangular_prism_vertices(width: f32, height: f32) -> Vec<[f32; 3]> {
    let base_vertices = vec![
        //Don't forget our models indexes from
        //1 not 0
        [0.0, 0.0, 0.0],
        [0.870793, 0.870793, -1.000000],
        [0.870793, 1.000000, -0.870793],
        [1.000000, 0.870793, -0.870793],
        [0.870793, -1.000000, -0.870793],
        [0.870793, -0.870793, -1.000000],
        [1.000000, -0.870793, -0.870793],
        [1.000000, 0.870793, 0.870793],
        [0.870793, 1.000000, 0.870793],
        [0.870793, 0.870793, 1.000000],
        [1.000000, -0.870793, 0.870793],
        [0.870793, -0.870793, 1.000000],
        [0.870793, -1.000000, 0.870793],
        [-0.870793, 0.870793, -1.000000],
        [-1.000000, 0.870793, -0.870793],
        [-0.870793, 1.000000, -0.870793],
        [-1.000000, -0.870793, -0.870793],
        [-0.870793, -0.870793, -1.000000],
        [-0.870793, -1.000000, -0.870793],
        [-1.000000, 0.870793, 0.870793],
        [-0.870793, 0.870793, 1.000000],
        [-0.870793, 1.000000, 0.870793],
        [-0.870793, -1.000000, 0.870793],
        [-0.870793, -0.870793, 1.000000],
        [-1.000000, -0.870793, 0.870793],
    ];
    let min_max = get_vertice_min_max(&base_vertices);
    let cube_start_size = min_max.1[0] - min_max.0[0];
    let x_z_scale = width / cube_start_size;
    let scale_matrix = Matrix4::from_scale(x_z_scale);
    //How far will our ys move after scaling.  We have to scale the cube first so that the bevels
    //scale, then we can move the points up or down the y axis so that our cube is longer.
    let y_offset = (cube_start_size - width) / 2.0;
    let mut vertices = Vec::new();
    for vertex in base_vertices {
        let vec4_pos = Vector4::new(vertex[0], vertex[1], vertex[2], 1.0);

        let scaled = scale_matrix * vec4_pos;
        let y_pos = if scaled.y < 0.0 {
            scaled.y - y_offset
        } else {
            scaled.y + y_offset
        } + min_max.1[1];
        vertices.push([scaled.x, y_pos, scaled.z]);
    }
    vertices
}

///This function will return the indicies to draw a cube.  Like our other assets, this function
///will hardcode the index data to save us the hassle of publishing the models and fetching them
///from the web.
fn create_rectangular_prism_indices() -> Vec<u32> {
    vec![
        4, 22, 18, 19, 16, 24, 9, 23, 11, 15, 8, 2, 3, 10, 6, 13, 5, 17, 4, 12, 22, 19, 14, 16, 9,
        20, 23, 15, 21, 8, 3, 7, 10, 13, 1, 5,
    ]
}

fn create_rectangular_prism_edges() -> Vec<u32> {
    vec![
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 22,
        16, 18, 18, 5, 4, 6, 1, 3, 20, 24, 23, 11, 7, 9, 17, 14, 13, 21, 9, 8, 8, 3, 2, 12, 23, 22,
        15, 19, 21, 2, 13, 15, 4, 10, 12, 22, 24, 16, 18, 17, 5, 6, 5, 1, 20, 19, 24, 11, 10, 7,
        17, 16, 14, 21, 20, 9, 8, 7, 3, 12, 11, 23, 15, 14, 19, 2, 1, 13, 4, 6, 10,
    ]
}

fn reconcile_shape_vertices(
    vertices: &Vec<[f32; 3]>,
    indices: &Vec<u32>,
    edge_indices: &Vec<u32>,
    normals: &Vec<[f32; 3]>,
    normal_indices: &Vec<u32>,
    edge_normal_indices: &Vec<u32>,
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

    let mut i = 0;
    while i < edge_indices.len() {
        let vertex = vertices[edge_indices[i] as usize];
        let normal = normals[edge_normal_indices[i] as usize];
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
    let edge_indices = create_rectangular_prism_edges();

    let normals = create_normal_vertices();
    let normal_indices = create_normal_indices();
    let normal_indices_edge = create_normal_indices_edges();
    reconcile_shape_vertices(
        &vertices,
        &indices,
        &edge_indices,
        &normals,
        &normal_indices,
        &normal_indices_edge,
    )
}
