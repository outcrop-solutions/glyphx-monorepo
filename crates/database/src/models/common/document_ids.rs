use serde::{Deserialize, Serialize};
use super::deserialize_object_id;
///A Helper Structure for running queries 
///against a colllection to determine if a set of ids exist.
///This prevents us from having to return and 
///deserialize the entire document
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DocumentIds {
    #[serde(rename = "_id", deserialize_with = "deserialize_object_id")]
    pub id: String,
}

impl Default for DocumentIds {
    fn default() -> Self {
        DocumentIds {
            id: "".to_string(),
        }
    }
}

