use async_trait::async_trait;
use mockall::automock;
use mongodb::bson::{doc, Document};
use mongodb::error::Result as MongoDbResult;
use mongodb::options::{
    CountOptions, DeleteOptions, FindOneOptions, FindOptions, InsertOneOptions, UpdateOptions,
};

use super::ProcessTrackingModel;
use crate::models::common::DocumentIds;
use crate::models::common::*;

///I was having issues getting this to work as a generic trait. To keep things moving, for now we
///will just create a DatabaseOperations trait for each collection.
#[automock]
#[async_trait]
pub trait DatabaseOperations {
    async fn find_one(
        &self,
        filter: Document,
        options: Option<FindOneOptions>,
    ) -> MongoDbResult<Option<ProcessTrackingModel>>;

    async fn count_documents(
        &self,
        filter: Document,
        options: Option<CountOptions>,
    ) -> MongoDbResult<u64>;

    async fn query_documents(
        &self,
        filter: Document,
        options: Option<FindOptions>,
    ) -> MongoDbResult<Option<Vec<ProcessTrackingModel>>>;

    async fn query_ids(
        &self,
        filter: Document,
        options: Option<FindOptions>,
    ) -> MongoDbResult<Option<Vec<DocumentIds>>>;

    async fn insert_document(
        &self,
        document: Document,
        options: Option<InsertOneOptions>,
    ) -> CreateOneResult;

    async fn update_one_document(
        &self,
        filter: &Document,
        document: &Document,
        options: Option<UpdateOptions>,
    ) -> UpdateOneResult;

    async fn delete_one_document(
        &self,
        filter: &Document,
        options: Option<DeleteOptions>,
    ) -> DeleteOneResult;
}
