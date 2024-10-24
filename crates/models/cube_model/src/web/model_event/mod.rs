mod add_glyphs;
mod add_statistics;
mod add_vector;
mod model_move_direction;
mod screenshot;
mod camera_type_changed;

use super::state::State;
use crate::model::{
    data::{GlyphVertexData, Hit},
    filtering::Query,
};

pub use add_glyphs::*;
pub use add_statistics::*;
pub use add_vector::*;
pub use model_move_direction::*;
pub use screenshot::*;
pub use camera_type_changed::*;

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
    GlyphsUpdated(Vec<GlyphVertexData>),
    HitDetection(Hit),
    TakeScreenshot(bool),
    ScreenshotTaken(Screenshot, bool),
    ResizeWindow {
        width: u32,
        height: u32,
    },
    ConfigurationUpdated,
    CameraTypeChanged(CameraTypeChanged),
    ClearData,
    ResetState,
}
impl ModelEvent {
    pub fn event_type(&self) -> &str {
        match self {
            Self::StateReady(_) => "StateReady",
            Self::ModelMove(_) => "ModelMove",
            Self::AddVector(_) => "AddVector",
            Self::AddStatistic(_) => "AddStatistic",
            Self::AddGlyph(_) => "AddGlyph",
            Self::Redraw => "Redraw",
            Self::ToggleAxisLines => "ToggleAxisLines",
            Self::SelectGlyph { .. } => "SelectGlyph",
            Self::SelectedGlyphs(_) => "SelectedGlyphs",
            Self::SelectGlyphs(_) => "SelectGlyphs",
            Self::UpdateModelFilter(_) => "UpdateModelFilter",
            Self::GlyphsUpdated(_) => "GlyphsUpdated",
            Self::HitDetection(_) => "HitDetection",
            Self::TakeScreenshot(_) => "TakeScreenshot",
            Self::ScreenshotTaken(_, is_state_creation) => {
                if *is_state_creation {
                    "StateScreenshotTaken"
                } else {
                    "ScreenshotTaken"
                }
            }
            Self::ResizeWindow { .. } => "ResizeWindow",
            Self::ConfigurationUpdated => "ConfigurationUpdated",
            Self::CameraTypeChanged(_) => "CameraTypeChanged",
            Self::ClearData => "ClearData",
            Self::ResetState => "ResetState",

        }
    }
}
impl std::fmt::Debug for ModelEvent {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelEvent::StateReady(_state) => write!(f, "StateReady"),
            ModelEvent::ModelMove(model_move_direction) => {
                write!(f, "ModelMove({:?})", model_move_direction)
            }
            ModelEvent::AddVector(add_vector_data) => {
                write!(f, "AddVector({:?})", add_vector_data)
            }
            ModelEvent::AddStatistic(add_statistic_data) => {
                write!(f, "AddStatistic({:?})", add_statistic_data)
            }
            ModelEvent::AddGlyph(add_glyph_data) => write!(f, "AddGlyph({:?})", add_glyph_data),
            ModelEvent::Redraw => write!(f, "Redraw"),
            ModelEvent::ToggleAxisLines => write!(f, "ToggleAxisLines"),
            ModelEvent::SelectGlyph {
                x_pos,
                y_pos,
                multi_select,
            } => write!(
                f,
                "SelectGlyph(x_pos: {}, y_pos: {}, multi_select: {})",
                x_pos, y_pos, multi_select
            ),
            ModelEvent::SelectedGlyphs(glyphs) => write!(f, "SelectedGlyphs({:?})", glyphs),
            ModelEvent::SelectGlyphs(glyphs) => write!(f, "SelectGlyphs({:?})", glyphs),
            ModelEvent::UpdateModelFilter(query) => write!(f, "UpdateModelFilter({:?})", query),
            ModelEvent::GlyphsUpdated(_glyphs) => write!(f, "GlyphsUpdated"),
            ModelEvent::HitDetection(hit) => write!(f, "HitDetection({:?})", hit),
            ModelEvent::TakeScreenshot(_) => write!(f, "TakeScreenshot"),
            ModelEvent::ScreenshotTaken(screenshot, _) => {
                write!(f, "ScreenShotTaken({:?})", screenshot)
            }
            ModelEvent::ResizeWindow { width, height } => {
                write!(f, "ResizeWindow(width: {}, height: {})", width, height)
            }
            ModelEvent::ConfigurationUpdated => write!(f, "ConfigurationUpdated"),
            ModelEvent::CameraTypeChanged(camera_type) => write!(f, "CameraTypeChanged({:?})", camera_type.to_string()),
            ModelEvent::ClearData => write!(f, "ClearData"),
            ModelEvent::ResetState => write!(f, "ResetState"),
        }
    }
}

//So our State cannot be serialized due to the fact that many of the WGPU structs are
//not marked as Serialize.  We have to include a value in our enum to hold state --
//this is required to get wasm_bindgen working.  Since we use the same ModelEvent to
//both control flow nternally and communicate with the client we have to build a
//ModelEvent structure that can be serliazed so it can be sent back to javascript.
#[derive(Serialize, Debug)]
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
    HitDetection(Hit),
    TakeScreenshot,
    ScreenShotTaken(Screenshot),
    Other(String),
    ResizeWindow {
        width: u32,
        height: u32,
    },
    ConfigurationUpdated,
    CameraTypeChanged(String),
    ClearData,
    ResetState,

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
            ModelEvent::GlyphsUpdated(_glyphs) => Self::Other("GlyphsUpdated".to_string()),
            ModelEvent::HitDetection(hit) => Self::HitDetection(hit.clone()),
            ModelEvent::TakeScreenshot(_) => Self::TakeScreenshot,
            ModelEvent::ScreenshotTaken(screenshot, _) => Self::ScreenShotTaken(screenshot.clone()),
            ModelEvent::ResizeWindow { width, height } => Self::ResizeWindow {
                width: *width,
                height: *height,
            },
            ModelEvent::ConfigurationUpdated => Self::ConfigurationUpdated,
            ModelEvent::CameraTypeChanged(camera_type) => {
                Self::CameraTypeChanged(camera_type.to_string())
            },
            ModelEvent::ClearData => Self::ClearData,
            ModelEvent::ResetState => Self::ResetState,
        }
    }
}