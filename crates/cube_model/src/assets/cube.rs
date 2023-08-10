// Define a function to create the vertices of the elongated cube (rectangular prism)
fn create_rectangular_prism_vertices(width: f32, height: f32) -> Vec<[f32; 3]> {
    let half_width = width * 0.5;
    let half_height = height * 0.5;
    vec![
        // Front face vertices
        [-half_width, -half_width, half_height],
        [half_width, -half_width, half_height],
        [half_width, half_width, half_height],
        [-half_width, half_width, half_height],
        // Back face vertices
        [half_width, -half_width, -half_height],
        [-half_width, -half_width, -half_height],
        [-half_width, half_width, -half_height],
        [half_width, half_width, -half_height],
    ]
}

// Define a function to create the indices for the elongated cube (rectangular prism)
fn create_rectangular_prism_indices() -> Vec<u32> {
    vec![
        // Front face
        0, 1, 2, 2, 3, 0,
        // Back face
        4, 5, 6, 6, 7, 4,
        // Top face
        3, 2, 6, 6, 7, 3,
        // Bottom face
        0, 1, 5, 5, 4, 0,
        // Right face
        1, 2, 6, 6, 5, 1,
        // Left face
        0, 3, 7, 7, 4, 0,
    ]
}
 pub fn create_rectangular_prism(width: f32, height: f32) -> (Vec<[f32; 3]>, Vec<u32>) {
     let vertices = create_rectangular_prism_vertices(width, height);
     let indices = create_rectangular_prism_indices();
     (vertices, indices)
 }
