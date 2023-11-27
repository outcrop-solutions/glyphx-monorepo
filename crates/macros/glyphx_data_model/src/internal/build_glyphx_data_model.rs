use super::build_to_bson_function;
use super::types::*;
use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use syn::Ident;

fn build_from_string_function(ident: &Ident) -> TokenStream {
    let panic_string = format!("Unable to parse {} from string: {{}}", ident);
    quote!(
        fn from_str(value: &str) -> #ident {
            let parse_result: serde_json::Result<#ident> = serde_json::from_str(value);
            if parse_result.is_err() {
                panic!(
                    #panic_string,
                    value
                );
         }
         parse_result.unwrap()
        }
    )
}

fn build_from_document_function(ident: &Ident) -> TokenStream {
    let panic_string = format!("Unable to parse {} from document: {{:?}}", ident);
    quote!(

        fn from_document(document: &mongodb::bson::Document) -> #ident {
            let parse_result = mongodb::bson::from_document(document.to_owned());
            if parse_result.is_err() {
                panic!(
                    #panic_string,
                 document
                );
            }
            parse_result.unwrap()
        }
    )
}

fn build_to_json_function(ident: &Ident) -> TokenStream {
    let panic_string = format!("Unable to serialize  {} to json: {{:?}}", ident);
    quote!(
        fn to_json(&self) -> serde_json::Value {
            let json = serde_json::to_value(&self);
            if json.is_err() {
                panic!(
                    #panic_string,
                    self
                );
            }
            json.unwrap()
        }
    )
}

pub fn build_glyphx_data_model(
    ident: &Ident,
    _model_definition: &ModelDefinition,
    field_definitions: &Vec<FieldDefinition>,
) -> TokenStream {
    let create_ident = format_ident!("Create{}", ident);
    let update_ident = format_ident!("Update{}", ident);
    let from_string = build_from_string_function(&ident);
    let from_document = build_from_document_function(&ident);
    let to_json = build_to_json_function(&ident);
    //This is necessary since we use filters over iterators in other methods to get our fields.
    let to_bson = build_to_bson_function(&field_definitions.iter().collect(), None, Some(()));
    quote!(

        #[async_trait::async_trait]
        impl GlyphxDataModel<#ident, #create_ident, #update_ident> for #ident {
            #from_string
            #from_document
            #to_json
            #to_bson

        async fn get_by_id(id: &str) -> Result<Option<#ident>, crate::errors::FindOneError> {
            #ident::get_by_id_impl(id, &DatabaseOperationsImpl).await
        }

        async fn get_one_by_filter(
            filter: &mongodb::bson::Document,
        ) -> Result<Option<#ident>, crate::errors::FindOneError> {
            #ident::get_one_by_filter_impl(filter, &DatabaseOperationsImpl).await
        }

        async fn id_exists(id: &str) -> Result<Option<()>, crate::errors::IdExistsError> {
            #ident::id_exists_impl(id, &DatabaseOperationsImpl).await
        }

        async fn all_ids_exist(ids: &Vec<&str>) -> Result<(), crate::errors::AllIdsExistError> {
            #ident::all_ids_exist_impl(ids, &DatabaseOperationsImpl).await
        }

        async fn insert_document(
            input: &#create_ident,
        ) -> Result<#ident, crate::errors::InsertDocumentError> {
            #ident::insert_document_impl(input, &DatabaseOperationsImpl).await
        }

        async fn update_document_by_id(
            id: &str,
            input: &#update_ident,
        ) -> Result<#ident, crate::errors::UpdateDocumentError> {
            #ident::update_document_by_id_impl(id, input, &DatabaseOperationsImpl).await
        }
        async fn update_document_by_filter(
            filter: &mongodb::bson::Document,
            input: &#update_ident,
        ) -> Result<#ident, crate::errors::UpdateDocumentError> {
            #ident::update_document_by_filter_impl(filter, input, &DatabaseOperationsImpl)
                .await
        }

        async fn delete_document_by_id(id: &str) -> Result<(), crate::errors::DeleteDocumentError> {
            #ident::delete_document_by_id_impl(id, &DatabaseOperationsImpl).await
        }
        async fn delete_document_by_filter(filter: &mongodb::bson::Document) -> Result<(), crate::errors::DeleteDocumentError> {
            #ident::delete_document_by_filter_impl(filter, &DatabaseOperationsImpl).await
        }

     async fn query_documents(
        filter: &mongodb::bson::Document,
        page_number: Option<u64>,
        page_size: Option<u64>,
    ) -> Result<Option<crate::models::QueryResults<#ident>>, crate::errors::QueryDocumentsError>  {

        #ident::query_documents_impl(
            filter,
            page_number,
            page_size,
            &DatabaseOperationsImpl,
        )
        .await
     }

    }

    )
}
#[cfg(test)]
mod build_from_string_function {
    use super::*;

    #[test]
    fn is_ok() {
        let res = build_to_json_function(&format_ident!("test"));
        println!("{}", res);
    }
}
