#[derive(Debug)]
pub enum VectorizerParametersFunction {
    FromJsonString,
    FromJsonValue,
    GetFieldDefinitionType,
    GetStandardFieldDefinition,
    GetDateFieldDefinition,
    AccumulatedFiledDefinitionFromJsonValue,
    StandardFieldDefinitionFromJsonValue,
    DateFieldDefinitionFromJsonValue,
    FieldDefinitionFromJsonValue,
    GetFieldDefinition,
    GetFieldDefinitions,
}

#[derive(Debug)]
pub enum VectorizerParametersError {
    JsonParseError {
        operation: VectorizerParametersFunction,
        description: String,
        line: usize,
        column: usize,
    },

    JsonValidationError {
        operation: VectorizerParametersFunction,
        description: String,
        field: String,
    },

    AxisNotDefined {
        operation: VectorizerParametersFunction,
        description: String,
        axis_name: String,
    },

    SupportingFieldNotDefined {
        operation: VectorizerParametersFunction,
        description: String,
        field: String,
    },

    InvalidFieldDefinitionType {
        operation: VectorizerParametersFunction,
        description: String,
        field: String,
        json: String,
    },

    InvalidFieldType {
        operation: VectorizerParametersFunction,
        description: String,
        field: String,
        field_type: usize,
    },
}

impl VectorizerParametersError {
    pub fn change_operation(input: Self, new_operation: VectorizerParametersFunction) -> Self {
        match input {
            Self::JsonParseError {
                operation: _,
                description,
                line,
                column,
            } => Self::JsonParseError {
                operation: new_operation,
                description,
                line,
                column,
            },
            Self::JsonValidationError {
                operation: _,
                description,
                field,
            } => Self::JsonValidationError {
                operation: new_operation,
                description,
                field,
            },
            Self::AxisNotDefined {
                operation: _,
                description,
                axis_name,
            } => Self::AxisNotDefined {
                operation: new_operation,
                description,
                axis_name,
            },
            Self::SupportingFieldNotDefined {
                operation: _,
                description,
                field,
            } => Self::SupportingFieldNotDefined {
                operation: new_operation,
                description,
                field,
            },
            Self::InvalidFieldDefinitionType {
                operation: _,
                description,
                field,
                json,
            } => Self::InvalidFieldDefinitionType {
                operation: new_operation,
                description,
                field,
                json,
            },
            Self::InvalidFieldType {
                operation: _,
                description,
                field,
                field_type,
            } => Self::InvalidFieldType {
                operation: new_operation,
                description,
                field,
                field_type,
            },
        }
    }
}

#[cfg(test)]
mod change_operation {
    use super::*;

    #[test]
    #[allow(non_snake_case)]
    fn JsonPareError() {
        let input = VectorizerParametersError::JsonParseError {
            operation: VectorizerParametersFunction::FromJsonString,
            description: "test".to_string(),
            line: 1,
            column: 1,
        };
        let new_operation = VectorizerParametersFunction::FromJsonValue;
        let output = VectorizerParametersError::change_operation(input, new_operation);
        match output {
            VectorizerParametersError::JsonParseError {
                operation,
                description,
                line,
                column,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(description, "test".to_string());
                assert_eq!(line, 1);
                assert_eq!(column, 1);
            }
            _ => assert!(false),
        }
    }

    #[test]
    #[allow(non_snake_case)]
    fn JsonValidationError() {
        let input = VectorizerParametersError::JsonValidationError {
            operation: VectorizerParametersFunction::FromJsonString,
            description: "test".to_string(),
            field: "test".to_string(),
        };
        let new_operation = VectorizerParametersFunction::FromJsonValue;
        let output = VectorizerParametersError::change_operation(input, new_operation);
        match output {
            VectorizerParametersError::JsonValidationError {
                operation,
                description,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(description, "test".to_string());
                assert_eq!(field, "test".to_string());
            }
            _ => assert!(false),
        }
    }

    #[test]
    #[allow(non_snake_case)]
    fn AxisNotDefined() {
        let input = VectorizerParametersError::AxisNotDefined {
            operation: VectorizerParametersFunction::FromJsonString,
            description: "test".to_string(),
            axis_name: "test".to_string(),
        };
        let new_operation = VectorizerParametersFunction::FromJsonValue;
        let output = VectorizerParametersError::change_operation(input, new_operation);
        match output {
            VectorizerParametersError::AxisNotDefined {
                operation,
                description,
                axis_name,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(description, "test".to_string());
                assert_eq!(axis_name, "test".to_string());
            }
            _ => assert!(false),
        }
    }
    #[test]
    #[allow(non_snake_case)]
    fn SupportingFieldNotDefined() {
        let input = VectorizerParametersError::SupportingFieldNotDefined {
            operation: VectorizerParametersFunction::FromJsonString,
            description: "test".to_string(),
            field: "test".to_string(),
        };
        let new_operation = VectorizerParametersFunction::FromJsonValue;
        let output = VectorizerParametersError::change_operation(input, new_operation);
        match output {
            VectorizerParametersError::SupportingFieldNotDefined {
                operation,
                description,
                field,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(description, "test".to_string());
                assert_eq!(field, "test".to_string());
            }
            _ => assert!(false),
        }
    }

    #[test]
    #[allow(non_snake_case)]
    fn InvalidFieldDefinitionType() {
        let input = VectorizerParametersError::InvalidFieldDefinitionType {
            operation: VectorizerParametersFunction::FromJsonString,
            description: "test".to_string(),
            field: "test".to_string(),
            json: "test".to_string(),
        };
        let new_operation = VectorizerParametersFunction::FromJsonValue;
        let output = VectorizerParametersError::change_operation(input, new_operation);
        match output {
            VectorizerParametersError::InvalidFieldDefinitionType {
                operation,
                description,
                field,
                json,
            } => {
                match operation {
                    VectorizerParametersFunction::FromJsonValue => assert!(true),
                    _ => assert!(false),
                }
                assert_eq!(description, "test".to_string());
                assert_eq!(field, "test".to_string());
                assert_eq!(json, "test".to_string());
            }
            _ => assert!(false),
        }
    }
}
