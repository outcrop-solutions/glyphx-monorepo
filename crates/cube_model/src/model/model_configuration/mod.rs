mod errors;
mod color_wheel;

pub use color_wheel::ColorWheel;
use crate::assets::color::Color;
pub use errors::*;
use glyphx_core_error::GlyphxErrorData;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

type Location = [f32; 3];
macro_rules! parse_json {
    (let $var_name: ident = &$json: ident [$field_name: literal] as Array ) => {
        let $var_name = &$json[$field_name];
        if $var_name.is_null() {
            let message = format!(
                "The field {} was not found in the json",
                stringify!($field_name)
            );
            let inner_data = $json.clone();
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(FromJsonError::FieldNotFound(error_data));
        }
        if !$var_name.is_array() {
            let message = format!("The value of the json: {} is not an array", $var_name);
            let inner_data = $json.clone();
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(FromJsonError::TypeMismatch(error_data));
        }
        let $var_name = $var_name.as_array().unwrap();
    };

    (let $var_name: ident = &$json: ident [$field_name: literal] as f32 ) => {
        let $var_name = &$json[$field_name];
        if $var_name.is_null() {
            let message = format!(
                "The field {} was not found in the json",
                stringify!($field_name)
            );
            let inner_data = $json.clone();
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(FromJsonError::FieldNotFound(error_data));
        }
        if !$var_name.is_f64() {
            let message = format!("The value of the json: {} is not a number", $var_name);
            let inner_data = $json.clone();
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(FromJsonError::TypeMismatch(error_data));
        }
        let $var_name = $var_name.as_f64().unwrap() as f32;
    };
}

macro_rules! partial_json {
    (let $var_name: ident = &$field: ident as Array $length: literal ) => {
        if $field.is_null() {
            let message = format!(
                "The field {} was null",
                stringify!($var_name)
            );
            let inner_data = json!({stringify!($var_name): $field});
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(PartialUpdateError::NullValue(error_data));
        }
        if !$field.is_array() {
            let message = format!("The value of the json: {} is not an array", $field);
            let inner_data = json!({stringify!($var_name): $field});
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(PartialUpdateError::TypeMismatch(error_data));
        }

        let $var_name = $field.as_array().unwrap();
        if $var_name.len() != $length {
            let message = format!(
                "The array: {:?} does not have {} elements and cannot be converted to a configuration type",
                $var_name, $length
            );
            let inner_data = json!({stringify!($var_name): $field});
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(PartialUpdateError::InvalidFormat(error_data));
        }
    };

    (let $var_name: ident = &$field: ident as f32 ) => {
        if $field.is_null() {
            let message = format!(
                "The field {} was null",
                stringify!($var_name)
            );
            let inner_data = json!({stringify!($var_name): $field});
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(PartialUpdateError::NullValue(error_data));
        }
        if !$field.is_f64() {
            let message = format!("The value of the json: {} is not a number", $field);
            let inner_data = json!({stringify!($var_name): $field});
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(PartialUpdateError::TypeMismatch(error_data));
        }

        let $var_name = $field.as_f64 ().unwrap() as f32;
    };
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ModelConfiguration {
    //set our color arrangment
    //60 gradations of color
    pub min_color: Color,
    pub max_color: Color,
    pub background_color: Color,
    pub x_axis_color: Color,
    pub y_axis_color: Color,
    pub z_axis_color: Color,
    //Define our grid
    //We keep the cone (arrowhead) and cylinder (arrow shaft) separate
    //shaft
    pub grid_cylinder_radius: f32,
    pub grid_cylinder_length: f32,
    //head
    pub grid_cone_length: f32,
    pub grid_cone_radius: f32,
    //How far from the edges do we place our glyphs
    pub glyph_offset: f32,
    //How big can our glyhs be as a ratio of the base grid size
    pub z_height_ratio: f32,
    //Gives a minium height for the glyphs
    pub min_glyph_height: f32,

    pub light_location: [f32; 3],
    pub light_color: Color,
    pub light_intensity: f32,
    pub glyph_size: f32,
    pub model_origin: [f32; 3],
}
impl ModelConfiguration {
    fn location_from_array(json: &Vec<Value>) -> Result<Location, FromJsonError> {
        if json.len() != 3 {
            let message = format!(
                "The array: {:?} does not have 4 elements and cannot be converted to a Color",
                json
            );
            let inner_data = json!(json);
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(FromJsonError::InvalidFormat(error_data));
        }
        for i in 0..3 {
            if !json[i].is_f64() {
                let message = format!(
                    "The value: {:?} at index: {} is not a float and cannot be converted to a Color",
                    json[i], i
                );
                let inner_data = json!(json);
                let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
                return Err(FromJsonError::TypeMismatch(error_data));
            }
        }
        Ok([
            json[0].as_f64().unwrap() as f32,
            json[1].as_f64().unwrap() as f32,
            json[2].as_f64().unwrap() as f32,
        ])
    }
    fn color_from_array(json: &Vec<Value>) -> Result<Color, FromJsonError> {
        if json.len() != 4 {
            let message = format!(
                "The array: {:?} does not have 4 elements and cannot be converted to a Color",
                json
            );
            let inner_data = json!(json);
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(FromJsonError::InvalidFormat(error_data));
        }
        for i in 0..4 {
            if !json[i].is_f64() {
                let message = format!(
                    "The value: {:?} at index: {} is not a float and cannot be converted to a Color",
                    json[i], i
                );
                let inner_data = json!(json);
                let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
                return Err(FromJsonError::TypeMismatch(error_data));
            }
        }
        Ok([
            json[0].as_f64().unwrap() as f32,
            json[1].as_f64().unwrap() as f32,
            json[2].as_f64().unwrap() as f32,
            json[3].as_f64().unwrap() as f32,
        ])
    }
    pub fn from_json(json: &Value) -> Result<Self, FromJsonError> {
        parse_json!(let min_color = &json["min_color"] as Array);
        let min_color = Self::color_from_array(min_color)?;

        parse_json!(let max_color = &json["max_color"] as Array);
        let max_color = Self::color_from_array(max_color)?;

        parse_json!(let background_color = &json["background_color"] as Array);
        let background_color = Self::color_from_array(background_color)?;

        parse_json!(let x_axis_color = &json["x_axis_color"] as Array);
        let x_axis_color = Self::color_from_array(x_axis_color)?;

        parse_json!(let y_axis_color = &json["y_axis_color"] as Array);
        let y_axis_color = Self::color_from_array(y_axis_color)?;

        parse_json!(let z_axis_color = &json["z_axis_color"] as Array);
        let z_axis_color = Self::color_from_array(z_axis_color)?;

        parse_json!(let grid_cylinder_radius = &json["grid_cylinder_radius"] as f32);
        parse_json!(let grid_cylinder_length = &json["grid_cylinder_length"] as f32);
        parse_json!(let grid_cone_length = &json["grid_cone_length"] as f32);
        parse_json!(let grid_cone_radius = &json["grid_cone_radius"]as f32);
        parse_json!(let glyph_offset = &json["glyph_offset"] as f32);
        parse_json!(let z_height_ratio = &json["z_height_ratio"]as f32);
        parse_json!(let min_glyph_height = &json["min_glyph_height"] as f32);

        parse_json!(let light_location = &json["light_location"] as Array);
        let light_location = Self::location_from_array(light_location)?;

        parse_json!(let light_color = &json["light_color"] as Array);
        let light_color = Self::color_from_array(light_color)?;

        parse_json!(let light_intensity = &json["light_intensity"] as f32);
        parse_json!(let glyph_size = &json["glyph_size"] as f32);
        parse_json!(let model_origin = &json["model_origin"] as Array);
        let model_origin = Self::location_from_array(model_origin)?;
        Ok(ModelConfiguration {
            min_color,
            max_color,
            background_color,
            x_axis_color,
            y_axis_color,
            z_axis_color,
            grid_cylinder_radius,
            grid_cylinder_length,
            grid_cone_length,
            grid_cone_radius,
            glyph_offset,
            z_height_ratio,
            min_glyph_height,
            light_location,
            light_color,
            light_intensity,
            glyph_size,
            model_origin,
        })
    }

    pub fn partial_update(&mut self, json: &Value) -> Result<&Self, PartialUpdateError> {
        if !json.is_object() {
            let message =
                "The json is not an object and cannot be used to update the model configuration"
                    .to_string();
            let inner_data = json.clone();
            let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
            return Err(PartialUpdateError::InvalidJson(error_data));
        }

        let obj_json = json.as_object().unwrap();
        for (key, value) in obj_json.iter() {
            match key.as_str() {
                "min_color" => {
                    partial_json!(let min_color = &value as  Array 4);
                    let min_color = Self::color_from_array(min_color)?;
                    self.min_color = min_color;
                },
                "max_color" => {
                    partial_json!(let max_color = &value as  Array 4);
                    let max_color = Self::color_from_array(max_color)?;
                    self.max_color = max_color;
                },
                "background_color" => {
                    partial_json!(let background_color = &value as  Array 4);
                    let background_color = Self::color_from_array(background_color)?;
                    self.background_color = background_color;
                },
                "x_axis_color" => {
                    partial_json!(let x_axis_color = &value as  Array 4);
                    let x_axis_color = Self::color_from_array(x_axis_color)?;
                    self.x_axis_color = x_axis_color;
                },
                "y_axis_color" => {
                    partial_json!(let y_axis_color = &value as  Array 4);
                    let y_axis_color = Self::color_from_array(y_axis_color)?;
                    self.y_axis_color = y_axis_color;
                },
                "z_axis_color" => {
                    partial_json!(let z_axis_color = &value as  Array 4);
                    let z_axis_color = Self::color_from_array(z_axis_color)?;
                    self.z_axis_color = z_axis_color;
                },
                "grid_cylinder_radius" => {
                    partial_json!(let grid_cylinder_radius = &value as f32);
                    self.grid_cylinder_radius = grid_cylinder_radius;
                },
                "grid_cylinder_length" => {
                    partial_json!(let grid_cylinder_length = &value as f32);
                    self.grid_cylinder_length = grid_cylinder_length;
                },
                "grid_cone_length" => {
                    partial_json!(let grid_cone_length = &value as f32);
                    self.grid_cone_length = grid_cone_length;
                },
                "grid_cone_radius" => {
                    partial_json!(let grid_cone_radius = &value as f32);
                    self.grid_cone_radius = grid_cone_radius;
                },
                "glyph_offset" => {
                    partial_json!(let glyph_offset = &value as f32);
                    self.glyph_offset = glyph_offset;
                },
                "z_height_ratio" => {
                    partial_json!(let z_height_ratio = &value as f32);
                    self.z_height_ratio = z_height_ratio;
                },
                "min_glyph_height" => {
                    partial_json!(let min_glyph_height = &value as f32);
                    self.min_glyph_height = min_glyph_height;
                },
                "light_location" => {
                    partial_json!(let light_location = &value as Array 3);
                    let light_location = Self::location_from_array(light_location)?;
                    self.light_location = light_location;
                },
                "light_color" => {
                    partial_json!(let light_color = &value as Array 4);
                    let light_color = Self::color_from_array(light_color)?;
                    self.light_color = light_color;
                },
                "light_intensity" => {
                    partial_json!(let light_intensity = &value as f32);
                    self.light_intensity = light_intensity;
                },
                "glyph_size" => {
                    partial_json!(let glyph_size = &value as f32);
                    self.glyph_size = glyph_size;
                },
                "model_origin" => {
                    partial_json!(let model_origin = &value as Array 3);
                    let model_origin = Self::location_from_array(model_origin)?;
                    self.model_origin = model_origin;
                },
                value => {
                    let message = format!(
                        "The field: {} is not a valid field for a model configuration",
                        value
                    );
                    let inner_data = json.clone();
                    let error_data = GlyphxErrorData::new(message, Some(inner_data), None);
                    return Err(PartialUpdateError::FieldNotFound(error_data));
                }
            }
        }

        Ok(self)
    }
}

impl Default for ModelConfiguration {
    fn default() -> Self {
        ModelConfiguration {
            //M -- Done
            max_color: [255.0, 0.0, 0.0, 1.0],
            //N -- Done
            min_color: [0.0, 255.0, 255.0, 1.0],
            //B -- Done
            background_color: [13.0, 19.0, 33.0, 1.0],
            //X -- done
            x_axis_color: [255.0, 0.0, 0.0, 1.0],
            //Y -- done
            y_axis_color: [0.0, 255.0, 0.0, 1.0],
            //Z -- done
            z_axis_color: [0.0, 0.0, 255.0, 1.0],
            //A -- done
            grid_cylinder_length: 10.80,
            //R -- done
            grid_cylinder_radius: 0.005,
            //C -- done
            grid_cone_length: 0.02,
            //K -- done
            grid_cone_radius: 0.010,
            //H -- done
            z_height_ratio: 1.0,
            //O -- done
            glyph_offset: 0.015,
            //E -- Done
            min_glyph_height: 0.0002,
            //W -- Done
            light_color: [255.0, 255.0, 255.0, 1.0],
            //L -- Done
            light_location: [-30.0, -30.0, -30.0],
            //I -- Done
            light_intensity: 0.02,
            //S -- Done
            glyph_size: 0.015,
            //G
            model_origin: [-5.0, -5.0, -5.0],
        }
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;
    use serde_json::to_value;
    mod from_json {
        use super::*;

        #[test]
        fn is_ok() {
            let input = ModelConfiguration::default();
            let json = to_value(&input).unwrap();

            let result = ModelConfiguration::from_json(&json);
            assert!(result.is_ok());
            assert_eq!(result.unwrap(), input);
        }

        #[test]
        fn array_is_not_array() {
            let input = ModelConfiguration::default();
            let mut json = to_value(&input).unwrap();
            json["min_color"] = json!(1.0);
            let result = ModelConfiguration::from_json(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::TypeMismatch(_) => {}
                _ => panic!("Expected TypeMismatch error"),
            }
        }

        #[test]
        fn array_has_invalid_types() {
            let input = ModelConfiguration::default();
            let mut json = to_value(&input).unwrap();
            json["min_color"] = json!(["a", "b", "c", "d"]);
            let result = ModelConfiguration::from_json(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::TypeMismatch(_) => {}
                _ => panic!("Expected TypeMismatch error"),
            }
        }

        #[test]
        fn number_is_not_number() {
            let input = ModelConfiguration::default();
            let mut json = to_value(&input).unwrap();
            json["grid_cone_length"] = json!("I am bad");
            let result = ModelConfiguration::from_json(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::TypeMismatch(_) => {}
                _ => panic!("Expected TypeMismatch error"),
            }
        }

        #[test]
        fn field_is_not_found() {
            let input = ModelConfiguration::default();
            let mut json = to_value(&input).unwrap();
            json["grid_cone_length"] = json!(null);
            let result = ModelConfiguration::from_json(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::FieldNotFound(_) => {}
                _ => panic!("Expected TypeMismatch error"),
            }
        }
    }
    mod location_from_array {
        use super::*;

        #[test]
        fn is_ok() {
            let input = vec![json!(1.0), json!(2.0), json!(3.0)];
            let result = ModelConfiguration::location_from_array(&input);
            assert!(result.is_ok());
            assert_eq!(result.unwrap(), [1.0, 2.0, 3.0]);
        }

        #[test]
        fn length_not_3() {
            let input = vec![json!(1.0), json!(2.0)];
            let result = ModelConfiguration::location_from_array(&input);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::InvalidFormat(_) => {}
                _ => panic!("Expected InvalidFormat error"),
            }
        }

        #[test]
        fn invalid_value() {
            let input = vec![json!(1.0), json!("A"), json!(2.0)];
            let result = ModelConfiguration::location_from_array(&input);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::TypeMismatch(_) => {}
                _ => panic!("Expected InvalidFormat error"),
            }
        }
    }

    mod color_from_array {
        use super::*;

        #[test]
        fn is_ok() {
            let input = vec![json!(1.0), json!(2.0), json!(3.0), json!(4.0)];
            let result = ModelConfiguration::color_from_array(&input);
            assert!(result.is_ok());
            assert_eq!(result.unwrap(), [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn length_not_4() {
            let input = vec![json!(1.0), json!(2.0), json!(3.0)];
            let result = ModelConfiguration::color_from_array(&input);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::InvalidFormat(_) => {}
                _ => panic!("Expected InvalidFormat error"),
            }
        }

        #[test]
        fn invalid_value() {
            let input = vec![json!(1.0), json!("A"), json!(2.0), json!(4.0)];
            let result = ModelConfiguration::color_from_array(&input);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                FromJsonError::TypeMismatch(_) => {}
                _ => panic!("Expected InvalidFormat error"),
            }
        }
    }

    mod partial_update {
        use super::*;

        #[test]
        fn min_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"min_color": [1.0, 2.0, 3.0, 4.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.min_color, [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn max_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"max_color": [1.0, 2.0, 3.0, 4.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.max_color, [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn background_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"background_color": [1.0, 2.0, 3.0, 4.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.background_color, [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn x_axis_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"x_axis_color": [1.0, 2.0, 3.0, 4.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.x_axis_color, [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn y_axis_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"y_axis_color": [1.0, 2.0, 3.0, 4.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.y_axis_color, [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn z_axis_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"z_axis_color": [1.0, 2.0, 3.0, 4.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.z_axis_color, [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn grid_cylinder_radius() {
            let mut input = ModelConfiguration::default();
            let json = json!({"grid_cylinder_radius": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.grid_cylinder_radius, 1.0);
        }

        #[test]
        fn grid_cylinder_length() {
            let mut input = ModelConfiguration::default();
            let json = json!({"grid_cylinder_length": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.grid_cylinder_length, 1.0);
        }

        #[test]
        fn grid_cone_length() {
            let mut input = ModelConfiguration::default();
            let json = json!({"grid_cone_length": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.grid_cone_length, 1.0);
        }

        #[test]
        fn grid_cone_radius() {
            let mut input = ModelConfiguration::default();
            let json = json!({"grid_cone_radius": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.grid_cone_radius, 1.0);
        }

        #[test]
        fn glyph_offset() {
            let mut input = ModelConfiguration::default();
            let json = json!({"glyph_offset": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.glyph_offset, 1.0);
        }

        #[test]
        fn z_height_ratio() {
            let mut input = ModelConfiguration::default();
            let json = json!({"z_height_ratio": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.z_height_ratio, 1.0);
        }

        #[test]
        fn min_glyph_height() {
            let mut input = ModelConfiguration::default();
            let json = json!({"min_glyph_height": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.min_glyph_height, 1.0);
        }

        #[test]
        fn light_location() {
            let mut input = ModelConfiguration::default();
            let json = json!({"light_location": [1.0, 2.0, 3.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.light_location, [1.0, 2.0, 3.0]);
        }

        #[test]
        fn light_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"light_color": [1.0, 2.0, 3.0, 4.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.light_color, [1.0, 2.0, 3.0, 4.0]);
        }

        #[test]
        fn light_intensity() {
            let mut input = ModelConfiguration::default();
            let json = json!({"light_intensity": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.light_intensity, 1.0);
        }

        #[test]
        fn glyph_size() {
            let mut input = ModelConfiguration::default();
            let json = json!({"glyph_size": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.glyph_size, 1.0);
        }

        #[test]
        fn model_origin() {
            let mut input = ModelConfiguration::default();
            let json = json!({"model_origin": [1.0, 2.0, 3.0]});
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.model_origin, [1.0, 2.0, 3.0]);
        }

        #[test]
        fn invalid_field() {
            let mut input = ModelConfiguration::default();
            let json = json!({"bad_field": 1.0});
            let result = input.partial_update(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                PartialUpdateError::FieldNotFound(_) => {}
                _ => panic!("Expected FieldNotFound error"),
            }
        }

        #[test]
        fn invalid_json() {
            let mut input = ModelConfiguration::default();
            let json = json!(1.0);
            let result = input.partial_update(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                PartialUpdateError::InvalidJson(_) => {}
                _ => panic!("Expected InvalidJson error"),
            }
        }

        #[test]
        fn null_value() {
            let mut input = ModelConfiguration::default();
            let json = json!({"min_color": null});
            let result = input.partial_update(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                PartialUpdateError::NullValue(_) => {}
                _ => panic!("Expected NullValue error"),
            }
        }

        #[test]
        fn invalid_color() {
            let mut input = ModelConfiguration::default();
            let json = json!({"min_color": [1.0, 2.0, 3.0]});
            let result = input.partial_update(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                PartialUpdateError::InvalidFormat(_) => {}
                _ => panic!("Expected InvalidFormat error"),
            }
        }

        #[test]
        fn invalid_location() {
            let mut input = ModelConfiguration::default();
            let json = json!({"light_location": [1.0, 2.0]});
            let result = input.partial_update(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                PartialUpdateError::InvalidFormat(_) => {}
                _ => panic!("Expected InvalidFormat error"),
            }
        }

        #[test]
        fn invalid_number() {
            let mut input = ModelConfiguration::default();
            let json = json!({"grid_cylinder_radius": "I am bad"});
            let result = input.partial_update(&json);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                PartialUpdateError::TypeMismatch(_) => {}
                _ => panic!("Expected TypeMismatch error"),
            }
        }

        #[test]
        fn update_multiple_values() {
            let mut input = ModelConfiguration::default();
            let json = json!({
                "min_color": [1.0, 2.0, 3.0, 4.0],
                "max_color": [5.0, 6.0, 7.0, 8.0],
                "background_color": [9.0, 10.0, 11.0, 12.0],
                "x_axis_color": [13.0, 14.0, 15.0, 16.0],
                "y_axis_color": [17.0, 18.0, 19.0, 20.0],
                "z_axis_color": [21.0, 22.0, 23.0, 24.0],
                "grid_cylinder_radius": 25.0,
                "grid_cylinder_length": 26.0,
                "grid_cone_length": 27.0,
                "grid_cone_radius": 28.0,
                "glyph_offset": 29.0,
                "z_height_ratio": 30.0,
                "min_glyph_height": 31.0,
                "light_location": [32.0, 33.0, 34.0],
                "light_color": [35.0, 36.0, 37.0, 38.0],
                "light_intensity": 39.0,
                "glyph_size": 40.0,
                "model_origin": [41.0, 42.0, 43.0],
            });
            let result = input.partial_update(&json);
            assert!(result.is_ok());
            assert_eq!(input.min_color, [1.0, 2.0, 3.0, 4.0]);
            assert_eq!(input.max_color, [5.0, 6.0, 7.0, 8.0]);
            assert_eq!(input.background_color, [9.0, 10.0, 11.0, 12.0]);
            assert_eq!(input.x_axis_color, [13.0, 14.0, 15.0, 16.0]);
            assert_eq!(input.y_axis_color, [17.0, 18.0, 19.0, 20.0]);
            assert_eq!(input.z_axis_color, [21.0, 22.0, 23.0, 24.0]);
            assert_eq!(input.grid_cylinder_radius, 25.0);
            assert_eq!(input.grid_cylinder_length, 26.0);
            assert_eq!(input.grid_cone_length, 27.0);
            assert_eq!(input.grid_cone_radius, 28.0);
            assert_eq!(input.glyph_offset, 29.0);
            assert_eq!(input.z_height_ratio, 30.0);
            assert_eq!(input.min_glyph_height, 31.0);
            assert_eq!(input.light_location, [32.0, 33.0, 34.0]);
            assert_eq!(input.light_color, [35.0, 36.0, 37.0, 38.0]);
            assert_eq!(input.light_intensity, 39.0);
            assert_eq!(input.glyph_size, 40.0);
            assert_eq!(input.model_origin, [41.0, 42.0, 43.0]);
        }
    }
}
