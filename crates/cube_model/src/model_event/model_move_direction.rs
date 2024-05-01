use serde::{Serialize, Deserialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelMoveDirection {
    Pitch(f32),
    Yaw(f32),
    Distance(f32),
    Up(f32),
    Down(f32),
    Left(f32),
    Right(f32),

}
