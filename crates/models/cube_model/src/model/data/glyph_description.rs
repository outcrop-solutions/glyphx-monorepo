
use model_common::vectors::VectorOrigionalValue;

use serde_json::{json, Value};

#[derive(Debug, Clone)]
pub struct GlyphDescription {
    pub x: VectorOrigionalValue,
    //These are in application order and not flipped.  It is because the data is not flipped when
    //it is loaded into the GlyphManager
    pub y: VectorOrigionalValue,
    pub z: f64,
}

impl GlyphDescription {
    pub fn new(x: VectorOrigionalValue, y: VectorOrigionalValue, z: f64) -> Self {
        Self { x, y, z }
    }

    pub fn to_json(&self) -> Value {
        Value::Object(serde_json::Map::from_iter(vec![
            ("x".to_string(), self.x.to_json()),
            ("y".to_string(), self.y.to_json()),
            ("z".to_string(), json!(self.z)),
        ]))
    }
}
