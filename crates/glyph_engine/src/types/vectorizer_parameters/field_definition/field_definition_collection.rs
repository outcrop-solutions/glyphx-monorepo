use crate::types::vectorizer_parameters::FieldDefinition;
#[derive(Debug, Clone)]
pub struct NamedFieldDefinition {
    pub name: String,
    pub field_definition: FieldDefinition,
}

#[derive(Debug, Clone)]
pub struct FieldDefinitionCollectionIterator<'a> {
    field_definitions: &'a Vec<NamedFieldDefinition>,
    index: usize,
}

impl<'a> Iterator for FieldDefinitionCollectionIterator<'a> {
    type Item = &'a NamedFieldDefinition;
    fn next(&mut self) -> Option<Self::Item> {
        if self.index >= self.field_definitions.len() {
            return None;
        }
        let result = &self.field_definitions[self.index];
        self.index += 1;
        Some(result)
    }
}

#[derive(Debug, Clone)]
pub struct FieldDefinitionCollection {
    field_definitions: Vec<NamedFieldDefinition>,
}

impl FieldDefinitionCollection {
    pub fn new() -> Self {
        Self {
            field_definitions: Vec::new(),
        }
    }

    pub fn add_field_definition(&mut self, name: String, field_definition: FieldDefinition) {
        self.field_definitions.push(NamedFieldDefinition {
            name,
            field_definition,
        });
    }

    pub fn get_field_definition(&self, name: &str) -> Option<&FieldDefinition> {
        let mut result: Option<&FieldDefinition> = None;
        for named_field_definition in self.field_definitions.iter() {
            if named_field_definition.name == name {
                result = Some(&named_field_definition.field_definition);
                break;
            }
        }
        result
    }

    pub fn iter(&self) -> FieldDefinitionCollectionIterator {
        FieldDefinitionCollectionIterator {
            field_definitions: &self.field_definitions,
            index: 0,
        }
    }
}
#[cfg(test)]
fn get_test_json() -> serde_json::Value {
    serde_json::json!({
        "fieldDefinitions": [
            {
                "fieldDisplayName": "test1",
                "fieldDataType" : 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "test1"
                }
            },
            {
                "fieldDisplayName": "test2",
                "fieldDataType" : 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "test2"
                }
            },
            {
                "fieldDisplayName": "test3",
                "fieldDataType" : 1,
                "fieldDefinition": {
                    "fieldType": "standard",
                    "fieldName": "test3"
                }
            }
        ]
    })
}

#[cfg(test)]
mod new {
    use super::*;
    #[test]
    fn test() {
        let field_definition_collection = FieldDefinitionCollection::new();
        assert_eq!(field_definition_collection.field_definitions.len(), 0);
    }
}

#[cfg(test)]
mod add_field_definition {
    use super::*;
    use crate::types::vectorizer_parameters::FieldDefinition;

    #[test]
    fn is_ok() {
        let json = get_test_json();
        let json = json["fieldDefinitions"].as_array().unwrap();
        let mut field_definition_collection = FieldDefinitionCollection::new();
        for field_definition in json.iter() {
            let name = field_definition["fieldDisplayName"]
                .as_str()
                .unwrap()
                .to_string();
            let field_definition = FieldDefinition::from_json(&field_definition).unwrap();
            field_definition_collection.add_field_definition(name, field_definition);
        }
        assert_eq!(field_definition_collection.field_definitions.len(), 3);
        let first_field = &field_definition_collection.field_definitions[0];
        assert_eq!(first_field.name, "test1");
        let first_field_definition = &first_field.field_definition;
        match first_field_definition {
            FieldDefinition::Standard { .. } => {
                assert!(true);
            }
            _ => {
                panic!("Unexpected field definition");
            }
        }
    }
}

#[cfg(test)]
mod get_field_definition {
    use super::*;

    #[test]
    fn is_ok() {
        let json = get_test_json();
        let json = json["fieldDefinitions"].as_array().unwrap();
        let mut field_definition_collection = FieldDefinitionCollection::new();
        for field_definition in json.iter() {
            let name = field_definition["fieldDisplayName"]
                .as_str()
                .unwrap()
                .to_string();
            let field_definition = FieldDefinition::from_json(&field_definition).unwrap();
            field_definition_collection.add_field_definition(name, field_definition);
        }
        assert_eq!(field_definition_collection.field_definitions.len(), 3);
        let first_field = field_definition_collection.get_field_definition("test1");
        assert!(first_field.is_some());
        let first_field = first_field.unwrap();
        match first_field {
            FieldDefinition::Standard { .. } => {
                assert!(true);
            }
            _ => {
                panic!("Unexpected field definition");
            }
        }
    }

    #[test]
    fn field_does_not_exist() {
        let json = get_test_json();
        let json = json["fieldDefinitions"].as_array().unwrap();
        let mut field_definition_collection = FieldDefinitionCollection::new();
        for field_definition in json.iter() {
            let name = field_definition["fieldDisplayName"]
                .as_str()
                .unwrap()
                .to_string();
            let field_definition = FieldDefinition::from_json(&field_definition).unwrap();
            field_definition_collection.add_field_definition(name, field_definition);
        }
        assert_eq!(field_definition_collection.field_definitions.len(), 3);
        let first_field = field_definition_collection.get_field_definition("test4");
        assert!(first_field.is_none());
    }
}

#[cfg(test)]
mod iter {
    use super::*;

    #[test]
    fn is_ok() {
        let json = get_test_json();
        let json = json["fieldDefinitions"].as_array().unwrap();
        let mut field_definition_collection = FieldDefinitionCollection::new();
        for field_definition in json.iter() {
            let name = field_definition["fieldDisplayName"]
                .as_str()
                .unwrap()
                .to_string();
            let field_definition = FieldDefinition::from_json(&field_definition).unwrap();
            field_definition_collection.add_field_definition(name, field_definition);
        }
        assert_eq!(field_definition_collection.field_definitions.len(), 3);
        let mut count = 0;
        for field_definition in field_definition_collection.iter() {
            count += 1;
            let field_name = format!("test{}", count);
            assert_eq!(field_definition.name, field_name);
            let field_definition = &field_definition.field_definition;
            match field_definition {
                FieldDefinition::Standard { .. } => {
                    assert!(true);
                }
                _ => {
                    panic!("Unexpected field definition");
                }
            }
        }
        assert_eq!(count, 3);
    }
}
