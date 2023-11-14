use async_trait::async_trait;
use mockall::automock;
use mongodb::bson::Document;
use mongodb::error::{Error as MongoDbError, Result as MongoDbResult};
use mongodb::options::{FindOneOptions, CountOptions, FindOptions};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use futures::stream::TryStreamExt;

#[automock]
#[async_trait]
pub trait DatabaseOperations<T1>
where
    T1: Clone + Send + Sync + 'static,
{
    async fn find_one(
        &self,
        filter: Document,
        options: Option<FindOneOptions>,
    ) -> MongoDbResult<Option<T1>>;

    async fn count_documents(
        &self,
        filter: Document,
        options: Option<CountOptions>,
    ) -> MongoDbResult<u64>;

    async fn query_projection<T2>(
        filter: Document,
        options: Option<FindOptions>, 
        ) -> MongoDbResult<Option<Vec<T2>>>
where
    T2: serde::de::DeserializeOwned + Clone + Send + Unpin + Sync + 'static;
}
