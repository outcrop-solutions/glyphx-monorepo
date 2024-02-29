/// This macro is used to handle functions that return Result<T, E>  in a consistent way.
/// If a code block returns the Result::Err(E) variant, the emited code will unwrap the error
/// and convert it to the supplied error type using the From trait.  There is also an
/// optional log level parameter which will log the error at the specified level.  Some exmaples of
/// using this macro are:
///handle_error! (let x = foo(1,2,5); Error, fatal)
///handle_error! (let x = foo(1,2,5); Error)
///handle_error!(let x_field_definition = self.parameters.get_field_definition("xaxis"); GlyphEngineProcessError::from_get_field_definition_error("xaxis"), error);
///If the call to foo is an error, the error will be converted to an Error and returned.  If the log
///level is specified, the error will also be logged at the specified level.
///The macro will also unwrap the result of the call to foo and assign it to the variable x.  If the
///call to foo is successful, the variable x will be assigned the result of the call to foo.
macro_rules! handle_error {
    //In this pattern, the error will be passed to the $function_name as the first argument.
    //The $functions_arguments will be passed as the second argument.
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident ($functions_arguments:expr ), $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::$function_name(error, $functions_arguments);
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident (), $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::$function_name(error);
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident ($functions_arguments:expr )) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::$function_name(error, $functions_arguments);
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident ()) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::$function_name(error);
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $error_type: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::from(error);
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    //glyphx_error! (let x = foo(1,2,5); Error, fatal)
    (let $var_name:ident = $express : expr; $error_type: ident, $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::from(error);
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
}
