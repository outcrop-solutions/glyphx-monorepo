use super::ProcessStatus;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use mongodb::bson::DateTime;
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

impl UpdateProcessTrackingModel {
    pub fn is_valid(&self) -> bool {
        self.process_name.is_some()
            || self.process_status.is_some()
            || self.process_start_time.is_some()
            || self.process_end_time.is_some()
            || self.process_result.is_some()
            || self.process_heartbeat.is_some()
    }
}

