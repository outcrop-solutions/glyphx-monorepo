use glyph_engine::types::vectorizer_parameters::VectorizerParameters;
use glyphx_common::{AthenaConnection, S3Connection};
use glyphx_core::Singleton;
use glyph_engine::GlyphEngine;
use serde_json::json;

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn test_vector_processor() {
    let _ = AthenaConnection::build_singleton().await;
    let _ = S3Connection::build_singleton().await;
    let table_name = "glyphx_646fa59785272d19babc2af1_6483770b7fb04babe1412e04_view";
    let params = json!({
        "workspace_id": "1234",
        "project_id": "5678",
        "data_table_name": table_name,
        "output_file_prefix": "test",
        "model_hash": "jptesting",
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
}
