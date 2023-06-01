//! This moodule contains utility functions for manipulating json 
//! objects and json strings.

/// In our error handling, we use std::fmt::Display to serialize
/// our erros into strings.  Using std::fmt::Display allows us to
/// use any type that implements std::fmt::Display as the inner
/// error.  This is a very flexible approach, but it has one
/// drawback.  The inner errors are brought into the error message
/// as JSON strings.  To convert these to parsable objects, we 
/// need to do some cleanup on the strings.  This function does
/// that cleanup.
pub fn clean_json_string(input: String) -> String {
    input.replace("{{", "_d_b_")
        .replace("}}", "_b_d_")
        .replace("\\\"", "\"")
        .replace("\"{", "{")
        .replace("}\"", "}")
        .replace("\\", "")
        .replace("_d_b_", "{{")
        .replace("_b_d_", "}}")
}


#[cfg(test)]
mod json_functions_tests {
 use super::*;

 #[test]
 fn test_clean_json_string() {
     let input = "{{}}\\\" \"{ }\" \\".to_string(); 
     let expected = "{{}}\" { } ".to_string();
     let actual = clean_json_string(input);
     assert_eq!(expected, actual);
 }
}

