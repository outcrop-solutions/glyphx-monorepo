//! This model holds our AthenaManager struct for interacting with AWS Athena. 
//! Since many of the functions in this struct run against AWS services we 
//! have implemented our impl pattern to inject the AWS calls into the impl methods. 
//! The purpose of the public functions is to inject the production AWS calls into 
//! the impl methods.  This allows us to write unit tests against the impl methods and 
//! to mock the calls -- effectivly allowing us to unit test our logic and not AWS's logic. 
//! Another thing that you may notice is that we have included some of our impl methods in our
//! implementation of the AthenaManagerOps trait.  This is because some of our methods call 
//! other functions on or Athena manager struct.  This also allows us to test those methods.
//! Full integratiuon tests exist in the tests/aws directory to test theses methods against AWS.
use aws_sdk_athena::error::ProvideErrorMetadata;
use aws_sdk_athena::types::{QueryExecutionContext, QueryExecutionState, ResultConfiguration};
use aws_sdk_athena::Client as AthenaClient;
use aws_sdk_s3::error::SdkError;

use aws_sdk_athena::operation::get_query_execution::{
    GetQueryExecutionError, GetQueryExecutionOutput,
};
use aws_sdk_athena::operation::start_query_execution::{
    StartQueryExecutionError, StartQueryExecutionOutput,
};

use aws_sdk_athena::operation::get_query_results::{GetQueryResultsError, GetQueryResultsOutput};

use aws_sdk_athena::operation::get_database::{GetDatabaseError, GetDatabaseOutput};

use super::result_set_converter::convert_to_json;
use async_trait::async_trait;
pub use crate::types::aws::athena_manager::athena_manager_errors::{
    ConstructorError, GetQueryPagerError, GetQueryResultsError as GlyphxGetQueryResultsError,
    GetQueryStatusError, GetTableDescriptionError, RunQueryError, StartQueryError, AthenaStreamIteratorError
};
pub use crate::types::aws::athena_manager::query_status::AthenaQueryStatus;
pub use crate::types::aws::athena_manager::table_description::*;
pub use crate::types::error::GlyphxErrorData;

use mockall::*;
use serde_json::{json, Value};
use std::time::{Duration, Instant};
use tokio_stream::Stream;

/// This trait defines those methods that we will be mocking in our unit tests.  We will be
/// mocking these methods because they call AWS services and we want to test our logic and not
/// AWS's logic.
#[automock]
#[async_trait]
trait AthenaManagerOps {
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
    ) -> Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>;

    fn get_query_results_paginator(
        &self,
        client: &AthenaClient,
        query_id: &str,
        page_size: Option<i32>,
    ) -> Box<dyn Stream<Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>> + Unpin + Send>;

    async fn start_query_impl(
        &self,
        athena_manager: &AthenaManager,
        query: &str,
        output_location: Option<String>,
    ) -> Result<String, StartQueryError>;

    async fn get_query_status_impl(
        &self,
        athena_manager: &AthenaManager,
        query_id: &str,
    ) -> Result<AthenaQueryStatus, GetQueryStatusError>;

    async fn get_query_results_impl(
        &self,
        athena_manager: &AthenaManager,
        query_id: &str,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, GlyphxGetQueryResultsError>;

    async fn run_query_impl(
        &self,
        athena_manager: &AthenaManager,
        query: &str,
        time_out: Option<i32>,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, RunQueryError>;
}

///This struct holds our production implementation of the AthenaManagerOps trait.
#[derive(Debug, Clone)]
struct AthenaManagerOpsImpl;

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
    ) -> Box<dyn Stream<Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>> + Unpin + Send>
    {
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

    ///Some of our AtenaManager methods call other methods on the AthenaManager.  This method
    ///wraps calls to start_query_impl so that the methods that call start_query_impl can be
    ///tested.
    ///# Arguments
    ///* `athena_manager` - The AthenaManager.
    ///* `query` - The query to execute.
    ///* `output_location` - The output location for the query results.
    async fn start_query_impl(
        &self,
        athena_manager: &AthenaManager,
        query: &str,
        output_location: Option<String>,
    ) -> Result<String, StartQueryError> {
        athena_manager
            .start_query_impl(query, output_location, &AthenaManagerOpsImpl)
            .await
    }
    ///Some of our AtenaManager methods call other methods on the AthenaManager.  This method
    ///wraps calls to get_query_status_impl so that the methods that call get_query_status_impl can be
    ///tested.
    ///# Arguments
    ///* `athena_manager` - The AthenaManager.
    ///* `query_id` - The query id.
    async fn get_query_status_impl(
        &self,
        athena_manager: &AthenaManager,
        query_id: &str,
    ) -> Result<AthenaQueryStatus, GetQueryStatusError> {
        athena_manager
            .get_query_status_impl(query_id, &AthenaManagerOpsImpl)
            .await
    }
    ///Some of our AtenaManager methods call other methods on the AthenaManager.  This method
    ///wraps calls to get_query_results_impl so that the methods that call get_query_results_impl can be
    ///tested.
    ///# Arguments
    ///* `athena_manager` - The AthenaManager.
    ///* `query_id` - The query id.
    ///* `results_include_header_row` - Whether or not the results in the query output have a
    ///header row in addition to the information included in the result_metadata.
    async fn get_query_results_impl(
        &self,
        athena_manager: &AthenaManager,
        query_id: &str,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, GlyphxGetQueryResultsError> {
        athena_manager
            .get_query_results_impl(query_id, results_include_header_row, &AthenaManagerOpsImpl)
            .await
    }
    ///Some of our AtenaManager methods call other methods on the AthenaManager.  This method
    ///wraps calls to run_query_impl so that the methods that call run_query_impl can be
    ///tested.
    ///# Arguments
    ///* `athena_manager` - The AthenaManager.
    ///* `query` - The query to execute.
    ///* `time_out` - The maximum amount of time to wait for the query to complete.
    ///* `results_include_header_row` - Whether or not the results in the query output have a
    ///header row in addition to the information included in the result_metadata.
    async fn run_query_impl(
        &self,
        athena_manager: &AthenaManager,
        query: &str,
        time_out: Option<i32>,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, RunQueryError> {
        athena_manager
            .run_query_impl(
                query,
                time_out,
                results_include_header_row,
                &AthenaManagerOpsImpl,
            )
            .await
    }
}
///The AthenaManager is used to execute queries against AWS Athena.
#[derive(Debug, Clone)]
pub struct AthenaManager {
    catalog: String,
    database: String,
    client: AthenaClient,
}

///The impl of the functions for our AthenaManager.  in most cases you will see two versions of the
///function.  The pub facing part of the API and the private impl.  For example run_query and 
///run_query_impl.  The pub facing part of the API is what is used by consumers and injects the
///production AWS calls to the impl which does the actual work.  In this patters, the impls can be
///fully tested with mocks without having to actually call AWS.
impl AthenaManager {
    ///This method is used to create a new AthenaManager.
    ///# Arguments
    ///* `catalog` - The name of the data catalog to use for the AthenaManager.
    ///* `database` - The name of the database to use for the AthenaManager.
    pub async fn new(catalog: &str, database: &str) -> Result<AthenaManager, ConstructorError> {
        AthenaManager::new_impl(catalog, database, &AthenaManagerOpsImpl).await
    }
    ///A get acessor to get a reference to the databse name that was used to create the AthenaManager.
    pub fn get_database(&self) -> &str {
        &self.database
    }

    ///A get acessor to get a reference to the catalog name that was used to create the AthenaManager.
    pub fn get_catalog(&self) -> &str {
        &self.catalog
    }

    ///As noted, Athena runs queries Asynchronously.  This method is used to start a query and
    ///returns the query id that can be used to track the status of the query execution.
    ///# Arguments
    ///* `query` - The query to execute.
    ///* `output_location` - The output location for the query results.  This is optional each
    ///database has a default output location defined in AWS.
    pub async fn start_query(
        &self,
        query: &str,
        output_location: Option<String>,
    ) -> Result<String, StartQueryError> {
        self.start_query_impl(query, output_location, &AthenaManagerOpsImpl)
            .await
    }

    ///This method is used to get the status of a query execution that was previously started by a
    ///call to start_query.
    ///# Arguments
    ///* `query_id` - The query id.
    pub async fn get_query_status(
        &self,
        query_id: &str,
    ) -> Result<AthenaQueryStatus, GetQueryStatusError> {
        self.get_query_status_impl(query_id, &AthenaManagerOpsImpl)
            .await
    }
    ///Once a query has been completed, this method can be called to return the results of the
    ///query.  Keep in mind that calling this method befire the query has completed will result in
    ///an error.
    ///# Arguments
    ///* `query_id` - The query id.
    ///* `results_include_header_row` - Whether or not the results in the query output have a
    ///header row in addition to the information included in the result_metadata.
    pub async fn get_query_results(
        &self,
        query_id: &str,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, GlyphxGetQueryResultsError> {
        self.get_query_results_impl(query_id, results_include_header_row, &AthenaManagerOpsImpl)
            .await
    }

    ///This method effectivly wraps the call to start_query, get_query_status and
    ///get_query_results.  Additionally, the user may set a time out value that will cause the
    ///method to return an error if the query has not completed within the specified time.  The
    ///default is 60 seconds.
    ///# Arguments
    ///* `query` - The query to execute.
    ///* `time_out` - The maximum amount of time to wait for the query to complete in seconds.  The
    ///default is 60 seconds.
    ///* `results_include_header_row` - Whether or not the results in the query output have a
    ///header row in addition to the information included in the result_metadata.
    pub async fn run_query(
        &self,
        query: &str,
        time_out: Option<i32>,
        results_include_header_row: Option<bool>,
    ) -> Result<Value, RunQueryError> {
        self.run_query_impl(
            query,
            time_out,
            results_include_header_row,
            &AthenaManagerOpsImpl,
        )
        .await
    }
    ///Often times it is not desirable to return the enire result set of a query into memory.  This
    ///method will return a stream of results that can be processed one at a time.  It is important
    ///to remember to not call this method until the query has completed.
    ///# Arguments
    ///* `query_id` - The query id.
    ///* `page_size` - The number of results to return per page.  The default is 1000.
    pub async fn get_paged_query_results(
        &self,
        query_id: &str,
        page_size: Option<i32>,
    ) -> Result<
        impl Stream<Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>> + Unpin + Send,
        GetQueryPagerError,
    > {
        self.get_paged_query_results_impl(query_id, page_size, &AthenaManagerOpsImpl)
            .await
    }

    ///This method is used to check and see if a table exists in the database.
    ///# Arguments
    ///* `table_name` - The name of the table to check for.
    pub async fn table_exists(&self, table_name: &str) -> Result<bool, RunQueryError> {
        self.table_exists_impl(table_name, &AthenaManagerOpsImpl)
            .await
    }

    ///This method is used to check and see if a view exists in the database.
    ///# Arguments
    ///* `view_name` - The name of the view to check for.
    pub async fn view_exists(&self, view_name: &str) -> Result<bool, RunQueryError> {
        self.view_exists_impl(view_name, &AthenaManagerOpsImpl)
            .await
    }

    ///This method is used to drop a table from the database.
    ///# Arguments
    ///* `table_name` - The name of the table to drop.
    pub async fn drop_table(&self, table_name: &str) -> Result<(), RunQueryError> {
        self.drop_table_impl(table_name, &AthenaManagerOpsImpl)
            .await
    }
   ///This method is used to drop a view from the database.
   ///# Arguments
   ///* `view_name` - The name of the view to drop.
    pub async fn drop_view(&self, view_name: &str) -> Result<(), RunQueryError> {
        self.drop_view_impl(view_name, &AthenaManagerOpsImpl).await
    }

    ///This method will return the columns and data types for the specified table.
    ///# Arguments
    ///* `table_name` - The name of the table to get the description for.
    pub async fn get_table_description(
        &self,
        table_name: &str,
    ) -> Result<Vec<ColumnDescription>, GetTableDescriptionError> {
        self.get_table_description_impl(table_name, &AthenaManagerOpsImpl)
            .await
    }


    ///The intrnal implementation of the new method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `catalog` - The name of the data catalog to use to build the AthenaManager.
    ///* `database` - The name of the database to use to build the AthenaManager.
    ///* `aws_operations` - The implementation of AthenaManagerOps to use to make or mock the aws calls.
    async fn new_impl<T: AthenaManagerOps>(
        catalog: &str,
        database: &str,
        aws_operations: &T,
    ) -> Result<AthenaManager, ConstructorError> {
        let config = ::aws_config::from_env().region("us-east-2").load().await;
        let client = AthenaClient::new(&config);
        let res = aws_operations
            .get_database(&client, catalog, database)
            .await;

        if res.is_err() {
            let err = res.err().unwrap().into_service_error();
            match err {
                GetDatabaseError::InternalServerException(e) => {
                    return Err(ConstructorError::UnexpectedError(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": catalog,
                            "database": database,
                        })),
                        None,
                    )));
                }
                GetDatabaseError::InvalidRequestException(e) => {
                    return Err(ConstructorError::UnexpectedError(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": catalog,
                            "database": database,
                        })),
                        None,
                    )));
                }
                GetDatabaseError::MetadataException(e) => {
                    return Err(ConstructorError::DatabaseDoesNotExist(
                        GlyphxErrorData::new(
                            e.to_string(),
                            Some(json!({
                                "catalog": catalog,
                                "database": database,
                            })),
                            None,
                        ),
                    ));
                }
                GetDatabaseError::Unhandled(e) => {
                    return Err(ConstructorError::UnexpectedError(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": catalog,
                            "database": database,
                        })),
                        None,
                    )));
                }
                _ => {
                    return Err(ConstructorError::UnexpectedError(GlyphxErrorData::new(
                        "An unknown error has occurred.  Unfortunatly I have no more information to share".to_string(),
                        Some(json!({
                            "catalog": catalog,
                            "database": database,
                        })),
                        None,
                    )));
                }
            }
        } else {
            Ok(AthenaManager {
                catalog: catalog.to_string(),
                database: database.to_string(),
                client,
            })
        }
    }

    ///The internal implementation of the start_query method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `query` - The query to run.
    ///* `output_location` - The location to store the results of the query.
    ///* `aws_operations` - The implementation of AthenaManagerOps to use to make or mock the aws calls.
    async fn start_query_impl<T: AthenaManagerOps>(
        &self,
        query: &str,
        output_location: Option<String>,
        aws_operations: &T,
    ) -> Result<String, StartQueryError> {
        //We need to force this into a String because using traits
        //with our dependency injection scheme causes some lifetime
        //issues.  This clears that up without a bunch of extra
        //complexity.
        let output_location = match output_location {
            Some(loc) => Some(loc.to_string()),
            None => None,
        };
        let res = aws_operations
            .start_query_execution(
                &self.client,
                &self.catalog,
                &self.database,
                query,
                output_location,
            )
            .await;

        if res.is_err() {
            let service_error = res.err().unwrap().into_service_error();
            match service_error {
                StartQueryExecutionError::InvalidRequestException(e) => {
                    return Err(StartQueryError::DatabaseDoesNotExist(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": self.catalog,
                            "database": self.database,
                            "query": query,
                        })),
                        None,
                    )));
                }
                StartQueryExecutionError::TooManyRequestsException(e) => {
                    return Err(StartQueryError::RequestWasThrottled(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": self.catalog,
                            "database": self.database,
                            "query": query,
                        })),
                        None,
                    )));
                }
                StartQueryExecutionError::InternalServerException(e) => {
                    return Err(StartQueryError::UnexpectedError(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": self.catalog,
                            "database": self.database,
                            "query": query,
                        })),
                        None,
                    )));
                }
                StartQueryExecutionError::Unhandled(e) => {
                    return Err(StartQueryError::UnexpectedError(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": self.catalog,
                            "database": self.database,
                            "query": query,
                        })),
                        None,
                    )));
                }
                _ => {
                    return Err(StartQueryError::UnexpectedError(GlyphxErrorData::new(
                        "An unknown error has occurred.  Unfortunatly I have no more information to share".to_string(),
                        Some(json!({
                            "catalog": self.catalog,
                            "database": self.database,
                            "query": query,
                        })),
                        None,
                    )));
                }
            }
        } else {
            let output = res.unwrap();
            Ok(output.query_execution_id.unwrap())
        }
    }

    ///The internal implementation of the get_query_status method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `query_id` - The id of the query to get the status of.
    ///* `aws_operations` - The implementation of AthenaManagerOps to use to make or mock the aws calls.
    async fn get_query_status_impl<T: AthenaManagerOps>(
        &self,
        query_id: &str,
        aws_ops: &T,
    ) -> Result<AthenaQueryStatus, GetQueryStatusError> {
        let res = aws_ops.get_query_execution(&self.client, query_id).await;
        if res.is_err() {
            let service_error = res.err().unwrap().into_service_error();
            match service_error {
               GetQueryExecutionError::InvalidRequestException(e) => {
                    return Err(
                        GetQueryStatusError::QueryDoesNotExist(GlyphxErrorData::new(e.message().unwrap().to_string(), Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id    }),
                                    ), None) )
                        )
                },
                GetQueryExecutionError::InternalServerException(e) => {
                    return Err(
                        GetQueryStatusError::UnexpectedError(GlyphxErrorData::new(e.message().unwrap().to_string(), Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id    }),
                                    ), None) )
                        )

                },
                GetQueryExecutionError::Unhandled(e) => {
                    return Err(
                        GetQueryStatusError::UnexpectedError(GlyphxErrorData::new(e.meta().to_string(), Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id    }),
                                    ), None) )
                        )

                },
                _ => {
                    return Err(
                        GetQueryStatusError::UnexpectedError(GlyphxErrorData::new(String::from("An unexpected error has occurred.  Unfortunatly I have no other information to give."), Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id    }),
                                    ), None) )
                        )
                }
            }
        } else {
            let output = res.unwrap();
            let status = output.query_execution.unwrap().status.unwrap();
            let state = status.state().unwrap();
            let state = match state {
                QueryExecutionState::Queued => AthenaQueryStatus::Queued,
                QueryExecutionState::Running => AthenaQueryStatus::Running,
                QueryExecutionState::Succeeded => AthenaQueryStatus::Succeeded,
                QueryExecutionState::Failed => {
                    AthenaQueryStatus::Failed(status.athena_error.unwrap())
                }
                QueryExecutionState::Cancelled => AthenaQueryStatus::Cancelled,
                _ => AthenaQueryStatus::Unknown,
            };
            Ok(state)
        }
    }

    ///The internal implementation of the get_query_results method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `query_id` - The id of the query to get the results of.
    ///* `results_include_header_row` - indicates whether or not to results contain a header row
    ///that should be excluded from the results.
    ///* `aws_operations` - The implementation of AthenaManagerOps to use to make or mock the aws calls.
    async fn get_query_results_impl<T: AthenaManagerOps>(
        &self,
        query_id: &str,
        results_include_header_row: Option<bool>,
        aws_operations: &T,
    ) -> Result<Value, GlyphxGetQueryResultsError> {
        let res = aws_operations
            .get_query_results(&self.client, query_id)
            .await;
        if res.is_err() {
            let service_error = res.err().unwrap().into_service_error();
            return Err(GlyphxGetQueryResultsError::from_aws_get_query_result_error(
                service_error,
                &self.catalog,
                &self.database,
                query_id,
            ));
        } 
            let res = res.unwrap();
            let result_set = res.result_set;
            if result_set.is_none() {
                return Ok(json!([]));
            }
            let result_set = result_set.unwrap();
            if result_set.rows.is_none() {
                return Ok(Value::Null);
            }
            Ok(convert_to_json(&result_set, results_include_header_row))
        
    }

    ///An internal helper method that will convert StartQueryErrors to RunQueryErrors.
    ///# Arguments
    ///* `error` - The StartQueryError to convert.
    ///* `query` - The query that was attempted to be run.
    fn convert_start_query_error_to_run_query_error(
        &self,
        error: StartQueryError,
        query: &str,
    ) -> RunQueryError {
        let data =
            Some(json!({"catalog": self.catalog, "database": self.database, "query": query}));

        match error {
            StartQueryError::DatabaseDoesNotExist(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "DatabaseDoesNotExist": inner_error });
                RunQueryError::DatabaseDoesNotExist(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            StartQueryError::RequestWasThrottled(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "RequestWasThrottled": inner_error });
                RunQueryError::RequestWasThrottled(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            StartQueryError::UnexpectedError(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "UnexpectedError": inner_error });
                RunQueryError::UnexpectedError(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
        }
    }
    ///An internal helper method that will convert GetQueryStatusErrors to RunQueryErrors.
    ///# Arguments
    ///* `error` - The GetQueryStatusError to convert.
    ///* `query` - The query that was attempted to be run.
    ///* `query_id` - The id of the query that was attempted to be run.
    fn convert_get_query_status_error_to_run_query_error(
        &self,
        error: GetQueryStatusError,
        query: &str,
        query_id: &str,
    ) -> RunQueryError {
        let data = Some(
            json!({"catalog": self.catalog, "database": self.database, "query": query, "query_id": query_id}),
        );

        match error {
            GetQueryStatusError::QueryDoesNotExist(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "QueryDoesNotExist": inner_error });
                RunQueryError::QueryDoesNotExist(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            GetQueryStatusError::UnexpectedError(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "UnexpectedError": inner_error });
                RunQueryError::UnexpectedError(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
        }
    }
    ///An internal helper method that will convert GetQueryStatusErrors to GetQueryPagerErrors.
    ///# Arguments
    ///* `error` - The GetQueryStatusError to convert.
    ///* `query_id` - The id of the query that was attempted to be run.
    fn convert_get_query_status_error_to_get_query_pager_error(
        &self,
        error: GetQueryStatusError,
        query_id: &str,
    ) -> GetQueryPagerError {
        let data =
            Some(json!({"catalog": self.catalog, "database": self.database, "query_id": query_id}));

        match error {
            GetQueryStatusError::QueryDoesNotExist(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "QueryDoesNotExist": inner_error });
                GetQueryPagerError::QueryDoesNotExist(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            GetQueryStatusError::UnexpectedError(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "UnexpectedError": inner_error });
                GetQueryPagerError::UnexpectedError(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
        }
    }
    ///An internal helper method that will convert GetQueryResultsErrors to RunQueryErrors.
    ///# Arguments
    ///* `error` - The GetQueryResultsError to convert.
    ///* `query` - The query that was attempted to be run.
    ///* `query_id` - The id of the query that was attempted to be run.
    fn convert_get_query_results_error_to_run_query_error(
        &self,
        error: GlyphxGetQueryResultsError,
        query: &str,
        query_id: &str,
    ) -> RunQueryError {
        let data = Some(
            json!({"catalog": self.catalog, "database": self.database, "query": query, "query_id": query_id}),
        );

        match error {
            GlyphxGetQueryResultsError::QueryDoesNotExist(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "QueryDoesNotExist": inner_error });
                RunQueryError::QueryDoesNotExist(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            GlyphxGetQueryResultsError::RequestWasThrottled(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "RequestWasThrottled": inner_error });
                RunQueryError::RequestWasThrottled(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            GlyphxGetQueryResultsError::UnexpectedError(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "UnexpectedError": inner_error });
                RunQueryError::UnexpectedError(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
        }
    }

    ///An internal helper method that will convert GetQueryResultsErrors to
    ///GetTableDescriptionErrors.
    ///# Arguments
    ///* `error` - The GetQueryResultsError to convert.
    ///* `table_name` - The name of the table that was attempted to be described.
    fn convert_run_query_error_to_get_table_description_error(
        &self,
        error: RunQueryError,
        table_name: &str,
    ) -> GetTableDescriptionError {
        let data = Some(
            json!({"catalog": self.catalog, "database": self.database, "table_name": table_name}),
        );

        match error {
            RunQueryError::QueryDoesNotExist(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "QueryDoesNotExist": inner_error });
                GetTableDescriptionError::QueryDoesNotExist(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            RunQueryError::RequestWasThrottled(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "RequestWasThrottled": inner_error });
                GetTableDescriptionError::RequestWasThrottled(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            RunQueryError::QueryFailed(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "QueryFailed": inner_error });
                GetTableDescriptionError::QueryFailed(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            RunQueryError::QueryTimedOut(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "QueryTimedOut": inner_error });
                GetTableDescriptionError::QueryTimedOut(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }

            RunQueryError::DatabaseDoesNotExist(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "DatabaseDoesNotExist": inner_error });
                GetTableDescriptionError::DatabaseDoesNotExist(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            RunQueryError::QueryCancelled(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "QueryCancelled": inner_error });
                GetTableDescriptionError::QueryCancelled(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
            RunQueryError::UnexpectedError(e) => {
                let inner_error = serde_json::to_value(&e).unwrap();
                let inner_error = json!({ "UnexpectedError": inner_error });
                GetTableDescriptionError::UnexpectedError(GlyphxErrorData::new(
                    e.message,
                    data,
                    Some(inner_error),
                ))
            }
        }
    }
    ///Our internal implementation of run_query. This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `query` - The query to run.
    ///* `time_out` - The amount of time in seconds to wait for the query to complete.
    ///* `results_include_header_row` - Indicates whether or not the results include a header row
    ///which should be excuded from the results. 
    ///* `aws_operations` - The AthenaManagerOps implementation to use to make or mock the aws calls.
    async fn run_query_impl<T: AthenaManagerOps>(
        &self,
        query: &str,
        time_out: Option<i32>,
        results_include_header_row: Option<bool>,
        aws_operations: &T,
    ) -> Result<Value, RunQueryError> {
        let result = aws_operations.start_query_impl(self, query, None).await;
        if result.is_err() {
            let err = result.err().unwrap();
            return Err(self.convert_start_query_error_to_run_query_error(err, query));
        }

        let query_id = result.unwrap();

        let time_out = time_out.unwrap_or(60); //Default to 60 seconds if no timeout is specified.
        let start_time = Instant::now();
        let desired_duration = Duration::from_secs(time_out as u64);
        //Check our query status until results are ready or we hit our timeout.
        let query_result: Result<(), RunQueryError> = loop {
            let elapsed = start_time.elapsed();

            if elapsed >= desired_duration {
                break Err(RunQueryError::QueryTimedOut(GlyphxErrorData::new(
                    String::from("The query timed out."),
                    Some(
                        json!({"catalog": self.catalog, "database": self.database, "query": query, "query_id": query_id, "timeout": time_out}),
                    ),
                    None,
                )));
            }

            let result = aws_operations.get_query_status_impl(self, &query_id).await;
            if result.is_err() {
                let err = result.err().unwrap();
                break Err(
                    self.convert_get_query_status_error_to_run_query_error(err, query, &query_id)
                );
            }

            let query_status = result.unwrap();
            match query_status {
                AthenaQueryStatus::Succeeded => break Ok(()),
                AthenaQueryStatus::Failed(error) => {
                    break Err(RunQueryError::QueryFailed(GlyphxErrorData::new(
                        String::from("The query failed. See the inner error for more details."),
                        Some(
                            json!({"catalog": self.catalog, "database": self.database, "query": query, "query_id": query_id}),
                        ),
                        Some(json!({"AthenaError": error.error_message()})),
                    )))
                }
                AthenaQueryStatus::Cancelled => {
                    break Err(RunQueryError::QueryCancelled(GlyphxErrorData::new(
                        String::from("The query was cancelled."),
                        Some(
                            json!({"catalog": self.catalog, "database": self.database, "query": query, "query_id": query_id}),
                        ),
                        None,
                    )))
                }
                _ => {}
            }
        };

        if query_result.is_err() {
            return Err(query_result.err().unwrap());
        }

        let results = aws_operations
            .get_query_results_impl(self, &query_id, results_include_header_row)
            .await;
        if results.is_err() {
            let err = results.err().unwrap();
            return Err(
                self.convert_get_query_results_error_to_run_query_error(err, query, &query_id)
            );
        }

        let results = results.unwrap();
        Ok(results)
    }

    ///Our internal implementation of get_query_results. This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `query_id` - The id of the query to get the results for.
    ///* `page_size` - The number of results to return per page.  If None, the default page size(1000) will be used.
    ///* `aws_operations` - The AthenaManagerOps implementation to use to make or mock the aws calls.
    async fn get_paged_query_results_impl<T: AthenaManagerOps>(
        &self,
        query_id: &str,
        page_size: Option<i32>,
        aws_operations: &T,
    ) -> Result<
        impl Stream<Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>> + Unpin + Send,
        GetQueryPagerError,
    > {
        let status = aws_operations.get_query_status_impl(self, query_id).await;
        if status.is_err() {
            let err = status.err().unwrap();
            return Err(self.convert_get_query_status_error_to_get_query_pager_error(err, query_id));
        } else {
            let status = status.unwrap();
            let is_finished = match status {
                AthenaQueryStatus::Succeeded => Ok(()),
                AthenaQueryStatus::Failed(athena_error) => {
                    Err(GetQueryPagerError::QueryFailed(GlyphxErrorData::new(
                        String::from("The query failed. See the inner error for more details."),
                        Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id}),
                        ),
                        Some(json!({"AthenaError": athena_error.error_message()})),
                    )))
                }
                AthenaQueryStatus::Cancelled => {
                    Err(GetQueryPagerError::QueryCancelled(GlyphxErrorData::new(
                        String::from("The query was cancelled."),
                        Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id}),
                        ),
                        None,
                    )))
                }
                AthenaQueryStatus::Running => {
                    Err(GetQueryPagerError::QueryNotFinished(GlyphxErrorData::new(
                        String::from("The query is still running."),
                        Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id}),
                        ),
                        None,
                    )))
                }
                AthenaQueryStatus::Queued => {
                    Err(GetQueryPagerError::QueryNotFinished(GlyphxErrorData::new(
                        String::from("The query is still queued."),
                        Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id}),
                        ),
                        None,
                    )))
                }
                AthenaQueryStatus::Unknown => {
                    Err(GetQueryPagerError::QueryNotFinished(GlyphxErrorData::new(
                        String::from("The query is still running But I cannot get a status on it."),
                        Some(
                            json!({"catalog": self.catalog, "database": self.database, "query_id": query_id}),
                        ),
                        None,
                    )))
                }
            };

            if is_finished.is_err() {
                return Err(is_finished.err().unwrap());
            }

            Ok(aws_operations.get_query_results_paginator(&self.client, query_id, page_size))
        }
    }
    
    ///Our intenal implementation of our table_exists method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `table_name` - The name of the table to check for.
    ///* `aws_operations` - The AthenaManagerOps implementation to use to make or mock the aws calls.
    async fn table_exists_impl<T: AthenaManagerOps>(
        &self,
        table_name: &str,
        aws_operations: &T,
    ) -> Result<bool, RunQueryError> {
        let query = format!("SHOW TABLES '{}'", table_name);
        let results = aws_operations
            .run_query_impl(self, &query, Some(10), Some(false))
            .await;
        if results.is_err() {
            let err = results.err().unwrap();
            return Err(err);
        }
        let results = results.unwrap();
        Ok(results.as_array().unwrap().len() > 0)
    }

    ///Our intenal implementation of our view_exists method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `view_name` - The name of the view to check for.
    ///* `aws_operations` - The AthenaManagerOps implementation to use to make or mock the aws calls.
    async fn view_exists_impl<T: AthenaManagerOps>(
        &self,
        view_name: &str,
        aws_operations: &T,
    ) -> Result<bool, RunQueryError> {
        let query = format!("SHOW VIEWS LIKE '{}'", view_name);
        let results = aws_operations
            .run_query_impl(self, &query, Some(10), Some(false))
            .await;
        if results.is_err() {
            let err = results.err().unwrap();
            return Err(err);
        }
        let results = results.unwrap();
        Ok(results.as_array().unwrap().len() > 0)
    }

    ///Our intenal implementation of our drop_table method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `table_name` - The name of the table to drop.
    ///* `aws_operations` - The AthenaManagerOps implementation to use to make or mock the aws calls.
    async fn drop_table_impl<T: AthenaManagerOps>(
        &self,
        table_name: &str,
        aws_operations: &T,
    ) -> Result<(), RunQueryError> {
        let query = format!("DROP TABLE IF EXISTS `{}`", table_name);
        let results = aws_operations
            .run_query_impl(self, &query, Some(10), Some(false))
            .await;
        if results.is_err() {
            let err = results.err().unwrap();
            return Err(err);
        }
        Ok(())
    }

    ///Our intenal implementation of our drop_view method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `view_name` - The name of the view to drop.
    ///* `aws_operations` - The AthenaManagerOps implementation to use to make or mock the aws calls.
    async fn drop_view_impl<T: AthenaManagerOps>(
        &self,
        view_name: &str,
        aws_operations: &T,
    ) -> Result<(), RunQueryError> {
        let query = format!("DROP VIEW IF EXISTS \"{}\"", view_name);
        let results = aws_operations
            .run_query_impl(self, &query, Some(10), Some(false))
            .await;
        if results.is_err() {
            let err = results.err().unwrap();
            return Err(err);
        }
        Ok(())
    }
    ///Our intenal implementation of our get_table_description method.  This method will make the actual calls to aws
    ///when AthenaManagerOpsImpl is passed as the aws_operations parameter.  For unit tests, a mock
    ///of AthenaManagerOps can be passed in to simulate the aws calls.
    ///# Arguments
    ///* `table_name` - The name of the table to get the description for.
    ///* `aws_operations` - The AthenaManagerOps implementation to use to make or mock the aws calls.
    async fn get_table_description_impl<T: AthenaManagerOps>(
        &self,
        table_name: &str,
        aws_operations: &T,
    ) -> Result<Vec<ColumnDescription>, GetTableDescriptionError> {
        let query = format!("DESCRIBE `{}`", table_name);
        let results = aws_operations
            .run_query_impl(self, &query, Some(10), Some(false))
            .await;
        if results.is_err() {
            let err = self.convert_run_query_error_to_get_table_description_error(
                results.err().unwrap(),
                table_name,
            );
            return Err(err);
        }
        let results = results.unwrap();
        let mut columns: Vec<ColumnDescription> = vec![];
        for row in results.as_array().unwrap() {
            let row = row.as_object().unwrap();
            let full_name = row.get("col_name").unwrap().as_str().unwrap();
            let parts = full_name.split("\t").collect::<Vec<&str>>();
            let name = parts[0].trim();
            let column_type = match parts[1].trim() {
                s if s == "string" || s.starts_with("varchar(") => ColumnDataType::STRING,
                "bigint" => ColumnDataType::INTEGER,
                "double" => ColumnDataType::NUMBER,
                _ => ColumnDataType::UNKNOWN,
            };
            let column = ColumnDescription {
                name: name.to_string(),
                data_type: column_type,
            };
            columns.push(column);
        }
        Ok(columns)
    }
}

impl Default for AthenaManager {
    fn default() -> Self {
       let config = aws_config::SdkConfig::builder().build();
        let client = AthenaClient::new(&config);
        AthenaManager { client, database: "mock".to_string(), catalog: "mock".to_string()}
    }
}

#[cfg(test)]
pub mod constructor {
    use super::*;
    use aws_sdk_athena::types::error::{
        InternalServerException, InvalidRequestException, MetadataException,
    };
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;

    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());
    }

    #[tokio::test]
    async fn does_not_exist() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let meta = ErrorMetadata::builder()
                .message("an error has occurred")
                .code("500")
                .build();
            let metadata_exception = MetadataException::builder()
                .message("an error has occurred")
                .meta(meta)
                .build();
            let err = GetDatabaseError::MetadataException(metadata_exception);
            let inner = http::Response::builder()
                .status(200)
                .header("Content-Type", "application/json")
                .body(SdkBody::empty())
                .unwrap();
            Err(SdkError::service_error(err, inner))
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_err());
        let is_not_found = match res.err().unwrap() {
            ConstructorError::DatabaseDoesNotExist(_) => true,
            _ => false,
        };
        assert!(is_not_found);
    }

    #[tokio::test]
    async fn internal_server_error() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let meta = ErrorMetadata::builder()
                .message("an error has occurred")
                .code("500")
                .build();
            let internal_server_exception = InternalServerException::builder()
                .message("an error has occurred")
                .meta(meta)
                .build();
            let err = GetDatabaseError::InternalServerException(internal_server_exception);
            let inner = http::Response::builder()
                .status(200)
                .header("Content-Type", "application/json")
                .body(SdkBody::empty())
                .unwrap();
            Err(SdkError::service_error(err, inner))
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            ConstructorError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }

    #[tokio::test]
    async fn invalid_request_error() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let meta = ErrorMetadata::builder()
                .message("an error has occurred")
                .code("500")
                .build();
            let invalid_request_exception = InvalidRequestException::builder()
                .message("an error has occurred")
                .meta(meta)
                .build();
            let err = GetDatabaseError::InvalidRequestException(invalid_request_exception);
            let inner = http::Response::builder()
                .status(200)
                .header("Content-Type", "application/json")
                .body(SdkBody::empty())
                .unwrap();
            Err(SdkError::service_error(err, inner))
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            ConstructorError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }

    #[tokio::test]
    async fn unhandled_error() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let meta = ErrorMetadata::builder()
                .message("an error has occurred")
                .code("500")
                .build();
            let unhandled_exception = Unhandled::builder()
                .source("an error has occurred")
                .meta(meta)
                .build();
            let err = GetDatabaseError::Unhandled(unhandled_exception);
            let inner = http::Response::builder()
                .status(200)
                .header("Content-Type", "application/json")
                .body(SdkBody::empty())
                .unwrap();
            Err(SdkError::service_error(err, inner))
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            ConstructorError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
pub mod accessors {
    use super::*;

    #[tokio::test]
    async fn catalog() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());
        let athena_manager = res.unwrap();
        let saved_catalog = athena_manager.get_catalog();
        assert_eq!(saved_catalog, catalog);
    }

    #[tokio::test]
    async fn database() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());
        let athena_manager = res.unwrap();
        let saved_database = athena_manager.get_database();
        assert_eq!(saved_database, database);
    }
}

#[cfg(test)]
pub mod start_query {
    use super::*;
    use aws_sdk_athena::types::error::{
        InternalServerException, InvalidRequestException, TooManyRequestsException,
    };
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;

    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let query_id_clone = query_id;

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_execution()
            .times(1)
            .returning(move |_, _, _, _, _| {
                let output = StartQueryExecutionOutput::builder()
                    .query_execution_id(query_id_clone)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .start_query_impl("some query", None, &mocks)
            .await;
        assert!(res.is_ok());
        let query_id = res.unwrap();
        assert_eq!(query_id, query_id);
    }

    #[tokio::test]
    async fn database_does_not_exist() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_execution()
            .times(1)
            .returning(move |_, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let invalid_request_exception = InvalidRequestException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err =
                    StartQueryExecutionError::InvalidRequestException(invalid_request_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .start_query_impl("some query", None, &mocks)
            .await;
        assert!(res.is_err());
        let does_not_exist = match res.err().unwrap() {
            StartQueryError::DatabaseDoesNotExist(_) => true,
            _ => false,
        };
        assert!(does_not_exist);
    }

    #[tokio::test]
    async fn too_many_requests() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_execution()
            .times(1)
            .returning(move |_, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let too_many_request_exception = TooManyRequestsException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err =
                    StartQueryExecutionError::TooManyRequestsException(too_many_request_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .start_query_impl("some query", None, &mocks)
            .await;
        assert!(res.is_err());
        let is_throttled = match res.err().unwrap() {
            StartQueryError::RequestWasThrottled(_) => true,
            _ => false,
        };
        assert!(is_throttled);
    }

    #[tokio::test]
    async fn internal_server_exception() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_execution()
            .times(1)
            .returning(move |_, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let internal_server_exception = InternalServerException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err =
                    StartQueryExecutionError::InternalServerException(internal_server_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .start_query_impl("some query", None, &mocks)
            .await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            StartQueryError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }

    #[tokio::test]
    async fn unhandled_exception() {
        let catalog = "catalog";
        let database = "database";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_execution()
            .times(1)
            .returning(move |_, _, _, _, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let unhandled_exception = Unhandled::builder()
                    .source("an error has occurred")
                    .meta(meta)
                    .build();
                let err = StartQueryExecutionError::Unhandled(unhandled_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .start_query_impl("some query", None, &mocks)
            .await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            StartQueryError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
pub mod get_query_status {
    use super::*;
    use aws_sdk_athena::types::error::{InternalServerException, InvalidRequestException};
    use aws_sdk_athena::types::{AthenaError, QueryExecution, QueryExecutionStatus};
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;

    #[tokio::test]
    async fn is_queued() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(move |_, _| {
                let query_execution_status = QueryExecutionStatus::builder()
                    .state(QueryExecutionState::Queued)
                    .build();

                let query_execution = QueryExecution::builder()
                    .status(query_execution_status)
                    .build();

                let output = GetQueryExecutionOutput::builder()
                    .query_execution(query_execution)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_ok());
        let status = res.unwrap();
        let is_queued = match status {
            AthenaQueryStatus::Queued => true,
            _ => false,
        };
        assert!(is_queued);
    }

    #[tokio::test]
    async fn is_running() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(move |_, _| {
                let query_execution_status = QueryExecutionStatus::builder()
                    .state(QueryExecutionState::Running)
                    .build();

                let query_execution = QueryExecution::builder()
                    .status(query_execution_status)
                    .build();

                let output = GetQueryExecutionOutput::builder()
                    .query_execution(query_execution)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_ok());
        let status = res.unwrap();
        let is_running = match status {
            AthenaQueryStatus::Running => true,
            _ => false,
        };
        assert!(is_running);
    }

    #[tokio::test]
    async fn is_succeeded() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(move |_, _| {
                let query_execution_status = QueryExecutionStatus::builder()
                    .state(QueryExecutionState::Succeeded)
                    .build();

                let query_execution = QueryExecution::builder()
                    .status(query_execution_status)
                    .build();

                let output = GetQueryExecutionOutput::builder()
                    .query_execution(query_execution)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_ok());
        let status = res.unwrap();
        let is_succeeded = match status {
            AthenaQueryStatus::Succeeded => true,
            _ => false,
        };
        assert!(is_succeeded);
    }

    #[tokio::test]
    async fn is_failed() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(move |_, _| {
                let query_execution_status = QueryExecutionStatus::builder()
                    .state(QueryExecutionState::Failed)
                    .athena_error(
                        AthenaError::builder()
                            .error_message("Your query has failed")
                            .build(),
                    )
                    .build();

                let query_execution = QueryExecution::builder()
                    .status(query_execution_status)
                    .build();

                let output = GetQueryExecutionOutput::builder()
                    .query_execution(query_execution)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_ok());
        let status = res.unwrap();
        let is_failed = match status {
            AthenaQueryStatus::Failed(_) => true,
            _ => false,
        };
        assert!(is_failed);
    }

    #[tokio::test]
    async fn is_cancelled() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(move |_, _| {
                let query_execution_status = QueryExecutionStatus::builder()
                    .state(QueryExecutionState::Cancelled)
                    .build();

                let query_execution = QueryExecution::builder()
                    .status(query_execution_status)
                    .build();

                let output = GetQueryExecutionOutput::builder()
                    .query_execution(query_execution)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_ok());
        let status = res.unwrap();
        let is_cancelled = match status {
            AthenaQueryStatus::Cancelled => true,
            _ => false,
        };
        assert!(is_cancelled);
    }

    #[tokio::test]
    async fn query_does_not_exist() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(|_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let invalid_request_exception = InvalidRequestException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err =
                    GetQueryExecutionError::InvalidRequestException(invalid_request_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_query_does_not_exist = match err {
            GetQueryStatusError::QueryDoesNotExist(_) => true,
            _ => false,
        };
        assert!(is_query_does_not_exist);
    }

    #[tokio::test]
    async fn internal_server_exception() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(|_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let internal_server_exception = InternalServerException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err =
                    GetQueryExecutionError::InternalServerException(internal_server_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_unexpected = match err {
            GetQueryStatusError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }

    #[tokio::test]
    async fn unhandled() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_execution()
            .times(1)
            .returning(|_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let unhandled_exception = Unhandled::builder()
                    .source("an error has occurred")
                    .meta(meta)
                    .build();
                let err = GetQueryExecutionError::Unhandled(unhandled_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.get_query_status_impl(query_id, &mocks).await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_unexpected = match err {
            GetQueryStatusError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
pub mod get_query_results {
    use super::*;
    use aws_sdk_athena::types::error::{
        InternalServerException, InvalidRequestException, TooManyRequestsException,
    };
    use aws_sdk_athena::types::{
        ColumnInfo, ColumnNullable, Datum, ResultSet, ResultSetMetadata, Row,
    };
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;

    fn get_result_set_metadata() -> ResultSetMetadata {
        ResultSetMetadata::builder()
            .set_column_info(Some(vec![
                ColumnInfo::builder()
                    .name("col1".to_string())
                    .r#type("varchar".to_string())
                    .nullable(ColumnNullable::Nullable)
                    .build(),
                ColumnInfo::builder()
                    .name("col2".to_string())
                    .r#type("bigint".to_string())
                    .nullable(ColumnNullable::NotNull)
                    .build(),
            ]))
            .build()
    }

    fn get_result_set() -> ResultSet {
        let metadata = get_result_set_metadata();
        let mut result_set = ResultSet::builder().result_set_metadata(metadata);

        result_set = result_set.rows(
            Row::builder()
                .set_data(Some(vec![
                    Datum::builder()
                        .set_var_char_value(Some("abc".to_string()))
                        .build(),
                    Datum::builder()
                        .set_var_char_value(Some("123".to_string()))
                        .build(),
                ]))
                .build(),
        );

        result_set = result_set.rows(
            Row::builder()
                .set_data(Some(vec![
                    Datum::builder()
                        .set_var_char_value(Some("cba".to_string()))
                        .build(),
                    Datum::builder()
                        .set_var_char_value(Some("321".to_string()))
                        .build(),
                ]))
                .build(),
        );
        result_set.build()
    }
    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let output = GetQueryResultsOutput::builder()
                    .result_set(get_result_set())
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, None, &mocks)
            .await;
        assert!(res.is_ok());
        let result = res.unwrap();
        assert!(result.is_array());

        let result = result.as_array();
        assert!(result.is_some());

        let result = result.unwrap();
        assert_eq!(result.len(), 2);

        let row1 = &result[0];
        assert!(row1.is_object());
        let row1 = row1.as_object();
        assert!(row1.is_some());
        let row1 = row1.unwrap();
        assert_eq!(row1.len(), 2);
        assert_eq!(row1.get("col1").unwrap(), "abc");
        assert_eq!(row1.get("col2").unwrap(), 123);

        let row2 = &result[1];
        assert!(row2.is_object());
        let row2 = row2.as_object();
        assert!(row2.is_some());
        let row2 = row2.unwrap();
        assert_eq!(row2.len(), 2);
        assert_eq!(row2.get("col1").unwrap(), "cba");
        assert_eq!(row2.get("col2").unwrap(), 321);
    }

    #[tokio::test]
    async fn is_ok_with_header_row() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let output = GetQueryResultsOutput::builder()
                    .result_set(get_result_set())
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, Some(true), &mocks)
            .await;
        assert!(res.is_ok());
        let result = res.unwrap();
        assert!(result.is_array());

        let result = result.as_array();
        assert!(result.is_some());

        let result = result.unwrap();
        assert_eq!(result.len(), 1);

        let row = &result[0];
        assert!(row.is_object());
        let row = row.as_object();
        assert!(row.is_some());
        let row = row.unwrap();
        assert_eq!(row.len(), 2);
        assert_eq!(row.get("col1").unwrap(), "cba");
        assert_eq!(row.get("col2").unwrap(), 321);
    }

    #[tokio::test]
    async fn is_ok_with_no_result_set() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let output = GetQueryResultsOutput::builder().build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, Some(true), &mocks)
            .await;
        assert!(res.is_ok());
        let result = res.unwrap();
        assert!(result.is_array());

        let result = result.as_array();
        assert!(result.is_some());

        let result = result.unwrap();
        assert_eq!(result.len(), 0);
    }
    #[tokio::test]
    async fn is_ok_with_no_data() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let metadata = get_result_set_metadata();
                let result_set = ResultSet::builder().result_set_metadata(metadata).build();
                let output = GetQueryResultsOutput::builder()
                    .result_set(result_set)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, Some(true), &mocks)
            .await;
        assert!(res.is_ok());
        let result = res.unwrap();
        assert!(result.is_null());
    }

    #[tokio::test]
    async fn query_does_not_exist() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let invalid_request_exception = InvalidRequestException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err = GetQueryResultsError::InvalidRequestException(invalid_request_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, None, &mocks)
            .await;
        assert!(res.is_err());
        let does_not_exist = match res.err().unwrap() {
            GlyphxGetQueryResultsError::QueryDoesNotExist(_) => true,
            _ => false,
        };
        assert!(does_not_exist);
    }

    #[tokio::test]
    async fn too_many_requests() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let too_many_request_exception = TooManyRequestsException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err =
                    GetQueryResultsError::TooManyRequestsException(too_many_request_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, None, &mocks)
            .await;
        assert!(res.is_err());
        let is_throttled = match res.err().unwrap() {
            GlyphxGetQueryResultsError::RequestWasThrottled(_) => true,
            _ => false,
        };
        assert!(is_throttled);
    }

    #[tokio::test]
    async fn internal_server_exception() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let internal_server_exception = InternalServerException::builder()
                    .message("an error has occurred")
                    .meta(meta)
                    .build();
                let err = GetQueryResultsError::InternalServerException(internal_server_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, None, &mocks)
            .await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            GlyphxGetQueryResultsError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }

    #[tokio::test]
    async fn unhandled_exception() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_results()
            .times(1)
            .returning(move |_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let unhandled_exception = Unhandled::builder()
                    .source("an error has occurred")
                    .meta(meta)
                    .build();
                let err = GetQueryResultsError::Unhandled(unhandled_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, inner))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_results_impl(query_id, None, &mocks)
            .await;
        assert!(res.is_err());
        let is_unexpected = match res.err().unwrap() {
            GlyphxGetQueryResultsError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
mod convert_start_query_error_to_run_query_error {
    use super::*;

    #[tokio::test]
    async fn convert_database_does_not_exist_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = StartQueryError::DatabaseDoesNotExist(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager.convert_start_query_error_to_run_query_error(error, query);

        let (error, inner_error) = match &result {
            RunQueryError::DatabaseDoesNotExist(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("DatabaseDoesNotExist").is_some());
    }

    #[tokio::test]
    async fn convert_request_was_throttled_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = StartQueryError::RequestWasThrottled(GlyphxErrorData::new(
            String::from("The Request was Throttled."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager.convert_start_query_error_to_run_query_error(error, query);

        let (error, inner_error) = match &result {
            RunQueryError::RequestWasThrottled(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("RequestWasThrottled").is_some());
    }

    #[tokio::test]
    async fn convert_unexpected_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = StartQueryError::UnexpectedError(GlyphxErrorData::new(
            String::from("Something unexpected has happened."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager.convert_start_query_error_to_run_query_error(error, query);

        let (error, inner_error) = match &result {
            RunQueryError::UnexpectedError(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());
        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("UnexpectedError").is_some());
    }
}

#[cfg(test)]
mod convert_get_query_status_error_to_run_query_error {
    use super::*;

    #[tokio::test]
    async fn convert_query_does_not_exist_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = GetQueryStatusError::QueryDoesNotExist(GlyphxErrorData::new(
            String::from("The query does not exist."),
            Some(
                json!({"catalog": catalog, "database": database, query: "query", "query_id": query_id }),
            ),
            None,
        ));

        let result = athena_manager
            .convert_get_query_status_error_to_run_query_error(error, query, query_id);

        let (error, inner_error) = match &result {
            RunQueryError::QueryDoesNotExist(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("QueryDoesNotExist").is_some());
    }

    #[tokio::test]
    async fn convert_unexpected_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = GetQueryStatusError::UnexpectedError(GlyphxErrorData::new(
            String::from("Something unexpected has happened."),
            Some(
                json!({"catalog": catalog, "database": database, query: "query", "query_id": query_id }),
            ),
            None,
        ));

        let result = athena_manager
            .convert_get_query_status_error_to_run_query_error(error, query, query_id);

        let (error, inner_error) = match &result {
            RunQueryError::UnexpectedError(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());
        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("UnexpectedError").is_some());
    }
}

#[cfg(test)]
mod convert_get_query_results_error_to_run_query_error {
    use super::*;

    #[tokio::test]
    async fn convert_query_does_not_exist_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = GlyphxGetQueryResultsError::QueryDoesNotExist(GlyphxErrorData::new(
            String::from("The query does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_get_query_results_error_to_run_query_error(error, query, query_id);

        let (error, inner_error) = match &result {
            RunQueryError::QueryDoesNotExist(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("QueryDoesNotExist").is_some());
    }

    #[tokio::test]
    async fn convert_request_was_throttled_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = GlyphxGetQueryResultsError::RequestWasThrottled(GlyphxErrorData::new(
            String::from("The Request was Throttled."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_get_query_results_error_to_run_query_error(error, query, query_id);

        let (error, inner_error) = match &result {
            RunQueryError::RequestWasThrottled(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("RequestWasThrottled").is_some());
    }

    #[tokio::test]
    async fn convert_unexpected_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = GlyphxGetQueryResultsError::UnexpectedError(GlyphxErrorData::new(
            String::from("Something unexpected has happened."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_get_query_results_error_to_run_query_error(error, query, query_id);

        let (error, inner_error) = match &result {
            RunQueryError::UnexpectedError(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());
        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("UnexpectedError").is_some());
    }
}

#[cfg(test)]
mod run_query {
    use super::*;

    use aws_sdk_athena::types::{
        AthenaError, ColumnInfo, ColumnNullable, Datum, ResultSet, ResultSetMetadata, Row,
    };
    fn get_result_set_metadata() -> ResultSetMetadata {
        ResultSetMetadata::builder()
            .set_column_info(Some(vec![
                ColumnInfo::builder()
                    .name("col1".to_string())
                    .r#type("varchar".to_string())
                    .nullable(ColumnNullable::Nullable)
                    .build(),
                ColumnInfo::builder()
                    .name("col2".to_string())
                    .r#type("bigint".to_string())
                    .nullable(ColumnNullable::NotNull)
                    .build(),
            ]))
            .build()
    }

    fn get_result_set() -> ResultSet {
        let metadata = get_result_set_metadata();
        let mut result_set = ResultSet::builder().result_set_metadata(metadata);

        result_set = result_set.rows(
            Row::builder()
                .set_data(Some(vec![
                    Datum::builder()
                        .set_var_char_value(Some("abc".to_string()))
                        .build(),
                    Datum::builder()
                        .set_var_char_value(Some("123".to_string()))
                        .build(),
                ]))
                .build(),
        );

        result_set = result_set.rows(
            Row::builder()
                .set_data(Some(vec![
                    Datum::builder()
                        .set_var_char_value(Some("cba".to_string()))
                        .build(),
                    Datum::builder()
                        .set_var_char_value(Some("321".to_string()))
                        .build(),
                ]))
                .build(),
        );
        result_set.build()
    }

    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let query_id_clone = query_id.to_string();
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| Ok(query_id_clone.clone()));

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Succeeded;
                Ok(output)
            });

        mocks
            .expect_get_query_results_impl()
            .times(1)
            .returning(|_, _, _| {
                let output = get_result_set();

                Ok(convert_to_json(&output, None))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, None, None, &mocks)
            .await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.is_array());

        let result = result.as_array().unwrap();
        assert_eq!(result.len(), 2);
    }

    #[tokio::test]
    async fn is_ok_will_loop() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let query_id_clone = query_id.to_string();
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| Ok(query_id_clone.clone()));

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Running;
                Ok(output)
            });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Succeeded;
                Ok(output)
            });

        mocks
            .expect_get_query_results_impl()
            .times(1)
            .returning(|_, _, _| {
                let output = get_result_set();

                Ok(convert_to_json(&output, None))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, None, None, &mocks)
            .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn will_loop_time_out() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let query_id_clone = query_id.to_string();
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| Ok(query_id_clone.clone()));

        mocks.expect_get_query_status_impl().returning(|_, _| {
            let output = AthenaQueryStatus::Running;
            Ok(output)
        });

        mocks
            .expect_get_query_results_impl()
            .times(0)
            .returning(|_, _, _| {
                let output = get_result_set();

                Ok(convert_to_json(&output, None))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, Some(1), None, &mocks)
            .await;

        assert!(result.is_err());

        let err = result.unwrap_err();
        let is_timeout = match err {
            RunQueryError::QueryTimedOut(_) => true,
            _ => false,
        };

        assert!(is_timeout);
    }

    #[tokio::test]
    async fn start_query_will_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| {
                Err(StartQueryError::UnexpectedError(GlyphxErrorData::new(
                    String::from("An Unexpected Error has Occurred"),
                    None,
                    None,
                )))
            });

        mocks
            .expect_get_query_status_impl()
            .times(0)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Running;
                Ok(output)
            });

        mocks
            .expect_get_query_results_impl()
            .times(0)
            .returning(|_, _, _| {
                let output = get_result_set();

                Ok(convert_to_json(&output, None))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, Some(1), None, &mocks)
            .await;

        assert!(result.is_err());

        let err = result.unwrap_err();
        let is_unexpected = match err {
            RunQueryError::UnexpectedError(_) => true,
            _ => false,
        };

        assert!(is_unexpected);
    }

    #[tokio::test]
    async fn get_query_status_will_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let query_id_clone = query_id.to_string();
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| Ok(query_id_clone.clone()));

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = GetQueryStatusError::UnexpectedError(GlyphxErrorData::new(
                    String::from("An Unexpected Error has Occurred"),
                    None,
                    None,
                ));
                Err(output)
            });

        mocks
            .expect_get_query_results_impl()
            .times(0)
            .returning(|_, _, _| {
                let output = get_result_set();

                Ok(convert_to_json(&output, None))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, None, None, &mocks)
            .await;

        assert!(result.is_err());

        let err = result.unwrap_err();
        let is_unexpected = match err {
            RunQueryError::UnexpectedError(_) => true,
            _ => false,
        };

        assert!(is_unexpected);
    }

    #[tokio::test]
    async fn get_query_status_failed() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let query_id_clone = query_id.to_string();
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| Ok(query_id_clone.clone()));

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Failed(
                    AthenaError::builder()
                        .error_message("Your query has failed")
                        .build(),
                );

                Ok(output)
            });

        mocks
            .expect_get_query_results_impl()
            .times(0)
            .returning(|_, _, _| {
                let output = get_result_set();

                Ok(convert_to_json(&output, None))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, None, None, &mocks)
            .await;

        assert!(result.is_err());

        let err = result.unwrap_err();
        let is_failed = match err {
            RunQueryError::QueryFailed(_) => true,
            _ => false,
        };

        assert!(is_failed);
    }

    #[tokio::test]
    async fn get_query_status_canceled() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let query_id_clone = query_id.to_string();
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| Ok(query_id_clone.clone()));

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Cancelled;

                Ok(output)
            });

        mocks
            .expect_get_query_results_impl()
            .times(0)
            .returning(|_, _, _| {
                let output = get_result_set();

                Ok(convert_to_json(&output, None))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, None, None, &mocks)
            .await;

        assert!(result.is_err());

        let err = result.unwrap_err();
        let is_cancelled = match err {
            RunQueryError::QueryCancelled(_) => true,
            _ => false,
        };

        assert!(is_cancelled);
    }

    #[tokio::test]
    async fn get_results_failed() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let query_id_clone = query_id.to_string();
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_start_query_impl()
            .times(1)
            .returning(move |_, _, _| Ok(query_id_clone.clone()));

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Succeeded;
                Ok(output)
            });

        mocks
            .expect_get_query_results_impl()
            .times(1)
            .returning(|_, _, _| {
                let output = GlyphxGetQueryResultsError::UnexpectedError(GlyphxErrorData::new(
                    String::from("An Unexpected Error has Occurred"),
                    None,
                    None,
                ));

                Err(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .run_query_impl(query, None, None, &mocks)
            .await;

        assert!(result.is_err());
        let err = result.unwrap_err();
        let is_unexpected = match err {
            RunQueryError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
mod convert_get_query_status_error_to_get_query_pager_error {
    use super::*;

    #[tokio::test]
    async fn convert_query_does_not_exist_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = GetQueryStatusError::QueryDoesNotExist(GlyphxErrorData::new(
            String::from("The query does not exist."),
            Some(
                json!({"catalog": catalog, "database": database, query: "query", "query_id": query_id }),
            ),
            None,
        ));

        let result =
            athena_manager.convert_get_query_status_error_to_get_query_pager_error(error, query_id);

        let (error, inner_error) = match &result {
            GetQueryPagerError::QueryDoesNotExist(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("QueryDoesNotExist").is_some());
    }

    #[tokio::test]
    async fn convert_unexpected_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = GetQueryStatusError::UnexpectedError(GlyphxErrorData::new(
            String::from("Something unexpected has happened."),
            Some(
                json!({"catalog": catalog, "database": database, query: "query", "query_id": query_id }),
            ),
            None,
        ));

        let result =
            athena_manager.convert_get_query_status_error_to_get_query_pager_error(error, query_id);

        let (error, inner_error) = match &result {
            GetQueryPagerError::UnexpectedError(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());
        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("UnexpectedError").is_some());
    }
}
#[cfg(test)]
pub mod get_paged_query_results {
    use super::*;
    use aws_sdk_athena::types::AthenaError;

    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Succeeded;
                Ok(output)
            });

        mocks
            .expect_get_query_results_paginator()
            .times(1)
            .returning(|client, query_id, page_size| {
                //Currently this function wraps the call to get query
                //results into the pager without calling out to AWS.
                //So, there is no harm in just returing the actual
                //call here.  If this changes we will have to go to the
                //trouble of mocking the paginator.
                AthenaManagerOpsImpl.get_query_results_paginator(client, query_id, page_size)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager
            .get_paged_query_results_impl(query_id, None, &mocks)
            .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn query_failed() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let athena_error = AthenaError::builder()
                    .error_message("An Unexpected Error has Occurred")
                    .build();
                let output = AthenaQueryStatus::Failed(athena_error);
                Ok(output)
            });

        mocks
            .expect_get_query_results_paginator()
            .times(0)
            .returning(|client, query_id, page_size| {
                //Currently this function wraps the call to get query
                //results into the pager without calling out to AWS.
                //So, there is no harm in just returing the actual
                //call here.  If this changes we will have to go to the
                //trouble of mocking the paginator.
                AthenaManagerOpsImpl.get_query_results_paginator(client, query_id, page_size)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager
            .get_paged_query_results_impl(query_id, None, &mocks)
            .await;

        assert!(result.is_err());
        let is_failed = match result.err().unwrap() {
            GetQueryPagerError::QueryFailed(_) => true,
            _ => false,
        };
        assert!(is_failed);
    }

    #[tokio::test]
    async fn query_cancelled() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Cancelled;
                Ok(output)
            });

        mocks
            .expect_get_query_results_paginator()
            .times(0)
            .returning(|client, query_id, page_size| {
                //Currently this function wraps the call to get query
                //results into the pager without calling out to AWS.
                //So, there is no harm in just returing the actual
                //call here.  If this changes we will have to go to the
                //trouble of mocking the paginator.
                AthenaManagerOpsImpl.get_query_results_paginator(client, query_id, page_size)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager
            .get_paged_query_results_impl(query_id, None, &mocks)
            .await;

        assert!(result.is_err());
        let is_cancelled = match result.err().unwrap() {
            GetQueryPagerError::QueryCancelled(_) => true,
            _ => false,
        };
        assert!(is_cancelled);
    }

    #[tokio::test]
    async fn query_running() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Running;
                Ok(output)
            });

        mocks
            .expect_get_query_results_paginator()
            .times(0)
            .returning(|client, query_id, page_size| {
                //Currently this function wraps the call to get query
                //results into the pager without calling out to AWS.
                //So, there is no harm in just returing the actual
                //call here.  If this changes we will have to go to the
                //trouble of mocking the paginator.
                AthenaManagerOpsImpl.get_query_results_paginator(client, query_id, page_size)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager
            .get_paged_query_results_impl(query_id, None, &mocks)
            .await;

        assert!(result.is_err());
        let is_not_finished = match result.err().unwrap() {
            GetQueryPagerError::QueryNotFinished(_) => true,
            _ => false,
        };
        assert!(is_not_finished);
    }

    #[tokio::test]
    async fn query_queued() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Queued;
                Ok(output)
            });

        mocks
            .expect_get_query_results_paginator()
            .times(0)
            .returning(|client, query_id, page_size| {
                //Currently this function wraps the call to get query
                //results into the pager without calling out to AWS.
                //So, there is no harm in just returing the actual
                //call here.  If this changes we will have to go to the
                //trouble of mocking the paginator.
                AthenaManagerOpsImpl.get_query_results_paginator(client, query_id, page_size)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager
            .get_paged_query_results_impl(query_id, None, &mocks)
            .await;

        assert!(result.is_err());
        let is_not_finished = match result.err().unwrap() {
            GetQueryPagerError::QueryNotFinished(_) => true,
            _ => false,
        };
        assert!(is_not_finished);
    }

    #[tokio::test]
    async fn query_status_unknown() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = AthenaQueryStatus::Unknown;
                Ok(output)
            });

        mocks
            .expect_get_query_results_paginator()
            .times(0)
            .returning(|client, query_id, page_size| {
                //Currently this function wraps the call to get query
                //results into the pager without calling out to AWS.
                //So, there is no harm in just returing the actual
                //call here.  If this changes we will have to go to the
                //trouble of mocking the paginator.
                AthenaManagerOpsImpl.get_query_results_paginator(client, query_id, page_size)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager
            .get_paged_query_results_impl(query_id, None, &mocks)
            .await;

        assert!(result.is_err());
        let is_not_finished = match result.err().unwrap() {
            GetQueryPagerError::QueryNotFinished(_) => true,
            _ => false,
        };
        assert!(is_not_finished);
    }

    #[tokio::test]
    async fn query_status_returns_an_error() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_get_query_status_impl()
            .times(1)
            .returning(|_, _| {
                let output = GetQueryStatusError::UnexpectedError(GlyphxErrorData::new(
                    String::from("An Error has Occurred"),
                    None,
                    None,
                ));
                Err(output)
            });

        mocks
            .expect_get_query_results_paginator()
            .times(0)
            .returning(|client, query_id, page_size| {
                //Currently this function wraps the call to get query
                //results into the pager without calling out to AWS.
                //So, there is no harm in just returing the actual
                //call here.  If this changes we will have to go to the
                //trouble of mocking the paginator.
                AthenaManagerOpsImpl.get_query_results_paginator(client, query_id, page_size)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager
            .get_paged_query_results_impl(query_id, None, &mocks)
            .await;

        assert!(result.is_err());
        let is_unexpected = match result.err().unwrap() {
            GetQueryPagerError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
mod table_exists {
    use super::*;

    #[tokio::test]
    async fn table_exists() {
        let catalog = "catalog";
        let database = "database";
        let table = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let output = json!([1]);
                Ok(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.table_exists_impl(table, &mocks).await;
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[tokio::test]
    async fn table_does_not_exist() {
        let catalog = "catalog";
        let database = "database";
        let table = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let output = json!([]);
                Ok(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.table_exists_impl(table, &mocks).await;
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[tokio::test]
    async fn query_is_error() {
        let catalog = "catalog";
        let database = "database";
        let table = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let glypx_error_data =
                    GlyphxErrorData::new(String::from("An Error has Occurred"), None, None);
                let output = RunQueryError::UnexpectedError(glypx_error_data);
                Err(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.table_exists_impl(table, &mocks).await;
        assert!(result.is_err());
        let is_unexpected = match result.err().unwrap() {
            RunQueryError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
mod view_exists {
    use super::*;

    #[tokio::test]
    async fn view_exists() {
        let catalog = "catalog";
        let database = "database";
        let view = "view";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let output = json!([1]);
                Ok(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.view_exists_impl(view, &mocks).await;
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[tokio::test]
    async fn view_does_not_exist() {
        let catalog = "catalog";
        let database = "database";
        let view = "view";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let output = json!([]);
                Ok(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.view_exists_impl(view, &mocks).await;
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[tokio::test]
    async fn query_is_error() {
        let catalog = "catalog";
        let database = "database";
        let view = "view";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let glypx_error_data =
                    GlyphxErrorData::new(String::from("An Error has Occurred"), None, None);
                let output = RunQueryError::UnexpectedError(glypx_error_data);
                Err(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.view_exists_impl(view, &mocks).await;
        assert!(result.is_err());
        let is_unexpected = match result.err().unwrap() {
            RunQueryError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
mod drop_table {
    use super::*;

    #[tokio::test]
    async fn drop_table() {
        let catalog = "catalog";
        let database = "database";
        let table = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let output = json!([1]);
                Ok(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.drop_table_impl(table, &mocks).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn query_is_error() {
        let catalog = "catalog";
        let database = "database";
        let table = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let glypx_error_data =
                    GlyphxErrorData::new(String::from("An Error has Occurred"), None, None);
                let output = RunQueryError::UnexpectedError(glypx_error_data);
                Err(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.drop_table_impl(table, &mocks).await;
        assert!(result.is_err());
        let is_unexpected = match result.err().unwrap() {
            RunQueryError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}
#[cfg(test)]
mod drop_view {
    use super::*;

    #[tokio::test]
    async fn drop_view() {
        let catalog = "catalog";
        let database = "database";
        let view = "view";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let output = json!([1]);
                Ok(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.drop_view_impl(view, &mocks).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn query_is_error() {
        let catalog = "catalog";
        let database = "database";
        let view = "view";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let glypx_error_data =
                    GlyphxErrorData::new(String::from("An Error has Occurred"), None, None);
                let output = RunQueryError::UnexpectedError(glypx_error_data);
                Err(output)
            });

        let athena_manager = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(athena_manager.is_ok());
        let athena_manager = athena_manager.unwrap();

        let result = athena_manager.drop_view_impl(view, &mocks).await;
        assert!(result.is_err());
        let is_unexpected = match result.err().unwrap() {
            RunQueryError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}

#[cfg(test)]
mod convert_run_query_error_to_get_table_description_error {
    use super::*;

    #[tokio::test]
    async fn convert_database_does_not_exist_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = RunQueryError::DatabaseDoesNotExist(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_run_query_error_to_get_table_description_error(error, table_name);

        let (error, inner_error) = match &result {
            GetTableDescriptionError::DatabaseDoesNotExist(e) => {
                (Some(e).clone(), e.inner_error.clone())
            }
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("DatabaseDoesNotExist").is_some());
    }

    #[tokio::test]
    async fn convert_quey_does_not_exist_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = RunQueryError::QueryDoesNotExist(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_run_query_error_to_get_table_description_error(error, table_name);

        let (error, inner_error) = match &result {
            GetTableDescriptionError::QueryDoesNotExist(e) => {
                (Some(e).clone(), e.inner_error.clone())
            }
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("QueryDoesNotExist").is_some());
    }

    #[tokio::test]
    async fn convert_request_was_throttled_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = RunQueryError::RequestWasThrottled(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_run_query_error_to_get_table_description_error(error, table_name);

        let (error, inner_error) = match &result {
            GetTableDescriptionError::RequestWasThrottled(e) => {
                (Some(e).clone(), e.inner_error.clone())
            }
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("RequestWasThrottled").is_some());
    }

    #[tokio::test]
    async fn convert_unexpected_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = RunQueryError::UnexpectedError(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_run_query_error_to_get_table_description_error(error, table_name);

        let (error, inner_error) = match &result {
            GetTableDescriptionError::UnexpectedError(e) => {
                (Some(e).clone(), e.inner_error.clone())
            }
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("UnexpectedError").is_some());
    }

    #[tokio::test]
    async fn convert_query_timed_out_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = RunQueryError::QueryTimedOut(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_run_query_error_to_get_table_description_error(error, table_name);

        let (error, inner_error) = match &result {
            GetTableDescriptionError::QueryTimedOut(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("QueryTimedOut").is_some());
    }

    #[tokio::test]
    async fn convert_query_failed_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = RunQueryError::QueryFailed(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_run_query_error_to_get_table_description_error(error, table_name);

        let (error, inner_error) = match &result {
            GetTableDescriptionError::QueryFailed(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("QueryFailed").is_some());
    }

    #[tokio::test]
    async fn convert_query_cancelled_error() {
        let catalog = "catalog";
        let database = "database";
        let query = "SELECT * FROM table";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let error = RunQueryError::QueryCancelled(GlyphxErrorData::new(
            String::from("The database does not exist."),
            Some(json!({"catalog": catalog, "database": database, query: "query" })),
            None,
        ));

        let result = athena_manager
            .convert_run_query_error_to_get_table_description_error(error, table_name);

        let (error, inner_error) = match &result {
            GetTableDescriptionError::QueryCancelled(e) => (Some(e).clone(), e.inner_error.clone()),
            _ => (None, None),
        };

        assert!(inner_error.is_some());
        assert!(error.is_some());

        let inner_error = inner_error.unwrap();
        assert!(inner_error.get("QueryCancelled").is_some());
    }
}

#[cfg(test)]
mod get_table_description {
    use super::*;

    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(|_, _, _, _| {
                let output = json!([
                    { "col_name" : "col1\tvarchar(50)"},
                    { "col_name" :"col2\tstring"},
                    { "col_name" :"col3\tbigint"},
                    { "col_name" :"col4\tdouble"},
                    { "col_name" :"col5\tboolean"}
                ]);
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .get_table_description_impl(table_name, &mocks)
            .await;
        assert!(result.is_ok());
        let result = result.unwrap();

        assert_eq!(result.len(), 5);
        assert_eq!(result[0].name, "col1");
        let is_string = match &result[0].data_type {
            ColumnDataType::STRING => true,
            _ => false,
        };
        assert!(is_string);

        assert_eq!(result[1].name, "col2");
        let is_string = match &result[1].data_type {
            ColumnDataType::STRING => true,
            _ => false,
        };
        assert!(is_string);

        assert_eq!(result[2].name, "col3");
        let is_integer = match &result[2].data_type {
            ColumnDataType::INTEGER => true,
            _ => false,
        };
        assert!(is_integer);

        assert_eq!(result[3].name, "col4");
        let is_number = match &result[3].data_type {
            ColumnDataType::NUMBER => true,
            _ => false,
        };
        assert!(is_number);

        assert_eq!(result[4].name, "col5");
        let is_unknown = match &result[4].data_type {
            ColumnDataType::UNKNOWN => true,
            _ => false,
        };
        assert!(is_unknown);
    }

    #[tokio::test]
    async fn is_err() {
        let catalog = "catalog";
        let database = "database";
        let table_name = "table";

        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database().times(1).returning(|_, _, _| {
            let output = GetDatabaseOutput::builder().build();
            Ok(output)
        });

        mocks
            .expect_run_query_impl()
            .times(1)
            .returning(move |_, _, _, _| {
                let glyphx_data = GlyphxErrorData::new(
                    String::from("The database does not exist."),
                    Some(json!({"catalog": catalog, "database": database, "table_name": table_name })),
                    None,
                );
                let output = RunQueryError::DatabaseDoesNotExist(glyphx_data);
                Err(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();

        let result = athena_manager
            .get_table_description_impl(table_name, &mocks)
            .await;
        assert!(result.is_err());

        let database_does_exist = match result.err().unwrap() {
            GetTableDescriptionError::DatabaseDoesNotExist(_) => true,
            _ => false,
        };

        assert!(database_does_exist);
    }
}
