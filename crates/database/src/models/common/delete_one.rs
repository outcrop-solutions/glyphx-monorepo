use serde::{Deserialize, Serialize};
use mongodb::error::Error as MongoDbError;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DeleteOneData {
    pub deleted_count: u64,
}

pub type DeleteOneResult = Result<DeleteOneData, MongoDbError>;

