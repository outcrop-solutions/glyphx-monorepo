use crate::types::field_definition_type::FieldDefinitionType;

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

#[cfg(test)]
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

