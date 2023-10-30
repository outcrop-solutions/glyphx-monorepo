//! Our error type for glyphx crates.
use serde_json;
use serde::{Deserialize, Serialize};

///Our standard error structure.  All Glyphx crates should pass relevant error information in 
///this structure.
#[derive(Clone, Deserialize, Serialize, Debug)]
pub struct GlyphxErrorData {
    pub message: String,
    pub data: Option<serde_json::Value>,
    #[serde(rename = "innerError")]
    pub inner_error: Option<serde_json::Value>,
}
impl GlyphxErrorData {
    /// Creates a new GlyphxErrorData object.
    /// # Arguments
    /// * `message` - A string that describes the error.
    /// * `data` - An optional serde_json::Value object that contains additional information about the error.
    /// * `inner_error` - An optional serde_json::Value object that contains the inner error.
    pub fn new(
        message: String,
        data: Option<serde_json::Value>,
        inner_error: Option<serde_json::Value>,
    ) -> Self {
        GlyphxErrorData {
            message,
            data,
            inner_error,
        }
    }

    pub fn to_json(&self) -> serde_json::Value {
        serde_json::to_value(self).unwrap()
    }
}

impl Default for GlyphxErrorData {
    fn default() -> Self {
        GlyphxErrorData {
            message: String::from("An Error Has Occurred"),
            data: None,
            inner_error: None,
        }
    }
}

/// Implements the Display trait for GlyphxErrorData so that the data can be logged
impl std::fmt::Display for GlyphxErrorData {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut json = serde_json::json!({
            "message": self.message,
        });
        if let Some(data) = &self.data {
            json["data"] = data.clone();
        }
        if let Some(inner_error) = &self.inner_error {
            json["innerError"] = inner_error.clone();
        }
        write!(f, "{}", json)
    }
}

#[cfg(test)]
mod glyphx_error_tests {
    use super::*;

    #[test]
    fn build_glyphx_error_with_nones() {
        let msg = String::from("Error");
        let error = GlyphxErrorData::new(
            msg.clone(),
            None,
            None,
        );
        let error = error.to_string();

        let json = serde_json::from_str::<serde_json::Value>(error.as_str());
        assert!(json.is_ok());
        let json = json.unwrap();
        assert_eq!(json["message"], msg);

    }
    #[test]
    fn build_glyphx_error_with_data() {
        let msg = String::from("Error");
        let data = serde_json::json!({
            "key": "value",
            "foo": "bar"
        });
        let error = GlyphxErrorData::new(
            msg.clone(),
            Some(data.clone()),
            None,
        );
        let error = error.to_string();

        let json = serde_json::from_str::<serde_json::Value>(error.as_str());
        assert!(json.is_ok());
        let json = json.unwrap();
        assert_eq!(json["message"], msg);
        let err_data = json["data"].as_object().unwrap();
        assert_eq!(err_data.get("key").unwrap(), data.get("key").unwrap());
        assert_eq!(err_data.get("foo").unwrap(), data.get("foo").unwrap());

    }

    #[test]
    fn build_glyphx_error_with_inner_error() {
        let msg = String::from("Error");
        let inner_error = serde_json::json!({
            "key": "value",
            "foo": "bar"
        });
        let error = GlyphxErrorData::new(
            msg.clone(),
            None,
            Some(inner_error.clone()),
        );
        let error = error.to_string();

        let json = serde_json::from_str::<serde_json::Value>(error.as_str());
        assert!(json.is_ok());
        let json = json.unwrap();
        assert_eq!(json["message"], msg);
        let inner_err_data = json["innerError"].as_object().unwrap();
        assert_eq!(inner_err_data.get("key").unwrap(), inner_error.get("key").unwrap());
        assert_eq!(inner_err_data.get("foo").unwrap(), inner_error.get("foo").unwrap());

    }

    #[test]
    fn build_glyphx_error_with_inner_error_as_glyphx_error_data() {
        let msg = String::from("Error");
        let inner_msg = String::from("Inner Error");
        let data = serde_json::json!({
            "key": "value",
            "foo": "bar"
        });
        let inner_error = GlyphxErrorData::new(
            inner_msg.clone(),
            Some(data.clone()),
            None,
        );        
        let error = GlyphxErrorData::new(
            msg.clone(),
            None,
            Some(serde_json::to_value(inner_error.clone()).unwrap()),
        );
        let error = error.to_string();

        let json = serde_json::from_str::<serde_json::Value>(error.as_str());
        assert!(json.is_ok());
        let json = json.unwrap();
        assert_eq!(json["message"], msg);
        let inner_err_data = json["innerError"].as_object().unwrap();
        let inner_err_data = inner_err_data["data"].as_object().unwrap();
        assert_eq!(inner_err_data.get("key").unwrap(), inner_error.clone().data.unwrap().get("key").unwrap());
        assert_eq!(inner_err_data.get("foo").unwrap(), inner_error.clone().data.unwrap().get("foo").unwrap());

    }
}
