mod add_glyphs;
mod add_statistics;
mod add_vector;
mod model_move_direction;

use crate::model::{filtering::Query, state::State};

pub(crate) use add_glyphs::AddGlyphData;
pub(crate) use add_statistics::AddStatisticData;
pub(crate) use add_vector::AddVectorData;
pub(crate) use model_move_direction::ModelMoveDirection;

use serde::Serialize;
use serde_json::Value;
pub enum ModelEvent {
    StateReady(State),
    ModelMove(ModelMoveDirection),
    AddVector(AddVectorData),
    AddStatistic(AddStatisticData),
    AddGlyph(AddGlyphData),
    Redraw,
    ToggleAxisLines,
    SelectGlyph {
        x_pos: f32,
        y_pos: f32,
        multi_select: bool,
    },
    SelectedGlyphs(Vec<Value>),
    SelectGlyphs(Vec<u32>),
    UpdateModelFilter(Query),
}

//So our State cannot be serialized due to the fact that many of the WGPU structs are
//not marked as Serialize.  We have to include a value in our enum to hold state --
//this is required to get wasm_bindgen working.  Since we use the same ModelEvent to
//both control flow nternally and communicate with the client we have to build a
//ModelEvent structure that can be serliazed so it can be sent back to javascript.
#[derive(Serialize)]
pub enum JsSafeModelEvent {
    ModelMove(ModelMoveDirection),
    AddVector(AddVectorData),
    AddStatistic(AddStatisticData),
    AddGlyph(AddGlyphData),
    Redraw,
    ToggleAxisLines,
    SelectGlyph {
        x_pos: f32,
        y_pos: f32,
        multi_select: bool,
    },
    SelectedGlyphs(Vec<Value>),
    SelectGlyphs(Vec<u32>),
    UpdateModelFilter(Query),
    Other(String),
}

impl From<&ModelEvent> for JsSafeModelEvent {
    fn from(input: &ModelEvent) -> Self {
        match input {
            ModelEvent::StateReady(_) => Self::Other("StateReady".to_string()),
            ModelEvent::ModelMove(model_move_direction) => {
                Self::ModelMove(model_move_direction.clone())
            }
            ModelEvent::AddVector(add_vector_data) => Self::AddVector(add_vector_data.clone()),
            ModelEvent::AddStatistic(add_statistic_data) => {
                Self::AddStatistic(add_statistic_data.clone())
            }
            ModelEvent::AddGlyph(add_glyph_data) => Self::AddGlyph(add_glyph_data.clone()),
            ModelEvent::Redraw => Self::Redraw,
            ModelEvent::ToggleAxisLines => Self::ToggleAxisLines,
            ModelEvent::SelectGlyph {
                x_pos,
                y_pos,
                multi_select,
            } => Self::SelectGlyph {
                x_pos: x_pos.clone(),
                y_pos: y_pos.clone(),
                multi_select: multi_select.clone(),
            },
            ModelEvent::SelectedGlyphs(glyphs) => Self::SelectedGlyphs(glyphs.clone()),
            ModelEvent::SelectGlyphs(glyphs) => Self::SelectGlyphs(glyphs.clone()),
            ModelEvent::UpdateModelFilter(query) => Self::UpdateModelFilter(query.clone()),
        }
    }
}
