use super::types::*;
use proc_macro2::TokenStream;
use quote::quote;
use syn::Ident;

fn build_get_collection_function(struct_ident: &Ident, collection_name: &str) -> TokenStream {
    quote! {
        fn get_collection(&self) -> mongodb::error::Result<mongodb::Collection<#struct_ident>> {
            let mongo = crate::mongo_db_connection::MongoDbConnection::get_instance();
            let database = mongo.get_database();
            if database.is_err() {
                return mongodb::error::Result::Err(mongodb::error::Error::custom("The MongoDb connection has not been initialized"));
            }
            let database = database.unwrap();
            let collection: mongodb::Collection<#struct_ident> = database.collection(#collection_name);
            mongodb::error::Result::Ok(collection)
        }
    }
}

fn build_find_one(struct_ident: &Ident) -> TokenStream {
    quote! {
      async fn find_one(
          &self,
          filter: mongodb::bson::Document,
          options: Option<mongodb::options::FindOneOptions>,
      ) -> mongodb::error::Result<Option<#struct_ident>> {
          let collection  = self.get_collection();
          if collection.is_err() {
              return mongodb::error::Result::Err(collection.err().unwrap());
          }

          let collection = collection.unwrap();
          collection.find_one(filter).with_options(options).await
      }
    }
}

fn build_count_documents() -> TokenStream {
    quote! {
      async fn count_documents(
          &self,
          filter: mongodb::bson::Document,
          options: Option<mongodb::options::CountOptions>,
      ) -> mongodb::error::Result<u64> {
          let collection  = self.get_collection();
          if collection.is_err() {
              return mongodb::error::Result::Err(collection.err().unwrap());
          }
          let collection = collection.unwrap();
          collection.count_documents(filter).with_options(options).await
      }
    }
}

fn build_query_documents(struct_ident: &Ident) -> TokenStream {
    quote! {
      async fn query_documents(
          &self,
          filter: mongodb::bson::Document,
          options: Option<mongodb::options::FindOptions>,
      ) -> mongodb::error::Result<Option<Vec<#struct_ident>>> {
          let collection  = self.get_collection();
          if collection.is_err() {
              return mongodb::error::Result::Err(collection.err().unwrap());
          }
          let collection = collection.unwrap();
          let res = collection.find(filter).with_options(options).await;

          if res.is_err() {
              return mongodb::error::Result::Err(res.err().unwrap());
          }
          let res = res.unwrap();
          let res = res.try_collect().await.unwrap();
          mongodb::error::Result::Ok(Some(res))
      }
    }
}

fn build_query_ids() -> TokenStream {
    quote! {
       async fn query_ids(
          &self,
          filter: mongodb::bson::Document,
          options: Option<mongodb::options::FindOptions>,
      ) -> mongodb::error::Result<Option<Vec<crate::models::common::DocumentIds>>> {
          let mut options = options.unwrap_or(mongodb::options::FindOptions::default());
          options.projection = Some(doc! { "_id": 1 });
          let collection  = self.get_collection();
          if collection.is_err() {
              return mongodb::error::Result::Err(collection.err().unwrap());
          }
          let collection = collection.unwrap();
          let collection = collection.clone_with_type::<crate::models::common::DocumentIds>();
          let res = collection.find(filter).with_options(options).await;

          if res.is_err() {
              return mongodb::error::Result::Err(res.err().unwrap());
          }
          let res = res.unwrap();
          let res = res.try_collect().await;
          if res.is_err() {
              return mongodb::error::Result::Err(res.err().unwrap());
          }
          mongodb::error::Result::Ok(Some(res.unwrap()))
      }

    }
}

fn build_insert_document() -> TokenStream {
    quote! {
      async fn insert_document(
          &self,
          document: mongodb::bson::Document,
          options: Option<mongodb::options::InsertOneOptions>,
      ) -> crate::models::common::create_one::CreateOneResult {
          let collection  = self.get_collection();
          if collection.is_err() {
              return crate::models::common::create_one::CreateOneResult::Err(collection.err().unwrap());
          }
          //We need this support the genric Document struct
          let collection = collection.unwrap().clone_with_type::<mongodb::bson::Document>();
          let result = collection.insert_one(document).with_options(options).await;
          if result.is_err() {
              return crate::models::common::create_one::CreateOneResult::Err(result.err().unwrap());
          }

          let result = result.unwrap();
          let id = result.inserted_id.as_object_id().unwrap().to_string();
          Ok(crate::models::common::create_one::CreateOneData { id })
      }
    }
}

fn build_update_document() -> TokenStream {
    quote! {
      async fn update_one_document(
          &self,
          filter: &mongodb::bson::Document,
          document: &mongodb::bson::Document,
          options: Option<mongodb::options::UpdateOptions>,
      ) -> crate::models::common::update_one::UpdateOneResult {
          let collection  = self.get_collection();
          if collection.is_err() {
              return crate::models::common::update_one::UpdateOneResult::Err(collection.err().unwrap());
          }
          let collection = collection.unwrap();
          let result = collection
              .update_one(filter.clone(), document.clone()).with_options(options)
              .await;
          if result.is_err() {
              return crate::models::common::update_one::UpdateOneResult::Err(result.err().unwrap());
          }

          let result = result.unwrap();
          let modified_count = result.modified_count;
          Ok(crate::models::common::update_one::UpdateOneData { modified_count })
      }
    }
}

fn build_delete_document() -> TokenStream {
    quote! {
      async fn delete_one_document(
          &self,
          filter: &mongodb::bson::Document,
          options: Option<mongodb::options::DeleteOptions>,
      ) -> crate::models::common::delete_one::DeleteOneResult {

          let collection  = self.get_collection();
          if collection.is_err() {
              return crate::models::common::delete_one::DeleteOneResult::Err(collection.err().unwrap());
          }
          let collection = collection.unwrap();
          let result = collection
              .delete_one(filter.clone()).with_options(options)
              .await;
          if result.is_err() {
              return crate::models::common::delete_one::DeleteOneResult::Err(result.err().unwrap());
          }

          let result = result.unwrap();
          let deleted_count = result.deleted_count;
          Ok(crate::models::common::delete_one::DeleteOneData { deleted_count })
      }
    }
}

pub fn build_database_operations_impl(
    struct_ident: &Ident,
    model_definition: &ModelDefinition,
) -> TokenStream {
    let get_collection_function =
        build_get_collection_function(struct_ident, &model_definition.collection);
    let find_one_function = build_find_one(struct_ident);

    let count_documents_function =
        build_count_documents();

    let query_documents_function =
        build_query_documents(struct_ident);

    let query_ids_function = build_query_ids();

    let insert_document_function =
        build_insert_document();

    let update_document_function =
        build_update_document();

    let delete_document_function =
        build_delete_document();

    quote! {
     use futures::stream::StreamExt;
     struct DatabaseOperationsImpl;

     #[async_trait::async_trait]
    impl DatabaseOperations for DatabaseOperationsImpl {
         #get_collection_function
         #find_one_function
         #count_documents_function
         #query_documents_function
         #query_ids_function
         #insert_document_function
         #update_document_function
         #delete_document_function
     }

     }
}
pub fn build_database_operations_trait(struct_ident: &Ident) -> TokenStream {
    quote! {
             #[mockall::automock]
             #[async_trait::async_trait]
             pub trait DatabaseOperations {
                 fn get_collection(&self) -> mongodb::error::Result<mongodb::Collection<#struct_ident>>;
                 async fn find_one(
                     &self,
                     filter: mongodb::bson::Document,
                     options: Option<mongodb::options::FindOneOptions>,
                 ) ->  mongodb::error::Result<Option<#struct_ident>>;

                 async fn count_documents(
                     &self,
                     filter: mongodb::bson::Document,
                     options: Option<mongodb::options::CountOptions>,
                 ) -> mongodb::error::Result<u64>;

                 async fn query_documents(
                     &self,
                     filter: mongodb::bson::Document,
                     options: Option<mongodb::options::FindOptions>,
                 ) -> mongodb::error::Result<Option<Vec<#struct_ident>>>;

                 async fn query_ids(
                     &self,
                     filter: mongodb::bson::Document,
                     options: Option<mongodb::options::FindOptions>,
                 ) -> mongodb::error::Result<Option<Vec<crate::models::common::DocumentIds>>>;

                 async fn insert_document(
                     &self,
                     document: mongodb::bson::Document,
                     options: Option<mongodb::options::InsertOneOptions>,
                 ) -> crate::models::common::CreateOneResult;

                 async fn update_one_document(
                     &self,
                     filter: &mongodb::bson::Document,
                     document: &mongodb::bson::Document,
                     options: Option<mongodb::options::UpdateOptions>,
                 ) -> crate::models::common::UpdateOneResult;

                 async fn delete_one_document(
                     &self,
                     filter: &mongodb::bson::Document,
                     options: Option<mongodb::options::DeleteOptions>,
                 ) -> crate::models::common::DeleteOneResult;
             }
    }
}
