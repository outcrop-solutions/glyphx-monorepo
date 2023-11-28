use mongodb::bson::Bson;
use serde::{Deserialize, Deserializer};

pub fn deserialize_object_id<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    let bson_value = Bson::deserialize(deserializer)?;
    match bson_value {
        Bson::ObjectId(object_id) => Ok(object_id.to_string()),
        _ => Err(serde::de::Error::custom("Expected ObjectId")),
    }
}
