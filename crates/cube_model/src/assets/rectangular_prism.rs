///Like other shapes, I am hardcoding the models in code directly to save us the hassle of
///publishing the models and fetching them with reqwest.  This function defines the verticies for a
///cube centered at 0, 0, 0.
fn create_rectangular_prism_vertices(width: f32, height: f32) -> Vec<[f32; 3]> {
    let base_vertices = vec![
        //Don't forget our models indexes from 
        //1 not 0
        [0.0, 0.0, 0.0],
        [-1.000000, 1.000000, 0.000000],
        [-1.000000, 1.000000, 2.000000],
        [1.000000, 1.000000, 0.000000],
        [1.000000, 1.000000, 2.000000],
        [-1.000000, -1.000000, 0.000000],
        [-1.000000, -1.000000, 2.000000],
        [1.000000, -1.000000, 0.000000],
        [1.000000, -1.000000, 2.000000],
    ];
        let x_y_scale = width / 2.0;
        let z_scale = height / 2.0;
        let mut vertices = Vec::new();
        for vertex in base_vertices {
            vertices.push([vertex[0] * x_y_scale, vertex[1] * x_y_scale, vertex[2] * z_scale]);
        }
        vertices
}

///This function will return the indicies to draw a cube.  Like our other assets, this function
///will hardcode the index data to save us the hassle of publishing the models and fetching them
///from the web.
fn create_rectangular_prism_indices() -> Vec<u32> {
    vec![
        4, 1, 2, 8, 3, 4, 6, 7, 8, 2, 5, 6, 3, 5, 1, 8, 2, 6, 4, 3, 1, 8, 7, 3, 6, 5, 7, 2, 1, 5,
        3, 7, 5, 8, 4, 2,
    ]
}

pub fn create_rectangular_prism(width: f32, height: f32) -> (Vec<[f32; 3]>, Vec<u32>) {
    let vertices = create_rectangular_prism_vertices(width, height);
    let indices = create_rectangular_prism_indices();
    (vertices, indices)
}
