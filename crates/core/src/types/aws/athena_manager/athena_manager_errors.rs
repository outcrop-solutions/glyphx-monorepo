///! Holds all of our error types for AthenaManager operations.
mod constructor_error;
mod start_query_error;
mod get_query_status_error;
mod get_query_results_error;
mod run_query_error;
mod get_query_pager_error;
mod get_table_description_error;

pub use constructor_error::ConstructorError;
pub use start_query_error::StartQueryError;
pub use get_query_status_error::GetQueryStatusError;
pub use get_query_results_error::GetQueryResultsError;
pub use run_query_error::RunQueryError;
pub use get_query_pager_error::GetQueryPagerError;
pub use get_table_description_error::GetTableDescriptionError;






