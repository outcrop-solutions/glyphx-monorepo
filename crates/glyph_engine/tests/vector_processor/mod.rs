use glyph_engine::vector_processer::{VectorProcesser, VectorValueProcesser, TaskStatus};
use glyph_engine::types::vectorizer_parameters::VectorizerParameters;
use glyphx_core::Singleton;
use glyphx_common::{AthenaConnection, S3Connection};

use serde_json::json;

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn test_vector_processor() {
    AthenaConnection::build_singleton().await;
    S3Connection::build_singleton().await;
    let table_name = "glyphx_646fa59785272d19babc2af1_6483770b7fb04babe1412e04_view";
    let params =  json!({
                "workspace_id": "1234",
                "project_id": "5678",
                "data_table_name": "glyphx_646fa59785272d19babc2af1_6483770b7fb04babe1412e04_view",
                "xAxis" : {
                    "fieldDisplayName": "vendor",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "vendor"
                    }
                },
                "yAxis" : {
                    "fieldDisplayName": "field2",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field2"
                    }
                },
                "zAxis" : {
                    "fieldDisplayName": "field3",
                    "fieldDataType": 1,
                    "fieldDefinition": {
                        "fieldType": "standard",
                        "fieldName": "field3"
                    }
                },
                "supportingFields" : [ ]
            });
    let params = VectorizerParameters::from_json_value(&params).unwrap();
    let mut vector_processer = VectorProcesser::new("x", &params.data_table_name,"test/jptesting", params.get_field_definition("xaxis").unwrap());
    vector_processer.start();
    let final_status;
    loop {
        let status = vector_processer.check_status();
        if status == TaskStatus::Complete {
            final_status = status;
            break;
        } 
        match status {
            TaskStatus::Errored(_) => {
                final_status = status;
                break;
            }
            _ => {}
        }
    }
    assert_eq!(final_status, TaskStatus::Complete);


}


