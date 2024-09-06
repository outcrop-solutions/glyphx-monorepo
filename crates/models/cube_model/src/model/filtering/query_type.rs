use super::{Operator, SubType, FromJsonValueError};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum QueryType {
    Include {
        sub_type: SubType,
        operator: Operator,
    },
    Exclude {
        sub_type: SubType,
        operator: Operator,
    },
    And(Vec<QueryType>),
    Or(Vec<QueryType>),
    NoOp,
}

impl QueryType {
    fn deserialize_operator(json_value: &Value) -> Result<Operator, FromJsonValueError> {
        let operator = json_value.get("operator");
        if operator.is_none() {
            return Err(FromJsonValueError::json_format_error(
                "An operator is not defined for the axis filter",
                "operator",
                json_value,
            ));
        }
        let operator = operator.unwrap();
        Operator::from_json_value(&operator)
    }
    fn desserialize_sub_type(json_value: &Value) -> Result<SubType, FromJsonValueError> {
        let sub_type = json_value.get("sub_type");
        if sub_type.is_none() {
            return Err(FromJsonValueError::json_format_error(
                "A sub_type is not defined for the axis filter",
                "sub_type",
                json_value,
            ));
        }
        let sub_type = sub_type.unwrap();
        SubType::from_json_value(sub_type)
    }

    pub fn deserialize_and_or(json_value: &Value) -> Result<Vec<Self>, FromJsonValueError> {
        if !json_value.is_array() {
            return Err(FromJsonValueError::json_format_error(
                &format!("The and/or query_type must be an array"),
                "json_value",
                json_value,
            ));
        }
        let json_array = json_value.as_array().unwrap();
        let mut query_types = Vec::new();
        for json_value in json_array {
            let query_type = Self::from_json_value(json_value)?;
            query_types.push(query_type);
        }
        Ok(query_types)
    }
    pub fn from_json_value(json_value: &Value) -> Result<Self, FromJsonValueError> {
        if !json_value.is_object() {
            return Err(FromJsonValueError::json_format_error(
                "The query type is not an object",
                "query_type",
                json_value,
            ));
        }
        let json_obj = json_value.as_object().unwrap();
        if json_obj.len() != 1 {
            return Err(FromJsonValueError::json_format_error(
                "The query type object should have one and only one key include, exclude, and, or, or no_op",
                "query_type",
                json_value,
            ));
        }

        let no_op = json_obj.get("no_op");
        if no_op.is_some() {
            Ok(QueryType::NoOp)
        } else {
            let query_type = json_obj.keys().next().unwrap();
            let json_value = json_obj.get(query_type).unwrap(); 
            match query_type.as_str() { 
                "include" => { 

                    let operator = Self::deserialize_operator(json_value)?;
                    let sub_type = Self::desserialize_sub_type(json_value)?;
                    Ok(QueryType::Include { sub_type, operator })},
                "exclude" => {
                
                    let operator = Self::deserialize_operator(json_value)?;
                    let sub_type = Self::desserialize_sub_type(json_value)?;
                    Ok(QueryType::Exclude { sub_type, operator })
                },
                "and" => {
                    let query_types = Self::deserialize_and_or(json_value)?;
                    Ok(QueryType::And(query_types))
                },
                "or" => {
                    let query_types = Self::deserialize_and_or(json_value)?;
                    Ok(QueryType::Or(query_types))
                }
                _ => Err(FromJsonValueError::json_format_error(
                    "The query type object should have one and only one key include, exclude or no_op",
                    "query_type",
                    json_value,
                )),
            }
        }
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;
    use serde_json::json;
    use super::super::ComparisonValue;
    mod query_type {
        use super::*;
        mod deserialize_operator {
            use super::*;

            #[test]
            fn is_ok() {
                let json_value = json!({"operator": {"name" : "GreaterThan"}});
                let result = QueryType::deserialize_operator(&json_value);
                assert!(result.is_ok());
                let result = result.unwrap();
                match result {
                    Operator::GreaterThan => {}
                    _ => panic!("Unexpected Operator Type"),
                }
            }

            #[test]
            fn operator_is_not_defined() {
                let json_value = json!({"opera": {"name" : "GreaterThan"}});
                let result = QueryType::deserialize_operator(&json_value);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    FromJsonValueError::JsonFormatError(_) => {}
                    _ => panic!("Unexpected Error Type"),
                }
            }
        }
       
        mod from_json_value {
            use super::*;

            #[test]
            fn include_is_ok() {
                let json_value = json!({ "include" : { "sub_type": { "name": "Value", "type": "Number", "value": 5.0 }, "operator": { "name": "GreaterThan" } }});

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_ok());
                let result = result.unwrap();
                match result {
                    QueryType::Include { sub_type, operator } => {
                        match sub_type {
                            SubType::Value(ComparisonValue::Number(value)) => {
                                assert_eq!(value, 5.0);
                            }
                            _ => panic!("Unexpected SubType"),
                        }
                        match operator {
                            Operator::GreaterThan => {}
                            _ => panic!("Unexpected Operator"),
                        }
                    }
                    _ => panic!("Unexpected QueryType"),
                }
            }

            #[test]
            fn exclude_is_ok() {
                let json_value = json!({ "exclude" : { "sub_type": { "name": "Value", "type": "Number", "value": 5.0 }, "operator": { "name": "GreaterThan" } }});

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_ok());
                let result = result.unwrap();
                match result {
                    QueryType::Exclude { sub_type, operator } => {
                        match sub_type {
                            SubType::Value(ComparisonValue::Number(value)) => {
                                assert_eq!(value, 5.0);
                            }
                            _ => panic!("Unexpected SubType"),
                        }
                        match operator {
                            Operator::GreaterThan => {}
                            _ => panic!("Unexpected Operator"),
                        }
                    }
                    _ => panic!("Unexpected QueryType"),
                }
            }

            #[test]
            fn no_op_is_ok() {
                let json_value = json!({ "no_op" : {} });

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_ok());
                let result = result.unwrap();
                match result {
                    QueryType::NoOp => {},
                    _ => panic!("Unexpected QueryType"),
                }
            }

            #[test]
            fn and_is_ok() {
                let json_value = json!({ "and": [ { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 5.0 }, "operator": { "name": "GreaterThan" } } }, { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 6.0 }, "operator": { "name": "GreaterThan" } } } ] });

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_ok());
                let result = result.unwrap();
                match result {
                    QueryType::And(query_types) => {
                        assert_eq!(query_types.len(), 2);
                        match &query_types[0] {
                            QueryType::Exclude { sub_type, operator } => {
                                match sub_type {
                                    SubType::Value(ComparisonValue::Number(value)) => {
                                        assert_eq!(*value, 5.0 );
                                    }
                                    _ => panic!("Unexpected SubType"),
                                }
                                match operator {
                                    Operator::GreaterThan => {}
                                    _ => panic!("Unexpected Operator"),
                                }
                            }
                            _ => panic!("Unexpected QueryType"),
                        }
                        match &query_types[1] {
                            QueryType::Exclude { sub_type, operator } => {
                                match sub_type {
                                    SubType::Value(ComparisonValue::Number(value)) => {
                                        assert_eq!(*value, 6.0);
                                    }
                                    _ => panic!("Unexpected SubType"),
                                }
                                match operator {
                                    Operator::GreaterThan => {}
                                    _ => panic!("Unexpected Operator"),
                                }
                            }
                            _ => panic!("Unexpected QueryType"),
                        }
                    
                    }
                    _ => panic!("Unexpected QueryType"),
                }
            }

            #[test]
            fn or_is_ok() {
                let json_value = json!({ "or": [ { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 5.0 }, "operator": { "name": "GreaterThan" } } }, { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 6.0 }, "operator": { "name": "GreaterThan" } } } ] });

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_ok());
                let result = result.unwrap();
                match result {
                    QueryType::Or(query_types) => {
                        assert_eq!(query_types.len(), 2);
                        match &query_types[0] {
                            QueryType::Exclude { sub_type, operator } => {
                                match sub_type {
                                    SubType::Value(ComparisonValue::Number(value)) => {
                                        assert_eq!(*value, 5.0 );
                                    }
                                    _ => panic!("Unexpected SubType"),
                                }
                                match operator {
                                    Operator::GreaterThan => {}
                                    _ => panic!("Unexpected Operator"),
                                }
                            }
                            _ => panic!("Unexpected QueryType"),
                        }
                        match &query_types[1] {
                            QueryType::Exclude { sub_type, operator } => {
                                match sub_type {
                                    SubType::Value(ComparisonValue::Number(value)) => {
                                        assert_eq!(*value, 6.0);
                                    }
                                    _ => panic!("Unexpected SubType"),
                                }
                                match operator {
                                    Operator::GreaterThan => {}
                                    _ => panic!("Unexpected Operator"),
                                }
                            }
                            _ => panic!("Unexpected QueryType"),
                        }
                    
                    }
                    _ => panic!("Unexpected QueryType"),
                }
            }

            #[test]
            fn nested_and_or_is_ok() {
                let json_value = json!({ "and": [ { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 5.0 }, "operator": { "name": "GreaterThan" } } }, { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 6.0 }, "operator": { "name": "GreaterThan" } } }, { "or": [ { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 10.0 }, "operator": { "name": "GreaterThan" } } }, { "exclude": { "sub_type": { "name": "Value", "type": "Number", "value": 11.0 }, "operator": { "name": "GreaterThan" } } } ] } ] });

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_ok());
                let result = result.unwrap();
                match result {
                    QueryType::And(query_types) => {
                        assert_eq!(query_types.len(), 3);
                        match &query_types[0] {
                            QueryType::Exclude { sub_type, operator } => {
                                match sub_type {
                                    SubType::Value(ComparisonValue::Number(value)) => {
                                        assert_eq!(*value, 5.0 );
                                    }
                                    _ => panic!("Unexpected SubType"),
                                }
                                match operator {
                                    Operator::GreaterThan => {}
                                    _ => panic!("Unexpected Operator"),
                                }
                            }
                            _ => panic!("Unexpected QueryType"),
                        }
                        match &query_types[1] {
                            QueryType::Exclude { sub_type, operator } => {
                                match sub_type {
                                    SubType::Value(ComparisonValue::Number(value)) => {
                                        assert_eq!(*value, 6.0);
                                    }
                                    _ => panic!("Unexpected SubType"),
                                }
                                match operator {
                                    Operator::GreaterThan => {}
                                    _ => panic!("Unexpected Operator"),
                                }
                            }
                            _ => panic!("Unexpected QueryType"),
                        }
                        match &query_types[2] {
                            QueryType::Or(query_types) => {
                                assert_eq!(query_types.len(), 2);
                                match &query_types[0] {
                                    QueryType::Exclude { sub_type, operator } => {
                                        match sub_type {
                                            SubType::Value(ComparisonValue::Number(value)) => {
                                                assert_eq!(*value, 10.0 );
                                            }
                                            _ => panic!("Unexpected SubType"),
                                        }
                                        match operator {
                                            Operator::GreaterThan => {}
                                            _ => panic!("Unexpected Operator"),
                                        }
                                    }
                                    _ => panic!("Unexpected QueryType"),
                                }
                                match &query_types[1] {
                                    QueryType::Exclude { sub_type, operator } => {
                                        match sub_type {
                                            SubType::Value(ComparisonValue::Number(value)) => {
                                                assert_eq!(*value, 11.0);
                                            }
                                            _ => panic!("Unexpected SubType"),
                                        }
                                        match operator {
                                            Operator::GreaterThan => {}
                                            _ => panic!("Unexpected Operator"),
                                        }
                                    }
                                    _ => panic!("Unexpected QueryType"),
                                }
                            }
                            _ => panic!("Unexpected QueryType"),
                        }
                    
                    }
                    _ => panic!("Unexpected QueryType"),
                }
            }
            #[test]
            fn invalid_query_type() {
                let json_value = json!({ "foo" : {} });

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    FromJsonValueError::JsonFormatError(_) => {},
                    _ => panic!("Unexpected FromJsonValueError type"),
                }
            }

            #[test]
            fn malformed_query_type_not_an_object() {
                let json_value = json!( "foo" );

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    FromJsonValueError::JsonFormatError(_) => {},
                    _ => panic!("Unexpected FromJsonValueError type"),
                }
            }

            #[test]
            fn malformed_query_type_extra_keys() {
                let json_value = json!({ "include" : { "sub_type": { "name": "Value", "type": "Number", "value": 5.0 }, "operator": { "name": "GreaterThan" } }, "exclude" : { "sub_type": { "name": "Value", "type": "Number", "value": 5.0 }, "operator": { "name": "GreaterThan" } }});

                let result = QueryType::from_json_value(&json_value);
                assert!(result.is_err());
                let result = result.err().unwrap();
                match result {
                    FromJsonValueError::JsonFormatError(_) => {},
                    _ => panic!("Unexpected FromJsonValueError type"),
                }
            }
        }
    }
}
