use super::ProcessStatus;
use mongodb::bson::{Document, to_bson};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use mongodb::bson::DateTime;
use derive_builder::Builder;
///This will need it's own to_bson method which will wrap ObjectIds around the string
///representations.
///Ok, this is good for creating a new process tracking model.  We have two required field:
///process_id and process_name which must be set before calling build.  We also have
///process_status which can be optionaly set by the caller.
///The rest of the fields are set internally and cannot be set by the caller.
#[derive(Clone, Debug, Serialize, Deserialize, Builder)]
pub struct CreateProcessTrackingModel {
    #[builder(setter(into))]
    #[serde(rename = "processId")]
    process_id: String,
    #[builder(setter(into))]
    #[serde(rename = "processName")]
    process_name: String,
    #[builder(default = "ProcessStatus::Running")]
    #[serde(rename = "processStatus")]
    process_status: ProcessStatus,
    //Only fields above this can be set by the user
    #[builder(setter(skip), default = "Some(DateTime::now())")]
    #[serde(rename = "processStartTime")]
    process_start_time: Option<DateTime>,
    #[builder(setter(skip), default = "Vec::new()")]
    #[serde(rename = "processMessages")]
    process_messages: Vec<String>,
    #[builder(setter(skip), default = "Vec::new()")]
    #[serde(rename = "processError")]
    process_error: Vec<Value>,
    ///Perhaps for these two fields, we should not even include them in the CreateProcessTrackingModel
    ///they are optional fields that are set via other methods.
    #[builder(setter(skip), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processResult")]
    process_result: Option<Value>,
    #[builder(setter(skip), default = "None")]
    #[serde(skip_serializing_if = "Option::is_none", rename = "processHeartbeat")]
    process_heartbeat: Option<DateTime>,
}

impl CreateProcessTrackingModel {
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
        
       Ok(document) 
    }
}
