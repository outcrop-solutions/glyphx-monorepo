use serde::{Serialize, Deserialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelMoveDirection {
    Left(f32),
    Right(f32),
    Forward(f32),
    Backward(f32),
    Up(f32),
    Down(f32),
}
