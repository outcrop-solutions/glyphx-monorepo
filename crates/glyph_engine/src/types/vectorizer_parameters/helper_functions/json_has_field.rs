use super::helper_function_errors::JsonHasFieldError;
use glyphx_core::GlyphxErrorData;
use serde_json::{json, Value};

pub fn json_has_field(input: &Value, field_name: &str) -> Result<(), JsonHasFieldError> {
    let field = &input[field_name];
    if field.is_null() {
        let description = format!(
            "the json value does not have the field {} defined",
            field_name
        );
        let data = json!({ "field": field_name });
        return Err(JsonHasFieldError::JsonValidationError(
            GlyphxErrorData::new(description, Some(data), None),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod json_has_field {
    use super::*;

    #[test]
    fn is_ok() {
        let input = json!({"field": "test"});
        let result = json_has_field(&input, "field");
        assert!(result.is_ok());
    }

    #[test]
    fn is_err() {
        let input = json!({"field": "test"});
        let result = json_has_field(&input, "field2");
        assert!(result.is_err());
        let result = result.unwrap_err();
        match result {
            JsonHasFieldError::JsonValidationError(error_data) => {
                let d = error_data.data.unwrap();
                let field = d["field"].as_str().unwrap();
                assert_eq!(field, "field2");
            }
        }
    }
}
