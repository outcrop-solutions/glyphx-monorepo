use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct ModelDefinition {
    pub collection: String,
}

#[derive(Debug, Deserialize, Clone)]
pub enum PushType {
    Push,
    Shift,
}

#[derive(Debug, Deserialize, Clone)]
pub struct VectorFieldDefinition {
    pub push_type: PushType,
    pub vector_type: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct FieldDefinition {
    pub name: String,
    pub field_type: String,
    pub is_option: Option<()>,
    pub is_vector: Option<VectorFieldDefinition>,
    pub is_updateable: Option<()>,
    pub is_createable: Option<()>,
    pub is_object_id: Option<()>,
    pub pass_through_attributes: Vec<String>,
    pub default_value: Option<String>,
    pub database_name: String,
}
