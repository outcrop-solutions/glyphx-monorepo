use serde::{Serialize, Deserialize};
mod model_move_direction;
mod  add_vector;
pub(crate) use model_move_direction::ModelMoveDirection;
pub(crate) use add_vector::AddVectorData;
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelEvent {
    ModelMove(ModelMoveDirection),
    AddVector(AddVectorData),
}
