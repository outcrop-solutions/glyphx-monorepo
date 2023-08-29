use crate::assets::cone::create_cone;
use crate::assets::cylinder::create_cylinder;
use crate::assets::shape_vertex::ShapeVertex;
pub fn create_axis_line(radius: f32, cylinder_height: f32, cone_height: f32, cone_radius: f32) -> Vec<ShapeVertex> {
    //get our cylinder
    let mut vertices = create_cylinder(cylinder_height, radius);
    //get our cone as the top
    let cone_vertices =  create_cone(cone_height, cone_radius);

    //Our cone is centered at 0,0,0.  We need to shift Y(up) by the height of the cylinder
     for vertex in &cone_vertices {
         let shifted_vertex = ShapeVertex {
             position_vertex: [vertex.position_vertex[0], vertex.position_vertex[1] + cylinder_height, vertex.position_vertex[2] ],
             normal: [vertex.normal[0], vertex.normal[1] + cylinder_height, vertex.normal[2] ],
             color: vertex.color,
         }; 

         vertices.push(shifted_vertex);
     }

    vertices
}
