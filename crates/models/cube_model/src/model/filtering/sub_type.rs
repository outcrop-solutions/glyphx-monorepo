use super::{ComparisonValue, FromJsonValueError};

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum SubType {
    Value(ComparisonValue),
    Statistic(String),
}
const VALID_STATISTICS: [&str; 25] = [
    "mean", "median", "pct_0", "pct_5", "pct_10", "pct_15", "pct_20", "pct_25", "pct_30", "pct_33",
    "pct_35", "pct_40", "pct_45", "pct_50", "pct_55", "pct_60", "pct_65", "pct_67", "pct_70",
    "pct_75", "pct_80", "pct_85", "pct_90", "pct_95", "pct_99",
];
impl SubType {
    fn deserialze_value_sub_type(json_value: &Value) -> Result<SubType, FromJsonValueError> {
        let comparison_value = ComparisonValue::from_json_value(json_value)?;
        Ok(SubType::Value(comparison_value))
    }

    fn deserialize_statistic_sub_type(json_value: &Value) -> Result<SubType, FromJsonValueError> {
        let statistic = json_value.get("value");
        if statistic.is_none() {
            return Err(FromJsonValueError::json_format_error(
                "The field value is not defined for the sub_type",
                "statistic",
                json_value,
            ));
        }
        let statistic = statistic.unwrap();
        if !statistic.is_string() {
            return Err(FromJsonValueError::json_value_error(
                "The value of statistic is not a string",
                "statistic",
                json_value,
            ));
        }
        let statistic = statistic.as_str().unwrap();
        if !VALID_STATISTICS.contains(&statistic) {
            return Err(FromJsonValueError::json_value_error(
                &format!("The statistic {} is not supported", statistic),
                "statistic",
                json_value,
            ));
        }
        Ok(SubType::Statistic(statistic.to_string()))
    }

    pub fn from_json_value(json_value: &Value) -> Result<Self, FromJsonValueError> {
        let name = json_value.get("name");
        if name.is_none() {
            return Err(FromJsonValueError::json_format_error(
                "The field name is not defined for the sub_type",
                "name",
                json_value,
            ));
        }
        let name = name.unwrap();
        if !name.is_string() {
            return Err(FromJsonValueError::json_value_error(
                "The value of name is not a string",
                "name",
                json_value,
            ));
        }
        let name = name.as_str().unwrap();
        match name {
            "Value" => Self::deserialze_value_sub_type(json_value),
            "Statistic" => Self::deserialize_statistic_sub_type(json_value),
            _ => Err(FromJsonValueError::json_value_error(
                &format!("The type of sub_type :{} is not supported", name),
                "name",
                json_value,
            )),
        }
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    mod from_json_value {
        use super::*;
        use serde_json::json;

        #[test]
        fn from_json_value_with_value_is_ok() {
            let json_value = json!({
              "name": "Value",
              "type": "Number",
              "value": 5.0,
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_ok());
            let sub_type = sub_type.unwrap();
            match sub_type {
                SubType::Value(_) => {}
                _ => panic!("Unexpected SubType"),
            }
        }

        #[test]
        fn from_json_value_with_statistic_is_ok() {
            let json_value = json!({
              "name": "Statistic",
              "value": "mean",
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_ok());
            let sub_type = sub_type.unwrap();
            match sub_type {
                SubType::Statistic(stat) => {
                    assert_eq!(stat, "mean");
                }
                _ => panic!("Unexpected SubType"),
            }
        }

        #[test]
        fn from_json_value_with_statistic_no_value() {
            let json_value = json!({
              "name": "Statistic",
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_err());
            let sub_type = sub_type.err().unwrap();
            match sub_type {
                FromJsonValueError::JsonFormatError(_) => {}
                _ => panic!("Unexpected FromJsonValueError type"),
            }
        }

        #[test]
        fn from_json_value_with_statistic_value_is_not_a_string() {
            let json_value = json!({
              "name": "Statistic",
              "value": 5.0,
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_err());
            let sub_type = sub_type.err().unwrap();
            match sub_type {
                FromJsonValueError::JsonValueError(_) => {}
                _ => panic!("Unexpected FromJsonValueError type"),
            }
        }

        #[test]
        fn from_json_value_with_statistic_value_is_not_a_valid_stat() {
            let json_value = json!({
              "name": "Statistic",
              "value": "foo",
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_err());
            let sub_type = sub_type.err().unwrap();
            match sub_type {
                FromJsonValueError::JsonValueError(_) => {}
                _ => panic!("Unexpected FromJsonValueError type"),
            }
        }
        #[test]
        fn from_json_value_err_no_name() {
            let json_value = json!({
              "nam": "Value",
              "type": "Number",
              "value": 5.0,
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_err());
            let sub_type = sub_type.err().unwrap();
            match sub_type {
                FromJsonValueError::JsonFormatError(_) => {}
                _ => panic!("Unexpected FromJsonValueError type"),
            }
        }

        #[test]
        fn from_json_value_err_name_is_not_a_string() {
            let json_value = json!({
              "name": 5.0,
              "type": "Number",
              "value": 5.0,
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_err());
            let sub_type = sub_type.err().unwrap();
            match sub_type {
                FromJsonValueError::JsonValueError(_) => {}
                _ => panic!("Unexpected FromJsonValueError type"),
            }
        }

        #[test]
        fn from_json_value_err_name_is_not_supported() {
            let json_value = json!({
              "name": "Foo",
              "type": "Number",
              "value": 5.0,
            });
            let sub_type = SubType::from_json_value(&json_value);
            assert!(sub_type.is_err());
            let sub_type = sub_type.err().unwrap();
            match sub_type {
                FromJsonValueError::JsonValueError(_) => {}
                _ => panic!("Unexpected FromJsonValueError type"),
            }
        }
    }
}
