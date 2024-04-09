use crate::errors::{
    AllIdsExistError, DeleteDocumentError, FindOneError, IdExistsError, InsertDocumentError,
    UpdateDocumentError, QueryDocumentsError,
};
use crate::models::QueryResults;
use mongodb::bson::Document;
use serde_json::Value;

#[async_trait::async_trait]
pub trait GlyphxDataModel<T1, T2, T3> 
    where T1: std::fmt::Debug + serde::Serialize + std::clone::Clone{
    fn from_str(value: &str) -> T1;
    fn from_document(document: &mongodb::bson::Document) -> T1;
    fn to_json(&self) -> Value;
    fn to_bson(&self) -> Result<Document, mongodb::bson::ser::Error>;
    async fn get_by_id(id: &str) -> Result<Option<T1>, FindOneError>;
    async fn get_one_by_filter(filter: &Document) -> Result<Option<T1>, FindOneError>;
    async fn id_exists(id: &str) -> Result<Option<()>, IdExistsError>;
    async fn all_ids_exist(ids: &Vec<&str>) -> Result<(), AllIdsExistError>;
    async fn insert_document(input: &T2) -> Result<T1, InsertDocumentError>;
    async fn update_document_by_id(id: &str, input: &T3) -> Result<T1, UpdateDocumentError>;
    async fn update_document_by_filter(
        filter: &Document,
        input: &T3,
    ) -> Result<T1, UpdateDocumentError>;
    async fn delete_document_by_id(id: &str) -> Result<(), DeleteDocumentError>;
    async fn delete_document_by_filter(filter: &Document) -> Result<(), DeleteDocumentError>;
    async fn query_documents(
        filter: &Document,
        page_number: Option<u64>,
        page_size: Option<u64>,
    ) -> Result<Option<QueryResults<T1>>, QueryDocumentsError>;
}
