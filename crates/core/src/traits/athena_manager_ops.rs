/// This trait defines those methods that we will be mocking in our unit tests.  We will be
/// mocking these methods because they call AWS services and we want to test our logic and not
/// AWS's logic.
use crate::{
    aws::athena_manager::AthenaManager,
    types::aws::athena_manager::{
        athena_manager_errors::{
            GetQueryResultsError as GlyphxGetQueryResultsError, GetQueryStatusError, RunQueryError,
            StartQueryError,
        },
        query_status::AthenaQueryStatus,
    },
};

use async_trait::async_trait;

use aws_sdk_athena::{
    config::http::HttpResponse as Response,
    error::SdkError,
    operation::{
        get_database::{GetDatabaseError, GetDatabaseOutput},
        get_query_execution::{GetQueryExecutionError, GetQueryExecutionOutput},
        get_query_results::{GetQueryResultsError, GetQueryResultsOutput},
        start_query_execution::{StartQueryExecutionError, StartQueryExecutionOutput},
    },
    Client as AthenaClient,
};

use aws_smithy_async::future::pagination_stream::PaginationStream;
use mockall::*;
use serde_json::Value;

#[automock]
#[async_trait]
pub trait AthenaManagerOps :Send + Sync{
    async fn get_database(
        &self,
        client: &AthenaClient,
        catalog: &str,
        database: &str,
    ) -> Result<GetDatabaseOutput, SdkError<GetDatabaseError>>;

    async fn start_query_execution(
        &self,
        client: &AthenaClient,
        catalog: &str,
        database: &str,
        query: &str,
        output_location: Option<String>,
    ) -> Result<StartQueryExecutionOutput, SdkError<StartQueryExecutionError>>;

    async fn get_query_execution(
        &self,
        client: &AthenaClient,
        query_id: &str,
    ) -> Result<GetQueryExecutionOutput, SdkError<GetQueryExecutionError>>;

    async fn get_query_results(
        &self,
        client: &AthenaClient,
        query_id: &str,
        next_token: Option<String>,
    ) -> Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>;

    fn get_query_results_paginator(
        &self,
        client: &AthenaClient,
        query_id: &str,
        page_size: Option<i32>,
    ) -> Box<
        PaginationStream<Result<GetQueryResultsOutput, SdkError<GetQueryResultsError, Response>>>,
    >;

}

impl std::fmt::Debug for dyn AthenaManagerOps {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "AthenaManagerOps")
    }
}
