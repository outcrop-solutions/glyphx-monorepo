use glyphx_core::GlyphxErrorData;
use super::helper_function_errors::JsonHasFieldError;
use serde_json::{Value, json};

pub fn json_has_field(
    input: &Value,
    field_name: &str,
) -> Result<(), JsonHasFieldError> {
    let field = &input[field_name];
    if field.is_null() {
        let description = format!(
            "the json value does not have the field {} defined",
            field_name
        );
        let data = json!({"field": field_name});
        return Err(JsonHasFieldError::JsonValidationError(
            GlyphxErrorData::new(description, Some(data), None),
        ));
    }
    Ok(())
}
