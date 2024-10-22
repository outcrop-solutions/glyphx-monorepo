use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};

use bincode::{Error, ErrorKind};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone,Deserialize, Serialize, GlyphxCoreError)]
#[error_definition("StatsError")]
pub enum AddStatsError {
   DeserializationError(GlyphxErrorData), 
   StatsAlreadyExists(GlyphxErrorData),
   InvalidAxisName(GlyphxErrorData),
}

impl AddStatsError {
    pub fn axis_exists(axis_name: &str) -> Self {
        let msg = format!("The axis {} already exists.", axis_name);
        let json_data = json!({"axis_name": axis_name});
        let data = GlyphxErrorData::new(msg, Some(json_data), None);
        AddStatsError::StatsAlreadyExists(data)
    }

    pub fn invalid_axis_name(axis_name: &str) -> Self {
        let msg = format!("The axis {} is invalid.  The only valid axis names are x, y, or z", axis_name);
        let json_data = json!({"axis_name": axis_name});
        let data = GlyphxErrorData::new(msg, Some(json_data), None);
        AddStatsError::InvalidAxisName(data)
    }
}
impl From<Error> for AddStatsError {
    fn from(error: Error) -> Self {
        let (inner_error, msg, data) = match error.as_ref() {
            ErrorKind::Io(err) => {
                let str_err = err.to_string();
                (json!({"error": str_err}), "An io error occurred while deserializing the statistics.  See the inner error for more details.", json!({"ErrorKind": "Io"}))

                
            },
            ErrorKind::Custom(err) => {
                
                (json!({"error": err}), "A custom error occurred while deserializing the statistics.  See the inner error for more details.", json!({"ErrorKind": "Custom"}))
            },
            ErrorKind::SizeLimit => {
                (json!({"error": "Size limit exceeded"}), "The size limit was exceeded while deserializing the statistics.", json!({"ErrorKind": "SizeLimit"}))
            },
            ErrorKind::InvalidUtf8Encoding(utf8_error) => {
                let error_len = utf8_error.error_len();
                let inner_str = match error_len {
                    Some(len) => format!("An unexpected Value was found at position {}", len),
                    None => "Unexpectedly reached the end of the input".to_string(),
                };
                (json!({"error": inner_str}), "A utf8 encoding error occurred while deserializing the statistics.  See the inner error for more details.", json!({"InvalidUtf8Encoding": "Io"}))
            },
            ErrorKind::InvalidBoolEncoding(value) => {
                (json!({"error": format!("Invalid bool encoding: {}", value)}), "An invalid bool encoding was found while deserializing the statistics. See the inner error for more details.", json!({"InvalidBoolEncoding": "Io"}))
            },
            ErrorKind::InvalidCharEncoding => {
                (json!({"error": "Invalid char encoding"}), "An invalid char encoding was found while deserializing the statistics.", json!({"ErrorKind": "InvalidCharEncoding"}))
            },
            ErrorKind::InvalidTagEncoding(tag) => {
                (json!({"error": format!("Invalid tag encoding: {}", tag)}), "An invalid tag encoding was found while deserializing the statistics. See the inner error for more details.", json!({"ErrorKind": "InvalidTagEncoding"}))
            },
            ErrorKind::DeserializeAnyNotSupported => {
                (json!({"error": "Deserialize any not supported"}), "A Deserialize any not supported  error was encountered while deserializing the statistics.", json!({"ErrorKind": "DeserializeAnyNotSupported"}))
            },
            ErrorKind::SequenceMustHaveLength => {
                (json!({"error": "Sequence must have length"}), "A Sequence Must Have Length error was encountered while deserializing the statistics.", json!({"ErrorKind": "SequenceMustHaveLength"}))
            },

        };

        let data = GlyphxErrorData::new(msg.to_string(), Some(data), Some(inner_error));
        AddStatsError::DeserializationError(data)
    }
}
