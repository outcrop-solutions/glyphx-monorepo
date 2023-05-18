use crate::error::{GlyphxError, GlyphxErrorData};
use backtrace::Backtrace;

pub struct InvalidArgummentErrorData {
    data: serde_json::Value,
}

impl std::fmt::Display for InvalidArgummentErrorData {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", serde_json::to_string(&self.data).unwrap())
    }
}

pub struct InvalidArgumentError<'a> {
    info: GlyphxErrorData<'a, InvalidArgummentErrorData>,
}

impl<'a> GlyphxError<'a, InvalidArgummentErrorData> for InvalidArgumentError<'a> {
    fn get_info(&'a self) -> &'a GlyphxErrorData<InvalidArgummentErrorData> {
        &self.info
    }
}
impl<'a> InvalidArgumentError<'a> {
   pub fn new(
        message: &String,
        data: Option<serde_json::Value>,
        inner_error: Option<&'a dyn std::fmt::Display>,
    ) -> Self {
        InvalidArgumentError {
            info: GlyphxErrorData {
                error_code: 401,
                error_description: String::from("Invalid Argument Error"),
                message: message.clone(),
                data: match data {
                    Some(json) => Some(InvalidArgummentErrorData { data: json }),
                    None => None,
                },
                inner_error: inner_error
                    .map(|err| Box::new(err) as Box<dyn std::fmt::Display + 'a>),
                back_trace: Backtrace::new(),
            },
        }
    }
}

impl std::fmt::Display for InvalidArgumentError<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        GlyphxError::fmt(self, f)
    }
}

#[cfg(test)]
mod invalid_argument_error_tests {
    use super::*;
    use crate::error::unexpected_error::UnexpectedError;
    #[test]
    fn build_invalid_argument_error_with_nones() {
        let error = InvalidArgumentError::new(&String::from("Invalid Argument Error"), None, None);
        assert_eq!(error.get_info().error_code, 401);
        assert_eq!(error.get_info().error_description, "Invalid Argument Error");
        assert_eq!(error.get_info().message, "Invalid Argument Error");
        assert!(error.get_info().data.is_none());
        assert!(error.get_info().inner_error.is_none());
    }
    #[test]
    fn build_invalid_argument_error() {
        let data = serde_json::json!({
            "key": "value"
        });

        let inner_error = String::from("Inner Error");
        let error = InvalidArgumentError::new(
            &String::from("Invalid Argument Error"),
            Some(data),
            Some(&inner_error),
        );
        assert_eq!(error.get_info().error_code, 401);
        assert_eq!(error.get_info().error_description, "Invalid Argument Error");
        assert_eq!(error.get_info().message, "Invalid Argument Error");
        let err_data = error.get_info().data.as_ref().unwrap();
        assert_eq!(err_data.data.get("key").unwrap(), "value");
        assert!(error.get_info().inner_error.as_ref().unwrap().to_string() == "Inner Error");
    }

    #[test]
    fn serialize_invalid_argument_error() {
        let data = serde_json::json!({
            "key": "value"
        });

        let msg = String::from("You have supplied an invalid argument");

        let inner_inner_error = String::from("Inner Inner Error");

        let inner_error =
            UnexpectedError::new(&String::from("Inner Error"), None, Some(&inner_inner_error));

        let error = InvalidArgumentError::new(&msg, Some(data), Some(&inner_error));
        let json_string = format!("{}", error);
        let as_json = serde_json::from_str::<serde_json::Value>(&json_string.as_str()).unwrap();
        assert_eq!(*as_json.get("message").unwrap(), msg);
        assert_eq!(*as_json.get("error_code").unwrap(), 401);
        assert_eq!(*as_json.get("name").unwrap(), "Invalid Argument Error");
        let ser_data = as_json.get("data").unwrap();
        assert_eq!(*ser_data.get("key").unwrap(), "value");
        let inner_error = as_json.get("inner_error").unwrap();
        assert_eq!(*inner_error.get("message").unwrap(), "Inner Error");
        let inner_inner_error = inner_error.get("inner_error").unwrap();
        assert_eq!(inner_inner_error.as_str().unwrap(), inner_inner_error);
    }
}
