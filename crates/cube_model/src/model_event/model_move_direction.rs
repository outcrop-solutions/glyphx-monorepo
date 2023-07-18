#[derive(Debug, Clone)]
pub enum ModelMoveDirection {
    Left(bool),
    Right(bool),
    Forward(bool),
    Backward(bool),
}
