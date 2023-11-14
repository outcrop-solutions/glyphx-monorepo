use async_trait::async_trait;
use super::{DatabaseOperations, ProcessTrackingModel};
use crate::MongoDbConnection;
use crate::models::common::*;
use glyphx_core::Singleton;

use mongodb::Collection;
use mongodb::bson::{doc, Document};
use mongodb::error::Result as MongoDbResult;
use mongodb::options::{
    CountOptions, FindOneOptions, FindOptions, InsertOneOptions, UpdateOptions, DeleteOptions,
};
use futures::stream::TryStreamExt;

pub struct DatabaseOperationsImpl;

#[async_trait]
impl DatabaseOperations for DatabaseOperationsImpl {
    async fn find_one(
        &self,
        filter: Document,
        options: Option<FindOneOptions>,
    ) -> MongoDbResult<Option<ProcessTrackingModel>> {
        let mongo = MongoDbConnection::get_instance();
        let collection = mongo.database.collection("processtrackings");
        collection.find_one(filter, options).await
    }

    async fn count_documents(
        &self,
        filter: Document,
        options: Option<CountOptions>,
    ) -> MongoDbResult<u64> {
        let mongo = MongoDbConnection::get_instance();
        let collection: mongodb::Collection<ProcessTrackingModel> =
            mongo.database.collection("processtrackings");
        collection.count_documents(filter, options).await
    }

    async fn query_documents(
        &self,
        filter: Document,
        options: Option<FindOptions>,
    ) -> MongoDbResult<Option<Vec<ProcessTrackingModel>>> {
        let mongo = MongoDbConnection::get_instance();
        let collection = mongo.database.collection("processtrackings");
        let res = collection.find(filter, options).await;

        if res.is_err() {
            return MongoDbResult::Err(res.err().unwrap());
        }
        let res = res.unwrap();
        let res = res.try_collect().await.unwrap();
        MongoDbResult::Ok(Some(res))
    }

    async fn query_ids(
        &self,
        filter: Document,
        options: Option<FindOptions>,
    ) -> MongoDbResult<Option<Vec<DocumentIds>>> {
        let mut options = options.unwrap_or(FindOptions::default());
        options.projection = Some(doc! { "_id": 1 });
        let mongo = MongoDbConnection::get_instance();
        let collection: Collection<ProcessTrackingModel> =
            mongo.database.collection("processtrackings");
        let collection = collection.clone_with_type::<DocumentIds>();
        let res = collection.find(filter, options).await;

        if res.is_err() {
            return MongoDbResult::Err(res.err().unwrap());
        }
        let res = res.unwrap();
        let res = res.try_collect().await;
        if res.is_err() {
            return MongoDbResult::Err(res.err().unwrap());
        }
        MongoDbResult::Ok(Some(res.unwrap()))
    }

    async fn insert_document(
        &self,
        document: Document,
        options: Option<InsertOneOptions>,
    ) -> CreateOneResult {
        let mongo = MongoDbConnection::get_instance();
        let collection = mongo.database.collection("processtrackings");
        let result = collection.insert_one(document, options).await;
        if result.is_err() {
            return CreateOneResult::Err(result.err().unwrap());
        }

        let result = result.unwrap();
        let id = result.inserted_id.as_object_id().unwrap().to_string();
        Ok(CreateOneData { id })
    }

    async fn update_one_document(
        &self,
        filter: &Document,
        document: &Document,
        options: Option<UpdateOptions>,
    ) -> UpdateOneResult {
        let mongo = MongoDbConnection::get_instance();
        let collection: Collection<ProcessTrackingModel> =
            mongo.database.collection("processtrackings");
        let result = collection
            .update_one(filter.clone(), document.clone(), options)
            .await;
        if result.is_err() {
            return UpdateOneResult::Err(result.err().unwrap());
        }

        let result = result.unwrap();
        let modified_count = result.modified_count;
        Ok(UpdateOneData { modified_count })
    }

    async fn delete_one_document(
        &self,
        filter: &Document,
        options: Option<DeleteOptions>,
    ) -> DeleteOneResult {

        let mongo = MongoDbConnection::get_instance();
        let collection: Collection<ProcessTrackingModel> =
            mongo.database.collection("processtrackings");
        let result = collection
            .delete_one(filter.clone(), options)
            .await;
        if result.is_err() {
            return DeleteOneResult::Err(result.err().unwrap());
        }

        let result = result.unwrap();
        let deleted_count = result.deleted_count;
        Ok(DeleteOneData { deleted_count })
    }
}
