use crate::assets::cone::create_cone;
use crate::assets::cylinder::create_cylinder;
pub fn create_axis_line(radius: f32, cylinder_height: f32, cone_height: f32, cone_radius_pct: f32) -> (Vec<[f32; 3]>, Vec<u32>) {
    //This setting determines how mush of the axis line is cone and how much is cylinder

    //This setting determines the radius of the cone.  We want it to hang over the cylinder a
    //bit so that it looks like an arrow head
    let cone_radius = radius * cone_radius_pct;

    //we will add to these with the cone to create a base line that we can then orient and color.
    let (mut vertices, mut indices) = create_cylinder(cylinder_height, radius);


    //Now get our cone and add it to our vertices and indices
    let index_offset = vertices.len() as u32;
    let (cone_vertices, cone_indices) = create_cone(cone_height, cone_radius);

     for vertex in &cone_vertices {
         let x = vertex[0];
         let y = vertex[1];
         let z = vertex[2] + cylinder_height;

         vertices.push([x, y, z]);
     }

    for index in &cone_indices {
        indices.push(index + index_offset);
    }

    //Now we have a clyinder with a cone stuck on top oriented along the z access centered at
    //0,0,0.
    (vertices, indices)
}
