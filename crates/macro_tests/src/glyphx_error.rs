
#[cfg(test)]
mod glyphx_error {
    use glyphx_core::GlyphxError;
    use glyphx_core::GlyphxErrorData;
    use serde_json::{json, from_str, Value};
    use cool_asserts::assert_panics;
    #[derive(GlyphxError)]
    #[error_definition("UnitTest")]
    enum ConstructorError {
        FileNotFound(GlyphxErrorData),
        UnexpectedError(GlyphxErrorData),
    }


    #[test]
    fn file_not_found() {

        let inner_error = json!({
            "msg": "I am some inner data that could have come from anywhere",
            "foo": "bar",
            "bar" : "baz"
       });
       let error = ConstructorError::FileNotFound(GlyphxErrorData::new(
            String::from("The file foo was not found"),
            Some(json!({
                "fileName": "foo",
            })),
            Some(inner_error),
        ));
        //We can test the call to our log levels, but in a unit test, we do not want to configure
        //logiing.  In essence, this will ensure that our trait is properly exposed and callable 
        //we have to trust that logging is working as it is expected to.
       error.trace(); 
       error.debug();
       error.info();
       error.warn();
       error.error();
       assert_panics!(error.fatal());
        let error = error.to_string();

        let error_json = from_str::<Value>(&error);
        assert!(error_json.is_ok());
        let error_json = error_json.unwrap();
        assert_eq!(error_json["error"], "FileNotFound");
        assert_eq!(error_json["errorType"], "ConstructorError");
        assert_eq!(error_json["module"], "UnitTest");
        assert_eq!(error_json["glyphxErrorData"]["message"], "The file foo was not found");
        assert_eq!(error_json["glyphxErrorData"]["data"]["fileName"], "foo");
        assert_eq!(error_json["glyphxErrorData"]["innerError"]["msg"], "I am some inner data that could have come from anywhere");
        assert_eq!(error_json["glyphxErrorData"]["innerError"]["foo"], "bar");
        assert_eq!(error_json["glyphxErrorData"]["innerError"]["bar"], "baz");

    }

    #[test]
    fn unexpected_error() {
       let inner_error = json!({
            "msg": "I am some inner data that could have come from anywhere",
            "foo": "bar",
            "bar" : "baz"
       });
       let error = ConstructorError::UnexpectedError(GlyphxErrorData::new(
            String::from("The file foo was not found"),
            Some(json!({
                "fileName": "foo",
            })),
            Some(inner_error),
        ));
        let error = error.to_string();

        let error_json = from_str::<Value>(&error);
        assert!(error_json.is_ok());
        let error_json = error_json.unwrap();
        assert_eq!(error_json["error"], "UnexpectedError");
        assert_eq!(error_json["errorType"], "ConstructorError");
        assert_eq!(error_json["module"], "UnitTest");
        assert_eq!(error_json["glyphxErrorData"]["message"], "The file foo was not found");
        assert_eq!(error_json["glyphxErrorData"]["data"]["fileName"], "foo");
        assert_eq!(error_json["glyphxErrorData"]["innerError"]["msg"], "I am some inner data that could have come from anywhere");
        assert_eq!(error_json["glyphxErrorData"]["innerError"]["foo"], "bar");
        assert_eq!(error_json["glyphxErrorData"]["innerError"]["bar"], "baz");

    }
}
