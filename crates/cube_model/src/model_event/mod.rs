use serde::{Deserialize, Serialize};
mod add_glyphs;
mod add_statistics;
mod add_vector;
mod model_move_direction;
pub(crate) use add_glyphs::AddGlyphData;
pub(crate) use add_statistics::AddStatisticData;
pub(crate) use add_vector::AddVectorData;
pub(crate) use model_move_direction::ModelMoveDirection;
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelEvent {
    ModelMove(ModelMoveDirection),
    AddVector(AddVectorData),
    AddStatistic(AddStatisticData),
    AddGlyph(AddGlyphData),
    Redraw,
    ToggleAxisLines,
}
