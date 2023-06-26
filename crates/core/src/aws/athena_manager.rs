use aws_sdk_athena::types::{QueryExecutionContext, ResultConfiguration};
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

use async_recursion::async_recursion;
use async_trait::async_trait;
use glyphx_types::aws::athena_manager::athena_manager_errors::*;
use glyphx_types::error::GlyphxErrorData;

use serde_json::json;

use mockall::*;

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
}

#[derive(Debug, Clone)]
struct AthenaManagerOpsImpl;



    fn get_context(catalog: &str, database: &str) -> QueryExecutionContext {
        QueryExecutionContext::builder()
            .catalog(catalog)
            .database(database)
            .build()
    }
#[async_trait]
impl AthenaManagerOps for AthenaManagerOpsImpl {
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

    async fn start_query_execution(
        &self,
        client: &AthenaClient,
        catalog: &str,
        database: &str,
        query: &str,
        output_location: Option<String>,
    ) -> Result<StartQueryExecutionOutput, SdkError<StartQueryExecutionError>> {
        let context = get_context(catalog, database);
        let mut op = client
            .start_query_execution()
            .query_execution_context(context)
            .query_string(query);
        if output_location.is_some()  {
            let result_configuration = ResultConfiguration::builder()
                .output_location(output_location.unwrap())
                .build();
            op = op.result_configuration(result_configuration);
        }
        op .send()
            .await
    }

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
}

pub struct AthenaManager {
    catalog: String,
    database: String,
    client: AthenaClient,
}

impl AthenaManager {
    pub  async fn new(catalog: &str, database: &str) -> Result<AthenaManager, ConstructorError>{
      AthenaManager::new_impl(catalog, database, &AthenaManagerOpsImpl).await
    }

    pub fn get_database(&self) -> &str {
        &self.database
    }

    pub fn get_catalog(&self) -> &str {
        &self.catalog
    }

    pub async fn start_query(&self, query: &str, output_location: Option<&str>) -> Result<String, StartQueryError> {
        self.start_query_impl(query, output_location, &AthenaManagerOpsImpl).await 
    }

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

    async fn start_query_impl<T: AthenaManagerOps>(&self, query: &str, output_location : Option<&str>, aws_operations: &T ) -> Result<String, StartQueryError> {
        //We need to force this into a String because using traits 
        //with our dependency injection scheme causes some lifetime
        //issues.  This clears that up without a bunch of extra 
        //complexity.
        let output_location = match output_location {
            Some(loc) => Some(loc.to_string()),
            None => None,
        };
        let res = aws_operations.start_query_execution(&self.client, &self.catalog, &self.database, query, output_location).await;

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
                 },
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
                 } ,
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
                 },
                 StartQueryExecutionError::Unhandled(e) =>{
                    return Err(StartQueryError::UnexpectedError(GlyphxErrorData::new(
                        e.to_string(),
                        Some(json!({
                            "catalog": self.catalog,
                            "database": self.database,
                            "query": query,
                        })),
                        None,
                    )));
                 },
                 _ =>{
                    return Err(StartQueryError::UnexpectedError(GlyphxErrorData::new(
                        "An unknown error has occurred.  Unfortunatly I have no more information to share".to_string(),
                        Some(json!({
                            "catalog": self.catalog,
                            "database": self.database,
                            "query": query,
                        })),
                        None,
                    )));
                 },
            }
        } else {
            let output = res.unwrap();
            Ok(output.query_execution_id.unwrap())
        }
    }
}

#[cfg(test)]
pub mod constructor {
    use super::*;
    use aws_sdk_athena::types::error::{MetadataException, InternalServerException, InvalidRequestException};
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;

    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";
         
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
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
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
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
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
                let output = GetDatabaseOutput::builder().build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());
        let athena_manager = res.unwrap();
        let saved_database = athena_manager.get_database();
        assert_eq!(saved_database,database);
    }
}

#[cfg(test)]
pub mod start_query {
    use super::*;
    use aws_sdk_athena::types::error::{MetadataException, InternalServerException, InvalidRequestException};
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
    use aws_smithy_types::error::metadata::ErrorMetadata;
    use aws_smithy_types::error::Unhandled;

    #[tokio::test]
    async fn is_ok() {
        let catalog = "catalog";
        let database = "database";
        let query_id = "query_id";

        let query_id_clone = query_id.clone();
         
        let mut mocks = MockAthenaManagerOps::new();
        mocks.expect_get_database()
            .times(1)
            .returning(|_, _, _| {
                let output = GetDatabaseOutput::builder().build();
                Ok(output)
            });

        mocks.expect_start_query_execution()
            .times(1)
            .returning(move |_, _, _,_,_| {
                let output = StartQueryExecutionOutput::builder()
                    .query_execution_id(query_id_clone)
                    .build();
                Ok(output)
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager.start_query_impl("some query", None, &mocks).await;
        assert!(res.is_ok());
        let query_id = res.unwrap();
        assert_eq!(query_id, query_id);
    }
}
