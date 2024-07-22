use super::GetStatsError;
use glyphx_core_error::{GlyphxCoreError, GlyphxErrorData};
use bincode::{Error, ErrorKind};
use serde::{Deserialize, Serialize};
use serde_json::{json, to_value};
use crate::{data::GetVectorError, model::pipeline::glyphs::{new_ranked_glyph_data::NewRankedGlyphDataError, ranked_glyph_data::RankedGlyphDataError}};
#[derive(Debug, Clone,Deserialize, Serialize, GlyphxCoreError)]
#[error_definition("StatsError")]
pub enum AddGlyphError {
   DeserializationError(GlyphxErrorData), 
   RankOutOfRange(GlyphxErrorData),
   StatisticsNotInitialized(GlyphxErrorData),
   VectorNotFound(GlyphxErrorData),
}
impl AddGlyphError {
    pub fn rank_out_of_range(axis_name: &str, rank: u64, max_rank: u64) -> Self {
        let msg = format!("The rank: {} for axis: {} is out of bounds: {} .", rank, axis_name, max_rank);
        let json_data = json!({"axis_name": axis_name, "rank": rank, "max_rank": max_rank});
        let data = GlyphxErrorData::new(msg, Some(json_data), None);
        AddGlyphError::RankOutOfRange(data)
    }

    pub fn statistics_not_initialized(axis: &str) -> Self {
        let msg = format!("The statistics for axis : {} have not been initialized. You must load them before adding glyphs.", axis);
        let data = GlyphxErrorData::new(msg.to_string(), None, None);
        AddGlyphError::StatisticsNotInitialized(data)
    }

}
impl From<Error> for AddGlyphError {
    fn from(error: Error) -> Self {
        let (inner_error, msg, data) = match error.as_ref() {
            ErrorKind::Io(err) => {
                let str_err = err.to_string();
                (json!({"error": str_err}), "An io error occurred while deserializing the Glyph.  See the inner error for more details.", json!({"ErrorKind": "Io"}))

                
            },
            ErrorKind::Custom(err) => {
                
                (json!({"error": err}), "A custom error occurred while deserializing the Glyph.  See the inner error for more details.", json!({"ErrorKind": "Custom"}))
            },
            ErrorKind::SizeLimit => {
                (json!({"error": "Size limit exceeded"}), "The size limit was exceeded while deserializing the Glyph.", json!({"ErrorKind": "SizeLimit"}))
            },
            ErrorKind::InvalidUtf8Encoding(utf8_error) => {
                let error_len = utf8_error.error_len();
                let inner_str = match error_len {
                    Some(len) => format!("An unexpected Value was found at position {}", len),
                    None => "Unexpectedly reached the end of the input".to_string(),
                };
                (json!({"error": inner_str}), "A utf8 encoding error occurred while deserializing the Glyph.  See the inner error for more details.", json!({"InvalidUtf8Encoding": "Io"}))
            },
            ErrorKind::InvalidBoolEncoding(value) => {
                (json!({"error": format!("Invalid bool encoding: {}", value)}), "An invalid bool encoding was found while deserializing the Glyph. See the inner error for more details.", json!({"InvalidBoolEncoding": "Io"}))
            },
            ErrorKind::InvalidCharEncoding => {
                (json!({"error": "Invalid char encoding"}), "An invalid char encoding was found while deserializing the Glyph.", json!({"ErrorKind": "InvalidCharEncoding"}))
            },
            ErrorKind::InvalidTagEncoding(tag) => {
                (json!({"error": format!("Invalid tag encoding: {}", tag)}), "An invalid tag encoding was found while deserializing the Glyph. See the inner error for more details.", json!({"ErrorKind": "InvalidTagEncoding"}))
            },
            ErrorKind::DeserializeAnyNotSupported => {
                (json!({"error": "Deserialize any not supported"}), "A Deserialize any not supported  error was encountered while deserializing the Glyph.", json!({"ErrorKind": "DeserializeAnyNotSupported"}))
            },
            ErrorKind::SequenceMustHaveLength => {
                (json!({"error": "Sequence must have length"}), "A Sequence Must Have Length error was encountered while deserializing the Glyph.", json!({"ErrorKind": "SequenceMustHaveLength"}))
            },

        };

        let data = GlyphxErrorData::new(msg.to_string(), Some(data), Some(inner_error));
        AddGlyphError::DeserializationError(data)
    }
}

impl From<GetVectorError> for AddGlyphError {
     fn from(error: GetVectorError) -> Self {
         let message = "A Value for the vector could not be found.  See the inner error for more details.";
         let inner_error = to_value(error).unwrap();
         let data = GlyphxErrorData::new(message.to_string(), None, Some(inner_error));
         AddGlyphError::VectorNotFound(data)
     }
}

impl From<RankedGlyphDataError> for AddGlyphError {
    fn from(error: RankedGlyphDataError) -> Self {
        let (message, data) = match error {
            RankedGlyphDataError::InvalidXRank(rank) => {
                let msg = format!("An error occurred adding the glyph. The x rank: {} is out of bounds. See the inner error for additional information", rank);
                let json_data = json!({"axis" : "x",  "rank": rank});
                (msg, json_data)
            },
            RankedGlyphDataError::InvalidZRank(rank) => {
                let msg = format!("An error occurred adding the glyph. The Z rank: {} is out of bounds. See the inner error for additional information", rank);
                let json_data = json!({"axis" : "Z",  "rank": rank});
                (msg, json_data)
            },
        };
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message.to_string(), Some(data), Some(inner_error));
        AddGlyphError::RankOutOfRange(error_data)
    }
}

impl From<NewRankedGlyphDataError> for AddGlyphError {
    fn from(error: NewRankedGlyphDataError) -> Self {
        let (message, data) = match error {
            NewRankedGlyphDataError::InvalidXRank(rank) => {
                let msg = format!("An error occurred adding the glyph. The x rank: {} is out of bounds. See the inner error for additional information", rank);
                let json_data = json!({"axis" : "x",  "rank": rank});
                (msg, json_data)
            },
            NewRankedGlyphDataError::InvalidZRank(rank) => {
                let msg = format!("An error occurred adding the glyph. The Z rank: {} is out of bounds. See the inner error for additional information", rank);
                let json_data = json!({"axis" : "Z",  "rank": rank});
                (msg, json_data)
            },
        };
        let inner_error = to_value(error).unwrap();
        let error_data = GlyphxErrorData::new(message.to_string(), Some(data), Some(inner_error));
        AddGlyphError::RankOutOfRange(error_data)
    }
}

impl From<GetStatsError> for AddGlyphError {
    fn from(error: GetStatsError) -> Self {
        let data = error.get_glyphx_error_data();
        let data = data.data.as_ref().unwrap();
        let axis = data["axis_name"].as_str().unwrap();
        let message = format!("The statistics for axis : {} have not been initialized. You must load them before adding glyphs.", axis);
        let inner_error = to_value(&error).unwrap();
        let data = GlyphxErrorData::new(message.to_string(), Some(data.clone()), Some(inner_error));
        AddGlyphError::StatisticsNotInitialized(data)
    }
}
