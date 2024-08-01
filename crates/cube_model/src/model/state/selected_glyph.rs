use model_common::vectors::VectorOrigionalValue;

use serde_json::{Value, json};

pub struct GlyphDescription {
    pub x : VectorOrigionalValue,
    //These are in application order and not flipped.  It is because the data is not flipped when
    //it is loaded into the GlyphManager
    pub y : VectorOrigionalValue,
    pub z : f64,

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
pub struct SelectedGlyph {
    pub glyph_id: u32,
    pub row_ids: Vec<usize>,
    pub desc: GlyphDescription, 
}

impl SelectedGlyph {
    pub fn new(glyph_id: u32, row_ids: Vec<usize>, desc: GlyphDescription) -> Self {
        Self { glyph_id, row_ids, desc }
    }

    pub fn to_json(&self) -> Value {
        let mut row_ids = Vec::new();
        for row_id in &self.row_ids {
            row_ids.push(Value::Number((*row_id).into()));
        }
        let desc = &self.desc.to_json();
        json!({"glyph_id": self.glyph_id, "row_ids": row_ids, "desc": desc} )
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;
    
    #[test]
    fn is_ok() {

        let description = GlyphDescription::new(
            VectorOrigionalValue::F64(1.0),
            VectorOrigionalValue::String("I am Groot".to_string()),
            7.0,
        );
        let selected_glyph = SelectedGlyph::new(1, vec![1, 2, 3], description);
        let json = selected_glyph.to_json();

        let glyph_id = json.get("glyph_id");
        assert!(glyph_id.is_some());
        let glyph_id = glyph_id.unwrap();
        assert!(glyph_id.is_number());
        let glyph_id = glyph_id.as_u64().unwrap();
        assert_eq!(glyph_id, 1);

        let row_ids = json.get("row_ids");
        assert!(row_ids.is_some());
        let row_ids = row_ids.unwrap();
        assert!(row_ids.is_array());
        let row_ids = row_ids.as_array().unwrap();
        assert_eq!(row_ids.len(), 3);
        for (i, row_id) in row_ids.iter().enumerate() {
            assert!(row_id.is_number());
            let row_id = row_id.as_u64().unwrap();
            assert_eq!(row_id, (i + 1) as u64);
        }

        let desc = json.get("desc");
        assert!(desc.is_some());
        let desc = desc.unwrap();
        assert!(desc.is_object());
        let desc = desc.as_object().unwrap();
        let x = desc.get("x");
        assert!(x.is_some());
        let x = x.unwrap();
        assert!(x.is_number());
        let x = x.as_f64().unwrap();
        assert_eq!(x, 1.0);

        let y = desc.get("y");
        assert!(y.is_some());
        let y = y.unwrap();
        assert!(y.is_string());
        let y = y.as_str().unwrap();
        assert_eq!(y, "I am Groot");

        let z = desc.get("z");
        assert!(z.is_some());
        let z = z.unwrap();
        assert!(z.is_number());
        let z = z.as_f64().unwrap();
        assert_eq!(z, 7.0);
    }
}
