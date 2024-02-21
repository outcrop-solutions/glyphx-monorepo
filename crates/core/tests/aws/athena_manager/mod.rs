use crate::generate_random_file_name;
use aws_sdk_athena::operation::get_query_results::{GetQueryResultsError, GetQueryResultsOutput};
use aws_sdk_s3::error::SdkError;
use glyphx_core::aws::athena_manager::AthenaManager;
use glyphx_core::aws::athena_manager::AthenaQueryStatus;
use glyphx_core::aws::athena_manager::ColumnDataType;
use glyphx_core::aws::athena_stream_iterator::AthenaStreamIterator;
use std::time::{Duration, Instant};

use tokio_stream::{Stream, StreamExt};
const CATALOG: &str = "AwsDataCatalog";
const DATABASE: &str = "jpstestdatabase";

const TABLE_CREATE_QUERY: &str = "CREATE EXTERNAL TABLE `<table_name>`(
  `glyphx_id__` bigint, 
  `col1` double, 
  `col2` varchar(100), 
  `col3` double)
ROW FORMAT SERDE 
  'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe' 
STORED AS INPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat' 
OUTPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat'
LOCATION
  's3://jps-test-bucket/integration_testing/test_table'
TBLPROPERTIES (
  'parquet.compression'='GZIP')";

const VIEW_CREATE_QUERY: &str =
    "CREATE OR REPLACE VIEW \"<view_name>\" AS SELECT * FROM \"<table_name>\"";

async fn validate_table_existance(
    athena_manager: &AthenaManager,
    table_name: &str,
    should_exist: bool,
) {
    let does_table_exist = athena_manager.table_exists(&table_name).await;
    assert!(does_table_exist.is_ok());
    assert!(does_table_exist.unwrap() == should_exist);
}

async fn validate_view_existance(
    athena_manager: &AthenaManager,
    view_name: &str,
    should_exist: bool,
) {
    let does_view_exist = athena_manager.view_exists(&view_name).await;
    assert!(does_view_exist.is_ok());
    assert!(does_view_exist.unwrap() == should_exist);
}

async fn validate_table_definition(athena_manager: &AthenaManager, table_name: &str) {
    let table_description = athena_manager.get_table_description(&table_name).await;
    assert!(table_description.is_ok());
    let table_description = table_description.unwrap();
    assert_eq!(table_description.len(), 4);
    assert_eq!(table_description[0].name, "glyphx_id__");
    let is_integer = match table_description[0].data_type {
        ColumnDataType::INTEGER => true,
        _ => false,
    };
    assert!(is_integer);
    assert_eq!(table_description[1].name, "col1");
    let is_number = match table_description[1].data_type {
        ColumnDataType::NUMBER => true,
        _ => false,
    };
    assert!(is_number);

    assert_eq!(table_description[2].name, "col2");
    let is_string = match table_description[2].data_type {
        ColumnDataType::STRING => true,
        _ => false,
    };
    assert!(is_string);

    assert_eq!(table_description[3].name, "col3");
    let is_number = match table_description[3].data_type {
        ColumnDataType::NUMBER => true,
        _ => false,
    };
    assert!(is_number);
}

async fn get_paged_results(
    athena_manager: &AthenaManager,
    table_name: &str,
) -> Box<dyn Stream<Item = Result<GetQueryResultsOutput, SdkError<GetQueryResultsError>>> + Unpin>
{
    let query = format!("SELECT * FROM {}", &table_name);
    let query_id = athena_manager.start_query(&query, None).await;
    assert!(query_id.is_ok());
    let query_id = query_id.unwrap();
    let time_out = 60; //60 seconds.
    let start_time = Instant::now();
    let desired_duration = Duration::from_secs(time_out as u64);
    let status = loop {
        let elapsed = start_time.elapsed();
        if elapsed >= desired_duration {
            break None;
        }
        let status = athena_manager.get_query_status(&query_id).await;
        if status.is_err() {
            panic!("Error getting query status: {:?}", status.err().unwrap());
        }

        let status = status.unwrap();
        match status {
            AthenaQueryStatus::Succeeded => {
                break Some(AthenaQueryStatus::Succeeded);
            }
            AthenaQueryStatus::Failed(e) => {
                panic!("Query failed: {:?}", e);
            }
            AthenaQueryStatus::Cancelled => {
                panic!("Query was cancelled.");
            }
            _ => {
                //Do nothing.
            }
        }
    };
    assert!(status.is_some());

    //Page this at 1 so we can test the iterator
    let pager = athena_manager
        .get_paged_query_results(&query_id, Some(1))
        .await;
    assert!(pager.is_ok());
    let pager = pager.unwrap();
    Box::new(pager)
}

#[tokio::test]
async fn integration_test() {
    let table_name = format!("test_{}", generate_random_file_name(10)).to_lowercase();
    let view_name = format!("test_{}", generate_random_file_name(10)).to_lowercase();
    let athena_manager = AthenaManager::new(CATALOG, DATABASE).await;
    assert!(athena_manager.is_ok());
    let athena_manager = athena_manager.unwrap();

    //1. Create a Test Table
    let query = TABLE_CREATE_QUERY.replace("<table_name>", &table_name);
    let result = athena_manager.run_query(&query, Some(15), None).await;
    assert!(result.is_ok());

    //2. Check to see if the table exists.

    validate_table_existance(&athena_manager, &table_name, true).await;

    //3. Get the table definition.
    validate_table_definition(&athena_manager, &table_name).await;
    //4. Query the Data
    let query = format!("SELECT * FROM {}", &table_name);
    let result = athena_manager.run_query(&query, None, None).await;
    assert!(result.is_ok());
    let result = result.unwrap();
    assert!(result.as_array().unwrap().len() >= 1);

    //5. Get a paged result set.
    let pager = get_paged_results(&athena_manager, &table_name).await;

    //6. Enumerate it.
    let mut iterator = AthenaStreamIterator::new(pager, "12345", CATALOG, DATABASE);
    let mut count = 0;
    loop {
        let result = iterator.next().await;
        if result.is_err() {
            break;
        }
        let result = result.unwrap();
        if result.is_some() {
        let result = result.unwrap();
        eprintln!("Result: {:?}", result);
        count += 1;
        } else {
            break;
        }
    }
    assert!(count >= 1);

    //7. Create a view for the table.
    let query = VIEW_CREATE_QUERY
        .replace("<view_name>", &view_name)
        .replace("<table_name>", &table_name);

    let result = athena_manager.run_query(&query, Some(15), None).await;
    assert!(result.is_ok());

    //8. Check that the view exists.
    validate_view_existance(&athena_manager, &view_name, true).await;

    //9. Query the view.
    let query = format!("SELECT * FROM {}", &view_name);
    let result = athena_manager.run_query(&query, Some(15), None).await;
    assert!(result.is_ok());
    let result = result.unwrap();
    assert!(result.as_array().unwrap().len() >= 1);

    //10. Drop the table.
    let result = athena_manager.drop_table(&table_name).await;
    assert!(result.is_ok());
    validate_table_existance(&athena_manager, &table_name, false).await;

    //11. Drop the view.
    let result = athena_manager.drop_view(&view_name).await;
    assert!(result.is_ok());
    validate_view_existance(&athena_manager, &view_name, false).await;
}
