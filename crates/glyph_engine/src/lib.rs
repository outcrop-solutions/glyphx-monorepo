pub mod types;
pub mod errors;

pub use errors::*;

use glyphx_common::{AthenaConnection, Heartbeat, S3Connection};
use glyphx_database::MongoDbConnection;
use glyphx_core::{Singleton, ErrorTypeParser};

//glyphx_error! (let x = foo(1,2,5); Error, fatal)
macro_rules! handle_error {
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

pub use types::*;
use types::vectorizer_parameters::VectorizerParameters;

pub struct GlyphEngine {
   parameters: VectorizerParameters,
}

impl GlyphEngine {
   //We are assuming that the function which calls GlyphEngine has already checked that the parameters are valid and loaded them from a JSON string.
   pub async fn new(parameters: &VectorizerParameters) -> Self {
      let _ = Self::init().await;
      GlyphEngine {
         parameters: parameters.clone(),
      } 
   }
   async fn init() -> Result<(), GlyphEngineInitError> {
       
     handle_error!(let _result = S3Connection::build_singleton().await; GlyphEngineInitError, fatal);
     handle_error!(let _result = AthenaConnection::build_singleton().await; GlyphEngineInitError, fatal);
     handle_error!(let _result = MongoDbConnection::build_singleton().await; GlyphEngineInitError, fatal);
     //1 minute heartbeat
     let mut heartbeat = Heartbeat::new("GlyphEngine".to_string(), 60000);
     handle_error!(let _result = heartbeat.start().await; GlyphEngineInitError, fatal); 
     Ok(())
   }

   pub async fn process(&self) -> Result<(), ()> {
      Ok(())
   }
}

