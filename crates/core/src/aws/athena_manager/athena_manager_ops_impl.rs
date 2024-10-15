
use aws_sdk_athena::config::http::HttpResponse as Response;
use aws_sdk_athena::types::{QueryExecutionContext, ResultConfiguration};
use aws_sdk_athena::Client as AthenaClient;
use aws_sdk_s3::error::SdkError;
use aws_smithy_async::future::pagination_stream::PaginationStream;

use aws_sdk_athena::operation::get_query_execution::{
    GetQueryExecutionError, GetQueryExecutionOutput,
};
use aws_sdk_athena::operation::start_query_execution::{
    StartQueryExecutionError, StartQueryExecutionOutput,
};

use aws_sdk_athena::operation::get_query_results::{GetQueryResultsError, GetQueryResultsOutput};

use aws_sdk_athena::operation::get_database::{GetDatabaseError, GetDatabaseOutput};

use crate::traits::AthenaManagerOps;

pub use crate::types::aws::athena_manager::athena_manager_errors::{
    GetQueryResultsError as GlyphxGetQueryResultsError, GetQueryStatusError,
    RunQueryError, StartQueryError,
};
pub use crate::types::aws::athena_manager::query_status::AthenaQueryStatus;

use async_trait::async_trait;

use serde_json::Value;

///This struct holds our production implementation of the AthenaManagerOps trait.
#[derive(Debug, Clone)]
pub struct AthenaManagerOpsImpl;

///The implementation of our AthenaManaerOps trait with our production method calls.
#[async_trait]
impl AthenaManagerOps for AthenaManagerOpsImpl {
    ///This method calls the AWS Athena get_database method to determine whether or not the
    ///database exists.
    ///# Arguments
    ///* `client` - The AWS Athena client.
    ///* `catalog` - The AWS catalog.
    ///* `database` - The AWS database.
    async fn get_database(
        &self,
        client: &AthenaClient,
        catalog: &str,
        database: &str,
    ) -> Result<GetDatabaseOutput, SdkError<GetDatabaseError>> {
        client
            .get_database()
            .catalog_name(catalog)
            .database_name(database)
            .send()
            .await
    }
    ///Unlike traditional databases, query execution in Athen is asynchronous.  This method
    ///calls the AWS Athena start_query_execution method to start the query execution.
    ///# Arguments
    ///* `client` - The AWS Athena client.
    ///* `catalog` - The AWS catalog.
    ///* `database` - The AWS database.
    ///* `query` - The query to execute.
    async fn start_query_execution(
        &self,
        client: &AthenaClient,
        catalog: &str,
        database: &str,
        query: &str,
        output_location: Option<String>,
    ) -> Result<StartQueryExecutionOutput, SdkError<StartQueryExecutionError>> {
        let context = QueryExecutionContext::builder()
            .catalog(catalog)
            .database(database)
            .build();
        let mut op = client
            .start_query_execution()
            .query_execution_context(context)
            .query_string(query);
        if output_location.is_some() {
            let result_configuration = ResultConfiguration::builder()
                .output_location(output_location.unwrap())
                .build();
            op = op.result_configuration(result_configuration);
        }
        op.send().await
    }

    ///Once a query has been started the AWS Athena get_query_execution method
    ///is called to determine the status of the query execution.
    ///# Arguments
    ///* `client` - The AWS Athena client.
    ///* `query_id` - The query id.
    async fn get_query_execution(
        &self,
        client: &AthenaClient,
        query_id: &str,
    ) -> Result<GetQueryExecutionOutput, SdkError<GetQueryExecutionError>> {
        client
            .get_query_execution()
            .query_execution_id(query_id)
            .send()
            .await
    }

    ///Once a query has completed, the AWS Athena get_query_results method is called
    ///to retrieve the results of the query.
    ///# Arguments
    ///* `client` - The AWS Athena client.
    ///* `query_id` - The query id.
    async fn get_query_results(
        &self,
        client: &AthenaClient,
        query_id: &str,
    ) -> Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>> {
        client
            .get_query_results()
            .query_execution_id(query_id)
            .send()
            .await
    }

    ///In some instances/workflows we may not want to return all of query results all at once.
    ///This method returns a paginator that can be used to retrieve the results in chunks.
    ///# Arguments
    ///* `client` - The AWS Athena client.
    ///* `query_id` - The query id.
    ///* `page_size` - The number of results to return per page.
    fn get_query_results_paginator(
        &self,
        client: &AthenaClient,
        query_id: &str,
        page_size: Option<i32>,
    ) -> Box<
        PaginationStream<Result<GetQueryResultsOutput, SdkError<GetQueryResultsError, Response>>>,
    > {
        //1st row is the header row, so we need to add 1 to the page size.
        let page_size = page_size.unwrap_or(1000);
        Box::new(
            client
                .get_query_results()
                .query_execution_id(query_id)
                .into_paginator()
                .page_size(page_size)
                .send(),
        )
    }

}
