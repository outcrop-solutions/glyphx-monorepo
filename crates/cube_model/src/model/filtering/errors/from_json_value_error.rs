use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};

use serde_json::{json, Value};

#[derive(Debug, GlyphxCoreError)]
#[error_definition("FromJsonValue")]
pub enum FromJsonValueError {
    JsonFormatError(GlyphxErrorData),
    JsonValueError(GlyphxErrorData),
}

impl FromJsonValueError {
    pub fn json_format_error(message: &str, field_name: &str, obj: &Value) -> Self {
       let error_data = json!({"field_name": field_name, "obj": obj});
       let error_data = GlyphxErrorData::new(message.to_string(), Some(error_data), None);
       FromJsonValueError::JsonFormatError(error_data)
   }

   pub fn json_value_error(message: &str, field_name: &str, obj: &Value) -> Self {
       let error_data = json!({"field_name": field_name, "obj": obj});
       let error_data = GlyphxErrorData::new(message.to_string(), Some(error_data), None);
       FromJsonValueError::JsonValueError(error_data)
   }
}
