use serde::{Deserialize, Serialize};
use mongodb::error::Error as MongoDbError;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateOneData {
    pub id: String,
}

pub type CreateOneResult = Result<CreateOneData, MongoDbError>;
