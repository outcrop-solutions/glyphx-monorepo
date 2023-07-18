mod model_move_direction;
pub(crate) use model_move_direction::ModelMoveDirection;
#[derive(Debug, Clone)]
pub enum ModelEvent {
    ModelMove(ModelMoveDirection),
}
