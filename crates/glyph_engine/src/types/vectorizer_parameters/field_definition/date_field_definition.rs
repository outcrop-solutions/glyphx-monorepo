use super::DateFieldDefinitionFromJsonError;
use crate::types::field_definition_type::FieldDefinitionType;
use crate::types::vectorizer_parameters::json_has_field;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum DateGrouping {
    QualifiedDayOfYear,
    DayOfYear,
    QualifiedDayOfMonth,
    YearDayOfMonth,
    MonthDayOfMonth,
    DayOfMonth,
    QualifiedDayOfWeek,
    DayOfWeek,
    QualifiedWeekOfYear,
    WeekOfYear,
    QualifiedMonth,
    MonthOfYear,
    Year,
    QualifiedQuarter,
    Quarter,
    YearOfWeek,
}

impl DateGrouping {
    pub fn from_str(input: &str) -> DateGrouping {
        let cleaned_input = input.trim().to_lowercase();
        let cleaned_input = cleaned_input.as_str();
        match cleaned_input {
            "qualified_day_of_year" => DateGrouping::QualifiedDayOfYear,
            "day_of_year" => DateGrouping::DayOfYear,
            "qualified_day_of_month" => DateGrouping::QualifiedDayOfMonth,
            "year_day_of_month" => DateGrouping::YearDayOfMonth,
            "month_day_of_month" => DateGrouping::MonthDayOfMonth,
            "day_of_month" => DateGrouping::DayOfMonth,
            "qualified_day_of_week" => DateGrouping::QualifiedDayOfWeek,
            "day_of_week" => DateGrouping::DayOfWeek,
            "qualified_week_of_year" => DateGrouping::QualifiedWeekOfYear,
            "week_of_year" => DateGrouping::WeekOfYear,
            "qualified_month" => DateGrouping::QualifiedMonth,
            "month_of_year" | "month" => DateGrouping::MonthOfYear,
            "year" => DateGrouping::Year,
            "qualified_quarter" => DateGrouping::QualifiedQuarter,
            "quarter" => DateGrouping::Quarter,
            "year_of_week" => DateGrouping::YearOfWeek,
            _ => DateGrouping::DayOfYear,
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DateFieldDefinition {
    pub field_type: FieldDefinitionType,
    pub field_name: String,
    pub date_grouping: DateGrouping,
}

impl DateFieldDefinition {
    pub fn from_json(input: &Value) -> Result<Self, DateFieldDefinitionFromJsonError> {
        let validation_result = Self::validate_json(input);
        if validation_result.is_err() {
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
        let has_field_name = json_has_field(input, "fieldName");
        if has_field_name.is_err() {
            let err = has_field_name.err().unwrap();
            let err = DateFieldDefinitionFromJsonError::from_json_has_field_error(err);
            return Err(err);
        }

        let has_date_grouping = json_has_field(input, "dateGrouping");
        if has_date_grouping.is_err() {
            let err = has_date_grouping.err().unwrap();
            let err = DateFieldDefinitionFromJsonError::from_json_has_field_error(err);
            return Err(err);
        }
        Ok(())
    }
    pub fn get_query(&self, display_name: &str) -> (String, String) {
        let raw_query = match &self.date_grouping {
            DateGrouping::QualifiedDayOfYear => {
                format!(
                    r#"(year(from_unixtime("{}"/1000)) * 1000) + day_of_year(from_unixtime("{}"/1000))"#,
                    self.field_name, self.field_name
                )
            }

            DateGrouping::DayOfYear => {
                format!(r#"day_of_year(from_unixtime("{}"/1000))"#, self.field_name)
            }

            DateGrouping::QualifiedDayOfMonth => {
                format!(
                    r#"(year(from_unixtime("{}"/1000)) * 10000) + (month(from_unixtime("{}"/1000)) * 100) + day_of_month(from_unixtime("{}"/1000))"#,
                    self.field_name, self.field_name, self.field_name
                )
            }

            DateGrouping::YearDayOfMonth => {
                format!(
                    r#"(year(from_unixtime("{}"/1000)) * 100) + day_of_month(from_unixtime("{}"/1000))"#,
                    self.field_name, self.field_name
                )
            }

            DateGrouping::MonthDayOfMonth => {
                format!(
                    r#"(month(from_unixtime("{}"/1000)) * 100) + day_of_month(from_unixtime("{}"/1000))"#,
                    self.field_name, self.field_name
                )
            }

            DateGrouping::DayOfMonth => {
                format!(r#"day(from_unixtime("{}"/1000))"#, self.field_name)
            }

            DateGrouping::QualifiedDayOfWeek => {
                format!(
                    r#"(year_of_week(from_unixtime("{}"/1000)) * 1000) + (week_of_year(from_unixtime("{}"/1000)) * 10) + day_of_week(from_unixtime("{}"/1000))"#,
                    self.field_name, self.field_name, self.field_name
                )
            }

            DateGrouping::DayOfWeek => {
                format!(r#"day_of_week(from_unixtime("{}"/1000))"#, self.field_name)
            }

            DateGrouping::QualifiedWeekOfYear => {
                format!(
                    r#" (year_of_week(from_unixtime({}/1000)) * 100) + (week_of_year(from_unixtime({}/1000)))"#,
                    self.field_name, self.field_name
                )
            }

            DateGrouping::WeekOfYear => {
                format!(r#"week_of_year(from_unixtime("{}"/1000))"#, self.field_name)
            }

            DateGrouping::QualifiedMonth => {
                format!(
                    r#"(year(from_unixtime("{}"/1000)) * 100) + month(from_unixtime("{}"/1000))"#,
                    self.field_name, self.field_name
                )
            }

            DateGrouping::MonthOfYear => {
                format!(r#"month(from_unixtime("{}"/1000))"#, self.field_name)
            }

            DateGrouping::Year => {
                format!(r#"year(from_unixtime("{}"/1000))"#, self.field_name)
            }

            DateGrouping::QualifiedQuarter => {
                format!(
                    r#"(year(from_unixtime("{}"/1000)) * 10) + quarter(from_unixtime("{}"/1000))"#,
                    self.field_name, self.field_name
                )
            }

            DateGrouping::Quarter => {
                format!(r#"quarter(from_unixtime("{}"/1000))"#, self.field_name)
            }

            DateGrouping::YearOfWeek => {
                format!(r#"year_of_week(from_unixtime("{}"/1000))"#, self.field_name)
            }
        };
        let query = format!(r#"{} as "{}""#, raw_query, display_name);
        (query, raw_query)
    }
}

#[cfg(test)]
#[allow(non_snake_case)]
mod DateGrouping_from_str {
    use super::*;
    #[test]
    fn qualified_day_of_year() {
        let date_grouping = DateGrouping::from_str("qualified_day_of_year");
        match date_grouping {
            DateGrouping::QualifiedDayOfYear => assert!(true),
            _ => assert!(false),
        }
    }
    #[test]
    fn day_of_year() {
        let date_grouping = DateGrouping::from_str("day_of_year");
        match date_grouping {
            DateGrouping::DayOfYear => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn qualified_day_of_month() {
        let date_grouping = DateGrouping::from_str("qualified_day_of_month");
        match date_grouping {
            DateGrouping::QualifiedDayOfMonth => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn year_day_of_month() {
        let date_grouping = DateGrouping::from_str("year_day_of_month");
        match date_grouping {
            DateGrouping::YearDayOfMonth => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn month_day_of_month() {
        let date_grouping = DateGrouping::from_str("month_day_of_month");
        match date_grouping {
            DateGrouping::MonthDayOfMonth => assert!(true),
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
    fn qualified_day_of_week() {
        let date_grouping = DateGrouping::from_str("qualified_day_of_week");
        match date_grouping {
            DateGrouping::QualifiedDayOfWeek => assert!(true),
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
    fn qualified_week_of_year() {
        let date_grouping = DateGrouping::from_str("qualified_week_of_year");
        match date_grouping {
            DateGrouping::QualifiedWeekOfYear => assert!(true),
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
    fn qualified_month() {
        let date_grouping = DateGrouping::from_str("qualified_month");
        match date_grouping {
            DateGrouping::QualifiedMonth => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn month() {
        let date_grouping = DateGrouping::from_str("month");
        match date_grouping {
            DateGrouping::MonthOfYear => assert!(true),
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
    fn year_of_week() {
        let date_grouping = DateGrouping::from_str("year_of_week");
        match date_grouping {
            DateGrouping::YearOfWeek => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn qualified_quarter() {
        let date_grouping = DateGrouping::from_str("qualified_quarter");
        match date_grouping {
            DateGrouping::QualifiedQuarter => assert!(true),
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
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "fieldName");
            }
            #[allow(unreachable_patterns)]
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
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "dateGrouping");
            }

            #[allow(unreachable_patterns)]
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
                let field_name = data["field"].as_str().unwrap();
                assert_eq!(field_name, "fieldName");
            }

            #[allow(unreachable_patterns)]
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}
