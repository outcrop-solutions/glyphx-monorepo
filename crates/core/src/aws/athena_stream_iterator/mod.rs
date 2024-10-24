pub mod test_objects;
pub use aws_sdk_athena::{
    error::SdkError,
    operation::get_query_results::{GetQueryResultsError, GetQueryResultsOutput},
    types::{ColumnInfo, ColumnNullable, Datum, ResultSet, ResultSetMetadata, Row},
};

pub use aws_sdk_athena::operation::get_query_results::GetQueryResultsError as AwsGetQueryResultsError;

use tokio_stream::{Stream, StreamExt};

use super::{
    athena_manager::{AthenaStreamIteratorError, GlyphxGetQueryResultsError},
    result_set_converter::convert_to_json,
};
//We are re-exporting the types from the aws_sdk_athena crate so that we can use them in the other
//crates to avoid having to import them in each file.
use aws_sdk_athena::config::http::HttpResponse as Response;
pub use aws_sdk_athena::types::error::InternalServerException;
use aws_smithy_async::future::pagination_stream::PaginationStream;
pub use aws_smithy_runtime_api::client::orchestrator::HttpResponse;
pub use aws_smithy_types::{body::SdkBody, error::ErrorMetadata};
use serde_json::Value;

pub struct AthenaStreamIterator {
    results: Box<
        PaginationStream<Result<GetQueryResultsOutput, SdkError<GetQueryResultsError, Response>>>,
    >,
    query_output_results: Option<Vec<Value>>,
    query_output_size: usize,
    current_row: usize,
    query_id: String,
    catalog: String,
    database: String,
    first_page: bool,
    exhausted: bool,
}

impl AthenaStreamIterator {
    pub fn new(
        results: Box<
            PaginationStream<
                Result<GetQueryResultsOutput, SdkError<GetQueryResultsError, Response>>,
            >,
        >,
        query_id: &str,
        catalog: &str,
        database: &str,
    ) -> Self {
        Self {
            results,
            query_output_results: None,
            query_output_size: 0,
            current_row: 0,
            query_id: query_id.to_string(),
            catalog: catalog.to_string(),
            database: database.to_string(),
            exhausted: false,
            first_page: true,
        }
    }

    async fn reload(&mut self) -> Result<Option<()>, GlyphxGetQueryResultsError> {
        self.current_row = 0;
        //Get the next page of results from the stream.
        let next_result = self.results.next().await;

        if next_result.is_none() {
            //The stream has ended, we have exhausted the results.
            self.exhausted = true;
            return Ok(None);
        }

        let next_result = next_result.unwrap();
        if next_result.is_err() {
            let error = next_result.err().unwrap().into_service_error();
            let error = GlyphxGetQueryResultsError::from_aws_get_query_result_error(
                error,
                &self.catalog,
                &self.database,
                &self.query_id,
            );
            return Err(error);
        }
        let query_output_results = next_result.unwrap();
        //There is always a result set in the output, so we should never get a None.
        let result_set = query_output_results.result_set.as_ref().unwrap();
        //there are always rows, but they will be emptry if we have exhausted the result set.
        //this is the only to reliably check that we are at the end of the results.
        if result_set.rows.is_none() {
            self.exhausted = true;
            return Ok(None);
        }
        let rows = result_set.rows.as_ref().unwrap();
        if rows.is_empty() {
            self.exhausted = true;
            return Ok(None);
        }

        let mut converted_result_set = convert_to_json(result_set, Some(false));
        //If this is the first page, we need to remove the first row, as it is the header row.
        if self.first_page {
            self.first_page = false;
            converted_result_set.remove(0);
        }
        let result_set_size = converted_result_set.len();

        self.query_output_results = Some(converted_result_set.to_vec());
        self.query_output_size = result_set_size;
        //There is data in the result set
        return Ok(Some(()));
    }
    pub async fn next(&mut self) -> Result<Option<Value>, AthenaStreamIteratorError> {
        if self.exhausted {
            //You have hit the end of the result set, there is no more data to return,
            return Ok(None);
        }
        if self.query_output_results.is_none() {
            let reloaded = self.reload().await?;
            if reloaded.is_none() {
                return Ok(None);
            }
        }

        if self.current_row >= self.query_output_size {
            let reloaded = self.reload().await?;
            if reloaded.is_none() {
                return Ok(None);
            }
        }
        let result_set = self.query_output_results.as_ref().unwrap();
        let row = result_set[self.current_row].clone();
        self.current_row += 1;
        Ok(Some(row))
    }
}

#[cfg(test)]
mod test {
    use super::*;

    mod constructor {
        use super::*;
        use aws_smithy_async::future::pagination_stream::fn_stream::FnStream;

        #[tokio::test]
        async fn is_ok() {
            let fn_stream = FnStream::new(|_tx| Box::pin(async move {}));
            let stream = PaginationStream::new(fn_stream);

            let iter = AthenaStreamIterator::new(
                Box::new(stream),
                "test_query_id",
                "test_catalog",
                "test_database",
            );
            assert_eq!(iter.query_id, "test_query_id");
            assert_eq!(iter.catalog, "test_catalog");
            assert_eq!(iter.database, "test_database");
            assert_eq!(iter.query_output_results, None);
            assert_eq!(iter.query_output_size, 0);
            assert_eq!(iter.current_row, 0);
            assert_eq!(iter.exhausted, false);
            assert_eq!(iter.first_page, true);
        }
    }

    mod iterate {
        use super::*;
        use aws_sdk_athena::error::SdkError;
        use aws_sdk_athena::operation::get_query_results::GetQueryResultsError;
        use aws_sdk_athena::types::error::InternalServerException;
        use aws_smithy_async::future::pagination_stream::fn_stream::FnStream;
        use aws_smithy_runtime_api::http::{Response, StatusCode};
        use aws_smithy_types::body::SdkBody;
        use aws_smithy_types::error::ErrorMetadata;

        #[tokio::test]
        async fn is_ok() {
            let x_field_name = "test_field1";
            let y_field_name = "test_field2";
            let z_field_name = "test_field3";
            let fn_stream = FnStream::new(|tx| {
                Box::pin(async move {
                    if let Err(_) = tx.send(Ok(test_objects::get_query_results_set(
                        0,
                        x_field_name,
                        y_field_name,
                        z_field_name,
                        10,
                        true,
                        false,
                    ))).await {
                        return;
                    }
                    if let Err(_) = tx.send(Ok(test_objects::get_query_results_set(
                        1,
                        x_field_name,
                        y_field_name,
                        z_field_name,
                        10,
                        false,
                        false,
                    ))).await {
                        return;
                    }
                    if let Err(_) = tx.send(Ok(test_objects::get_query_results_set(
                        2,
                        x_field_name,
                        y_field_name,
                        z_field_name,
                        10,
                        false,
                        true,
                    ))).await {
                        return;
                    }
                })
            });

            let stream = PaginationStream::new(fn_stream);
            test_objects::MockStream::new(x_field_name, y_field_name, z_field_name, 10);

            let mut iter = AthenaStreamIterator::new(
                Box::new(stream),
                "test_query_id",
                "test_catalog",
                "test_database",
            );

            let mut count = 0;
            loop {
                let result = iter.next().await;
                assert!(result.is_ok());
                let result = result.unwrap();
                if result.is_none() {
                    break;
                }
                let result = result.unwrap();
                assert!(result.is_object());
                let result = result.as_object().unwrap();
                assert_eq!(result.len(), 4);
                assert!(result.contains_key(x_field_name));
                assert!(result.contains_key(y_field_name));
                assert!(result.contains_key(z_field_name));
                assert!(result.contains_key("glyphx_id__"));

                count += 1;
            }
            assert_eq!(count, 20);
        }
        #[tokio::test]
        async fn is_err() {
            let x_field_name = "test_field1";
            let y_field_name = "test_field2";
            let z_field_name = "test_field3";
            let fn_stream = FnStream::new(|tx| {
                Box::pin(async move {
                    if let Err(_) = tx
                        .send(Ok(test_objects::get_query_results_set(
                            0,
                            x_field_name,
                            y_field_name,
                            z_field_name,
                            10,
                            true,
                            false,
                        )))
                        .await
                    {
                        return;
                    }

                    let body = SdkBody::from("An error occurred".to_string());
                    let metadata = ErrorMetadata::builder()
                        .code("500")
                        .message("An error has occurred")
                        .build();
                    let internal_server_exception = InternalServerException::builder()
                        .message("An error has occurred")
                        .meta(metadata)
                        .build();

                    let query_response_error =
                        GetQueryResultsError::InternalServerException(internal_server_exception);
                    let raw: HttpResponse = HttpResponse::new(
                        StatusCode::from(http::StatusCode::from_u16(200).unwrap()),
                        body,
                    );
                    let error: SdkError<GetQueryResultsError> =
                        SdkError::service_error(query_response_error, raw);
                    if let Err(_) = tx.send(Err(error)).await {
                        return;
                    }
                })
            });

            let stream = PaginationStream::new(fn_stream);
            test_objects::MockStream::new(x_field_name, y_field_name, z_field_name, 10);

            let mut iter = AthenaStreamIterator::new(
                Box::new(stream),
                "test_query_id",
                "test_catalog",
                "test_database",
            );

            let mut count = 0;
            let mut did_error = false;
            loop {
                let result = iter.next().await;
                if result.is_ok() {
                    let result = result.unwrap();
                    if result.is_none() {
                        break;
                    }
                    let result = result.unwrap();
                    assert!(result.is_object());
                    let result = result.as_object().unwrap();
                    assert_eq!(result.len(), 4);
                    assert!(result.contains_key(x_field_name));
                    assert!(result.contains_key(y_field_name));
                    assert!(result.contains_key(z_field_name));
                    assert!(result.contains_key("glyphx_id__"));

                    count += 1;
                } else {
                    let error = result.err().unwrap();
                    match error {
                        AthenaStreamIteratorError::GetQueryResultsError(_) => {
                            did_error = true;
                            break;
                        }
                        #[allow(unreachable_patterns)]
                        _ => {
                            assert!(false);
                            break;
                        }
                    }
                }
            }
            //We should have gotten 10 results before the error.
            assert_eq!(count, 10);
            assert_eq!(did_error, true);
        }

        #[tokio::test]
        async fn is_exhausted() {
            let x_field_name = "test_field1";
            let y_field_name = "test_field2";
            let z_field_name = "test_field3";

            let fn_stream = FnStream::new(|tx| {
                Box::pin(async move {
                    if let Err(_) = tx.send(Ok(test_objects::get_query_results_set(
                        0,
                        x_field_name,
                        y_field_name,
                        z_field_name,
                        10,
                        true,
                        false,
                    ))).await {
                        return;
                    }

                    if let Err(_) = tx.send(Ok(test_objects::get_query_results_set(
                        1,
                        x_field_name,
                        y_field_name,
                        z_field_name,
                        10,
                        true,
                        false,
                    ))).await {
                        return;
                    }
                    if let Err(_) = tx.send(Ok(test_objects::get_query_results_set(
                        2,
                        x_field_name,
                        y_field_name,
                        z_field_name,
                        10,
                        false,
                        true,
                    ))).await {
                        return;
                    }
                })
            });

            let stream = PaginationStream::new(fn_stream);
            test_objects::MockStream::new(x_field_name, y_field_name, z_field_name, 10);

            let mut iter = AthenaStreamIterator::new(
                Box::new(stream),
                "test_query_id",
                "test_catalog",
                "test_database",
            );

            let mut count = 0;
            loop {
                let result = iter.next().await;
                assert!(result.is_ok());
                let result = result.unwrap();
                if result.is_none() {
                    break;
                }
                let result = result.unwrap();
                assert!(result.is_object());
                let result = result.as_object().unwrap();
                assert_eq!(result.len(), 4);
                assert!(result.contains_key(x_field_name));
                assert!(result.contains_key(y_field_name));
                assert!(result.contains_key(z_field_name));
                assert!(result.contains_key("glyphx_id__"));

                count += 1;
            }
            assert_eq!(count, 21);
            assert_eq!(iter.exhausted, true);

            let result = iter.next().await;
            assert!(result.is_ok());
            let result = result.unwrap();
            assert!(result.is_none());
        }
    }
}
