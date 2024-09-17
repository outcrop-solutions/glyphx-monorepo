use super::FromJsonValueError;

use serde::{Deserialize, Serialize};
use serde_json::Value;

pub type ComparisonFunction = fn(a: f64, b: f64) -> bool;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Operator {
    GreaterThan,
    GreaterThanEqual,
    LessThan,
    LessThanEqual,
    Equal,
    NotEqual,
}
impl Operator {
    fn greater_than(a: f64, b: f64) -> bool {
        a > b
    }

    fn greater_than_equal(a: f64, b: f64) -> bool {
        a >= b
    }

    fn less_than(a: f64, b: f64) -> bool {
        a < b
    }

    fn less_than_equal(a: f64, b: f64) -> bool {
        a <= b
    }

    fn equal(a: f64, b: f64) -> bool {
        a == b
    }

    fn not_equal(a: f64, b: f64) -> bool {
        a != b
    }

    pub fn get_comparison_function(&self) -> ComparisonFunction {
        match self {
            Self::GreaterThan => Self::greater_than,
            Self::GreaterThanEqual => Self::greater_than_equal,
            Self::LessThan => Self::less_than,
            Self::LessThanEqual => Self::less_than_equal,
            Self::Equal => Self::equal,
            Self::NotEqual => Self::not_equal,
        }
    }
    pub fn from_json_value(json_value: &Value) -> Result<Self, FromJsonValueError> {
        let name = json_value.get("name");
        if name.is_none() {
            return Err(FromJsonValueError::json_format_error(
                "A name value is not defined for the operator",
                "name",
                json_value,
            ));
        }
        let name = name.unwrap();
        if !name.is_string() {
            return Err(FromJsonValueError::json_format_error(
                "The value of name is not a string",
                "name",
                json_value,
            ));
        }
        let name = name.as_str().unwrap();
        match name {
            "GreaterThan" => Ok(Operator::GreaterThan),
            _ => Err(FromJsonValueError::json_value_error(
                &format!("The value of {} is not a valid operation", name),
                "name",
                json_value,
            )),
        }
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    mod get_comparison_function {
        use super::*;

        #[test]
        fn greater_than() {
            let a = 9.0;
            let b = 1.0;
            let operator = Operator::GreaterThan;
            let comparison_function = operator.get_comparison_function();
            assert!(comparison_function(a, b));
            assert!(!comparison_function(b, a));
        }

        #[test]
        fn greater_than_equal() {
            let a = 9.0;
            let b = 1.0;
            let operator = Operator::GreaterThanEqual;
            let comparison_function = operator.get_comparison_function();
            assert!(comparison_function(a, b));
            assert!(comparison_function(a, a));
            assert!(!comparison_function(b, a));
        }

        #[test]
        fn less_than() {
            let a = 1.0;
            let b = 9.0;
            let operator = Operator::LessThan;
            let comparison_function = operator.get_comparison_function();
            assert!(comparison_function(a, b));
            assert!(!comparison_function(b, a));
        }

        #[test]
        fn less_than_equal() {
            let a = 1.0;
            let b = 9.0;
            let operator = Operator::LessThanEqual;
            let comparison_function = operator.get_comparison_function();
            assert!(comparison_function(a, b));
            assert!(comparison_function(a, a));
            assert!(!comparison_function(b, a));
        }

        #[test]
        fn equal() {
            let a = 9.0;
            let b = 1.0;
            let operator = Operator::Equal;
            let comparison_function = operator.get_comparison_function();
            assert!(comparison_function(a, a));
            assert!(!comparison_function(a, b));
        }

        #[test]
        fn not_equal() {
            let a = 9.0;
            let b = 1.0;
            let operator = Operator::NotEqual;
            let comparison_function = operator.get_comparison_function();
            assert!(comparison_function(a, b));
            assert!(!comparison_function(a, a));
        }
    }

    mod from_json_value {
        use super::*;

        use serde_json::json;

        #[test]
        fn greater_than_is_ok() {
            let json_value = json!({"name" : "GreaterThan"});
            let result = Operator::from_json_value(&json_value);
            assert!(result.is_ok());
            let result = result.unwrap();
            match result {
                Operator::GreaterThan => {}
                _ => panic!("Unexpected Operator Type"),
            }
        }

        #[test]
        fn name_is_not_included() {
            let json_value = json!({"nam" : "GreaterThan"});
            let result = Operator::from_json_value(&json_value);
            assert!(result.is_err());
            let result = result.err().unwrap();
            match result {
                FromJsonValueError::JsonFormatError(_) => {}
                _ => panic!("Unexpected Error Type"),
            }
        }

        #[test]
        fn name_is_not_a_string() {
            let json_value = json!({"name" : 1.0});
            let result = Operator::from_json_value(&json_value);
            assert!(result.is_err());
            let result = result.err().unwrap();
            match result {
                FromJsonValueError::JsonFormatError(_) => {}
                _ => panic!("Unexpected Error Type"),
            }
        }

        #[test]
        fn name_is_not_a_valid_operator() {
            let json_value = json!({"name" : "IsGreaterThan"});
            let result = Operator::from_json_value(&json_value);
            assert!(result.is_err());
            let result = result.err().unwrap();
            match result {
                FromJsonValueError::JsonValueError(_) => {}
                _ => panic!("Unexpected Error Type"),
            }
        }
    }
}
