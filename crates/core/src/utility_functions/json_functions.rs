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

