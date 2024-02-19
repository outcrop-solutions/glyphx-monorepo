mod accumulated_field_definition;
mod accumulated_field_definition_errors;
mod date_field_definition;
mod date_field_definition_errors;
mod field_definition_collection;
mod field_definition_errors;
mod standard_field_definition;
mod standard_field_definition_errors;
use std::os::linux::raw;

pub use accumulated_field_definition::{
    AccumulatedFieldDefinition, AccumulatorFieldDefinition, AccumulatorType,
};
pub use accumulated_field_definition_errors::FromJsonError as AccumulatedFieldDefinitionFromJsonError;
pub use date_field_definition::{DateFieldDefinition, DateGrouping};
pub use date_field_definition_errors::FromJsonError as DateFieldDefinitionFromJsonError;
pub use field_definition_collection::FieldDefinitionCollection;
pub use field_definition_errors::*;
pub use standard_field_definition::StandardFieldDefinition;
pub use standard_field_definition_errors::FromJsonError as StandardFieldDefinitionFromJsonError;

use crate::types::vectorizer_parameters::helper_functions::json_has_field;

use crate::types::vectorizer_parameters::FieldDefinitionType;
use crate::types::FieldType;
use glyphx_core::GlyphxErrorData;
use serde_json::{json, Value};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FieldDefinition {
    Standard {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: StandardFieldDefinition,
        field_query: String,
        raw_query: String,
    },
    //    Formula(FormulaFieldDefinition),
    Date {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: DateFieldDefinition,
        field_query: String,
        raw_query: String,
    },
    Accumulated {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: AccumulatorFieldDefinition,
        field_query: String,
        raw_query: String,
    },
    Unknown(),
}

impl FieldDefinition {
    pub fn from_json(input: &Value) -> Result<FieldDefinition, FromJsonError> {
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

    fn build_accumulated_field(
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: &Value,
    ) -> Result<FieldDefinition, FromJsonError> {
        let accumulated_field_definition = AccumulatorFieldDefinition::from_json(field_definition);
        if accumulated_field_definition.is_err() {
            let err = accumulated_field_definition.err().unwrap();
            let err = FromJsonError::from_accumulated_field_from_json_error(err);
            return Err(err);
        }
        let accumulated_field_definition = accumulated_field_definition.unwrap();
        let (field_query, raw_query) = accumulated_field_definition.get_query(&field_display_name);
        Ok(FieldDefinition::Accumulated {
            field_display_name,
            field_data_type,
            field_definition: accumulated_field_definition,
            field_query,
            raw_query,
        })
    }
    fn build_date_field(
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: &Value,
    ) -> Result<FieldDefinition, FromJsonError> {
        let date_field_definition = DateFieldDefinition::from_json(field_definition);
        if date_field_definition.is_err() {
            let err = date_field_definition.err().unwrap();
            let err = FromJsonError::from_date_field_from_json_error(err);
            return Err(err);
        }
        let date_field_definition = date_field_definition.unwrap();
        let (field_query, raw_query) = date_field_definition.get_query(&field_display_name);
        let field_query = date_field_definition.get_query(&field_display_name);

        Ok(FieldDefinition::Date {
            field_display_name,
            field_data_type,
            field_definition: date_field_definition,
            field_query,
            raw_query,
        })
    }

    fn build_standard_field(
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: &Value,
    ) -> Result<FieldDefinition, FromJsonError> {
        let standard_field_definition = StandardFieldDefinition::from_json(field_definition);
    
        if standard_field_definition.is_err() {
            let err = standard_field_definition.err().unwrap();
            let err = FromJsonError::from_standard_field_from_json_error(err);
            return Err(err);
        }

        let standard_field_definition = standard_field_definition.unwrap();
        let (field_query, raw_query) = standard_field_definition.get_query(&field_display_name);
        let field_query = standard_field_definition.get_query(&field_display_name);
        Ok(FieldDefinition::Standard {
            field_display_name,
            field_data_type,
            field_definition: standard_field_definition,
            field_query,
            raw_query,
        })
    }

    fn get_field_data_type(input: &Value) -> Result<FieldType, FromJsonError> {
        let field_name = input["fieldDisplayName"].as_str().unwrap().to_string();
        let raw_field_data_type = input["fieldDataType"].as_u64().unwrap() as usize;
        let field_data_type = FieldType::from_numeric_value(raw_field_data_type);
        match field_data_type {
            FieldType::Unknown => {
                let description = format!("Invalid field data type: {}", raw_field_data_type);
                let data = json!( {
                "field": field_name,
                "field_type": raw_field_data_type
                });
                let err = FromJsonError::InvalidFieldType(GlyphxErrorData::new(
                    description,
                    Some(data),
                    None,
                ));
                return Err(err);
            }

            _ => Ok(field_data_type),
        }
    }

    fn get_field_definition_type(input: &Value) -> Result<FieldDefinitionType, FromJsonError> {
        let s = input.to_string();
        let field_display_name = input["fieldDisplayName"].as_str().unwrap().to_string();
        let raw_field_definition_type = input["fieldDefinition"]["fieldType"].as_str().unwrap();
        let field_definition_type = FieldDefinitionType::from_string(raw_field_definition_type);

        if field_definition_type.is_none() {
            let description = format!(
                "Invalid field definition type: {}",
                raw_field_definition_type
            );
            let data = json!( {
                "field": field_display_name,
                "field_definition_type": raw_field_definition_type
            });
            let err = FromJsonError::InvalidFieldDefinitionType(GlyphxErrorData::new(
                description,
                Some(data),
                None,
            ));
            return Err(err);
        }
        Ok(field_definition_type.unwrap())
    }

    fn validate_outer_json(input: &Value) -> Result<(), FromJsonError> {
        let has_field_display_name = json_has_field(input, "fieldDisplayName");

        if has_field_display_name.is_err() {
            let err = has_field_display_name.err().unwrap();
            let err = FromJsonError::from_json_has_field_error(err);
            return Err(err);
        }

        let has_field_data_type = json_has_field(input, "fieldDataType");
        if has_field_data_type.is_err() {
            let err = has_field_data_type.err().unwrap();
            let err = FromJsonError::from_json_has_field_error(err);
            return Err(err);
        }

        let has_field_definition = json_has_field(input, "fieldDefinition");
        if has_field_definition.is_err() {
            let err = has_field_definition.err().unwrap();
            let err = FromJsonError::from_json_has_field_error(err);
            return Err(err);
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
    pub fn get_field_query(&self) -> &str {
        match self {
            FieldDefinition::Standard {
                field_query, ..
            } => field_query.as_str(),
            FieldDefinition::Date {
                field_query, ..
            } => field_query.as_str(),
            FieldDefinition::Accumulated {
                field_query, ..
            } => field_query.as_str(),
            _ => "",
        }
    }

    pub fn get_raw_query(&self) -> &str {
        match self {
            FieldDefinition::Standard {
                raw_query, ..
            } => raw_query.as_str(),
            FieldDefinition::Date {
                raw_query, ..
            } => raw_query.as_str(),
            FieldDefinition::Accumulated {
                raw_query, ..
            } => raw_query.as_str(),
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

    pub fn get_query_parts(&self) -> (String, String, String) {
        let field_value;
        let field_name;
        let raw_field_query;
        match self {
            FieldDefinition::Standard {
                field_definition,
                field_display_name,
                ..
            } => {
                field_name = field_display_name.clone();
                (field_value, raw_field_query) = field_definition.get_query(&field_name);
            }
            FieldDefinition::Date {
                field_definition,
                field_display_name,
                ..
            } => {
                field_name = field_display_name.clone();
                (field_value, raw_field_query) = field_definition.get_query(&field_name);
            }
            FieldDefinition::Accumulated {
                field_definition,
                field_display_name,
                ..
            } => {
                field_name = field_display_name.clone();
                (field_value, raw_field_query) = field_definition.get_query(&field_name);
            }

            _ => {
                panic!("Unexpected field definition");
            }
        }
        (field_name, field_value, raw_field_query)
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
                accumulated_field_definition: AccumulatedFieldDefinition::Standard(
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
                accumulated_field_definition: AccumulatedFieldDefinition::Standard(
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
mod get_field_query {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn standard() {
        let field_query = String::from(r#""test" as "test""#);
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
            field_query : field_query.clone(),
            raw_query: String::from(r#""test""#),
        };
        assert_eq!(field_definition.get_field_query(), field_query);
    }

    #[test]
    fn date() {
        let field_query = String::from(r#""test" as "test""#);
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
            field_query : field_query.clone(),
            raw_query: String::from(r#""test""#),
        };
        assert_eq!(field_definition.get_field_query(), field_query);
    }

    #[test]
    fn accumulated() {
        let field_query = String::from(r#""test" as "test""#);
        let field_definition = FieldDefinition::Accumulated {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: AccumulatorFieldDefinition {
                accumulator_type: AccumulatorType::SUM,
                field_type: FieldDefinitionType::ACCUMULATED,
                accumulated_field_definition: AccumulatedFieldDefinition::Standard(
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
            field_query : field_query.clone(),
            raw_query: String::from(r#""test""#),
        };
        assert_eq!(field_definition.get_field_query(), field_query);
    }

    #[test]
    fn unknown() {
        let field_definition = FieldDefinition::Unknown();
        assert_eq!(field_definition.get_field_query(), "");
    }
}

#[cfg(test)]
mod get_raw_query {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    #[test]
    fn standard() {
        let raw_query = String::from(r#""test""#);
        let field_definition = FieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
            field_query : String::from(r#""test" as "test""#),
            raw_query: raw_query.clone(),
        };
        assert_eq!(field_definition.get_raw_query(), raw_query);
    }

    #[test]
    fn date() {
        let raw_query = String::from(r#""test""#);
        let field_definition = FieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
            field_query : String::from(r#""test" as "test""#),
            raw_query: raw_query.clone(),
        };
        assert_eq!(field_definition.get_raw_query(), raw_query);
    }

    #[test]
    fn accumulated() {
        let raw_query = String::from(r#""test""#);
        let field_definition = FieldDefinition::Accumulated {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: AccumulatorFieldDefinition {
                accumulator_type: AccumulatorType::SUM,
                field_type: FieldDefinitionType::ACCUMULATED,
                accumulated_field_definition: AccumulatedFieldDefinition::Standard(
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
            field_query : String::from(r#""test" as "test""#),
            raw_query: raw_query.clone(),
        };
        assert_eq!(field_definition.get_raw_query(), raw_query);
    }

    #[test]
    fn unknown() {
        let field_definition = FieldDefinition::Unknown();
        assert_eq!(field_definition.get_raw_query(), "");
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
                accumulated_field_definition: AccumulatedFieldDefinition::Standard(
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
                accumulated_field_definition: AccumulatedFieldDefinition::Standard(
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
                accumulated_field_definition: AccumulatedFieldDefinition::Standard(
                    StandardFieldDefinition {
                        field_type: FieldDefinitionType::Standard,
                        field_name: "test".to_string(),
                    },
                ),
            },
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            field_query: String::from(r#""test" as "test""#),
            raw_query: String::from(r#""test""#),
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
            FromJsonError::FieldNotDefined(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "fieldDisplayName");
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
            FromJsonError::FieldNotDefined(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "fieldDataType");
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
            FromJsonError::FieldNotDefined(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "fieldDefinition");
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
                field_query,
                raw_query,
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
            FromJsonError::StandardFieldDefinitionError(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "fieldName");
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
                field_query,
                raw_query,
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
            FromJsonError::DateFieldDefinitionError(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "dateGrouping");
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
                field_query,
                raw_query,
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
            FromJsonError::AccumulatorFieldDefinitionError(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "accumulatedFieldDefinition");
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
            FromJsonError::FieldNotDefined(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "fieldDisplayName");
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
            FromJsonError::InvalidFieldType(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "test");
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
            FromJsonError::InvalidFieldDefinitionType(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "test");
                assert_eq!(d["field_definition_type"], "invalid");
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
            FromJsonError::InvalidFieldDefinitionType(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "test");
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
            FromJsonError::InvalidFieldType(data) => {
                let d = data.data.unwrap();
                assert_eq!(d["field"], "test");
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}
#[cfg(test)]
mod get_query_parts {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use serde_json::json;

    #[test]
    fn standard_field() {
        let display_name = "some_standard";
        let internal_field_name = "test";
        let input = json!({
            "fieldDisplayName": display_name,
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": internal_field_name
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let (field_name, field_value, raw_query) = result.get_query_parts();
        assert_eq!(field_name, display_name);
        let expected_value = format!(r#""{}" as "{}""#, internal_field_name, display_name);
        assert_eq!(field_value, expected_value);

        let raw_expected_value = format!(r#""{}""#, internal_field_name);
        assert_eq!(raw_query, raw_expected_value);
    }

    #[test]
    fn date_field() {
        let display_name = "some_date";
        let internal_field_name = "test";
        let input = json!({
            "fieldDisplayName": display_name,
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "date",
                "fieldName": internal_field_name,
                "dateGrouping": "day_of_month"
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let (field_name, field_value, raw_query) = result.get_query_parts();
        assert_eq!(field_name, display_name);
        let expected_value = format!(
            r#"day(from_unixtime("{}"/1000)) as "{}""#,
            internal_field_name, display_name
        );
        assert_eq!(field_value, expected_value);

        let raw_expected_value = format!(
            r#"day(from_unixtime("{}"/1000))"#,
            internal_field_name
        );
        assert_eq!(raw_query, raw_expected_value);
    }

    #[test]
    fn accumulator_field_standard() {
        let display_name = "some_accumulator";
        let internal_field_name = "test";
        let input = json!({
            "fieldDisplayName": display_name,
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "accumulated",
                "accumulator": "sum",
                "accumulatedFieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": internal_field_name
                }
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let (field_name, field_value, raw_query) = result.get_query_parts();
        assert_eq!(field_name, display_name);
        let expected_value = format!(r#"SUM("{}") as "{}""#, internal_field_name, display_name);
        assert_eq!(field_value, expected_value);

        let raw_expected_value = format!(r#"SUM("{}")"#, internal_field_name);
        assert_eq!(raw_query, raw_expected_value);
    }

    #[test]
    fn accumulator_field_date() {
        let display_name = "some_accumulator";
        let internal_field_name = "test";
        let input = json!({
            "fieldDisplayName": display_name,
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "accumulated",
                "accumulator": "sum",
                "accumulatedFieldDefinition": {
                    "fieldType": "date",
                    "fieldName": internal_field_name,
                    "dateGrouping": "day_of_month"
                }
            }
        });
        let result = FieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let (field_name, field_value, raw_query) = result.get_query_parts();
        assert_eq!(field_name, display_name);
        let expected_value = format!(r#"SUM(day(from_unixtime("{}"/1000))) as "{}""#, internal_field_name, display_name);
        assert_eq!(field_value, expected_value);

        let raw_expected_value = format!(r#"SUM(day(from_unixtime("{}"/1000)))"#, internal_field_name);
        assert_eq!(raw_query, raw_expected_value);
    }
}
