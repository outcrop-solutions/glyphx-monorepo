pub use aws_sdk_athena::{
    error::SdkError,
    operation::get_query_results::{GetQueryResultsError, GetQueryResultsOutput},
};

pub use aws_sdk_athena::operation::get_query_results::GetQueryResultsError as AwsGetQueryResultsError;

use tokio_stream::{Stream, StreamExt};

use super::{athena_manager::GlyphxGetQueryResultsError, result_set_converter::convert_to_json};
use serde_json::Value;
use http::Response;
use aws_smithy_http::body::SdkBody;



pub struct AthenaStreamIterator
{
    results: Box<dyn Stream<Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>> + Unpin>,
    query_output_results: Option<Vec<Value>>,
    query_output_size: usize,
    current_row: usize,
    query_id: String,
    catalog: String,
    database: String,
    first_page: bool,
    exhausted: bool,
}

impl AthenaStreamIterator
{
    pub fn new(results:Box<dyn Stream<Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>> + Unpin>, query_id: &str, catalog: &str, database: &str) -> Self {
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
        
        //It looks like the stream always returns data so we should never get a None.
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
        let rows = result_set.rows.as_ref().unwrap();
        if rows.is_empty() {
            self.exhausted = true;
            return Ok(None);
        }

        let converted_result_set = convert_to_json(result_set, Some(false));
        let mut converted_result_set = converted_result_set.as_array().unwrap().to_vec();
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
    pub async fn next(&mut self) -> Result<Option<Value>, ()> {
        if self.exhausted {
            //You have hit the end of the result set, there is no more data to return,
            return Ok(None);
        }
        if self.query_output_results.is_none() {
            let reloaded = self.reload().await;
            if reloaded.is_err() {
                return Err(());
            }
            let reloaded = reloaded.unwrap();
            if reloaded.is_none() {
                return Ok(None);
            }
        }

        if self.current_row >= self.query_output_size {
            let reloaded = self.reload().await;
            if reloaded.is_err() {
                return Err(());
            }
            let reloaded = reloaded.unwrap();
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
