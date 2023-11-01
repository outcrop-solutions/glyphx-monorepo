use crate::types::field_definition_type::FieldDefinitionType;
use crate::types::vectorizer_parameters::json_has_field;
use super::DateFieldDefinitionFromJsonError;
use serde_json::Value;

#[derive(Debug, Copy, Clone)]
pub enum DateGrouping {
  DayOfYear,
  DayOfMonth,
  DayOfWeek,
  WeekOfYear,
  MonthOfYear,
  Year,
  Quarter,
}

impl DateGrouping {
    pub fn from_str(input: &str) -> DateGrouping {
     let cleaned_input = input.trim().to_lowercase();
     let cleaned_input = cleaned_input.as_str();
     match cleaned_input {
         "day_of_year" => DateGrouping::DayOfYear,
         "day_of_month" => DateGrouping::DayOfMonth,
         "day_of_week" => DateGrouping::DayOfWeek,
         "week_of_year" => DateGrouping::WeekOfYear,
         "month_of_year" => DateGrouping::MonthOfYear,
         "year" => DateGrouping::Year,
         "quarter" => DateGrouping::Quarter,
         _ => DateGrouping::DayOfYear,
     }

    }
}
#[derive(Debug, Clone)]
pub struct DateFieldDefinition {
   pub field_type: FieldDefinitionType,
   pub field_name: String,
   pub date_grouping: DateGrouping,
}

impl DateFieldDefinition {
    pub fn from_json(input: &Value) -> Result<Self, DateFieldDefinitionFromJsonError> {
        let validation_result = Self::validate_json(input);
        if validation_result.is_err()  {
            let err = validation_result.err().unwrap();
            return Err(err);
        }
        let field_name = input["fieldName"].as_str().unwrap().to_string();
        let field_type = FieldDefinitionType::Date;
        let raw_date_grouping = input["dateGrouping"].as_str().unwrap().to_string();
        let date_grouping = DateGrouping::from_str(&raw_date_grouping);
        Ok(Self {
            field_type,
            field_name,
            date_grouping,
        })
    }
    fn validate_json(input: &Value) -> Result<(), DateFieldDefinitionFromJsonError> {
        let has_field_name = json_has_field(
            input,
            "fieldName",
        );
        if has_field_name.is_err() {
            let err = has_field_name.err().unwrap();
            let err = DateFieldDefinitionFromJsonError::from_json_has_field_error(err);
            return Err(err);
        }

        let has_date_grouping = json_has_field(
            input,
            "dateGrouping",
        );
        if has_date_grouping.is_err() {
            let err = has_date_grouping.err().unwrap();
            let err = DateFieldDefinitionFromJsonError::from_json_has_field_error(err);
            return Err(err);
        }
        Ok(())

    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod DateGrouping_from_str {
  use super::*;
  #[test]
  fn day_of_year() {
    let date_grouping = DateGrouping::from_str("day_of_year");
    match date_grouping {
      DateGrouping::DayOfYear => assert!(true),
      _ => assert!(false),
    }
  }

  #[test]
  fn day_of_month() {
    let date_grouping = DateGrouping::from_str("day_of_month");
    match date_grouping {
      DateGrouping::DayOfMonth => assert!(true),
      _ => assert!(false),
    }
  }

  #[test]
  fn day_of_week() {
    let date_grouping = DateGrouping::from_str("day_of_week");
    match date_grouping {
      DateGrouping::DayOfWeek => assert!(true),
      _ => assert!(false),
    }
  }

  #[test]
  fn week_of_year() {
    let date_grouping = DateGrouping::from_str("week_of_year");
    match date_grouping {
      DateGrouping::WeekOfYear => assert!(true),
      _ => assert!(false),
    }
  }

  #[test] 
  fn month_of_year() {
    let date_grouping = DateGrouping::from_str("month_of_year");
    match date_grouping {
      DateGrouping::MonthOfYear => assert!(true),
      _ => assert!(false),
    }
  }

  #[test]
  fn year() {
    let date_grouping = DateGrouping::from_str("year");
    match date_grouping {
      DateGrouping::Year => assert!(true),
      _ => assert!(false),
    }
  }

  #[test]
  fn quarter() {
    let date_grouping = DateGrouping::from_str("quarter");
    match date_grouping {
      DateGrouping::Quarter => assert!(true),
      _ => assert!(false),
    }
  }

  #[test]
  fn unknown() {
    let date_grouping = DateGrouping::from_str("unknown");
    match date_grouping {
      DateGrouping::DayOfYear => assert!(true),
      _ => assert!(false),
    }
  }
}

#[cfg(test)]
mod validate_json {
    use super::*;
    use serde_json::json;

    #[test]
    fn valid() {
        let input = json!({
            "fieldType": "date",
            "fieldName": "test",
            "dateGrouping": "day_of_year"
        });
        let result = DateFieldDefinition::validate_json(&input);
        assert!(result.is_ok());
    }

    #[test]
    fn missing_field_name() {
        let input = json!({
            "fieldType": "date",
            "dateGrouping": "day_of_year"
        });
        let result = DateFieldDefinition::validate_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
             DateFieldDefinitionFromJsonError::FieldNotDefined(error_data) => {
                let data = error_data.data.unwrap();
                let field_name  = data["field"].as_str().unwrap();
                assert_eq!(field_name, "fieldName");

            },
            _ => {
                panic!("Unexpected result");
            }
        }
    }

    #[test]
    fn missing_date_grouping() {
        let input = json!({
            "fieldType": "date",
            "fieldName": "test"
        });
        let result = DateFieldDefinition::validate_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
       
        match result {
             DateFieldDefinitionFromJsonError::FieldNotDefined(error_data) => {
                let data = error_data.data.unwrap();
                let field_name  = data["field"].as_str().unwrap();
                assert_eq!(field_name, "dateGrouping");

            },
            _ => {
                panic!("Unexpected result");
            }
        }

    }
}

#[cfg(test)]
mod from_json {
    use super::*;
    use serde_json::json;

    #[test]
    fn valid() {
        let input = json!({
            "fieldType": "date",
            "fieldName": "test",
            "dateGrouping": "day_of_year"
        });
        let result = DateFieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        match result.field_type {
            FieldDefinitionType::Date => assert!(true),
            _ => assert!(false),
        }
        assert_eq!(result.field_name, "test".to_string());
        match result.date_grouping {
            DateGrouping::DayOfYear => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn missing_field_name() {
        let input = json!({
            "fieldType": "date",
            "dateGrouping": "day_of_year"
        });
        let result = DateFieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        
        match result {
             DateFieldDefinitionFromJsonError::FieldNotDefined(error_data) => {
                let data = error_data.data.unwrap();
                let field_name  = data["field"].as_str().unwrap();
                assert_eq!(field_name, "fieldName");

            },
            _ => {
                panic!("Unexpected result");
            }
        }

    }
}
