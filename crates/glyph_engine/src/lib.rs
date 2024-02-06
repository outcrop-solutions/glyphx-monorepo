pub mod types;
pub mod errors;
pub mod vector_processer;

use std::sync::mpsc::Receiver;
use std::thread::JoinHandle;


use glyphx_common::{AthenaConnection, Heartbeat, S3Connection};
use glyphx_database::MongoDbConnection;
use glyphx_core::{Singleton, ErrorTypeParser};

use async_trait::async_trait;
use mockall::automock;

pub use errors::*;
pub use types::*;
use types::vectorizer_parameters::VectorizerParameters;


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
    (let $var_name:ident = $express : expr; $error_type: ident::$function_name: ident ($functions_arguments:expr )) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            let error = $error_type::$function_name(error, $functions_arguments);
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
            let error = $var_name.unwrap_err();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
    (let $var_name:ident = $express : expr; $log_level: ident) => {
        let $var_name = $express;
        if $var_name.is_err() {
            let error = $var_name.unwrap_err();
            error.$log_level();
            return Err(error);
        }
        let $var_name = $var_name.unwrap();
    };
}

#[automock]
#[async_trait]
trait GlyphEngineOperations {
   async fn build_s3_connection(&self) -> Result<&'static S3Connection, GlyphEngineInitError>; 
   async fn build_athena_connection(&self) -> Result<&'static AthenaConnection, GlyphEngineInitError>;
   async fn build_mongo_connection(&self) -> Result<&'static MongoDbConnection, GlyphEngineInitError>;
   async fn build_heartbeat(&self) -> Result<Heartbeat, GlyphEngineInitError>;
}

struct GlyphEngineOperationsImpl;

#[async_trait]
impl GlyphEngineOperations for GlyphEngineOperationsImpl {
   async fn build_s3_connection(&self) -> Result<&'static S3Connection, GlyphEngineInitError> {
      handle_error!(let s3_connection = S3Connection::build_singleton().await; GlyphEngineInitError);
      Ok(s3_connection)
   }
   async fn build_athena_connection(&self) -> Result<&'static AthenaConnection, GlyphEngineInitError> {
      handle_error!(let athena_connection = AthenaConnection::build_singleton().await; GlyphEngineInitError);
      Ok(athena_connection)
   }
   async fn build_mongo_connection(&self) -> Result<&'static MongoDbConnection, GlyphEngineInitError> {
      handle_error!(let mongo_db_connection = MongoDbConnection::build_singleton().await; GlyphEngineInitError);
      Ok(mongo_db_connection)
   }
   async fn build_heartbeat(&self) -> Result<Heartbeat, GlyphEngineInitError> {
      //1 minute heartbeat
      let mut heartbeat = Heartbeat::new("GlyphEngine".to_string(), 60000);
      handle_error!(let _result = heartbeat.start().await; GlyphEngineInitError); 
      Ok(heartbeat)
   }
}
pub struct GlyphEngine {
   parameters: VectorizerParameters,
   heartbeat: Heartbeat,
   mongo_connection: &'static MongoDbConnection,
   athena_connection: &'static AthenaConnection,
   s3_connection: &'static S3Connection,
}

impl GlyphEngine {
   //We are assuming that the function which calls GlyphEngine has already checked that the parameters are valid and loaded them from a JSON string.
   pub async fn new(parameters: &VectorizerParameters) -> Result<GlyphEngine, GlyphEngineInitError> {
      let result = Self::init().await;
      if result.is_err() {
         let error = result.unwrap_err();
         return Err(error);
      }
      let (heartbeat, s3_connection, athena_connection, mongo_connection) = result.unwrap();
      Ok(GlyphEngine {
         parameters: parameters.clone(),
         heartbeat,
         s3_connection,
         athena_connection,
         mongo_connection,
      } )
   }


   async fn init() -> Result<(Heartbeat, &'static S3Connection, &'static AthenaConnection, &'static MongoDbConnection), GlyphEngineInitError> {
      Self::init_impl(&GlyphEngineOperationsImpl).await
   }

   async fn init_impl<T: GlyphEngineOperations>(operations: &T) -> Result<(Heartbeat, &'static S3Connection, &'static AthenaConnection, &'static MongoDbConnection), GlyphEngineInitError> {
       
     pass_error!(let s3_connection = operations.build_s3_connection().await; error);
     pass_error!(let athena_connection = operations.build_athena_connection().await; error);
     pass_error!(let mongo_db_connection = operations.build_mongo_connection().await; error);
     pass_error!(let heartbeat = operations.build_heartbeat().await; error); 
     Ok((heartbeat, s3_connection, athena_connection, mongo_db_connection))
   }

   ///Returns a receiver and the thread handle for the thread that will process 
   ///the vectorization request.
   // fn process_single_vector(&self, field_definition: &FieldDefinition) -> (ThreadHandle, Receiver<Result<(), GlyphEngineProcessError>>) {
   //    let (sender, receiver) = channel();
   //    let thread_handle = thread::spawn(move || {
   //       let result = self.process_single_vector_impl(field_definition);
   //       sender.send(result);
   //    });
   //    (thread_handle, receiver)

   // }
   fn process_vectors(&self) -> Result<(), GlyphEngineProcessError> {
       //1. Build the vector/rank tables tables -- 1 for each vertex  
       handle_error!(let x_field_definition = self.parameters.get_field_definition("xaxis"); GlyphEngineProcessError::from_get_field_definition_error("xaxis"), error);
       handle_error!(let y_field_definition = self.parameters.get_field_definition("yaxis"); GlyphEngineProcessError::from_get_field_definition_error("yaxis"), error);
       handle_error!(let z_field_definition = self.parameters.get_field_definition("zaxis"); GlyphEngineProcessError::from_get_field_definition_error("zaxis"), error);
       Ok(())
   }
   async fn process(&self) -> Result<(), GlyphEngineProcessError> {
       //1. Build the vector/rank tables tables -- 1 for each vertex  
       handle_error!(let x_field_definition = self.parameters.get_field_definition("xaxis"); GlyphEngineProcessError::from_get_field_definition_error("xaxis"), error);
       handle_error!(let y_field_definition = self.parameters.get_field_definition("yaxis"); GlyphEngineProcessError::from_get_field_definition_error("yaxis"), error);
       handle_error!(let z_field_definition = self.parameters.get_field_definition("zaxis"); GlyphEngineProcessError::from_get_field_definition_error("zaxis"), error);
       Ok(())
   }
}

