use serde_json::Value;
#[derive(Debug)]
pub enum VectorizerParametersFunction {
    FromJsonString,
    FromJsonValue,
}

#[derive(Debug)]
pub struct VectorizerParamtersErrorData {
    pub operation: VectorizerParametersFunction,
}
#[derive(Debug)]
pub struct VectorizerParameters {
    pub workspace_id: String,
    pub project_id: String,
    pub data_table_name: String
}
#[derive(Debug)]
pub enum VectorizerParametersError {
    JsonParseError{
        operation: VectorizerParametersFunction,
        description: String,
        line: usize,
        column: usize,
    },
    JsonValidationError{
        operation: VectorizerParametersFunction,
        description: String,
        field: String,
    },
}

impl VectorizerParameters {
    pub fn from_json_string(input: &str) -> Result<Self, VectorizerParametersError> {
       let parse_result: serde_json::Result<Value> = serde_json::from_str(input);
       if parse_result.is_err()  {
           let err = parse_result.err().unwrap();
           return Err(VectorizerParametersError::JsonParseError{
               operation: VectorizerParametersFunction::FromJsonString,
               description: err.to_string(),
               line: err.line(),
               column: err.column(),
           });
       }
       let value = parse_result.unwrap();
       Self::from_json_value(&value)
    }

    pub fn from_json_value(input: &Value)->  Result<Self, VectorizerParametersError> {
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
            return Err(VectorizerParametersError::JsonValidationError{
                operation: VectorizerParametersFunction::FromJsonValue,
                description: "project_id is null".to_string(),
                field: "project_id".to_string(),
            });
        }

        let data_table_name = &input["data_table_name"];
        if data_table_name.is_null() {
            return Err(VectorizerParametersError::JsonValidationError{
                operation: VectorizerParametersFunction::FromJsonValue,
                description: "data_table_name is null".to_string(),
                field: "data_table_name".to_string(),
            });
        }
        
        Ok(VectorizerParameters{
            workspace_id: workspace_id.as_str().unwrap().to_string(),
            project_id: project_id.as_str().unwrap().to_string(),
            data_table_name: data_table_name.as_str().unwrap().to_string(),
        })

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
            VectorizerParametersError::JsonValidationError{operation, description:_, field} => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => {},
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "workspace_id");
            },
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
            VectorizerParametersError::JsonValidationError{operation, description:_, field} => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => {},
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "project_id");
            },
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
            VectorizerParametersError::JsonValidationError{operation, description:_, field} => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => {},
                    _ => {
                        panic!("Unexpected error type");
                    }
                }
                assert_eq!(field, "data_table_name");
            },
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
    fn invalid_format() {
        let input = r#"
        {
            "workspace_id": "1234",
            "project_id": "5678",
            "project_id": "5678",
            "data_table_name": "my_table",
        }
        "#;

        let result = VectorizerParameters::from_json_string(input);
        assert!(result.is_ok());
    }
}
