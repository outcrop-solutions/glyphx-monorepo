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

use async_recursion::async_recursion;
use async_trait::async_trait;
use glyphx_types::aws::athena_manager::athena_manager_errors::*;
use glyphx_types::aws::athena_manager::query_status::AthenaQueryStatus;
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
        if output_location.is_some() {
            let result_configuration = ResultConfiguration::builder()
                .output_location(output_location.unwrap())
                .build();
            op = op.result_configuration(result_configuration);
        }
        op.send().await
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
    pub async fn new(catalog: &str, database: &str) -> Result<AthenaManager, ConstructorError> {
        AthenaManager::new_impl(catalog, database, &AthenaManagerOpsImpl).await
    }

    pub fn get_database(&self) -> &str {
        &self.database
    }

    pub fn get_catalog(&self) -> &str {
        &self.catalog
    }

    pub async fn start_query(
        &self,
        query: &str,
        output_location: Option<&str>,
    ) -> Result<String, StartQueryError> {
        self.start_query_impl(query, output_location, &AthenaManagerOpsImpl)
            .await
    }

    pub async fn get_query_status(&self, query_id: &str) -> Result<AthenaQueryStatus, GetQueryStatusError> {
        self.get_query_status_impl(query_id, &AthenaManagerOpsImpl)
            .await
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

    async fn start_query_impl<T: AthenaManagerOps>(
        &self,
        query: &str,
        output_location: Option<&str>,
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
            let state = status.state.unwrap();
            let state = match state {
                QueryExecutionState::Queued => AthenaQueryStatus::Queued,
                QueryExecutionState::Running => AthenaQueryStatus::Running,
                QueryExecutionState::Succeeded => AthenaQueryStatus::Succeeded,
                QueryExecutionState::Failed => AthenaQueryStatus::Failed,
                QueryExecutionState::Cancelled => AthenaQueryStatus::Cancelled,
                _ => AthenaQueryStatus::Unknown,
            };
            Ok(state)
        }
    }
}

#[cfg(test)]
pub mod constructor {
    use super::*;
    use aws_sdk_athena::types::error::{
        InternalServerException, InvalidRequestException, MetadataException,
    };
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
                Err(SdkError::service_error(err, Response::new(inner)))
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
    use aws_sdk_athena::types::{QueryExecution, QueryExecutionStatus};
    use aws_sdk_athena::types::error::{
        InternalServerException, InvalidRequestException, TooManyRequestsException,
    };
    use aws_smithy_http::body::SdkBody;
    use aws_smithy_http::operation::Response;
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
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
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
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
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
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
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
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
        assert!(res.is_ok());
        let status = res.unwrap();
        let is_failed = match status {
            AthenaQueryStatus::Failed => true,
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
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
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
            .returning( |_, _| {
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
                Err(SdkError::service_error(err, Response::new(inner)))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
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
            .returning( |_, _| {
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
                Err(SdkError::service_error(err, Response::new(inner)))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
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
            .returning( |_, _| {
                let meta = ErrorMetadata::builder()
                    .message("an error has occurred")
                    .code("500")
                    .build();
                let unhandled_exception = Unhandled::builder()
                    .source("an error has occurred")
                    .meta(meta)
                    .build();
                let err =
                    GetQueryExecutionError::Unhandled(unhandled_exception);
                let inner = http::Response::builder()
                    .status(200)
                    .header("Content-Type", "application/json")
                    .body(SdkBody::empty())
                    .unwrap();
                Err(SdkError::service_error(err, Response::new(inner)))
            });

        let res = AthenaManager::new_impl(catalog, database, &mocks).await;
        assert!(res.is_ok());

        let athena_manager = res.unwrap();
        let res = athena_manager
            .get_query_status_impl(query_id, &mocks)
            .await;
        assert!(res.is_err());
        let err = res.err().unwrap();
        let is_unexpected = match err {
            GetQueryStatusError::UnexpectedError(_) => true,
            _ => false,
        };
        assert!(is_unexpected);
    }
}
