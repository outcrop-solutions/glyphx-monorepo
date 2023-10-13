use crate::types::field_type::FieldType;
use crate::types::field_definition_type::FieldDefinitionType;
use crate::types::vectorizer_parameters::{StandardFieldDefinition, DateFieldDefinition, VectorizerParametersError, VectorizerParametersFunction, json_value_has_field};
use serde_json::Value;

#[derive(Debug, Copy, Clone)]
pub enum AccumulatorType {
    SUM,
    AVG,
    MIN,
    MAX,
    COUNT
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

#[derive(Debug, Clone)]
pub enum AccumulatedFieldDefinition {
    Standard {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: StandardFieldDefinition,
    },
    //    Formula(FormulaFieldDefinition),
    Date{ 
        field_display_name: String,
        field_data_type: FieldType,
        field_definition:DateFieldDefinition
    },
    Unknown(),
}

impl AccumulatedFieldDefinition {
    
    pub fn is_standard(&self) -> bool {
        match self {
            AccumulatedFieldDefinition::Standard{..} => true,
            _ => false,
        }
    }
    
    pub fn is_date(&self) -> bool {
        match self {
            AccumulatedFieldDefinition::Date{..} => true,
            _ => false,
        }
    }
    
    pub fn get_field_display_name(&self) -> &str {
        match self {
            AccumulatedFieldDefinition::Standard{field_display_name, ..} => field_display_name.as_str(),
            AccumulatedFieldDefinition::Date{field_display_name, ..} => field_display_name.as_str(),
            _ => "",
        }
    }

    pub fn get_standard_field_definition(&self) -> Option<&StandardFieldDefinition> {
        match self {
            AccumulatedFieldDefinition::Standard{field_definition, ..} => Some(field_definition),
            _ => None,
        }
    }

    pub fn get_date_field_definition(&self) -> Option<&DateFieldDefinition> {
        match self {
            AccumulatedFieldDefinition::Date{field_definition, ..} => Some(field_definition),
            _ => None,
        }
    }
}

#[derive(Debug,Clone)]
pub struct AccumulatorFieldDefinition {
    pub field_type: FieldDefinitionType,
    pub accumulator_type: AccumulatorType,
    pub accumulated_field_definition: AccumulatedFieldDefinition, 
}
impl AccumulatorFieldDefinition {

    pub fn from_json_value( json_value: &Value) -> Result<(),VectorizerParametersError> {
      Ok(())
    }

    pub fn validate_json(json_value: &Value) -> Result<(), VectorizerParametersError > {

        let has_field_field_type = json_value_has_field(json_value, "fieldType", VectorizerParametersFunction::AccumulatedFiledDefinitionFromJsonValue); 
        if has_field_field_type.is_err() {
            return Err(has_field_field_type.err().unwrap());
             }

        let has_field_data_type = json_value_has_field(json_value, "fieldDataType", VectorizerParametersFunction::GetDateFieldDefinition);
        if has_field_data_type.is_err() {
            return Err(has_field_data_type.err().unwrap());
        }

        let has_field_definition = json_value_has_field(json_value, "fieldDefinition", VectorizerParametersFunction::GetDateFieldDefinition);
        if has_field_definition.is_err() {
            return Err(has_field_definition.err().unwrap());
        }

        let field_definition = &json_value["fieldDefinition"];
        let has_field_name = json_value_has_field(field_definition, "fieldName", VectorizerParametersFunction::GetDateFieldDefinition);
        if has_field_name.is_err() {
            return Err(has_field_name.err().unwrap());
        }

        let has_date_grouping = json_value_has_field(field_definition, "dateGrouping", VectorizerParametersFunction::GetDateFieldDefinition);
        if has_date_grouping.is_err() {
            return Err(has_date_grouping.err().unwrap());
        }
        Ok(())
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
    use crate::types::vectorizer_parameters::{StandardFieldDefinition, DateFieldDefinition, DateGrouping};

    #[test]
    fn is_standard() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        assert!(accumulated_field_definition.is_standard());
    }

    #[test]
    fn not_standard() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        assert!(!accumulated_field_definition.is_standard());
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_is_date {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{StandardFieldDefinition, DateFieldDefinition, DateGrouping};

    #[test]
    fn is_date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        assert!(accumulated_field_definition.is_date());
    }

    #[test]
    fn not_date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        assert!(!accumulated_field_definition.is_date());
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_get_field_display_name {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{StandardFieldDefinition, DateFieldDefinition, DateGrouping};

    #[test]
    fn standard() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        assert_eq!(accumulated_field_definition.get_field_display_name(), "test");
    }

    #[test]
    fn date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        assert_eq!(accumulated_field_definition.get_field_display_name(), "test");
    }

    #[test]
    fn unknown() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Unknown();
        assert_eq!(accumulated_field_definition.get_field_display_name(), "");
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_get_standard_field_definition {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{StandardFieldDefinition, DateFieldDefinition, DateGrouping};

    #[test]
    fn standard() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        let standard_field_definition = accumulated_field_definition.get_standard_field_definition();
        assert!(standard_field_definition.is_some());
        let standard_field_definition = standard_field_definition.unwrap();
        match standard_field_definition.field_type {
            FieldDefinitionType::Standard => {},
            _ => {
                panic!("Unexpected result");
            }
        }
        assert_eq!(standard_field_definition.field_name, "test");
    }

    #[test]
    fn date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        let standard_field_definition = accumulated_field_definition.get_standard_field_definition();
        assert!(standard_field_definition.is_none());
    }

    #[test]
    fn unknown() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Unknown();
        let standard_field_definition = accumulated_field_definition.get_standard_field_definition();
        assert!(standard_field_definition.is_none());
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod AccumulatedFieldDefinition_get_date_field_definition {
    use super::*;
    use crate::types::field_definition_type::FieldDefinitionType;
    use crate::types::vectorizer_parameters::{StandardFieldDefinition, DateFieldDefinition, DateGrouping};

    #[test]
    fn standard() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Standard {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name: "test".to_string(),
            },
        };
        let date_field_definition = accumulated_field_definition.get_date_field_definition();
        assert!(date_field_definition.is_none());
    }

    #[test]
    fn date() {
        let accumulated_field_definition = AccumulatedFieldDefinition::Date {
            field_display_name: "test".to_string(),
            field_data_type: FieldType::String,
            field_definition: DateFieldDefinition {
                field_type: FieldDefinitionType::Date,
                field_name: "test".to_string(),
                date_grouping: DateGrouping::DayOfMonth,
            },
        };
        let date_field_definition = accumulated_field_definition.get_date_field_definition();
        assert!(date_field_definition.is_some());
        let date_field_definition = date_field_definition.unwrap();
        match date_field_definition.field_type {
            FieldDefinitionType::Date{..} => {},
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
