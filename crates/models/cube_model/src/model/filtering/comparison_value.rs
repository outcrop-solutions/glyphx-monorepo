use super::FromJsonValueError;

use model_common::VectorOrigionalValue;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ComparisonValue {
    Number(f64),
    Integer(u64),
    String(String),
}

impl ComparisonValue {
    pub fn into_vector_origional_value(&self) -> VectorOrigionalValue {
        match self {
            Self::Number(value) => VectorOrigionalValue::F64(value.clone()),
            Self::Integer(value) => VectorOrigionalValue::U64(value.clone()),
            Self::String(value) => VectorOrigionalValue::String(value.clone()),
        }
    }

    pub fn from_json_value(json_value: &Value) -> Result<Self, FromJsonValueError> {
        let data_type = json_value.get("type");
        if data_type.is_none() {
            return Err(FromJsonValueError::json_format_error(
                "Type is not defined for the Value sub_type",
                "Type",
                json_value,
            ));
        }
        let data_type = data_type.unwrap();
        if !data_type.is_string() {
            return Err(FromJsonValueError::json_value_error(
                "The value of type is not a string",
                "Type",
                json_value,
            ));
        }
        let data_type = data_type.as_str().unwrap();
        let value = json_value.get("value");

        if value.is_none() {
            return Err(FromJsonValueError::json_value_error(
                "Value is not defined for the sub_type",
                "value",
                json_value,
            ));
        }
        let value = value.unwrap();
        let comparison_value = match data_type {
            "Number" => {
                if !value.is_f64() {
                    return Err(FromJsonValueError::json_value_error(
                        "The value of the sub_type is not a number",
                        "value",
                        json_value,
                    ));
                }
                let value = value.as_f64().unwrap();
                ComparisonValue::Number(value)
            }
            "Integer" => {
                if !value.is_u64() {
                    return Err(FromJsonValueError::json_value_error(
                        "The value of the sub_type is not an integer",
                        "value",
                        json_value,
                    ));
                }
                let value = value.as_u64().unwrap();
                ComparisonValue::Integer(value)
            }
            "String" => {
                if !value.is_string() {
                    return Err(FromJsonValueError::json_value_error(
                        "The value of the sub_type is not a string",
                        "value",
                        json_value,
                    ));
                }
                let value = value.as_str().unwrap();
                ComparisonValue::String(value.to_string())
            }
            _ => {
                return Err(FromJsonValueError::json_value_error(
                    format!("The value of the type: {} is not valid", data_type).as_str(),
                    "type",
                    json_value,
                ));
            }
        };
        Ok(comparison_value)
    }
}
#[cfg(test)]
mod unit_tests {
    use super::*;

    mod from_json_value {
        use super::*;
        use serde_json::json;

        #[test]
        fn number_is_ok() {
            let json_value = json!({"value": 5.0, "type": "Number"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_ok());
            let comparison_operator = comparison_operator.unwrap();
            match comparison_operator {
                ComparisonValue::Number(value) => {
                    assert_eq!(value, 5.0);
                }
                _ => {
                    panic!("Unexpected Comparion Operator Type")
                }
            }
        }

        #[test]
        fn number_value_is_not_number() {
            let json_value = json!({"value": 5, "type": "Number"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_err());
            let comparison_operator = comparison_operator.err().unwrap();
            match comparison_operator {
                FromJsonValueError::JsonValueError(_) => {}
                _ => {
                    panic!("Unexpected Error Type")
                }
            }
        }

        #[test]
        fn integer_is_ok() {
            let json_value = json!({"value": 5, "type": "Integer"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_ok());
            let comparison_operator = comparison_operator.unwrap();
            match comparison_operator {
                ComparisonValue::Integer(value) => {
                    assert_eq!(value, 5);
                }
                _ => {
                    panic!("Unexpected Comparion Operator Type")
                }
            }
        }

        #[test]
        fn integer_value_is_not_number() {
            let json_value = json!({"value": 5.0, "type": "Integer"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_err());
            let comparison_operator = comparison_operator.err().unwrap();
            match comparison_operator {
                FromJsonValueError::JsonValueError(_) => {}
                _ => {
                    panic!("Unexpected Error Type")
                }
            }
        }

        #[test]
        fn string_is_ok() {
            let json_value = json!({"value": "I am a string", "type": "String"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_ok());
            let comparison_operator = comparison_operator.unwrap();
            match comparison_operator {
                ComparisonValue::String(value) => {
                    assert_eq!(value, "I am a string");
                }
                _ => {
                    panic!("Unexpected Comparion Operator Type")
                }
            }
        }

        #[test]
        fn string_value_is_not_string() {
            let json_value = json!({"value": 5.0, "type": "String"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_err());
            let comparison_operator = comparison_operator.err().unwrap();
            match comparison_operator {
                FromJsonValueError::JsonValueError(_) => {}
                _ => {
                    panic!("Unexpected Error Type")
                }
            }
        }

        #[test]
        fn data_type_is_missing() {
            let json_value = json!({"value": 5.0, "typ": "Number"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_err());
            let comparison_operator = comparison_operator.err().unwrap();
            match comparison_operator {
                FromJsonValueError::JsonFormatError(_) => {}
                _ => {
                    panic!("Unexpected Error Type")
                }
            }
        }

        #[test]
        fn data_type_is_not_a_string() {
            let json_value = json!({"value": 5.0, "type": 5.0});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_err());
            let comparison_operator = comparison_operator.err().unwrap();
            match comparison_operator {
                FromJsonValueError::JsonValueError(_) => {}
                _ => {
                    panic!("Unexpected Error Type")
                }
            }
        }

        #[test]
        fn value_is_missing() {
            let json_value = json!({"valu": 5.0, "typ": "Number"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_err());
            let comparison_operator = comparison_operator.err().unwrap();
            match comparison_operator {
                FromJsonValueError::JsonFormatError(_) => {}
                _ => {
                    panic!("Unexpected Error Type")
                }
            }
        }

        #[test]
        fn type_is_an_invalid_value() {
            let json_value = json!({"value": "I am a string", "type": "Foo"});
            let comparison_operator = ComparisonValue::from_json_value(&json_value);
            assert!(comparison_operator.is_err());
            let comparison_operator = comparison_operator.err().unwrap();
            match comparison_operator {
                FromJsonValueError::JsonValueError(_) => {}
                _ => {
                    panic!("Unexpected FromJsonValueError type")
                }
            }
        }
    }
}
