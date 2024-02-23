use bincode::{deserialize, serialize};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Glyph {
    pub x_value: f64,
    pub y_value: f64,
    pub z_value: f64,
    pub row_ids: Vec<usize>,
}

impl Glyph {
    pub fn new(x_value: f64, y_value: f64, z_value: f64, row_ids: Vec<usize>) -> Self {
        Glyph {
            x_value,
            y_value,
            z_value,
            row_ids,
        }
    }
    pub fn get_binary_size(&self) -> usize {
        self.row_ids.len() * 8 + 32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_glyph() {
        let glyph = Glyph::new(1.0, 2.0, 3.0, vec![1, 2, 3]);
        let encoded = serialize(&glyph).unwrap();
        let decoded: Glyph = deserialize(&encoded).unwrap();
        assert_eq!(glyph.get_binary_size(), encoded.len());
        assert_eq!(glyph.x_value, decoded.x_value);
        assert_eq!(glyph.y_value, decoded.y_value);
        assert_eq!(glyph.z_value, decoded.z_value);
        assert_eq!(glyph.row_ids, decoded.row_ids);
    }
}
