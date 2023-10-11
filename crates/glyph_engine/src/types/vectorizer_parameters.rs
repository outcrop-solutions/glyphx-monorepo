use crate::types::field_definition_type::FieldDefinitionType;
use crate::types::field_type::FieldType;
use serde_json::Value;
mod field_definition;
mod vectorizer_parameters_error;
pub use field_definition::{FieldDefinition, StandardFieldDefinition};
pub use vectorizer_parameters_error::{VectorizerParametersError, VectorizerParametersFunction};

#[derive(Debug)]
pub struct VectorizerParameters {
    pub workspace_id: String,
    pub project_id: String,
    pub data_table_name: String,
    raw_data: Value,
}

impl VectorizerParameters {
    pub fn from_json_string(input: &str) -> Result<Self, VectorizerParametersError> {
        let parse_result: serde_json::Result<Value> = serde_json::from_str(input);
        if parse_result.is_err() {
            let err = parse_result.err().unwrap();
            return Err(VectorizerParametersError::JsonParseError {
                operation: VectorizerParametersFunction::FromJsonString,
                description: err.to_string(),
                line: err.line(),
                column: err.column(),
            });
        }
        let value = parse_result.unwrap();
        Self::from_json_value(&value)
    }

    pub fn from_json_value(input: &Value) -> Result<Self, VectorizerParametersError> {
        let workspace_id = &input["workspace_id"];
        if workspace_id.is_null() {
            return Err(VectorizerParametersError::JsonValidationError {
                operation: VectorizerParametersFunction::FromJsonValue,
                description: "workspace_id is null".to_string(),
                field: "workspace_id".to_string(),
            });
        }

        let project_id = &input["project_id"];
        if project_id.is_null() {
            return Err(VectorizerParametersError::JsonValidationError {
                operation: VectorizerParametersFunction::FromJsonValue,
                description: "project_id is null".to_string(),
                field: "project_id".to_string(),
            });
        }

        let data_table_name = &input["data_table_name"];
        if data_table_name.is_null() {
            return Err(VectorizerParametersError::JsonValidationError {
                operation: VectorizerParametersFunction::FromJsonValue,
                description: "data_table_name is null".to_string(),
                field: "data_table_name".to_string(),
            });
        }
        Ok(VectorizerParameters {
            workspace_id: workspace_id.as_str().unwrap().to_string(),
            project_id: project_id.as_str().unwrap().to_string(),
            data_table_name: data_table_name.as_str().unwrap().to_string(),
            raw_data: input.clone(),
        })
    }

    pub fn get_supporting_field_names(&self) -> Option<Vec<String>> {
        let mut result = Vec::new();
        let supporting_fields = &self.raw_data["supportingFields"];
        if supporting_fields.is_null() {
            return None;
        }
        let supporting_fields = supporting_fields.as_array().unwrap();
        for field in supporting_fields {
            let supporting_name = field["fieldDisplayName"].as_str().unwrap().to_string();
            result.push(supporting_name);
        }
        if result.len() == 0 {
            return None;
        }
        Some(result)
    }

    fn get_field_json_value(&self, field_name: &str) -> Result<&Value, VectorizerParametersError> {
        let clean_field_name = field_name.trim().to_lowercase();
        let clean_field_name = clean_field_name.as_str();
        let value = match clean_field_name {
            "xaxis" => {
                let v = &self.raw_data["xAxis"];
                if v.is_null() {
                    return Err(VectorizerParametersError::AxisNotDefined {
                        operation: VectorizerParametersFunction::GetFieldDefinitionType,
                        description: "xAxis is not defined".to_string(),
                        axis_name: "xAxis".to_string(),
                    });
                }
                v
            }
            "yaxis" => {
                let v = &self.raw_data["yAxis"];
                if v.is_null() {
                    return Err(VectorizerParametersError::AxisNotDefined {
                        operation: VectorizerParametersFunction::GetFieldDefinitionType,
                        description: "yAxis is not defined".to_string(),
                        axis_name: "yAxis".to_string(),
                    });
                }
                v
            }
            "zaxis" => {
                let v = &self.raw_data["zAxis"];
                if v.is_null() {
                    return Err(VectorizerParametersError::AxisNotDefined {
                        operation: VectorizerParametersFunction::GetFieldDefinitionType,
                        description: "zAxis is not defined".to_string(),
                        axis_name: "zAxis".to_string(),
                    });
                }
                v
            }
            _ => {
                let supporting_fields = &self.raw_data["supportingFields"];
                if supporting_fields.is_null() {
                    return Err(VectorizerParametersError::SupportingFieldNotDefined {
                        operation: VectorizerParametersFunction::GetFieldDefinitionType,
                        description: "supportingFields is not defined".to_string(),
                        field: field_name.to_string(),
                    });
                }
                let supporting_fields = supporting_fields.as_array().unwrap();
                let supporting_field = supporting_fields.iter().find(|field| {
                    let name = field.as_object().unwrap();
                    //It is possible that our supporting field is not properly formatted.  We won't
                    //worry about that here.  Instead, we will just ignore a field if it doesn't
                    //have a fieldDisplayName.
                    if !name.contains_key("fieldDisplayName") {
                        return false;
                    }
                    let name = &name["fieldDisplayName"].as_str().unwrap().to_lowercase();
                    name == clean_field_name
                });
                if supporting_field.is_none() {
                    return Err(VectorizerParametersError::SupportingFieldNotDefined {
                        operation: VectorizerParametersFunction::GetFieldDefinitionType,
                        description: "supportingFields is not defined".to_string(),
                        field: field_name.to_string(),
                    });
                }
                supporting_field.unwrap()
            }
        };
        Ok(value)
    }

    pub fn get_field_definition_type(
        &self,
        field_name: &str,
    ) -> Result<FieldDefinitionType, VectorizerParametersError> {
        let clean_field_name = field_name.trim();
        let clean_field_name = clean_field_name.to_lowercase();
        let clean_field_name = clean_field_name.as_str();
        let value = match self.get_field_json_value(field_name) {
            Err(err) => {
                return Err(err);
            }
            Ok(value) => value,
        };

        let field_definition = value.as_object().unwrap();
        if !field_definition.contains_key("fieldDefinition") {
            return Err(VectorizerParametersError::InvalidFieldDefinitionType {
                operation: VectorizerParametersFunction::GetFieldDefinitionType,
                description: "fieldDefinition is not defined".to_string(),
                field: field_name.to_string(),
                json: format!("{:?}", field_definition),
            });
        }
        let field_definition = &field_definition["fieldDefinition"];
        let field_definition = field_definition.as_object().unwrap();
        if !field_definition.contains_key("fieldType") {
            return Err(VectorizerParametersError::InvalidFieldDefinitionType {
                operation: VectorizerParametersFunction::GetFieldDefinitionType,
                description: "fieldType is not defined".to_string(),
                field: field_name.to_string(),
                json: format!("{:?}", field_definition),
            });
        }
        let field_type = &field_definition["fieldType"];
        let field_type = field_type.as_str().unwrap().to_string();
        let field_definition_type = FieldDefinitionType::from_string(&field_type);
        if field_definition_type.is_none() {
            return Err(VectorizerParametersError::InvalidFieldDefinitionType {
                operation: VectorizerParametersFunction::GetFieldDefinitionType,
                description: "fieldType is not defined".to_string(),
                field: field_name.to_string(),
                json: format!("{:?}", field_definition),
            });
        }
        Ok(field_definition_type.unwrap())
    }

    pub fn get_standard_field_definition(
        &self,
        field_name: &str,
    ) -> Result<FieldDefinition, VectorizerParametersError> {
        let field_definition_type = self.get_field_definition_type(field_name);
        if field_definition_type.is_err() {
            let err = field_definition_type.err().unwrap();
            return Err(VectorizerParametersError::change_operation(err, VectorizerParametersFunction::GetStandardFieldDefinition));
        }
        let field_definition_type = field_definition_type.unwrap();
        match field_definition_type {
            FieldDefinitionType::Standard => {}
            _ => {
                return Err(VectorizerParametersError::InvalidFieldDefinitionType {
                    operation: VectorizerParametersFunction::GetStandardFieldDefinition,
                    description: "fieldType is not standard".to_string(),
                    field: field_name.to_string(),
                    json: format!("{:?}", field_definition_type),
                });
            }
        };
        let value = match self.get_field_json_value(field_name) {
            Err(err) => {
                return Err(err);
            }
            Ok(value) => value,
        };

        let validation_result = Self::validate_standard_field_json(&value);
        if validation_result.is_err() {
            return Err(validation_result.err().unwrap());
        } 

        let field_display_name = value["fieldDisplayName"].as_str().unwrap().to_string();
        let field_data_type = FieldType::from_numeric_value(value["fieldDataType"].as_u64().unwrap() as usize);
        let field_definition = &value["fieldDefinition"];

        let field_name = field_definition["fieldName"].as_str().unwrap().to_string();

        Ok(FieldDefinition::Standard {
            field_display_name,
            field_data_type,
            field_definition: StandardFieldDefinition {
                field_type: FieldDefinitionType::Standard,
                field_name,
            },
        })
    } 
     fn validate_standard_field_json(
        input: &Value
        ) -> Result<(), VectorizerParametersError> {

        let has_field_display_name = Self::json_value_has_field(input, "fieldDisplayName", VectorizerParametersFunction::GetStandardFieldDefinition); 
        if has_field_display_name.is_err() {
            return Err(has_field_display_name.err().unwrap());
             }

        let has_field_data_type = Self::json_value_has_field(input, "fieldDataType", VectorizerParametersFunction::GetStandardFieldDefinition);
        if has_field_data_type.is_err() {
            return Err(has_field_data_type.err().unwrap());
        }

        let has_field_definition = Self::json_value_has_field(input, "fieldDefinition", VectorizerParametersFunction::GetStandardFieldDefinition);
        if has_field_definition.is_err() {
            return Err(has_field_definition.err().unwrap());
        }

        let field_definition = &input["fieldDefinition"];
        let has_field_name = Self::json_value_has_field(field_definition, "fieldName", VectorizerParametersFunction::GetStandardFieldDefinition);
        if has_field_name.is_err() {
            return Err(has_field_name.err().unwrap());
        }
        Ok(())
     }
        
    fn json_value_has_field( input: &Value, field_name: &str, operation: VectorizerParametersFunction) -> Result<(), VectorizerParametersError> {
        let field = &input[field_name];
        if field.is_null() {
            return Err(VectorizerParametersError::JsonValidationError {
                operation,
                description: format!("the json value does not have the field {} defined", field_name),
                field: field_name.to_string(),
            });
        }
        Ok(())
    }
}

#[cfg(test)]
mod from_json_value {
    use super::*;
    use serde_json::json;
    #[test]
    fn ok() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.workspace_id, "1234");
        assert_eq!(result.project_id, "5678");
        assert_eq!(result.data_table_name, "my_table");
    }

    #[test]
    fn missing_workspace_id() {
        let input = json!({
            "project_id": "5678",
            "data_table_name": "my_table",
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "workspace_id");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn missing_project_id() {
        let input = json!({
            "workspace_id": "5678",
            "data_table_name": "my_table",
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "project_id");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn missing_data_table_name() {
        let input = json!({
            "workspace_id": "5678",
            "project_id": "my_table",
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "data_table_name");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}

#[cfg(test)]
mod from_json_string {
    use super::*;

    #[test]
    fn ok() {
        let input = r#"
        {
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table"
        }
        "#;

        let result = VectorizerParameters::from_json_string(input);
        //No need to check the results directly because they are tested above.
        assert!(result.is_ok());
    }
    #[test]
    fn invalid_format() {
        let input = r#"
        {
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": 
        }
        "#;

        let result = VectorizerParameters::from_json_string(input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonParseError {
                operation,
                description: _,
                line,
                column,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonString => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert!(line > 0);
                assert!(column > 0);
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}

#[cfg(test)]
mod get_supporting_field_names {
    use super::*;
    use serde_json::json;
    #[test]
    fn no_supporting_fields() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let supporting_fields = result.get_supporting_field_names();
        assert!(supporting_fields.is_none());
    }

    #[test]
    fn empty_supporting_fields() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "supportingFields": []
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let supporting_fields = result.get_supporting_field_names();
        assert!(supporting_fields.is_none());
    }

    #[test]
    fn has_supporting_fields() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "supportingFields": [
                {
                    "fieldDisplayName": "field1"
                },
                {
                    "fieldDisplayName": "field2"
                }
            ]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let supporting_fields = result.get_supporting_field_names();
        assert!(supporting_fields.is_some());
        let supporting_fields = supporting_fields.unwrap();
        assert_eq!(supporting_fields.len(), 2);
        assert_eq!(supporting_fields[0], "field1");
        assert_eq!(supporting_fields[1], "field2");
    }
}

#[cfg(test)]
mod get_field_definition_type {
    use super::*;
    use serde_json::json;
    #[test]
    fn is_standard() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis": {
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definition_type = result.get_field_definition_type("xaxis");
        assert!(field_definition_type.is_ok());
        let field_definition_type = field_definition_type.unwrap();
        match field_definition_type {
            FieldDefinitionType::Standard => {}
            _ => {
                panic!("Unexpected field definition type");
            }
        }
    }

    #[test]
    fn is_date() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "yAxis": {
                "fieldDefinition": {
                    "fieldType": "date"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definition_type = result.get_field_definition_type("yaxis");
        assert!(field_definition_type.is_ok());
        let field_definition_type = field_definition_type.unwrap();
        match field_definition_type {
            FieldDefinitionType::Date => {}
            _ => {
                panic!("Unexpected field definition type");
            }
        }
    }

    #[test]
    fn is_accumulator() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "zAxis": {
                "fieldDefinition": {
                    "fieldType": "accumulated"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definition_type = result.get_field_definition_type("zaxis");
        assert!(field_definition_type.is_ok());
        let field_definition_type = field_definition_type.unwrap();
        match field_definition_type {
            FieldDefinitionType::ACCUMULATED => {}
            _ => {
                panic!("Unexpected field definition type");
            }
        }
    }

    #[test]
    fn is_formula() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "supportingFields" : [{
            "fieldDisplayName": "field1",
                "fieldDefinition": {
                    "fieldType": "formula"
                }
            }
            ]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definition_type = result.get_field_definition_type("field1");
        assert!(field_definition_type.is_ok());
        let field_definition_type = field_definition_type.unwrap();
        match field_definition_type {
            FieldDefinitionType::Formula => {}
            _ => {
                panic!("Unexpected field definition type");
            }
        }
    }

    #[test]
    fn field_is_not_well_defined() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "zAxis": {
                "fieldDefinition": {
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definition_type = result.get_field_definition_type("zAxis");
        assert!(field_definition_type.is_err());
        let result = field_definition_type.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldDefinitionType {
                operation,
                description: _,
                field,
                json,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "zAxis");
                assert!(json.len() > 0);
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    #[allow(non_snake_case)]
    fn fieldDefinition_is_not_defined() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "zAxis": {
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definition_type = result.get_field_definition_type("zAxis");
        assert!(field_definition_type.is_err());
        let result = field_definition_type.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldDefinitionType {
                operation,
                description: _,
                field,
                json,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "zAxis");
                assert!(json.len() > 0);
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn field_definition_has_invalid_type() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "zAxis": {
                "fieldDefinition": {
                    "fieldType": "invalid"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definition_type = result.get_field_definition_type("zAxis");
        assert!(field_definition_type.is_err());
        let result = field_definition_type.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldDefinitionType {
                operation,
                description: _,
                field,
                json,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "zAxis");
                assert!(json.len() > 0);
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}

#[cfg(test)]
mod get_field_json_value {
    use super::*;
    use serde_json::json;
    #[test]
    fn xaxis() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis": {
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("xaxis");
        assert!(field_json_value.is_ok());
        assert!(field_json_value.unwrap().is_object());
    }

    #[test]
    fn yaxis() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "yAxis": {
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("yaxis");
        assert!(field_json_value.is_ok());
        assert!(field_json_value.unwrap().is_object());
    }

    #[test]
    fn zaxis() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "zAxis": {
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("zaxis");
        assert!(field_json_value.is_ok());
        assert!(field_json_value.unwrap().is_object());
    }

    #[test]
    fn supporting_field() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "supportingFields" : [{
            "fieldDisplayName": "field1",
                "fieldDefinition": {
                    "fieldType": "formula"
                }
            }
            ]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("field1");
        assert!(field_json_value.is_ok());
        assert!(field_json_value.unwrap().is_object());
    }

    #[test]
    fn xaxis_not_defined() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "yAxis": {
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("xaxis");
        assert!(field_json_value.is_err());
        let result = field_json_value.err().unwrap();
        match result {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description: _,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(axis_name, "xAxis");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn yaxis_not_defined() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis": {
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("yaxis");
        assert!(field_json_value.is_err());
        let result = field_json_value.err().unwrap();
        match result {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description: _,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(axis_name, "yAxis");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn zaxis_not_defined() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis": {
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("zaxis");
        assert!(field_json_value.is_err());
        let result = field_json_value.err().unwrap();
        match result {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description: _,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(axis_name, "zAxis");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn supporting_field_not_defined() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "supportingFields" : [{
            "fieldDisplayName": "field1",
                "fieldDefinition": {
                    "fieldType": "formula"
                }
            }
            ]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("field2");
        assert!(field_json_value.is_err());
        let result = field_json_value.err().unwrap();
        match result {
            VectorizerParametersError::SupportingFieldNotDefined {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "field2");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn no_supporting_fields() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table"
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_json_value = result.get_field_json_value("field2");
        assert!(field_json_value.is_err());
        let result = field_json_value.err().unwrap();
        match result {
            VectorizerParametersError::SupportingFieldNotDefined {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitionType => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "field2");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}

#[cfg(test)]
mod json_value_has_field {
    use super::*;
    use serde_json::json;

    #[test]
    fn has_field() {
        let input = json!({
            "fieldDisplayName": "field1",
                "fieldDefinition": {
                    "fieldType": "formula"
                }
        });

        let result = VectorizerParameters::json_value_has_field(&input, "fieldDisplayName", VectorizerParametersFunction::GetStandardFieldDefinition);
        assert!(result.is_ok());
    }

    #[test]
    fn does_not_have_field() {
        let input = json!({
            "fieldDisplayName": "field1",
                "fieldDefinition": {
                    "fieldType": "formula"
                }
        });

        let result = VectorizerParameters::json_value_has_field(&input, "foo", VectorizerParametersFunction::GetStandardFieldDefinition);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "foo");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}

#[cfg(test)]
mod validate_standard_field_json {
    use super::*;
    use serde_json::json;

    #[test]
    fn ok() {
        let input = json!({
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldName": "field1"
                }
        });

        let result = VectorizerParameters::validate_standard_field_json(&input);
        assert!(result.is_ok());
    }

    #[test]
    fn missing_field_display_name() {
        let input = json!({
            "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldName": "field1"
                }
        });

        let result = VectorizerParameters::validate_standard_field_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "fieldDisplayName");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn missing_field_data_type() {
        let input = json!({
            "fieldDisplayName": "field1",
                "fieldDefinition": {
                    "fieldName": "field1"
                }
        });

        let result = VectorizerParameters::validate_standard_field_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "fieldDataType");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn missing_field_definition() {
        let input = json!({
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
        });

        let result = VectorizerParameters::validate_standard_field_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "fieldDefinition");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn missing_field_name() {
        let input = json!({
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
                "fieldDefinition": {
                }
        });

        let result = VectorizerParameters::validate_standard_field_json(&input);
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "fieldName");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}

#[cfg(test)]
mod get_standard_field_definition {
    use super::*;
    use serde_json::json;

    #[test]
    fn ok() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldName": "field1",
                    "fieldType": "standard"
                }
            }
        });

        let vec_params = VectorizerParameters::from_json_value(&input);
        assert!(vec_params.is_ok());
        let vec_params = vec_params.unwrap();

        let result = vec_params.get_standard_field_definition("xaxis");
        assert!(result.is_ok());
        let result = result.unwrap();
        match result {
            FieldDefinition::Standard {
                field_display_name,
                field_data_type,
                field_definition,
            } => {
                assert_eq!(field_display_name, "field1");
                assert_eq!(field_definition.field_name, "field1");
                match field_data_type {
                    FieldType::String => {}
                    _ => {
                        panic!("Unexpected field type");
                    }
                };

                match field_definition.field_type {
                    FieldDefinitionType::Standard => {}
                    _ => {
                        panic!("Unexpected field definition type");
                    }
                };
            }
            _ => {
                panic!("Unexpected field definition type");
            }
        }
    }

    #[test]
    fn axis_field_does_not_exist() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "yAxis" : {
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldName": "field1",
                    "fieldType": "standard"
                }
            }
        });

        let vec_params = VectorizerParameters::from_json_value(&input);
        assert!(vec_params.is_ok());
        let vec_params = vec_params.unwrap();

        let result = vec_params.get_standard_field_definition("xaxis");
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description: _,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(axis_name, "xAxis");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn upporting_field_does_not_exist() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldName": "field1",
                    "fieldType": "standard"
                }
            },
            "supportingFields": []
        });

        let vec_params = VectorizerParameters::from_json_value(&input);
        assert!(vec_params.is_ok());
        let vec_params = vec_params.unwrap();

        let result = vec_params.get_standard_field_definition("foo");
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::SupportingFieldNotDefined {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "foo");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn field_is_not_standard() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldName": "field1",
                    "fieldType": "date"
                }
            },
            "supportingFields": []
        });

        let vec_params = VectorizerParameters::from_json_value(&input);
        assert!(vec_params.is_ok());
        let vec_params = vec_params.unwrap();

        let result = vec_params.get_standard_field_definition("xaxis");
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::InvalidFieldDefinitionType {
                operation,
                description: _,
                field,
                json,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "xaxis");
                assert!(json.len() > 0);
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }

    #[test]
    fn validation_failed() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
            "fieldDisplayName": "field1",
            "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard"
                }
            },
            "supportingFields": []
        });

        let vec_params = VectorizerParameters::from_json_value(&input);
        assert!(vec_params.is_ok());
        let vec_params = vec_params.unwrap();

        let result = vec_params.get_standard_field_definition("xaxis");
        assert!(result.is_err());
        let result = result.err().unwrap();
        match result {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetStandardFieldDefinition => {}
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "fieldName");
            }
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}
