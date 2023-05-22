//! This module defines the InvalidArgumentError which should
//! be used to denote errors that occur because of the value of
//! the arguments passed to a function.
use crate::error::{GlyphxError, GlyphxErrorData};
use backtrace::Backtrace;

///This structure defines the internal data that will be used to
///store information about the the arguments that are in error.
///This structure will implement the std::fmt::Display trait
///so that the values can be asily serialized to a json string
struct InvalidArgummentErrorData {
    ///The internal data that provides additional context about the
    ///arguments that caused the error.
    data: serde_json::Value,
}

///The implementation of the std::fmt::Display trait that serializes
///the internal data to a json string.
impl std::fmt::Display for InvalidArgummentErrorData {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", serde_json::to_string(&self.data).unwrap())
    }
}

///This structure defines the InvalidArgumentError which should
///be used to denote errors that occur because of the value of
///the arguments passed to a function.  For example a function
///expects values in the range of 1..=10 and the value passed is 11.  
pub struct InvalidArgumentError<'a> {
    ///The internal data structure that contains the error information.
    ///that will be returned by the implementation of the
    ///GlyphxError::get_info() method.
    info: GlyphxErrorData<'a, InvalidArgummentErrorData>,
}

///The implementation of the GlyphxError trait for the InvalidArgumentError
impl<'a> GlyphxError<'a, InvalidArgummentErrorData> for InvalidArgumentError<'a> {
    ///The implementation of the GlyphxError::get_info() method that
    ///returns a reference to the internal error data structure.
    fn get_info(&'a self) -> &'a GlyphxErrorData<InvalidArgummentErrorData> {
        &self.info
    }

    fn publish(&'a self) -> String {
        GlyphxError::internal_publish(self)
    }
}

///The implementation of our InvalidArgumentError.
impl<'a> InvalidArgumentError<'a> {
    ///The constructor for the InvalidArgumentError
    ///#Arguments
    ///* message - a message that describes the error.
    ///* data - optional data that provides additional
    ///context about the error.  If no data is passed, then pass None.
    ///* `inner_error` - An optional inner error.  This is useful when an error is
    ///   wrapped by another error.  If no inner error is provided, then
    ///   None should be passed.
    pub fn new(
        message: &String,
        data: Option<serde_json::Value>,
        inner_error: Option<&'a dyn std::fmt::Display>,
    ) -> Self {
        InvalidArgumentError {
            info: GlyphxErrorData::new(
                message,
                401,
                &String::from("Invalid Argument Error"),
                match data {
                    Some(json) => Some(InvalidArgummentErrorData { data: json }),
                    None => None,
                },
                inner_error.map(|err| Box::new(err) as Box<dyn std::fmt::Display + 'a>),
            ),
        }
    }
}
///The implementation of std::fmt::Display for the
///InvalidArgumentError.  This allows the error to be
///serialized to a json string.  This implementation
///uses the GlyphxError::fmt() method to serialize the
///error.
impl std::fmt::Display for InvalidArgumentError<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // let ss: &mut InvalidArgumentError = unsafe { std::mem::transmute(self) };

         GlyphxError::fmt(self, f)
    }
}

#[cfg(test)]
mod invalid_argument_error_tests {
    use super::*;
    use crate::error::unexpected_error::UnexpectedError;
    #[ignore]
    #[test]
    fn build_invalid_argument_error_with_nones() {
        let error = InvalidArgumentError::new(&String::from("Invalid Argument Error"), None, None);
        assert_eq!(error.get_info().error_code, 401);
        assert_eq!(error.get_info().error_description, "Invalid Argument Error");
        assert_eq!(error.get_info().message, "Invalid Argument Error");
        assert!(error.get_info().data.is_none());
        assert!(error.get_info().inner_error.is_none());
    }
    #[ignore]
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
    #[ignore]
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
