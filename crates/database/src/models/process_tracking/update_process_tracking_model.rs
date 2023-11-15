use super::ProcessStatus;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use mongodb::bson::DateTime;
use mongodb::bson::Document;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::to_bson;
use mongodb::bson::doc;
use derive_builder::Builder;

///Ok, this is good for updating a process tracking model.  All fields are optional and can be set,
///except for the id field which is set internally and the process_id which is immutable.  Vectors are
///excluded as they are updated via direct methods.
#[derive(Clone, Debug, Serialize, Deserialize, Builder)]
pub struct UpdateProcessTrackingModel {
    #[builder(setter(into, strip_option), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processName")]
    process_name: Option<String>,
    #[builder(setter(strip_option), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processStatus")]
    process_status: Option<ProcessStatus>,
    #[builder(setter(strip_option), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processStartTime")]
    process_start_time: Option<DateTime>,
    #[builder(setter(strip_option), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processEndTime")]
    process_end_time: Option<DateTime>,
    #[builder(setter(strip_option), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processResult")]
    process_result: Option<Value>,
    #[builder(setter(strip_option), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processHeartbeat")]
    process_heartbeat: Option<DateTime>,
}

///This will need it's own to_bson method which will wrap ObjectIds around the string
///representations.
impl UpdateProcessTrackingModel {
    pub fn is_valid(&self) -> bool {
        self.process_name.is_some()
            || self.process_status.is_some()
            || self.process_start_time.is_some()
            || self.process_end_time.is_some()
            || self.process_result.is_some()
            || self.process_heartbeat.is_some()
    }

    ///When we go to build this in the macro we will need a way to identify ObjectIds that we will
    ///need to convert from Strings to ObjectIds
    pub fn to_bson(&self) -> Result<Document, mongodb::bson::ser::Error> {
        let bson = to_bson(&self);
        if bson.is_err() {
            return Err(bson.err().unwrap());
        }
        let bson = bson.unwrap();
        let bson = bson.as_document().unwrap();
        let mut document = Document::new();
        bson.keys().for_each(|key| {
            if key == "_id" {
                let str_value = bson.get(key).unwrap().as_str().unwrap();
                let object_id = ObjectId::parse_str(str_value).unwrap();
                document.insert(key, mongodb::bson::Bson::ObjectId(object_id)); 
            } else {
                let v = bson.get(key).unwrap().clone();
                document.insert(key, v);
            }
        });
       let output = doc! {
            "$set": document
        };
        Ok(output) 
    }
}

