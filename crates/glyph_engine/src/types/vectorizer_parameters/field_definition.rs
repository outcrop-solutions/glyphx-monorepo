mod accumulated_field_definition;
mod date_field_definition;
mod standard_field_definition;
mod field_definition_collection;

pub use accumulated_field_definition::{
    AccumulatedFieldDefinition, AccumulatorFieldDefinition, AccumulatorType,
};
pub use date_field_definition::{DateFieldDefinition, DateGrouping};
pub use standard_field_definition::StandardFieldDefinition;
pub use field_definition_collection::FieldDefinitionCollection;

use crate::types::vectorizer_parameters::{
    json_value_has_field, FieldDefinitionType, VectorizerParametersError,
    VectorizerParametersFunction,
};
use crate::types::FieldType;
use serde_json::Value;
#[derive(Debug, Clone)]
pub enum FieldDefinition {
    Standard {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: StandardFieldDefinition,
    },
    //    Formula(FormulaFieldDefinition),
    Date {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: DateFieldDefinition,
    },
    Accumulated {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: AccumulatorFieldDefinition,
    },
    Unknown(),
}

impl FieldDefinition {
    pub fn from_json(input: &Value) -> Result<FieldDefinition, VectorizerParametersError> {
        let validation_result = Self::validate_outer_json(input);
        if validation_result.is_err() {
            return Err(validation_result.err().unwrap());
        }

        let field_display_name = input["fieldDisplayName"].as_str().unwrap().to_string();
        let field_data_type = Self::get_field_data_type(input);
        if field_data_type.is_err() {
            return Err(field_data_type.err().unwrap());
        }
        let field_data_type = field_data_type.unwrap();
        let field_definition = &input["fieldDefinition"];
        let field_definition_type = Self::get_field_definition_type(input);

        if field_definition_type.is_err() {
            return Err(field_definition_type.err().unwrap());
        }
        let field_definition_type = field_definition_type.unwrap();

        match field_definition_type {
            FieldDefinitionType::Standard => {
                Self::build_standard_field(field_display_name, field_data_type, field_definition)
            }
            FieldDefinitionType::Date => {
                Self::build_date_field(field_display_name, field_data_type, field_definition)
            }
            FieldDefinitionType::ACCUMULATED => {
                Self::build_accumulated_field(field_display_name, field_data_type, field_definition)
            }
            _ => Ok(FieldDefinition::Unknown()),
        }
    }

    fn build_accumulated_field( field_display_name: String, field_data_type: FieldType, field_definition: &Value ) ->  Result<FieldDefinition, VectorizerParametersError> {

       let accumulated_field_definition = AccumulatorFieldDefinition::from_json(field_definition); 
       if accumulated_field_definition.is_err() {
           let err = accumulated_field_definition.err().unwrap();
           let err = VectorizerParametersError::change_operation(err, VectorizerParametersFunction::FieldDefinitionFromJsonValue);
           return Err(err);
       }

       Ok(FieldDefinition::Accumulated {
           field_display_name,
           field_data_type,
           field_definition: accumulated_field_definition.unwrap(),
       })
    } 
    fn build_date_field( field_display_name: String, field_data_type: FieldType, field_definition: &Value ) ->  Result<FieldDefinition, VectorizerParametersError> {

       let date_field_definition = DateFieldDefinition::from_json(field_definition); 
       if date_field_definition.is_err() {
           let err = date_field_definition.err().unwrap();
           let err = VectorizerParametersError::change_operation(err, VectorizerParametersFunction::FieldDefinitionFromJsonValue);
           return Err(err);
       }

       Ok(FieldDefinition::Date {
           field_display_name,
           field_data_type,
           field_definition: date_field_definition.unwrap(),
       })
    }

    fn build_standard_field(
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: &Value,
    ) -> Result<FieldDefinition, VectorizerParametersError> {
        let standard_field_definition = StandardFieldDefinition::from_json(field_definition);
        if standard_field_definition.is_err() {
            let err = standard_field_definition.err().unwrap();
            let err = VectorizerParametersError::change_operation(
                err,
                VectorizerParametersFunction::FieldDefinitionFromJsonValue,
            );
            return Err(err);
        }

        Ok(FieldDefinition::Standard {
            field_display_name,
            field_data_type,
            field_definition: standard_field_definition.unwrap(),
        })
    }
    fn get_field_data_type(input: &Value) -> Result<FieldType, VectorizerParametersError> {
        let field_name = input["fieldDisplayName"].as_str().unwrap().to_string();
        let raw_field_data_type = input["fieldDataType"].as_u64().unwrap() as usize;
        let field_data_type = FieldType::from_numeric_value(raw_field_data_type);
        match field_data_type {
            FieldType::Unknown => Err(VectorizerParametersError::InvalidFieldType {
                operation: VectorizerParametersFunction::FieldDefinitionFromJsonValue,
                description: format!("Invalid field data type: {}", raw_field_data_type),
                field: field_name,
                field_type: raw_field_data_type,
            }),

            _ => Ok(field_data_type),
        }
    }
    fn get_field_definition_type(
        input: &Value,
    ) -> Result<FieldDefinitionType, VectorizerParametersError> {
        let field_display_name = input["fieldDisplayName"].as_str().unwrap().to_string();
        let raw_field_definition_type = input["fieldDefinition"]["fieldType"].as_str().unwrap();
        let field_definition_type = FieldDefinitionType::from_string(raw_field_definition_type);

        if field_definition_type.is_none() {
            return Err(VectorizerParametersError::InvalidFieldDefinitionType {
                operation: VectorizerParametersFunction::FieldDefinitionFromJsonValue,
                description: format!(
                    "Invalid field definition type: {}",
                    raw_field_definition_type
                ),
                field: field_display_name,
                json: format!("{}", input),
            });
        }
        Ok(field_definition_type.unwrap())
    }

    fn validate_outer_json(input: &Value) -> Result<(), VectorizerParametersError> {
        let has_field_display_name = json_value_has_field(
            input,
            "fieldDisplayName",
            VectorizerParametersFunction::FieldDefinitionFromJsonValue,
        );
        if has_field_display_name.is_err() {
            return Err(has_field_display_name.err().unwrap());
        }

        let has_field_data_type = json_value_has_field(
            input,
            "fieldDataType",
            VectorizerParametersFunction::FieldDefinitionFromJsonValue,
        );
        if has_field_data_type.is_err() {
            return Err(has_field_data_type.err().unwrap());
        }

        let has_field_definition = json_value_has_field(
            input,
            "fieldDefinition",
            VectorizerParametersFunction::FieldDefinitionFromJsonValue,
        );
        if has_field_definition.is_err() {
            return Err(has_field_definition.err().unwrap());
        }

        Ok(())
    }
    pub fn is_standard(&self) -> bool {
        match self {
            FieldDefinition::Standard { .. } => true,
            _ => false,
        }
    }

    pub fn is_date(&self) -> bool {
        match self {
            FieldDefinition::Date { .. } => true,
            _ => false,
        }
    }

    pub fn is_accumulated(&self) -> bool {
        match self {
            FieldDefinition::Accumulated { .. } => true,
            _ => false,
        }
    }

    pub fn get_field_display_name(&self) -> &str {
        match self {
            FieldDefinition::Standard {
                field_display_name, ..
            } => field_display_name.as_str(),
            FieldDefinition::Date {
                field_display_name, ..
            } => field_display_name.as_str(),
            FieldDefinition::Accumulated {
                field_display_name, ..
            } => field_display_name.as_str(),
            _ => "",
        }
    }

    pub fn get_standard_field_definition(&self) -> Option<&StandardFieldDefinition> {
        match self {
            FieldDefinition::Standard {
                field_definition, ..
            } => Some(field_definition),
            _ => None,
        }
    }

    pub fn get_date_field_definition(&self) -> Option<&DateFieldDefinition> {
        match self {
            FieldDefinition::Date {
                field_definition, ..
            } => Some(field_definition),
            _ => None,
        }
    }

    pub fn get_accumulator_field_definition(&self) -> Option<&AccumulatorFieldDefinition> {
        match self {
            FieldDefinition::Accumulated {
                field_definition, ..
            } => Some(field_definition),
            _ => None,
        }
    }
}

#[cfg(test)]
mod is_standard {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn is_standard() {
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        assert!(field_definition.is_standard());
    }

    #[test]
    fn not_standard() {
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        assert!(!field_definition.is_standard());
    }
}

#[cfg(test)]
mod is_date {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn is_date() {
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        assert!(field_definition.is_date());
    }

    #[test]
    fn not_date() {
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        assert!(!field_definition.is_date());
    }
}

#[cfg(test)]
mod is_accumulated {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn is_accumulated() {
        let field_definition = FieldDefinition::Accumulated {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: AccumulatorFieldDefinition {
                accumulator_type: AccumulatorType::SUM,
                field_type: FieldDefinitionType::ACCUMULATED,
                accumulated_field_definition: AccumulatedFieldDefinition::Standard (
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
        };
        assert!(field_definition.is_accumulated());
    }

    #[test]
    fn not_accumulated() {
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        assert!(!field_definition.is_accumulated());
    }
}

#[cfg(test)]
mod get_field_display_name {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn standard() {
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        assert_eq!(field_definition.get_field_display_name(), "test");
    }

    #[test]
    fn date() {
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        assert_eq!(field_definition.get_field_display_name(), "test");
    }

    #[test]
    fn accumulated() {
        let field_definition = FieldDefinition::Accumulated {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: AccumulatorFieldDefinition {
                accumulator_type: AccumulatorType::SUM,
                field_type: FieldDefinitionType::ACCUMULATED,
                accumulated_field_definition: AccumulatedFieldDefinition::Standard (
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
        };
        assert_eq!(field_definition.get_field_display_name(), "test");
    }

    #[test]
    fn unknown() {
        let field_definition = FieldDefinition::Unknown();
        assert_eq!(field_definition.get_field_display_name(), "");
    }
}

#[cfg(test)]
mod get_standard_field_definition {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn standard() {
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        let result = field_definition.get_standard_field_definition();
        assert!(result.is_some());
        let result = result.unwrap();
        assert_eq!(result.field_name, "test");
    }

    #[test]
    fn date() {
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        let result = field_definition.get_standard_field_definition();
        assert!(result.is_none());
    }

    #[test]
    fn accumulated() {
        let field_definition = FieldDefinition::Accumulated {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: AccumulatorFieldDefinition {
                accumulator_type: AccumulatorType::SUM,
                field_type: FieldDefinitionType::ACCUMULATED,
                accumulated_field_definition: AccumulatedFieldDefinition::Standard (
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
        };
        let result = field_definition.get_standard_field_definition();
        assert!(result.is_none());
    }

    #[test]
    fn unknown() {
        let field_definition = FieldDefinition::Unknown();
        let result = field_definition.get_standard_field_definition();
        assert!(result.is_none());
    }
}

#[cfg(test)]
mod get_date_field_definition {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn date() {
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        let result = field_definition.get_date_field_definition();
        assert!(result.is_some());
        let result = result.unwrap();
        assert_eq!(result.field_name, "test");
    }

    #[test]
    fn standard() {
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        let result = field_definition.get_date_field_definition();
        assert!(result.is_none());
    }

    #[test]
    fn accumulated() {
        let field_definition = FieldDefinition::Accumulated {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: AccumulatorFieldDefinition {
                accumulator_type: AccumulatorType::SUM,
                field_type: FieldDefinitionType::ACCUMULATED,
                accumulated_field_definition: AccumulatedFieldDefinition::Standard (
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
        };
        let result = field_definition.get_date_field_definition();
        assert!(result.is_none());
    }

    #[test]
    fn unknown() {
        let field_definition = FieldDefinition::Unknown();
        let result = field_definition.get_date_field_definition();
        assert!(result.is_none());
    }
}

#[cfg(test)]
mod get_accumulator_field_definition {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;

    #[test]
    fn accumulated() {
        let field_definition = FieldDefinition::Accumulated {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: AccumulatorFieldDefinition {
                accumulator_type: AccumulatorType::SUM,
                field_type: FieldDefinitionType::ACCUMULATED,
                accumulated_field_definition: AccumulatedFieldDefinition::Standard (
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
        };
        let result = field_definition.get_accumulator_field_definition();
        assert!(result.is_some());
        let result = result.unwrap();
        match result.accumulator_type {
            AccumulatorType::SUM => assert!(true),
            _ => assert!(false),
        }
    }
    #[test]
    fn date() {
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        let result = field_definition.get_accumulator_field_definition();
        assert!(result.is_none());
    }

    #[test]
    fn standard() {
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        let result = field_definition.get_accumulator_field_definition();
        assert!(result.is_none());
    }

    #[test]
    fn unknown() {
        let field_definition = FieldDefinition::Unknown();
        let result = field_definition.get_accumulator_field_definition();
        assert!(result.is_none());
    }
}

#[cfg(test)]
mod validate_outer_json {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use serde_json::json;

    #[test]
    fn valid() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": "string",
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::validate_outer_json(&input);
        assert!(result.is_ok());
    }

    #[test]
    fn missing_field_display_name() {
        let input = json!({
            "fieldDataType": "string",
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::validate_outer_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "fieldDisplayName");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn missing_field_data_type() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::validate_outer_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "fieldDataType");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn missing_field_definition() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": "string"
        });
        let result = FieldDefinition::validate_outer_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "fieldDefinition");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}

#[cfg(test)]
mod from_json {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use serde_json::json;

    #[test]
    fn standard_field() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        match result {
            FieldDefinition::Standard {
                field_display_name,
                field_data_type,
                field_definition,
            } => {
                assert_eq!(field_display_name, "test");
                match field_data_type {
                    FieldType::String => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(field_definition.field_name, "test");
                match field_definition.field_type {
                    FieldDefinitionType::Standard => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn standard_field_is_error() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "standard",
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "fieldName");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
 
    #[test]
    fn date_field() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "date",
                "fieldName": "test",
                "dateGrouping": "day_of_month"
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        match result {
            FieldDefinition::Date {
                field_display_name,
                field_data_type,
                field_definition,
            } => {
                assert_eq!(field_display_name, "test");
                match field_data_type {
                    FieldType::String => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(field_definition.field_name, "test");
                match field_definition.field_type {
                    FieldDefinitionType::Date => assert!(true),
                    _ => assert!(false),
                }
                match field_definition.date_grouping {
                    DateGrouping::DayOfMonth => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn date_field_is_error() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "date",
                "fieldName": "test",
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "dateGrouping");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn accumulator_field() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "accumulated",
                "accumulator": "sum",
                "accumulatedFieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "test"
                }
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        match result {
            FieldDefinition::Accumulated {
                field_display_name,
                field_data_type,
                field_definition,
            } => {
                assert_eq!(field_display_name, "test");
                match field_data_type {
                    FieldType::String => assert!(true),
                    _ => assert!(false),
                }
                match field_definition.accumulator_type {
                    AccumulatorType::SUM => assert!(true),
                    _ => assert!(false),
                }
                match field_definition.field_type {
                    FieldDefinitionType::ACCUMULATED => assert!(true),
                    _ => assert!(false),
                }
                match field_definition.accumulated_field_definition {
                    AccumulatedFieldDefinition::Standard(standard_field_definition) => {
                        assert_eq!(standard_field_definition.field_name, "test");
                        match standard_field_definition.field_type {
                            FieldDefinitionType::Standard => assert!(true),
                            _ => assert!(false),
                        }
                    }
                    _ => {
                        panic!("Unexpected result");
                    }
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
   
    #[test]
    fn accumulator_field_is_error() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "accumulated",
                "accumulator": "sum",
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "accumulatedFieldDefinition");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn outer_validation_error() {
        let input = json!({
            "fieldDataType": "string",
            "fieldDefinition": {
                "fieldType": "standard",
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "fieldDisplayName");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn field_data_type_is_error() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 999,
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldType {
                operation,
                description: _,
                field,
                field_type,
            } => {
                assert_eq!(field, "test");
                assert_eq!(field_type, 999);
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn field_definition_type_is_error() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "invalid",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldDefinitionType {
                operation,
                description: _,
                field,
                json,
            } => {
                assert_eq!(field, "test");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
                assert!(json.len() > 0);
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}

#[cfg(test)]
mod get_field_definition_type {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use serde_json::json;

    #[test]
    fn valid() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": "string",
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::get_field_definition_type(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        match result {
            FieldDefinitionType::Standard => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn invalid() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": "string",
            "fieldDefinition": {
                "fieldType": "invalid",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::get_field_definition_type(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldDefinitionType {
                operation,
                description: _,
                field,
                json,
            } => {
                assert_eq!(field, "test");
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
                assert!(json.len() > 0);
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}

#[cfg(test)]
mod get_field_data_type {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use serde_json::json;

    #[test]
    fn valid() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::get_field_data_type(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        match result {
            FieldType::String => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn invalid() {
        let input = json!({
            "fieldDisplayName": "test",
            "fieldDataType": 999,
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "test"
            }
        });
        let result = FieldDefinition::get_field_data_type(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldType {
                operation,
                description: _,
                field,
                field_type,
            } => {
                assert_eq!(field, "test");
                assert_eq!(field_type, 999);
                match operation {
                    VectorizerParametersFunction::FieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}
