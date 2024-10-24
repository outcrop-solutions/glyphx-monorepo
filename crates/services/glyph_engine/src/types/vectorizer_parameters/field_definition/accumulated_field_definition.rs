use crate::types::field_definition_type::FieldDefinitionType;
use crate::types::vectorizer_parameters::{DateFieldDefinition, StandardFieldDefinition};

use super::AccumulatedFieldDefinitionFromJsonError;
use crate::types::vectorizer_parameters::helper_functions::json_has_field;
use glyphx_core::GlyphxErrorData;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum AccumulatorType {
    SUM,
    AVG,
    MIN,
    MAX,
    COUNT,
}

impl AccumulatorType {
    pub fn from_str(input: &str) -> Self {
        let input = input.trim();
        let input = input.to_lowercase();
        let input = input.as_str();
        match input {
            "sum" => AccumulatorType::SUM,
            "avg" => AccumulatorType::AVG,
            "min" => AccumulatorType::MIN,
            "max" => AccumulatorType::MAX,
            "count" => AccumulatorType::COUNT,
            _ => AccumulatorType::SUM,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AccumulatedFieldDefinition {
    Standard(StandardFieldDefinition),
    //FormulaFieldDefinition(FormulaFieldDefinition),
    Date(DateFieldDefinition),
    Unknown(),
}

impl AccumulatedFieldDefinition {
    pub fn from_json(
        input: &Value,
        field_name: &str,
    ) -> Result<AccumulatedFieldDefinition, AccumulatedFieldDefinitionFromJsonError> {
        let field_definition_type = Self::get_field_definition_type(input, field_name);

        if field_definition_type.is_err() {
            return Err(field_definition_type.err().unwrap());
        }
        let field_definition_type = field_definition_type.unwrap();

        match field_definition_type {
            FieldDefinitionType::Standard => Self::build_standard_field(input),
            FieldDefinitionType::Date => Self::build_date_field(input),
            _ => Ok(AccumulatedFieldDefinition::Unknown()),
        }
    }

    fn build_date_field(
        field_definition: &Value,
    ) -> Result<AccumulatedFieldDefinition, AccumulatedFieldDefinitionFromJsonError> {
        let date_field_definition = DateFieldDefinition::from_json(field_definition);
        if date_field_definition.is_err() {
            let err = date_field_definition.err().unwrap();
            let err = AccumulatedFieldDefinitionFromJsonError::from_date_field_from_json_error(err);
            return Err(err);
        }

        Ok(AccumulatedFieldDefinition::Date(
            date_field_definition.unwrap(),
        ))
    }

    fn build_standard_field(
        field_definition: &Value,
    ) -> Result<AccumulatedFieldDefinition, AccumulatedFieldDefinitionFromJsonError> {
        let standard_field_definition = StandardFieldDefinition::from_json(field_definition);
        if standard_field_definition.is_err() {
            let err = standard_field_definition.err().unwrap();
            let err =
                AccumulatedFieldDefinitionFromJsonError::from_standard_field_from_json_error(err);
            return Err(err);
        }

        Ok(AccumulatedFieldDefinition::Standard(
            standard_field_definition.unwrap(),
        ))
    }

    fn get_field_definition_type(
        input: &Value,
        field_display_name: &str,
    ) -> Result<FieldDefinitionType, AccumulatedFieldDefinitionFromJsonError> {
        let raw_field_definition_type = &input["fieldType"];
        if raw_field_definition_type.is_null() {
            let description = "Missing field definition type".to_string();
            let data = json!({ "field": field_display_name });
            return Err(AccumulatedFieldDefinitionFromJsonError::FieldNotDefined(
                GlyphxErrorData::new(description, Some(data), None),
            ));
        }
        let raw_field_definition_type = raw_field_definition_type.as_str().unwrap();
        let field_definition_type = FieldDefinitionType::from_string(raw_field_definition_type);

        if field_definition_type.is_none() {
            let description = format!(
                "Invalid field definition type: {}",
                raw_field_definition_type
            );
            let data = json!({ "field" : field_display_name, "fieldDefinitionType": raw_field_definition_type});
            return Err(
                AccumulatedFieldDefinitionFromJsonError::InvalidFieldDefinitionType(
                    GlyphxErrorData::new(description, Some(data), None),
                ),
            );
        }
        Ok(field_definition_type.unwrap())
    }

    pub fn is_standard(&self) -> bool {
        match self {
            AccumulatedFieldDefinition::Standard { .. } => true,
            _ => false,
        }
    }

    pub fn is_date(&self) -> bool {
        match self {
            AccumulatedFieldDefinition::Date { .. } => true,
            _ => false,
        }
    }

    pub fn get_standard_field_definition(&self) -> Option<&StandardFieldDefinition> {
        match self {
            AccumulatedFieldDefinition::Standard(field_definition) => Some(field_definition),
            _ => None,
        }
    }

    pub fn get_date_field_definition(&self) -> Option<&DateFieldDefinition> {
        match self {
            AccumulatedFieldDefinition::Date(field_definition) => Some(field_definition),
            _ => None,
        }
    }

    pub fn get_query(&self) -> String {
        let query = match self {
            AccumulatedFieldDefinition::Standard(field_definition) => {
                let (_, raw_query) = field_definition.get_query("foo");
                raw_query
            }
            AccumulatedFieldDefinition::Date(field_definition) => {
                let (_, raw_query) = field_definition.get_query("foo");
                raw_query
            }
            _ => "Formula Field".to_string(),
        };

        query
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccumulatorFieldDefinition {
    pub field_type: FieldDefinitionType,
    pub accumulator_type: AccumulatorType,
    pub accumulated_field_definition: AccumulatedFieldDefinition,
}

impl AccumulatorFieldDefinition {
    pub fn from_json(
        json_value: &Value,
    ) -> Result<AccumulatorFieldDefinition, AccumulatedFieldDefinitionFromJsonError> {
        let validation_result = Self::validate_json(json_value);
        if validation_result.is_err() {
            return Err(validation_result.err().unwrap());
        }
        let raw_accumulator_type = &json_value["accumulator"].as_str().unwrap();
        let accumulator_type = AccumulatorType::from_str(raw_accumulator_type);

        let accumlated_field_definition = &json_value["accumulatedFieldDefinition"];
        let accumulated_field_definition = AccumulatedFieldDefinition::from_json(
            accumlated_field_definition,
            "accumulatedFieldDefinition",
        );
        if accumulated_field_definition.is_err() {
            let err = accumulated_field_definition.err().unwrap();
            return Err(err);
        }

        let accumulated_field_definition = accumulated_field_definition.unwrap();

        Ok(AccumulatorFieldDefinition {
            field_type: FieldDefinitionType::ACCUMULATED,
            accumulator_type,
            accumulated_field_definition,
        })
    }

    pub fn validate_json(
        json_value: &Value,
    ) -> Result<(), AccumulatedFieldDefinitionFromJsonError> {
        let has_field_field_type = json_has_field(json_value, "accumulator");
        if has_field_field_type.is_err() {
            let err = has_field_field_type.err().unwrap();
            let err = AccumulatedFieldDefinitionFromJsonError::from_json_has_field_error(err);
            return Err(err);
        }

        let has_field_data_type = json_has_field(json_value, "accumulatedFieldDefinition");
        if has_field_data_type.is_err() {
            let err = has_field_data_type.err().unwrap();
            let err = AccumulatedFieldDefinitionFromJsonError::from_json_has_field_error(err);
            return Err(err);
        }

        Ok(())
    }

    pub fn get_query(&self, display_name: &str) -> (String, String) {
        let base_query = self.accumulated_field_definition.get_query();
        let query = format!(
            r#"{:?}({}) as "{}""#,
            self.accumulator_type, base_query, display_name
        );
        let raw_query = format!(r#"{:?}({})"#, self.accumulator_type, base_query);
        (query, raw_query)
    }
}
#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatorType_from_str {
    use super::*;
    #[test]
    fn sum() {
        let accumulator_type = AccumulatorType::from_str("sum");
        match accumulator_type {
            AccumulatorType::SUM => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn avg() {
        let accumulator_type = AccumulatorType::from_str("avg");
        match accumulator_type {
            AccumulatorType::AVG => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn min() {
        let accumulator_type = AccumulatorType::from_str("min");
        match accumulator_type {
            AccumulatorType::MIN => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn max() {
        let accumulator_type = AccumulatorType::from_str("max");
        match accumulator_type {
            AccumulatorType::MAX => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn count() {
        let accumulator_type = AccumulatorType::from_str("count");
        match accumulator_type {
            AccumulatorType::COUNT => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn default() {
        let accumulator_type = AccumulatorType::from_str("default");
        match accumulator_type {
            AccumulatorType::SUM => assert!(true),
            _ => assert!(false),
        }
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_is_standard {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{
        DateFieldDefinition, DateGrouping, StandardFieldDefinition,
    };

    #[test]
    fn is_standard() {
        let accumulated_field_definition =
            AccumulatedFieldDefinition::Standard(StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            });

        assert!(accumulated_field_definition.is_standard());
    }

    #[test]
    fn not_standard() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date(DateFieldDefinition {
            field_type: FieldDefinitionType::Date,
            field_name: "test".to_string(),
            date_grouping: DateGrouping::DayOfMonth,
        });
        assert!(!accumulated_field_definition.is_standard());
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_is_date {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{
        DateFieldDefinition, DateGrouping, StandardFieldDefinition,
    };

    #[test]
    fn is_date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date(DateFieldDefinition {
            field_type: FieldDefinitionType::Date,
            field_name: "test".to_string(),
            date_grouping: DateGrouping::DayOfMonth,
        });
        assert!(accumulated_field_definition.is_date());
    }

    #[test]
    fn not_date() {
        let accumulated_field_definition =
            AccumulatedFieldDefinition::Standard(StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            });
        assert!(!accumulated_field_definition.is_date());
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_get_standard_field_definition {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{
        DateFieldDefinition, DateGrouping, StandardFieldDefinition,
    };

    #[test]
    fn standard() {
        let accumulated_field_definition =
            AccumulatedFieldDefinition::Standard(StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            });
        let standard_field_definition =
            accumulated_field_definition.get_standard_field_definition();
        assert!(standard_field_definition.is_some());
        let standard_field_definition = standard_field_definition.unwrap();
        match standard_field_definition.field_type {
            FieldDefinitionType::Standard => {}
            _ => {
                panic!("Unexpected result");
            }
        }
        assert_eq!(standard_field_definition.field_name, "test");
    }

    #[test]
    fn date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date(DateFieldDefinition {
            field_type: FieldDefinitionType::Date,
            field_name: "test".to_string(),
            date_grouping: DateGrouping::DayOfMonth,
        });
        let standard_field_definition =
            accumulated_field_definition.get_standard_field_definition();
        assert!(standard_field_definition.is_none());
    }

    #[test]
    fn unknown() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Unknown();
        let standard_field_definition =
            accumulated_field_definition.get_standard_field_definition();
        assert!(standard_field_definition.is_none());
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_get_date_field_definition {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{
        DateFieldDefinition, DateGrouping, StandardFieldDefinition,
    };

    #[test]
    fn standard() {
        let accumulated_field_definition =
            AccumulatedFieldDefinition::Standard(StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            });
        let date_field_definition = accumulated_field_definition.get_date_field_definition();
        assert!(date_field_definition.is_none());
    }

    #[test]
    fn date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date(DateFieldDefinition {
            field_type: FieldDefinitionType::Date,
            field_name: "test".to_string(),
            date_grouping: DateGrouping::DayOfMonth,
        });
        let date_field_definition = accumulated_field_definition.get_date_field_definition();
        assert!(date_field_definition.is_some());
        let date_field_definition = date_field_definition.unwrap();
        match date_field_definition.field_type {
            FieldDefinitionType::Date { .. } => {}
            _ => {
                panic!("Unexpected result");
            }
        }
        assert_eq!(date_field_definition.field_name, "test");
    }

    #[test]
    fn unknown() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Unknown();
        let date_field_definition = accumulated_field_definition.get_date_field_definition();
        assert!(date_field_definition.is_none());
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_get_field_definition_type {
    use super::*;
    use serde_json::json;

    #[test]
    fn is_ok() {
        let input = json!({
            "fieldType": "standard",
        });

        let field_definition_type =
            AccumulatedFieldDefinition::get_field_definition_type(&input, "test");
        assert!(field_definition_type.is_ok());
        let field_definition_type = field_definition_type.unwrap();
        match field_definition_type {
            FieldDefinitionType::Standard => {}
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn is_err() {
        let input = json!({
            "fieldType": "unknown",
        });

        let field_definition_type =
            AccumulatedFieldDefinition::get_field_definition_type(&input, "test");
        assert!(field_definition_type.is_err());
        let field_definition_type = field_definition_type.err().unwrap();

        match field_definition_type {
            AccumulatedFieldDefinitionFromJsonError::InvalidFieldDefinitionType(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "test");
                let field_definition_type_data = data["fieldDefinitionType"].as_str().unwrap();
                assert_eq!(field_definition_type_data, "unknown");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_from_json {
    use super::*;
    use serde_json::json;

    #[test]
    fn standard_is_ok() {
        let input = json!({
            "fieldType": "standard",
            "fieldName": "test",
        });

        let accumulated_field_definition = AccumulatedFieldDefinition::from_json(&input, "test");
        assert!(accumulated_field_definition.is_ok());
        let accumulated_field_definition = accumulated_field_definition.unwrap();
        match accumulated_field_definition {
            AccumulatedFieldDefinition::Standard(_) => {}
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn date_is_ok() {
        let input = json!({
            "fieldType": "date",
            "fieldName": "test",
            "dateGrouping": "dayOfMonth",
        });

        let accumulated_field_definition = AccumulatedFieldDefinition::from_json(&input, "test");
        assert!(accumulated_field_definition.is_ok());
        let accumulated_field_definition = accumulated_field_definition.unwrap();
        match accumulated_field_definition {
            AccumulatedFieldDefinition::Date(_) => {}
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn standard_is_err() {
        let input = json!({
            "fieldType": "standard",
            "dateGrouping": "dayOfMonth",
        });

        let accumulated_field_definition = AccumulatedFieldDefinition::from_json(&input, "test");
        assert!(accumulated_field_definition.is_err());
        let accumulated_field_definition = accumulated_field_definition.err().unwrap();
        match accumulated_field_definition {
            AccumulatedFieldDefinitionFromJsonError::StandardFieldDefinitionFromJsonError(
                error_data,
            ) => {
                let data = error_data.data.unwrap();
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "fieldName");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn date_is_err() {
        let input = json!({
            "fieldType": "date",
            "fieldName": "test",
        });

        let accumulated_field_definition = AccumulatedFieldDefinition::from_json(&input, "test");
        assert!(accumulated_field_definition.is_err());
        let accumulated_field_definition = accumulated_field_definition.err().unwrap();
        let _foo = accumulated_field_definition.to_string();
        match accumulated_field_definition {
            AccumulatedFieldDefinitionFromJsonError::DateFieldDefinitionFromJsonError(
                error_data,
            ) => {
                let data = error_data.data.unwrap();
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "dateGrouping");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatorFieldDefinition_validate_json {
    use super::*;
    use serde_json::json;

    #[test]
    fn is_ok() {
        let input = json!({
            "accumulator": "sum",
            "accumulatedFieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test",
            },
        });

        let result = AccumulatorFieldDefinition::validate_json(&input);
        assert!(result.is_ok());
    }

    #[test]
    fn accumulator_is_missing() {
        let input = json!({
            "accumulatedFieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test",
            },
        });

        let result = AccumulatorFieldDefinition::validate_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            AccumulatedFieldDefinitionFromJsonError::FieldNotDefined(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "accumulator");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn accumulatedFieldDefinition_is_missing() {
        let input = json!({
            "accumulator": "sum",
        });

        let result = AccumulatorFieldDefinition::validate_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            AccumulatedFieldDefinitionFromJsonError::FieldNotDefined(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "accumulatedFieldDefinition");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatorFieldDefinition_from_json {
    use super::*;
    use serde_json::json;

    #[test]
    fn is_ok() {
        let input = json!({
            "accumulator": "sum",
            "accumulatedFieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test",
            },
        });

        let result = AccumulatorFieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        match result.field_type {
            FieldDefinitionType::ACCUMULATED => {}
            _ => {
                panic!("Unexpected result");
            }
        }
        match result.accumulator_type {
            AccumulatorType::SUM => {}
            _ => {
                panic!("Unexpected result");
            }
        }
        match result.accumulated_field_definition {
            AccumulatedFieldDefinition::Standard(_) => {}
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn validation_fails() {
        let input = json!({
            "accumulatedFieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test",
            },
        });

        let result = AccumulatorFieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            AccumulatedFieldDefinitionFromJsonError::FieldNotDefined(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "accumulator");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn accumulatedFieldDefinition_fails() {
        let input = json!({
            "accumulator": "sum",
            "accumulatedFieldDefinition": {
                "fieldType": "invalid",
                "fieldName": "test",
            },
        });

        let result = AccumulatorFieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        let _foo = result.to_string();
        match result {
            AccumulatedFieldDefinitionFromJsonError::InvalidFieldDefinitionType(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "accumulatedFieldDefinition");
                let field_definition_type_data = data["fieldDefinitionType"].as_str().unwrap();
                assert_eq!(field_definition_type_data, "invalid");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}
