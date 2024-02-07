use serde::{Deserialize, Serialize};
use mongodb::error::Error as MongoDbError;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UpdateOneData {
    pub modified_count: u64,
}

pub type UpdateOneResult = Result<UpdateOneData, MongoDbError>;

