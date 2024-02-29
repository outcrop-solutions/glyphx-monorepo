use bson::Uuid;
use glyph_engine::types::vectorizer_parameters::VectorizerParameters;
use glyphx_common::{AthenaConnection, S3Connection};
use glyphx_core::{Singleton, utility_functions::file_functions::*};
use glyph_engine::GlyphEngine;
use serde_json::json;

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn test_vector_processor() {
    let athena_conenction = AthenaConnection::build_singleton().await;
    assert!(athena_conenction.is_ok());
    let s3_connection = S3Connection::build_singleton().await;
    assert!(s3_connection.is_ok());
    let s3_connection = s3_connection.unwrap();
    let table_name = "glyphx_646fa59785272d19babc2af1_6483770b7fb04babe1412e04_view";
    let workspace_id = Uuid::new().to_string();
    let project_id = Uuid::new().to_string();
    let model_hash = Uuid::new().to_string();
    let output_file_prefix = "test";
    let params = json!({
        "workspace_id": workspace_id,
        "project_id": project_id,
        "data_table_name": table_name,
        "output_file_prefix": output_file_prefix,
        "model_hash": model_hash,
        "xAxis" : {
            "fieldDisplayName": "vendor",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "standard",
                "fieldName": "vendor"
            }
        },
        "yAxis" : {
            "fieldDisplayName": "last_receipt_date",
            "fieldDataType": 0,
            "fieldDefinition": {
                "fieldType": "date",
                "fieldName": "last_receipt_date",
                "dateGrouping" : "month_of_year"

            }
        },
        "zAxis" : {
            "fieldDisplayName": "delta",
            "fieldDataType": 1,
            "fieldDefinition": {
                "fieldType": "accumulated",
                "accumulator": "sum",
                "accumulatedFieldDefinition" : {
                    "fieldType": "standard",
                    "fieldName": "delta"
                }
                    
            }
        },
        "supportingFields" : [ ]
    });
    let params = VectorizerParameters::from_json_value(&params).unwrap();
    let mut glyph_engine = GlyphEngine::new(&params).await.unwrap();

    let result = glyph_engine.process().await;
    assert!(result.is_ok());
    let result = result.unwrap();
    let s3_manager = s3_connection.get_s3_manager();
    assert!(s3_manager.file_exists(&result.glyphs_file_name).await.is_ok());
    assert!(s3_manager.file_exists(&result.x_axis_vectors_file_name).await.is_ok());
    assert!(s3_manager.file_exists(&result.y_axis_vectors_file_name).await.is_ok());
    assert!(s3_manager.file_exists(&result.statistics_file_name).await.is_ok());
    

    s3_manager.remove_object(&result.glyphs_file_name).await.unwrap();
    s3_manager.remove_object(&result.x_axis_vectors_file_name).await.unwrap();
    s3_manager.remove_object(&result.y_axis_vectors_file_name).await.unwrap();
    s3_manager.remove_object(&result.statistics_file_name).await.unwrap();
}
