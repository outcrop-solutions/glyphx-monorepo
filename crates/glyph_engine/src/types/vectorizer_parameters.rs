mod field_definition;
mod vectorizer_parameters_error;
mod helper_functions;

pub use helper_functions::*;
use crate::types::field_definition_type::FieldDefinitionType;
use glyphx_core::GlyphxErrorData;
use serde_json::{json, Value};

pub use field_definition::{
    DateFieldDefinition, DateGrouping, FieldDefinition, FieldDefinitionCollection,
    StandardFieldDefinition,
};
pub use vectorizer_parameters_error::{
    FromJsonStringError, FromJsonValueError, GetFieldDefinitionError,GetFieldDefinitionsError, GetFieldDefinitionTypeError
};

#[derive(Debug)]
pub struct VectorizerParameters {
    pub workspace_id: String,
    pub project_id: String,
    pub data_table_name: String,
    raw_data: Value,
}

impl VectorizerParameters {
    pub fn from_json_string(input: &str) -> Result<Self, FromJsonStringError> {
        let parse_result: serde_json::Result<Value> = serde_json::from_str(input);
        if parse_result.is_err() {
            let err = parse_result.err().unwrap();
            let data = json!({"line": err.line(), "column": err.column()});
            let message = err.to_string();
            let error = FromJsonStringError::JsonParseError(GlyphxErrorData::new(
                message,
                Some(data),
                None,
            ));

            return Err(error);
        }
        let value = parse_result.unwrap();
        let parsed_data = Self::from_json_value(&value);
        if parsed_data.is_ok() {
            return Ok(parsed_data.unwrap());
        } else {
            let err = parsed_data.err().unwrap();
            let error = FromJsonStringError::from_json_value_error(err);
            return Err(error);
        }
    }

    pub fn from_json_value(input: &Value) -> Result<Self, FromJsonValueError> {
        let workspace_id = &input["workspace_id"];
        if workspace_id.is_null() {
            return Err(FromJsonValueError::new("workspace_id"));
        }

        let project_id = &input["project_id"];
        if project_id.is_null() {
            return Err(FromJsonValueError::new("project_id"));
        }

        let data_table_name = &input["data_table_name"];
        if data_table_name.is_null() {
            return Err(FromJsonValueError::new("data_table_name"));
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

    fn get_field_json_value(&self, field_name: &str) -> Result<&Value, GetFieldDefinitionError> {
        let clean_field_name = field_name.trim().to_lowercase();
        let clean_field_name = clean_field_name.as_str();
        let value = match clean_field_name {
            "xaxis" => {
                let v = &self.raw_data["xAxis"];
                if v.is_null() {
                    let message = "xAxis is not defined".to_string();
                    let data = json!({"field": "xAxis"});
                    return Err(GetFieldDefinitionError::AxisNotDefined(
                        GlyphxErrorData::new(message, Some(data), None),
                    ));
                }
                v
            }
            "yaxis" => {
                let v = &self.raw_data["yAxis"];
                if v.is_null() {
                    let message = "yAxis is not defined".to_string();
                    let data = json!({"field": "yAxis"});
                    return Err(GetFieldDefinitionError::AxisNotDefined(
                        GlyphxErrorData::new(message, Some(data), None),
                    ));
                }
                v
            }
            "zaxis" => {
                let v = &self.raw_data["zAxis"];
                if v.is_null() {
                    let message = "zAxis is not defined".to_string();
                    let data = json!({"field": "zAxis"});
                    return Err(GetFieldDefinitionError::AxisNotDefined(
                        GlyphxErrorData::new(message, Some(data), None),
                    ));
                }
                v
            }
            _ => {
                let supporting_fields = &self.raw_data["supportingFields"];
                if supporting_fields.is_null() {
                    let message = format!("{} is not defined", field_name).to_string();
                    let data = json!({"field": field_name});
                    return Err(GetFieldDefinitionError::SupportingFieldNotDefined(
                        GlyphxErrorData::new(message, Some(data), None),
                    ));
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
                    let message = format!("{} is not defined", field_name).to_string();
                    let data = json!({"field": field_name});
                    return Err(GetFieldDefinitionError::SupportingFieldNotDefined(
                        GlyphxErrorData::new(message, Some(data), None),
                    ));
                }
                supporting_field.unwrap()
            }
        };
        Ok(value)
    }

    pub fn get_field_definition_type(
        &self,
        field_name: &str,
    ) -> Result<FieldDefinitionType, GetFieldDefinitionTypeError> {
        let value = match self.get_field_json_value(field_name) {
            Err(err) => {
                let error = GetFieldDefinitionTypeError::from_get_field_definition_error(err);
                return Err(error);
            }
            Ok(value) => value,
        };

        let field_definition = value.as_object().unwrap();
        if !field_definition.contains_key("fieldDefinition") {
                let description = "fieldDefinition is not defined".to_string();
                let data = json!({"field": field_name.to_string()});
                let error_data = GlyphxErrorData::new(description, Some(data), None);
                return Err(GetFieldDefinitionTypeError::JsonParsingError(error_data));
        }
        let field_definition = &field_definition["fieldDefinition"];
        let field_definition = field_definition.as_object().unwrap();
        if !field_definition.contains_key("fieldType") {
                let description = "fieldType is not defined".to_string();
                let data = json!({"field": field_name.to_string()});
                let error_data = GlyphxErrorData::new(description, Some(data), None);
                return Err(GetFieldDefinitionTypeError::JsonParsingError(error_data));
        }
        let field_type = &field_definition["fieldType"];
        let field_type = field_type.as_str().unwrap().to_string();
        let field_definition_type = FieldDefinitionType::from_string(&field_type);
        if field_definition_type.is_none() {
                let description =  format!("the fieldType {} is not defined", field_type);
                let data = json!({"field": field_name.to_string(), "fieldType": field_type});
                let error_data = GlyphxErrorData::new(description, Some(data), None);
                return Err(GetFieldDefinitionTypeError::InvalidFieldDefinitionType(error_data));
        }
        Ok(field_definition_type.unwrap())
    }

    pub fn get_field_definition(
        &self,
        field_name: &str,
    ) -> Result<FieldDefinition, GetFieldDefinitionError> {
        let json = self.get_field_json_value(field_name);
        if json.is_err() {
            return Err(json.unwrap_err());
        }

        let json = json.unwrap();
        let field_definition = FieldDefinition::from_json(json);
        if field_definition.is_err() {
             let err = field_definition.err().unwrap();
            return Err(GetFieldDefinitionError::from_from_json_error(err));
        }
        Ok(field_definition.unwrap())
    }

    pub fn get_field_definitions(
        &self,
    ) -> Result<FieldDefinitionCollection, GetFieldDefinitionsError> {
        let mut results = FieldDefinitionCollection::new();
        let x_axis = self.get_field_definition("xaxis");
        if x_axis.is_err() {
            let err = x_axis.unwrap_err();
            let err = GetFieldDefinitionsError::from_get_field_definition_error(err);
            return Err(err);
        }
        results.add_field_definition("xaxis".to_string(), x_axis.unwrap());

        let y_axis = self.get_field_definition("yaxis");
        if y_axis.is_err() {
            let err = y_axis.unwrap_err();
            let err = GetFieldDefinitionsError::from_get_field_definition_error(err);
            return Err(err);
        }
        results.add_field_definition("yaxis".to_string(), y_axis.unwrap());

        let z_axis = self.get_field_definition("zaxis");
        if z_axis.is_err() {
            let err = z_axis.unwrap_err();
            let err = GetFieldDefinitionsError::from_get_field_definition_error(err);
            return Err(err);
        }
        results.add_field_definition("zaxis".to_string(), z_axis.unwrap());
        for supporting_field_name in self.get_supporting_field_names().unwrap() {
            let supporting_field = self.get_field_definition(&supporting_field_name);
            if supporting_field.is_err() {
            let err = supporting_field.unwrap_err();
            let err = GetFieldDefinitionsError::from_get_field_definition_error(err);
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
            FromJsonValueError::JsonValidationError(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["fieldName"].as_str().unwrap();
                assert_eq!(field_name, "workspace_id");
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
            FromJsonValueError::JsonValidationError(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["fieldName"].as_str().unwrap();
                assert_eq!(field_name, "project_id");
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
            FromJsonValueError::JsonValidationError(error_data) => {
                let data = error_data.data.unwrap();
                let field_name = data["fieldName"].as_str().unwrap();
                assert_eq!(field_name, "data_table_name");
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
            FromJsonStringError::JsonParseError(_) => (),
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
            GetFieldDefinitionTypeError::JsonParsingError(error_data) => {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "zAxis");
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
            GetFieldDefinitionTypeError::JsonParsingError(error_data) => {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "zAxis");
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
            GetFieldDefinitionTypeError::InvalidFieldDefinitionType(error_data) => {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "zAxis");
                let field_type = data["fieldType"].as_str().unwrap();
                assert_eq!(field_type, "invalid");
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
            GetFieldDefinitionError::AxisNotDefined (error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "xAxis");
            },
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
            GetFieldDefinitionError::AxisNotDefined (error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "yAxis");
            },
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
            GetFieldDefinitionError::AxisNotDefined (error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "zAxis");
            },
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
            GetFieldDefinitionError::SupportingFieldNotDefined(error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "field2");
            },
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
            GetFieldDefinitionError::SupportingFieldNotDefined(error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "field2");
            },
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}

#[cfg(test)]
mod get_field_definition {

    use super::*;
    use crate::types::FieldType;
    use serde_json::json;

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
            GetFieldDefinitionError::JsonParsingError(error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "fieldName");
            },
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
            GetFieldDefinitionsError::AxisNotDefined (error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "xAxis");
            },
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
        match field_definitions{
            GetFieldDefinitionsError::AxisNotDefined (error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "yAxis");
            },
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
        match field_definitions{
            GetFieldDefinitionsError::AxisNotDefined (error_data)=> {
                let data = error_data.data.unwrap();
                let field = data["field"].as_str().unwrap();
                assert_eq!(field, "zAxis");
            },
            _ => {
                panic!("Unexpected error type");
            }
        }
    }
}
