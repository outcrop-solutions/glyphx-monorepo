//!This file defines the UnexpectedError type.  
//!This is a generic error type that can be
//!used if another more appropriate error does not exist.
use crate::error::{GlyphxError, GlyphxErrorData};
use backtrace::Backtrace;
///This structure defines a generic UnexpectedError type
///which can be used to return errors from functions that
///do not have a more specified error type.
pub struct UnexpectedError<'a> {
    ///The error data which contains the common fields.
    ///This is specific to errors that implement the
    ///[GlyphxError](../trait.GlyphxError.html) trait.
    ///This is what is returned by the [get_info](../trait.GlyphxError.html#tymethod.get_info) method.
    info: GlyphxErrorData<'a, String>,
}

///Our implementation of the [GlyphxError](../trait.GlyphxError.html) trait.  
///This will most likely change, but for now we are defining
///the data as a string. Really any type that implements
///std::fmt::Display will work.
impl<'a> GlyphxError<'a, String> for UnexpectedError<'a> {
    ///Out implementation of the [get_info](../trait.GlyphxError.html#tymethod.get_info) method
    fn get_info(&'a self) -> &'a GlyphxErrorData<String> {
        &self.info
    }
    fn publish(&'a self) -> String {
        GlyphxError::internal_publish(self)
    }
}

///This trait provides methods specific to our UnexpectedError
///type.  Each error type is free to create their own
///implementations, but for general purposes, a new method
///to create an error in strongly encouraged.
impl<'a> UnexpectedError<'a> {
    ///Builds a new UnexpectedError
    ///# Arguments
    ///* `message` - A message that describes the error.
    ///* `data` - Any optional data that may be useful in diagnosing the error.
    ///   If no data is provided, then None should be passed.
    ///* `inner_error` - An optional inner error.  This is useful when an error is
    ///   wrapped by another error.  If no inner error is provided, then
    ///   None should be passed.
    pub fn new(
        message: &String,
        data: Option<String>,
        inner_error: Option<&'a dyn std::fmt::Display>,
    ) -> Self {
        UnexpectedError {
            info: GlyphxErrorData::new(
                message,
                999,
                &String::from("Unexpected Error"),
                data,
                inner_error.map(|err| Box::new(err) as Box<dyn std::fmt::Display + 'a>),
            ),
        }
    }
}

///This trait provides the implementation of the std::fmt::Display trait
///This is required so that our error can be converted to a string so that
///it can be logged.  If you are creating your own error type, you will need
///to copy this implementation or impliment your own fmt method.  This
///implementation uses the default formatter provided by the [GlyphxError](../trait.GlyphxError.html) trait.
impl<'a> std::fmt::Display for UnexpectedError<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
         GlyphxError::fmt(self, f)
    }
}

#[cfg(test)]
mod unexpected_error_tests {
    use super::*;
    use crate::utility_functions::json_functions::clean_json_string;
    #[test]
    fn build_unexpected_error() {
        let msg = String::from("An unexpected error has occurred");
        let inner_error = String::from("I am the inner inner error");
        let err = UnexpectedError::new(&msg, Some(String::from("Some data")), Some(&inner_error));
        assert_eq!(err.message(), msg);
        assert_eq!(err.get_info().error_code, 999);
        assert_eq!(err.get_info().error_description, "Unexpected Error");
        let str_trace = err.get_backtrace_as_string();
        assert!(!str_trace.is_empty());

        let data = if let Some(value) = err.get_data() {
            value
        } else {
            String::from("")
        };
        assert_eq!(data, "Some data");

        let vec_trace = err.get_backtrace_as_vec();
        assert!(vec_trace.len() > 0);
    }
    #[test]
    fn serialize_unexpected_error() {
        let msg = String::from("An unexpected error has occurred");
        let inner_inner_error = String::from("I am the inner inner error");
        let inner_error = UnexpectedError::new(
            &String::from("I am the inner error"),
            Some(String::from("Some data")),
            Some(&inner_inner_error),
        );
        let err = UnexpectedError::new(&msg, Some(String::from("Some data")), Some(&inner_error));

        let serilized_as_json_string = format!("{}", err);
        let serilized_as_json_string = clean_json_string(serilized_as_json_string);
        assert!(!serilized_as_json_string.is_empty());
        let as_json =
            serde_json::from_str::<serde_json::Value>(&serilized_as_json_string.as_str()).unwrap();
        assert_eq!(*as_json.get("message").unwrap(), msg);
        assert_eq!(*as_json.get("error_code").unwrap(), 999);
        assert_eq!(*as_json.get("name").unwrap(), "Unexpected Error");
        assert_eq!(*as_json.get("data").unwrap(), "Some data");
        let inner_error_obj = as_json.get("inner_error").unwrap();
        assert_eq!(
            *inner_error_obj.get("message").unwrap(),
            "I am the inner error"
        );
        let inner_inner_error_obj = inner_error_obj.get("inner_error").unwrap();
        assert!(inner_inner_error_obj.is_string());
        assert_eq!(inner_inner_error_obj.as_str().unwrap(), inner_inner_error);
    }
}
