#[derive(Debug)]
pub enum FieldDefinitionType {
    Standard,
    Date,
    Formula,
    ACCUMULATED
}

impl FieldDefinitionType {
    pub fn from_string(input: &str) -> Option<Self> {
        let input = input.trim();
        let input = input.to_lowercase();
        let input = input.as_str();
        match input {
            "standard" => Some(FieldDefinitionType::Standard),
            "date" => Some(FieldDefinitionType::Date),
            "formula" => Some(FieldDefinitionType::Formula),
            "accumulated" => Some(FieldDefinitionType::ACCUMULATED),
            _ => None,
        }
    }
}
#[cfg(test)]
mod from_string {
    use super::*;
    #[test]
    fn standard() {
        let input = "standard";
        let result = FieldDefinitionType::from_string(input);
        assert!(result.is_some());
        let result = result.unwrap();
        match result {
            FieldDefinitionType::Standard => {},
            _ => {
                panic!("Unexpected result");
            }
        }
    }
    #[test]
    fn date() {
        let input = "date";
        let result = FieldDefinitionType::from_string(input);
        assert!(result.is_some());
        let result = result.unwrap();
        match result {
            FieldDefinitionType::Date => {},
            _ => {
                panic!("Unexpected result");
            }
        }
    }
    #[test]
    fn formula() {
        let input = "formula";
        let result = FieldDefinitionType::from_string(input);
        assert!(result.is_some());
        let result = result.unwrap();
        match result {
            FieldDefinitionType::Formula => {},
            _ => {
                panic!("Unexpected result");
            }
        }
    }
    #[test]
    fn accumulated() {
        let input = "accumulated";
        let result = FieldDefinitionType::from_string(input);
        assert!(result.is_some());
        let result = result.unwrap();
        match result {
            FieldDefinitionType::ACCUMULATED => {},
            _ => {
                panic!("Unexpected result");
            }
        }
    }
    #[test]
    fn invalid() {
        let input = "invalid";
        let result = FieldDefinitionType::from_string(input);
        assert!(result.is_none());
    }
}
