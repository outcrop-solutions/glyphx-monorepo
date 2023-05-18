//!This module contains the base error handiling structures 
//!and traits for Glyphx applications.  It also exposes 
//!a standard set of errors that can be used across all 
//!applications.  Application specific errors should 
//!be defined within the binaries or libraries themselves.
use backtrace::Backtrace;
use serde_json;
use serde_derive::{Deserialize, Serialize};

 mod unexpected_error;
 mod invalid_argument_error;
 mod invalid_operation_error;

 pub use unexpected_error::UnexpectedError;
 pub use invalid_argument_error::InvalidArgumentError;
 pub use invalid_operation_error::InvalidOperationError;

 ///This internal structure is used to coerce the errors
 ///in a JSON friendly format which can then be serialized 
 ///to a JSON string.
#[derive(Debug, Serialize, Deserialize)]
 struct ErrorAsLog {
     name: String,
     error_code: u16,
     message: String,
     stack_trace: Vec<String>,
     data: Option<String>,
     inner_error: Option<String>,
 }


/// A generlized data structure for storing error information
/// which defiens common fields so that errors can be logged
/// in a consistent manner.
pub struct GlyphxErrorData<'a, T:std::fmt::Display> {
    ///A message which provides a high level description of the error
    pub message:  String,
    ///A backtrace which provides a stack trace of the error
    pub back_trace:  Backtrace,
    ///A standardized error code to identify the type of error
    pub error_code: u16,
    ///A Human readable description of the error
    pub error_description: String,
    ///An optional data field which can be used by implementors to 
    ///provide additional context about the error
    pub data: Option<T>,
    ///An optional inner error which can be used to
    ///provide additional context about the error.  This 
    ///implements the Display trait so that it can be easily
    ///converted to a string for logging.
    pub inner_error: Option<Box<dyn std::fmt::Display +'a>>,
}
 
///A trait which provides a common interface for working 
///with errors.  Any errors that are generated bt Glyphx 
///programs should implement this trait.
pub trait GlyphxError<'a, T: 'a + std::fmt::Display>   {
    ///Returns a reference to the error data.  Since this can be 
    ///specific to the type of error, it is 
    ///implemented in the specific error types.
    fn get_info(&'a self) -> &'a GlyphxErrorData<T>;
    ///All errors get_info will return a GlyphxErrorData struct
    ///which contains common fields.  This method returns the
    ///message field from the GlyphxErrorData struct.
    fn message(&'a self) -> &'a str {
        &self.get_info().message
    }
    ///All errors get_info will return a GlyphxErrorData struct
    ///which contains common fields.  This method returns the
    ///backtrace field from the GlyphxErrorData struct. It is 
    ///the responsibility of the error to generate the backtrace.
    fn get_back_trace(&'a self) -> &'a Backtrace {
        &self.get_info().back_trace
    }

    ///All errors get_info will return a GlyphxErrorData struct
    ///which contains common fields.  This method returns the
    ///the backtrace as a string.
    fn get_backtrace_as_string(&'a self) -> String {
        format!("{:?}", self.get_back_trace())
    }
    ///All errors get_info will return a GlyphxErrorData struct
    ///which contains common fields.  This method returns the
    ///the backtrace as a vector of strings.
    fn get_backtrace_as_vec(&'a self) -> Vec<String> {
        let str = self.get_backtrace_as_string();
        str.split("\n").map(|s| s.to_string()).collect()
    }
    ///All errors get_info will return a GlyphxErrorData struct
    ///which contains common fields.  As part of this structure, 
    ///a structure implementing this trait can define data to 
    ///include in the error and subsequent logging.  This data 
    ///must include the std::fmt::Display trait so that it can
    ///be converted to a string for logging.
    fn get_data(&'a self) -> Option<String> {
        match &self.get_info().data {
            Some(data) => Some(data.to_string()),
            None => None,
        }
    }
   ///Our standard formatting function.  This formatter will review 
   ///data stored in the GlyphxErrorData struct and format it as a string for logging.
   fn fmt(&'a self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
       let error_as_log = ErrorAsLog {
            name: self.get_info().error_description.clone(),
            error_code: self.get_info().error_code,
            message: self.get_info().message.clone(),
            stack_trace: self.get_backtrace_as_vec(),
            data: self.get_data(),
            inner_error: match &self.get_info().inner_error {
                Some(inner_error) => Some(inner_error.to_string()),
                None => None,
            },
        };
        //The inne_errors are coming back as strings, so we need to clean them up to make them
        //JSON.
        let json = serde_json::to_value(&error_as_log).unwrap().to_string().replace("{{", "_d_b_").replace("}}", "_b_d_").replace("\"{", "{").replace("}\"", "}").replace("\\", "").replace("_d_b_", "{{" ).replace("_b_d_", "}}"); 

        write!(f, "{}", json)
    }

}

