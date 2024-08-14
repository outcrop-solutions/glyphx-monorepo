use crate::model::filtering::Query;
use serde::{Deserialize, Serialize};
use serde_json::Value;
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
    SelectGlyph{x_pos: f32, y_pos: f32, multi_select: bool},
    SelectedGlyphs(Vec<Value>),
    UpdateModelFilter(Query),


}
