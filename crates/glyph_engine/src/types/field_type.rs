#[derive(Debug, Clone)]
pub enum FieldType {
   Number,
   String,
   Integer,
   Date,
   Unknown
}

impl FieldType {
    pub fn from_numeric_value(input: usize) -> FieldType {
        match input {
            0 => FieldType::Number,
            1 => FieldType::String,
            2 => FieldType::Integer,
            3 => FieldType::Date,
            _ => FieldType::Unknown,
        }
    }
}

#[cfg(test)]
mod from_numeric_value {
    use super::*;   
    #[test]
    fn test_number() {
        let field_type = FieldType::from_numeric_value(0);
        match field_type {
            FieldType::Number => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn test_string() {
        let field_type = FieldType::from_numeric_value(1);
        match field_type {
            FieldType::String => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn test_integer() {
        let field_type = FieldType::from_numeric_value(2);
        match field_type {
            FieldType::Integer => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn test_date() {
        let field_type = FieldType::from_numeric_value(3);
        match field_type {
            FieldType::Date => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn test_unknown() {
        let field_type = FieldType::from_numeric_value(4);
        match field_type {
            FieldType::Unknown => assert!(true),
            _ => assert!(false),
        }
    }
}

