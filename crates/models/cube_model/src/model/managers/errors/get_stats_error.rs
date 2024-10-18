use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Deserialize, Serialize, GlyphxCoreError)]
#[error_definition("StatsManager")]
pub enum GetStatsError {
    StatsNotDefined(GlyphxErrorData),
    InvalidAxisName(GlyphxErrorData),
}

impl GetStatsError {
    pub fn stats_not_defined(axis_name: &str) -> Self {
        let msg = format!("Stats for axis {} are not defined", axis_name);  
        let data = json!({"axis_name": axis_name});
        let error_data = GlyphxErrorData::new(msg.to_string(), Some(data), None);
        Self::StatsNotDefined(error_data)
    }
    pub fn invalid_axis_name(axis_name: &str) -> Self {
        let msg = format!("Invalid axis name: {} acceptable values are x,y or z", axis_name);  
        let data = json!({"axis_name": axis_name});
        let error_data = GlyphxErrorData::new(msg.to_string(), Some(data), None);
        Self::InvalidAxisName(error_data)
    }
}
