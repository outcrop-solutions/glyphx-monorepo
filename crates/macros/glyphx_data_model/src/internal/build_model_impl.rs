use super::types::*;
use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use syn::Ident;

fn build_get_by_id(ident: &Ident, collection_name: &str) -> TokenStream {
    quote! {
        async fn get_by_id_impl<T: DatabaseOperations>(
            id: &str,
            database_operation: &T,
        ) -> Result<Option<#ident>, crate::errors::FindOneError> {
            let oid = mongodb::bson::oid::ObjectId::parse_str(id);
            if oid.is_err() {
                return Err(crate::errors::FindOneError::InvalidId(glyphx_core::GlyphxErrorData::new(
                    "The id is not a valid ObjectId".to_string(),
                    Some(
                        serde_json::json!({"collection" : #collection_name, "operation" : "get_by_id", "id" : id}),
                    ),
                    None,
                )));
            }
            let oid = oid.unwrap();
            let filter = mongodb::bson::doc! { "_id": oid };
            #ident::get_one_by_filter_impl(&filter, database_operation).await
        }
    }
}

fn build_get_one_by_filter(ident: &Ident, collection_name: &str) -> TokenStream {
    quote! {

    async fn get_one_by_filter_impl<T: DatabaseOperations>(
        filter: &mongodb::bson::Document,
        database_operation: &T,
    ) -> Result<Option<#ident>, crate::errors::FindOneError> {
        let raw_document = database_operation.find_one(filter.clone(), None).await;
        if raw_document.is_err() {
            return Err(crate::errors::FindOneError::from_mongo_db_error(
                &raw_document.unwrap_err().kind,
                #collection_name,
                "get_by_id",
            ));
        }

        let raw_document = raw_document.unwrap();
        if raw_document.is_none() {
            return Ok(None);
        }
        Ok(Some(raw_document.unwrap()))
    }
    }
}

fn build_id_exists(ident: &Ident, collection_name: &str) -> TokenStream {
    quote! {

    async fn id_exists_impl<T: DatabaseOperations>(
        id: &str,
        database_operation: &T,
    ) -> Result<Option<()>, crate::errors::IdExistsError> {
        let oid = mongodb::bson::oid::ObjectId::parse_str(id);
        if oid.is_err() {
            return Err(crate::errors::IdExistsError::InvalidId(glyphx_core::GlyphxErrorData::new(
                "The id is not a valid ObjectId".to_string(),
                Some(
                    serde_json::json!({"collection" : #collection_name, "operation" : "id_exists", "id" : id}),
                ),
                None,
            )));
        }
        let oid = oid.unwrap();
        let filter = mongodb::bson::doc! { "_id": oid };
        let document_count = database_operation.count_documents(filter, None).await;
        if document_count.is_err() {
            return Err(crate::errors::IdExistsError::from_mongo_db_error(
                &document_count.unwrap_err().kind,
                #collection_name,
                "id_exists",
            ));
        }
        let document_count = document_count.unwrap();
        if document_count == 0 {
            return Ok(None);
        }
        return Ok(Some(()));
    }
    }
}

fn build_all_ids_exists(_ident: &Ident, collection_name: &str) -> TokenStream {
    quote! {

      pub async fn all_ids_exist_impl<T: DatabaseOperations>(
          ids: &Vec<&str>,
          database_operation: &T,
      ) -> Result<(), crate::errors::AllIdsExistError> {
          let mut object_ids: Vec<mongodb::bson::oid::ObjectId> = Vec::new();
          for id in ids {
              let oid = mongodb::bson::oid::ObjectId::parse_str(id);
              if oid.is_err() {
                  return Err(crate::errors::AllIdsExistError::InvalidId(glyphx_core::GlyphxErrorData::new(
                      "The id is not a valid ObjectId".to_string(),
                      Some(
                          serde_json::json!({"collection" : #collection_name, "operation" : "all_ids_exist", "id" : id}),
                      ),
                      None,
                  )));
              }
              object_ids.push(oid.unwrap());
          }
          let filter = mongodb::bson::doc! { "_id": { "$in": object_ids } };
          let results = database_operation.query_ids(filter, None).await;

          if results.is_err() {
              return Err(crate::errors::AllIdsExistError::from_mongo_db_error(
                  &results.unwrap_err().kind,
                  #collection_name,
                  "all_ids_exist",
              ));
          }
          let results = results.unwrap();
          if results.is_none() {
              return Err(crate::errors::AllIdsExistError::MissingIds(glyphx_core::GlyphxErrorData::new(
                  "Unable to find any of the requested ids".to_string(),
                  Some(serde_json::json!({"ids" : ids})),
                  None,
              )));
          }
          let mut missing_ids: Vec<&str> = Vec::new();

          let results = results.unwrap();
          for id in ids {
              let mut found = false;
              for result in &results {
                  if result.id == *id {
                      found = true;
                      break;
                  }
              }
              if !found {
                  missing_ids.push(id);
              }
          }
          if missing_ids.len() > 0 {
              return Err(crate::errors::AllIdsExistError::MissingIds(glyphx_core::GlyphxErrorData::new(
                  "Some Ids Are Missing".to_string(),
                  Some(serde_json::json!({"ids" : missing_ids})),
                  None,
              )));
          }
          Ok(())
      }
    }
}

fn build_insert_document(ident: &Ident, collection_name: &str) -> TokenStream {
    let create_ident = format_ident!("Create{}", ident);
    quote! {
      pub async fn insert_document_impl<T: DatabaseOperations>(
          input: &#create_ident,
          database_operations: &T,
      ) -> Result<#ident, crate::errors::InsertDocumentError> {
          //I don't think that this would ever error since we are using the serializer to create it.
          //So, I am not going to worry about testing it for now.
          let bson = input.to_bson();
          if bson.is_err() {
              let err = bson.err().unwrap();
              let err =
                  crate::errors::InsertDocumentError::from_bson_error(err, #collection_name, "insert_document");
              return Err(err);
          }
          let document = bson.unwrap();

          let insert_results = database_operations.insert_document(document, None).await;

          if insert_results.is_err() {
              let err = insert_results.err().unwrap();
              let err = crate::errors::InsertDocumentError::from_mongo_db_error(
                  &err.kind,
                  #collection_name,
                  "insert_document",
              );
              return Err(err);
          }

          let insert_results = insert_results.unwrap();

          let id = insert_results.id;
          let get_results = #ident::get_by_id_impl(&id, database_operations).await;
          if get_results.is_err() {
              let err = get_results.err().unwrap();
              let err = crate::errors::InsertDocumentError::from_find_one_error(
                  &err,
                  #collection_name,
                  "insert_document",
              );
              return Err(err);
          }

          let get_results = get_results.unwrap();
          if get_results.is_none() {
              let data = serde_json::json!({"collection": #collection_name, "operation": "insert_document"});
              let message = "An unexpected error occurred and the get_by_id operation did not return a document".to_string();
              let error_data = glyphx_core::GlyphxErrorData::new(message, Some(data), None);
              return Err(crate::errors::InsertDocumentError::CreateFailure(error_data));
          }

          Ok(get_results.unwrap())
      }
    }
}

fn build_update_document_by_id(ident: &Ident, collection_name: &str) -> TokenStream {
    let update_ident = format_ident!("Update{}", ident);
    quote! {

      async fn update_document_by_id_impl<T: DatabaseOperations>(
          id: &str,
          input: &#update_ident,
          database_operations: &T,
      ) -> Result<#ident, crate::errors::UpdateDocumentError> {
          let oid = mongodb::bson::oid::ObjectId::parse_str(id);
          if oid.is_err() {
              return Err(crate::errors::UpdateDocumentError::InvalidId(glyphx_core::GlyphxErrorData::new(
                  "The id is not a valid ObjectId".to_string(),
                  Some(
                      serde_json::json!({"collection" : #collection_name, "operation" : "update_document_by_id", "id" : id}),
                  ),
                  None,
              )));
          }
          let oid = oid.unwrap();
          let filter = doc! { "_id": oid };
          #ident::update_document_by_filter_impl(&filter, input, database_operations).await
      }
    }
}

fn build_update_document_by_filter(ident: &Ident, collection_name: &str) -> TokenStream {
    let update_ident = format_ident!("Update{}", ident);
    quote! {

    async fn update_document_by_filter_impl<T: DatabaseOperations>(
        filter: &mongodb::bson::Document,
        input: &#update_ident,
        database_operations: &T,
    ) -> Result<#ident, crate::errors::UpdateDocumentError> {
        if !input.is_valid() {
            return Err(crate::errors::UpdateDocumentError::DocumentValidationFailure(glyphx_core::GlyphxErrorData::new(
                "At least one field in the UpdateProcessTrackingModel document must have a value".to_string(),
                Some(serde_json::json!({"collection" : #collection_name, "operation" : "update_document_by_filter"})),
                None,
            )));
        }
        let bson = input.to_bson();
        if bson.is_err() {
            let err = bson.err().unwrap();
            let err = crate::errors::UpdateDocumentError::from_bson_error(
                err,
                #collection_name,
                "update_document_by_filter",
            );
            return Err(err);
        }
        let document = bson.unwrap();
        #ident::update_document_impl(
            filter,
            &document,
            database_operations,
            "update_document_by_filter",
        )
        .await
    }
    }
}

fn build_update_document(ident: &Ident, collection_name: &str) -> TokenStream {
    quote! {

    async fn update_document_impl<T: DatabaseOperations>(
        filter: &mongodb::bson::Document,
        document: &mongodb::bson::Document,
        database_operations: &T,
        operation: &str,
    ) -> Result<#ident, crate::errors::UpdateDocumentError> {
        let update_result = database_operations
            .update_one_document(filter, document, None)
            .await;
        if update_result.is_err() {
            let err = update_result.err().unwrap();
            let err =
                crate::errors::UpdateDocumentError::from_mongo_db_error(&err.kind, #collection_name, operation);
            return Err(err);
        }

        let update_result = update_result.unwrap();
        if update_result.modified_count == 0 {
            let data = serde_json::json!({"collection": #collection_name, "operation": operation});
            let message = "An unexpected error occurred and the update operation did not modify any documents".to_string();
            let error_data = glyphx_core::GlyphxErrorData::new(message, Some(data), None);
            return Err(crate::errors::UpdateDocumentError::UpdateFailure(error_data));
        }

        let get_results = #ident::get_one_by_filter_impl(filter, database_operations).await;
        if get_results.is_err() {
            let err = get_results.err().unwrap();
            let err =
                crate::errors::UpdateDocumentError::from_find_one_error(&err, #collection_name, operation);
            return Err(err);
        }

        let get_results = get_results.unwrap();
        if get_results.is_none() {
            let data = serde_json::json!({"collection": #collection_name, "operation": operation});
            let message = "An unexpected error occurred and the get_by_id operation did not return a document".to_string();
            let error_data = glyphx_core::GlyphxErrorData::new(message, Some(data), None);
            return Err(crate::errors::UpdateDocumentError::UpdateFailure(error_data));
        }

        Ok(get_results.unwrap())
    }
    }
}
//TODO: this is a hard delete.  At some point we will need to develop a process for a soft delete.
fn build_delete_document_by_id(ident: &Ident, collection_name: &str ) -> TokenStream {
    quote! {
    async fn delete_document_by_id_impl<T: DatabaseOperations>(
        id: &str,
        database_operations: &T,
    ) -> Result<(), crate::errors::DeleteDocumentError> {
        let oid = mongodb::bson::oid::ObjectId::parse_str(id);
        if oid.is_err() {
            return Err(crate::errors::DeleteDocumentError::InvalidId(glyphx_core::GlyphxErrorData::new(
                "The id is not a valid ObjectId".to_string(),
                Some(
                    serde_json::json!({"collection" : #collection_name, "operation" : "get_by_id", "id" : id}),
                ),
                None,
            )));
        }
        let oid = oid.unwrap();
        let filter = mongodb::bson::doc! { "_id": oid };
        #ident::delete_document_by_filter_impl(&filter, database_operations).await
    }
    }
}

fn build_delete_document_by_filter(ident: &Ident, collection_name: &str ) -> TokenStream {
    quote! {
    async fn delete_document_by_filter_impl<T: DatabaseOperations>(
        filter: &mongodb::bson::Document,
        database_operations: &T,
    ) -> Result<(), crate::errors::DeleteDocumentError> {
        let delete_result = database_operations.delete_one_document(filter, None).await;

        if delete_result.is_err() {
            let err = delete_result.err().unwrap();
            let err = crate::errors::DeleteDocumentError::from_mongo_db_error(
                &err.kind,
                #collection_name,
                "delete_document_by_filter",
            );
            return Err(err);
        }
        let delete_result = delete_result.unwrap();
        if delete_result.deleted_count == 0 {
            let data = serde_json::json!({"collection": #collection_name, "operation": "delete_document_by_filter", "filter" : filter});
            let message = "No documents were found which could be deleted".to_string();
            let error_data = glyphx_core::GlyphxErrorData::new(message, Some(data), None);
            return Err(crate::errors::DeleteDocumentError::DeleteFailure(error_data));
        }

        Ok(())
    }
    }
}

fn build_add_item_to_vector_field(ident: &Ident,  field_definition: &FieldDefinition ) -> TokenStream {
    let add_field_ident = format_ident!("add_{}", field_definition.name);
    let add_field_by_filter_ident = format_ident!("add_{}_by_filter", field_definition.name);
    let field_type_ident = format_ident!("{}", field_definition.is_vector.as_ref().unwrap().vector_type);
    let field_name_ident = format_ident!("{}", field_definition.name);
    let add_field_impl_ident = format_ident!("add_{}_impl", field_definition.name);
    let add_field_by_filter_ident_impl_ident = format_ident!("add_{}_by_filter_impl", field_definition.name);
    quote! {

    pub async fn #add_field_ident(
        id: &str,
        #field_name_ident: &#field_type_ident,
    ) -> Result<#ident, crate::errors::UpdateDocumentError> {
        #ident::#add_field_impl_ident(id, #field_name_ident, &DatabaseOperationsImpl).await
    }

    pub async fn #add_field_by_filter_ident(
        filter: &mongodb::bson::Document,
        #field_name_ident: &#field_type_ident,
    ) -> Result<#ident, crate::errors::UpdateDocumentError> {
        #ident::#add_field_by_filter_ident_impl_ident(filter, #field_name_ident, &DatabaseOperationsImpl).await
    }
    }
}

fn build_add_item_to_vector_field_impl(ident: &Ident,  field_definition: &FieldDefinition, collection_name: &str ) -> TokenStream {
    let field_type_ident = format_ident!("{}", field_definition.is_vector.as_ref().unwrap().vector_type);
    let field_name_ident = format_ident!("{}", field_definition.name);
    let add_field_impl_ident = format_ident!("add_{}_impl", field_definition.name);
    let add_field_by_filter_impl_ident = format_ident!("add_{}_by_filter_impl", field_definition.name);
    let field_database_name : &str = &field_definition.database_name;
    let operation = format!("add_{}", field_definition.name);
    let operation_filter = format!("add_{}_by_filter", field_definition.name); 
    quote! {

    pub async fn #add_field_impl_ident<T: DatabaseOperations>(
        id: &str,
        #field_name_ident: &#field_type_ident,
        database_operations: &T,
    ) -> Result<#ident, crate::errors::UpdateDocumentError> {
        let oid = mongodb::bson::oid::ObjectId::parse_str(id);
        if oid.is_err() {
            return Err(crate::errors::UpdateDocumentError::InvalidId(glyphx_core::GlyphxErrorData::new(
                "The id is not a valid ObjectId".to_string(),
                Some(
                    serde_json::json!({"collection" : #collection_name, "operation" : #operation, "id" : id}),
                ),
                None,
            )));
        }
        let oid = oid.unwrap();
        let filter = mongodb::bson::doc! { "_id": oid };
        #ident::#add_field_by_filter_impl_ident(&filter, #field_name_ident, database_operations).await
    }

    pub async fn #add_field_by_filter_impl_ident<T: DatabaseOperations>(
        filter: &mongodb::bson::Document,
        #field_name_ident: &#field_type_ident,
        database_operations: &T,
    ) -> Result<#ident, crate::errors::UpdateDocumentError> {
        let bson = mongodb::bson::to_bson(#field_name_ident);
        let bson = bson.unwrap();
        let operation =
            doc! { "$push": {#field_database_name: { "$each": [bson], "$position": 0} }};
        #ident::update_document_impl(
            filter,
            &operation,
            database_operations,
            #operation_filter,
        )
        .await
    }

    }
}
fn build_adds_for_vector_fields(ident: &Ident, collection_name: &str, field_definitions : &Vec<&FieldDefinition> ) -> TokenStream {
    let mut tokens = quote! {

    };
    for field_definition in field_definitions {
      let add_function = build_add_item_to_vector_field(ident, field_definition);
      let add_function_impl = build_add_item_to_vector_field_impl(ident, field_definition, collection_name);
    tokens = quote! {
      #tokens
      #add_function
      #add_function_impl
    };
    }
    tokens
}

fn build_query_documents(ident: &Ident, collection_name: &str ) -> TokenStream {
    quote!{
    async fn query_documents_impl<T: DatabaseOperations>(
        filter: &mongodb::bson::Document,
        page_number: Option<u64>,
        page_size: Option<u64>,
        database_operations: &T,
    ) -> Result<Option<crate::models::QueryResults<#ident>>, crate::errors::QueryDocumentsError> {
        let page_number = page_number.unwrap_or(0);
        let page_size = page_size.unwrap_or(10);

        if page_size == 0 {
            return Err(crate::errors::QueryDocumentsError::InvalidPageSize(glyphx_core::GlyphxErrorData::new(
                "The page size must be greater than 0".to_string(),
                Some(
                    serde_json::json!({"collection" : #collection_name, "operation" : "query_documents", "page_size" : page_size}),
                ),
                None,
            )));
        }

        let number_of_documents = database_operations
            .count_documents(filter.clone(), None)
            .await;
        if number_of_documents.is_err() {
            return Err(crate::errors::QueryDocumentsError::from_mongo_db_error(
                &number_of_documents.unwrap_err().kind,
                #collection_name,
                "query_documents",
            ));
        }

        let number_of_documents = number_of_documents.unwrap();
        if number_of_documents == 0 {
            return Ok(None);
        }
        let number_of_pages = number_of_documents.div_ceil(page_size) - 1;
        if page_number > number_of_pages {
            return Err(crate::errors::QueryDocumentsError::InvalidPageNumber(
                glyphx_core::GlyphxErrorData::new(
                    "The requested page number is greater than the number of pages".to_string(),
                    Some(
                        serde_json::json!({"collection" : #collection_name,  "operation" : "query_documents", "number_of_pages" : number_of_pages, "page_number" : page_number}),
                    ),
                    None,
                ),
            ));
        }
        //TODO: We may want to be able to identify an incrementing field to always sort the data
        //by.  For now, we are going to just use _id since it is autop incrementing.
        let option_builder = mongodb::options::FindOptions::builder()
            .sort(doc! { "_id": 1 })
            .skip(page_number * page_size as u64)
            .limit(page_size as i64);

        let documents = database_operations
            .query_documents(filter.clone(), Some(option_builder.build()))
            .await;
        if documents.is_err() {
            return Err(crate::errors::QueryDocumentsError::from_mongo_db_error(
                &documents.unwrap_err().kind,
                #collection_name,
                "query_documents",
            ));
        }
        let documents = documents.unwrap();
        if documents.is_none() {
            return Ok(None);
        }

        Ok(Some(crate::models::QueryResults::<#ident> {
            results: documents.unwrap(),
            number_of_items: number_of_documents,
            page_number,
            page_size,
        }))
    }

    }
}
pub fn build_model_impl(
    ident: &Ident,
    model_definition: &ModelDefinition,
    field_definitions: &Vec<FieldDefinition>,
) -> TokenStream {
    let get_by_id = build_get_by_id(ident, &model_definition.collection);
    let get_one_by_filter = build_get_one_by_filter(ident, &model_definition.collection);
    let id_exists = build_id_exists(ident, &model_definition.collection);
    let all_ids_exists = build_all_ids_exists(ident, &model_definition.collection);
    let insert_document = build_insert_document(ident, &model_definition.collection);
    let update_document_by_id = build_update_document_by_id(ident, &model_definition.collection);
    let update_document_by_filter = build_update_document_by_filter(ident, &model_definition.collection);
    let update_document = build_update_document(ident, &model_definition.collection);
    let delete_document_by_id = build_delete_document_by_id(ident, &model_definition.collection);
    let delete_document_by_filter = build_delete_document_by_filter(ident, &model_definition.collection);
    let vector_fields = field_definitions.iter().filter(|field_definition| field_definition.is_vector.is_some()).collect();
    let adds_for_vector_fields = build_adds_for_vector_fields(ident, &model_definition.collection, &vector_fields);
    let query_documents = build_query_documents(ident, &model_definition.collection);
    quote! {
       impl #ident {
           #get_by_id
           #get_one_by_filter
           #id_exists
           #all_ids_exists
           #insert_document
           #update_document_by_id
           #update_document_by_filter
           #update_document
           #delete_document_by_id
           #delete_document_by_filter
           #adds_for_vector_fields
           #query_documents
       }
    }
}
