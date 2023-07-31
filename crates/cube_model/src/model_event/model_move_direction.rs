use serde::{Serialize, Deserialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelMoveDirection {
    Left(bool),
    Right(bool),
    Forward(bool),
    Backward(bool),
}
