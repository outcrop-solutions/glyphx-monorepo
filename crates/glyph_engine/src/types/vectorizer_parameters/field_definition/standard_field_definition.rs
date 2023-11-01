use crate::types::vectorizer_parameters::helper_functions::json_has_field;
use crate::types::vectorizer_parameters::field_definition::standard_field_definition_errors::FromJsonError;
use crate::types::field_definition_type::FieldDefinitionType;
use serde_json::Value;
#[derive(Debug, Clone)]
pub struct StandardFieldDefinition {
   pub field_type: FieldDefinitionType,
   pub field_name: String
}

impl StandardFieldDefinition {
    pub fn from_json(input: &Value) -> Result<Self, FromJsonError> {
        let validation_result = Self::validate_json(input);
        if validation_result.is_err()  {
            return Err( validation_result.err().unwrap() );
        }
        let field_name = input["fieldName"].as_str().unwrap().to_string();
        let field_type = FieldDefinitionType::Standard;
        Ok(Self {
            field_type,
            field_name,
        })

    }

    fn validate_json(input: &Value) -> Result<(), FromJsonError> {
        let has_field_name = json_has_field(
           input, 
            "fieldName",
        );
        if has_field_name.is_err() {
            let error = FromJsonError::from_json_has_field_error(has_field_name.err().unwrap());
            return Err(error);
        }
        Ok(())

    }
}

#[cfg(test)]
mod validate_json {
    use super::*;
    use serde_json::json;

    #[test]
    fn valid() {
        let input = json!({
            "fieldType": "standard",
            "fieldName": "test"
        });
        let result = StandardFieldDefinition::validate_json(&input);
        assert!(result.is_ok());
    }

    #[test]
    fn missing_field_name() {
        let input = json!({
            "fieldType": "standard"
        });
        let result = StandardFieldDefinition::validate_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "fieldName");
                match operation {
                    VectorizerParametersFunction::StandardFieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
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
    use serde_json::json;

    #[test]
    fn valid() {
        let input = json!({
            "fieldType": "standard",
            "fieldName": "test"
        });
        let result = StandardFieldDefinition::from_json(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.field_name, "test".to_string());
        match result.field_type {
            FieldDefinitionType::Standard => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn missing_field_name() {
        let input = json!({
            "fieldType": "standard"
        });
        let result = StandardFieldDefinition::from_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                assert_eq!(field, "fieldName");
                match operation {
                    VectorizerParametersFunction::StandardFieldDefinitionFromJsonValue => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected result");
            }
        }
    }
}
