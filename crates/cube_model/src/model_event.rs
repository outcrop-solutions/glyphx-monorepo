use serde::{Serialize, Deserialize};
mod model_move_direction;
pub(crate) use model_move_direction::ModelMoveDirection;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelEvent {
    ModelMove(ModelMoveDirection),
}
