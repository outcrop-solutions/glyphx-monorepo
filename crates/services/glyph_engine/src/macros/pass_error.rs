/// This macro is used to handle the unwraping of Result<T, E> in a standard way.
/// This macro is similar to handle_error except that it does not convert the error to a different
/// type.  If a code block returns the Result::Err(E)variant, the emitted core will unwrap the
/// error and return it.  There is also an optional log level parameter which will log the error
/// at the specified level.  Some exmaples of using this macro are:
///glyphx_error! (let x = foo(1,2,5); fatal)
///glyphx_error! (let x = foo(1,2,5); )
///If the call to foo is an error, the error will be returned.  If the log level is specified, the
///error will also be logged at the specified level.
///The macro will also unwrap the result of the call to foo and assign it to the variable x.  If the
///call to foo is successful, the variable x will be assigned the result of the call to foo.
macro_rules! pass_error {
    (let $var_name:ident = $express : expr; ) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.err().unwrap();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.err().unwrap();
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
}
