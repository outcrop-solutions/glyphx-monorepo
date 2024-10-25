use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, Debug)]
 pub struct GlyphEngineResults {
     pub x_axis_vectors_file_name: String,
     pub y_axis_vectors_file_name: String,
     pub glyphs_file_name: String,
     pub statistics_file_name: String,
 }
