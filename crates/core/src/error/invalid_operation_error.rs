use crate::error::{GlyphxError, GlyphxErrorData};
use backtrace::Backtrace;

pub struct InvalidOperationErrorData {
    data: serde_json::Value,
}

impl std::fmt::Display for InvalidOperationErrorData {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", serde_json::to_string(&self.data).unwrap())
    }
}

pub struct InvalidOperationError<'a> {
    info: GlyphxErrorData<'a, InvalidOperationErrorData>,
}

impl<'a> GlyphxError<'a, InvalidOperationErrorData> for InvalidOperationError<'a> {
    fn get_info(&'a self) -> &'a GlyphxErrorData<InvalidOperationErrorData> {
        &self.info
    }
}
impl<'a> InvalidOperationError<'a> {
    fn new(
        message: &String,
        data: Option<serde_json::Value>,
        inner_error: Option<&'a dyn std::fmt::Display>,
    ) -> Self {
        InvalidOperationError {
            info: GlyphxErrorData {
                error_code: 402,
                error_description: String::from("Invalid Operation Error"),
                message: message.clone(),
                data: match data {
                    Some(json) => Some(InvalidOperationErrorData { data: json }),
                    None => None,
                },
                inner_error: inner_error
                    .map(|err| Box::new(err) as Box<dyn std::fmt::Display + 'a>),
                back_trace: Backtrace::new(),
            },
        }
    }
}

impl std::fmt::Display for InvalidOperationError<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        GlyphxError::fmt(self, f)
    }
}

#[cfg(test)]
mod invalid_operation_error_tests {
    use super::*;
    use crate::error::invalid_argument_error::InvalidArgumentError;
  
    #[test]
    fn build_invalid_operation_error_with_nones() {
        let error = InvalidOperationError::new(&String::from("Invalid Operation Error"), None, None);
        assert_eq!(error.get_info().error_code, 402);
        assert_eq!(error.get_info().error_description, "Invalid Operation Error");
        assert_eq!(error.get_info().message, "Invalid Operation Error");
        assert!(error.get_info().data.is_none());
        assert!(error.get_info().inner_error.is_none());
    }
    
    #[test]
    fn build_invalid_operation_error() {
        let data = serde_json::json!({
            "key": "value"
        });

        let inner_error = String::from("Inner Error");
        let error = InvalidOperationError::new(
            &String::from("Invalid Operation Error"),
            Some(data),
            Some(&inner_error),
        );
        assert_eq!(error.get_info().error_code, 402);
        assert_eq!(error.get_info().error_description, "Invalid Operation Error");
        assert_eq!(error.get_info().message, "Invalid Operation Error");
        let err_data = error.get_info().data.as_ref().unwrap();
        assert_eq!(err_data.data.get("key").unwrap(), "value");
        assert!(error.get_info().inner_error.as_ref().unwrap().to_string() == inner_error);
    }

    #[test]
    fn serialize_invalid_operation_error() {
        let data = serde_json::json!({
            "key": "value"
        });
        
        let inner_data = serde_json::json!({
            "foo": "bar"
        });

        let msg = String::from("You have tried to perform an invalid operation");

        let inner_inner_error = String::from("Inner Inner Error");

        let inner_error =
            InvalidArgumentError::new(&String::from("Inner Error"), Some(inner_data), Some(&inner_inner_error));

        let error = InvalidOperationError::new(&msg, Some(data), Some(&inner_error));
        let json_string = format!("{}", error);
        let as_json = serde_json::from_str::<serde_json::Value>(&json_string.as_str()).unwrap();
        assert_eq!(*as_json.get("message").unwrap(), msg);
        assert_eq!(*as_json.get("error_code").unwrap(), 402);
        assert_eq!(*as_json.get("name").unwrap(), "Invalid Operation Error");
        let ser_data = as_json.get("data").unwrap();
        assert_eq!(*ser_data.get("key").unwrap(), "value");
        let inner_error = as_json.get("inner_error").unwrap();
        assert_eq!(*inner_error.get("message").unwrap(), "Inner Error");
        let inner_data = inner_error.get("data").unwrap();
        assert_eq!(*inner_data.get("foo").unwrap(), "bar");

        let inner_inner_error = inner_error.get("inner_error").unwrap();
        assert_eq!(inner_inner_error.as_str().unwrap(), inner_inner_error);
    }
}
