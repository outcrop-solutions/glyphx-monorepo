mod field_definition;
mod vectorizer_parameters_error;

use crate::types::field_definition_type::FieldDefinitionType;
use serde_json::Value;

pub use field_definition::{
    DateFieldDefinition, DateGrouping, FieldDefinition, StandardFieldDefinition, FieldDefinitionCollection
};
pub use vectorizer_parameters_error::{VectorizerParametersError, VectorizerParametersFunction};

pub fn json_value_has_field(
    input: &Value,
    field_name: &str,
    operation: VectorizerParametersFunction,
) -> Result<(), VectorizerParametersError> {
    let field = &input[field_name];
    if field.is_null() {
        return Err(VectorizerParametersError::JsonValidationError {
            operation,
            description: format!(
                "the json value does not have the field {} defined",
                field_name
            ),
            field: field_name.to_string(),
        });
    }
    Ok(())
}
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

    pub fn get_field_definition(
        &self,
        field_name: &str,
    ) -> Result<FieldDefinition, VectorizerParametersError> {
        let json = self.get_field_json_value(field_name);
        if json.is_err() {
            let err = VectorizerParametersError::change_operation(
                json.err().unwrap(),
                VectorizerParametersFunction::GetFieldDefinition,
            );
            return Err(err);
        }

        let json = json.unwrap();
        let field_definition = FieldDefinition::from_json(json);
        if field_definition.is_err() {
            let err = VectorizerParametersError::change_operation(
                field_definition.err().unwrap(),
                VectorizerParametersFunction::GetFieldDefinition);
            return Err(err);
        }
        Ok(field_definition.unwrap())
    }

    pub fn get_field_definitions(&self) -> Result<FieldDefinitionCollection, VectorizerParametersError> {
        let mut results = FieldDefinitionCollection::new();
        let x_axis = self.get_field_definition("xaxis");
        if x_axis.is_err()  {
            let err = VectorizerParametersError::change_operation(
                x_axis.err().unwrap(),
                VectorizerParametersFunction::GetFieldDefinitions);
            return Err(err);
        }
        results.add_field_definition("xaxis".to_string(), x_axis.unwrap());

        let y_axis = self.get_field_definition("yaxis");
        if y_axis.is_err()  {
            let err = VectorizerParametersError::change_operation(
                y_axis.err().unwrap(),
                VectorizerParametersFunction::GetFieldDefinitions);
            return Err(err);
        }
        results.add_field_definition("yaxis".to_string(), y_axis.unwrap());

        let z_axis = self.get_field_definition("zaxis");
        if z_axis.is_err()  {
            let err = VectorizerParametersError::change_operation(
                z_axis.err().unwrap(),
                VectorizerParametersFunction::GetFieldDefinitions);
            return Err(err);
        }
        results.add_field_definition("zaxis".to_string(), z_axis.unwrap());
        for supporting_field_name in self.get_supporting_field_names().unwrap() {
            let supporting_field = self.get_field_definition(&supporting_field_name);
            if supporting_field.is_err()  {
                let err = VectorizerParametersError::change_operation(
                    supporting_field.err().unwrap(),
                    VectorizerParametersFunction::GetFieldDefinitions);
                return Err(err);
            }
            results.add_field_definition(supporting_field_name, supporting_field.unwrap());
        }

        return Ok(results);
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
mod get_field_definition {

    use super::*;
    use serde_json::json;
    use crate::types::FieldType;

    #[test]
    fn standard_field() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
                "fieldDisplayName": "field1",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field1"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();

        let field_definition = result.get_field_definition("xaxis");
        assert!(field_definition.is_ok());

        let field_definition = field_definition.unwrap();

        match field_definition {
            FieldDefinition::Standard {
                field_display_name,
                field_data_type,
                field_definition,
            } => {
                assert_eq!(field_display_name, "field1");
                match field_data_type {
                    FieldType::String => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(field_definition.field_name, "field1");
                match field_definition.field_type {
                    FieldDefinitionType::Standard => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected field definition type");
            }
        }
    }

    #[test]
    fn date_field() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "yAxis" : {
                "fieldDisplayName": "field1",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "date",
                    "fieldName": "field1",
                    "dateGrouping": "day_of_week"
                }
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();

        let field_definition = result.get_field_definition("yaxis");
        assert!(field_definition.is_ok());

        let field_definition = field_definition.unwrap();

        match field_definition {
            FieldDefinition::Date {
                field_display_name,
                field_data_type,
                field_definition,
            } => {
                assert_eq!(field_display_name, "field1");
                match field_data_type {
                    FieldType::String => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(field_definition.field_name, "field1");
                match field_definition.field_type {
                    FieldDefinitionType::Date => assert!(true),
                    _ => assert!(false),
                }
                match field_definition.date_grouping {
                    DateGrouping::DayOfWeek => assert!(true),
                    _ => assert!(false),
                }
            }
            _ => {
                panic!("Unexpected field definition type");
            }
        }
    }

    #[test]
    fn is_error() {
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
            }
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();

        let field_definition = result.get_field_definition("xaxis");
        assert!(field_definition.is_err());

        let field_definition = field_definition.err().unwrap();
        match field_definition {
            VectorizerParametersError::JsonValidationError {
                operation,
                description: _,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinition => {}
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
        assert!(true);
    }
}

#[cfg(test)]
pub mod get_field_definitions {
    use super::*;
    use serde_json::json; 

    #[test]
    fn is_ok() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
                "fieldDisplayName": "field1",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field1"
                }
            },
            "yAxis" : {
                "fieldDisplayName": "field2",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field2"
                }
            },
            "zAxis" : {
                "fieldDisplayName": "field3",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field3"
                }
            },
            "supportingFields" : [
            {
                "fieldDisplayName": "field4",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field4"
                }
            }]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let mut found_x = false;
        let mut found_y = false;
        let mut found_z = false;
        let mut found_supporting = false;
        let field_definitions = result.get_field_definitions();
        assert!(field_definitions.is_ok());
        let field_definitions = field_definitions.unwrap();
        for field in field_definitions.iter() {
            if field.name == "xaxis" {
                found_x = true;
            };
            if field.name == "yaxis" {
                found_y = true;
            };
            if field.name == "zaxis" {
                found_z = true;
            };
            if field.name == "field4" {
                found_supporting = true;
            };
        }
        assert!(found_x);
        assert!(found_y);
        assert!(found_z);
        assert!(found_supporting);

    }

    #[test]
    fn no_x() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "yAxis" : {
                "fieldDisplayName": "field2",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field2"
                }
            },
            "zAxis" : {
                "fieldDisplayName": "field3",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field3"
                }
            },
            "supportingFields" : [
            {
                "fieldDisplayName": "field4",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field4"
                }
            }]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definitions = result.get_field_definitions();

        assert!(field_definitions.is_err());
        let field_definitions = field_definitions.err().unwrap();
        match field_definitions {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description: _,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitions => {}
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
    fn no_y() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
                "fieldDisplayName": "field2",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field2"
                }
            },
            "zAxis" : {
                "fieldDisplayName": "field3",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field3"
                }
            },
            "supportingFields" : [
            {
                "fieldDisplayName": "field4",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field4"
                }
            }]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definitions = result.get_field_definitions();

        assert!(field_definitions.is_err());
        let field_definitions = field_definitions.err().unwrap();
        match field_definitions {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description: _,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitions => {}
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
    fn no_z() {
        let input = json!({
            "workspace_id": "1234",
            "project_id": "5678",
            "data_table_name": "my_table",
            "xAxis" : {
                "fieldDisplayName": "field2",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field2"
                }
            },
            "yAxis" : {
                "fieldDisplayName": "field3",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field3"
                }
            },
            "supportingFields" : [
            {
                "fieldDisplayName": "field4",
                "fieldDataType": 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "field4"
                }
            }]
        });

        let result = VectorizerParameters::from_json_value(&input);
        assert!(result.is_ok());
        let result = result.unwrap();
        let field_definitions = result.get_field_definitions();

        assert!(field_definitions.is_err());
        let field_definitions = field_definitions.err().unwrap();
        match field_definitions {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description: _,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::GetFieldDefinitions => {}
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
}