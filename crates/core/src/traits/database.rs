use crate::types::aws::athena_manager::{
    athena_manager_errors::{
        GetQueryPagerError, GetQueryResultsError as GlyphxGetQueryResultsError,
        GetQueryStatusError, GetTableDescriptionError, RunQueryError, StartQueryError,
    },
    query_status::AthenaQueryStatus,
    table_description::*,
};

use async_trait::async_trait;
use aws_sdk_athena::{
    config::http::HttpResponse as Response,
    operation::get_query_results::{GetQueryResultsError, GetQueryResultsOutput},
    error::SdkError,
};
use aws_smithy_async::future::pagination_stream::PaginationStream;
use serde_json::Value;

#[async_trait]
pub trait IDatabase: std::fmt::Debug +  Send + Sync {
    fn get_database(&self) -> &str;
    fn get_catalog(&self) -> &str;
    async fn start_query(
        &self,
        query: &str,
        output_location: Option<String>,
    ) -> Result<String, StartQueryError>;
    async fn get_query_status(
        &self,
        query_id: &str,
    ) -> Result<AthenaQueryStatus, GetQueryStatusError>;
    async fn get_query_results(
        &self,
        query_id: &str,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, GlyphxGetQueryResultsError>;
    async fn run_query(
        &self,
        query: &str,
        time_out: Option<i32>,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, RunQueryError>;
    async fn get_paged_query_results(
        &self,
        query_id: &str,
        page_size: Option<i32>,
    ) -> Result<
        Box<
            PaginationStream<
                Result<GetQueryResultsOutput, SdkError<GetQueryResultsError, Response>>,
            >,
        >,
        GetQueryPagerError,
    >;
    async fn table_exists(&self, table_name: &str) -> Result<bool, RunQueryError>;
    async fn drop_table(&self, table_name: &str) -> Result<(), RunQueryError>;
    async fn view_exists(&self, view_name: &str) -> Result<bool, RunQueryError>;
    async fn drop_view(&self, view_name: &str) -> Result<(), RunQueryError>;
    async fn get_table_description(
        &self,
        table_name: &str,
    ) -> Result<Vec<ColumnDescription>, GetTableDescriptionError>;
}
