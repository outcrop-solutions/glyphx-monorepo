use crate::errors::{MongoDbConnectionConstructionError, MongoDbInitializationError};
use async_trait::async_trait;
use glyphx_core::SecretBoundError;
use glyphx_core::{GlyphxErrorData, SecretBoundSingleton};
use mockall::automock;
use mongodb::error::ErrorKind;

#[automock]
#[async_trait]
trait MongoDbConnectionOps {
    async fn build_mongodb_connection(
        &self,
        endpoint: String,
        database_name: String,
        username: String,
        password: String,
    ) -> MongoDbConnection;
}

#[derive(SecretBoundSingleton, Debug, Clone)]
#[secret_binder({"secret_name" : "db/mongodb", "initializer": "new", "initializer_error": "MongoDbConnectionConstructionError"})]
pub struct MongoDbConnection {
    endpoint: String,
    #[bind_field({"secret_name" : "schema" })]
    database_name: String,
    #[bind_field({"secret_name" : "user" })]
    username: String,
    password: String,
    #[bind_field({"is_bound": false})]
    client: Option<mongodb::Client>,
    #[bind_field({"is_bound": false})]
    database: Option<mongodb::Database>,
}

impl MongoDbConnection {
    pub fn get_client(&self) -> Result<&mongodb::Client, MongoDbInitializationError> {
        if self.client.is_none() {
            let error_data = GlyphxErrorData::new(
                "The client has not been initialized.".to_string(),
                None,
                None,
            );
            let err = MongoDbInitializationError::ClientNotInitialized(error_data);
            return Err(err);
        }
        Ok(&self.client.as_ref().unwrap())
    }
    pub fn get_database(&self) -> Result<&mongodb::Database, MongoDbInitializationError> {
        if self.database.is_none() {
            let error_data = GlyphxErrorData::new(
                "The database has not been initialized.".to_string(),
                None,
                None,
            );
            let err = MongoDbInitializationError::DatabaseNotInitialized(error_data);
            return Err(err);
        }
        Ok(&self.database.as_ref().unwrap())
    }
    pub async fn new<T>(
        endpoint: String,
        database_name: String,
        username: String,
        password: String,
    ) -> Result<Self, T>
    where
        T: SecretBoundError + From<ErrorKind>,
    {
    
        let client = Self::new_impl::<T>(endpoint, database_name, username, password).await;
        if client.is_err() {
            let err = client.err().unwrap();
            err.error();
            return Err(err);
        }
        Ok(client.unwrap())
    }
    //Mongo has made it difficult to test this, so we are going to have an impl function that will
    //return a Result<Self, MongoDbConnectionConstructionError>.  This way we can test the error
    //mapping in our integration tests.  Then the actual new call will panic.  We know that
    //error.fatal() will panic, calling to_string() on the error so all we will really need to
    //test is that new panics.
    pub async fn new_impl<T>(
        endpoint: String,
        database_name: String,
        username: String,
        password: String,
    ) -> Result<Self, T>
    where
        T: SecretBoundError + From<ErrorKind>,
    {
        let uri = format!(
            "mongodb+srv://{}:{}@{}?retryWrites=true&w=majority",
            username, password, endpoint
        );
        let client = mongodb::Client::with_uri_str(uri).await;
        if client.is_err() {
            let err = client.err().unwrap();
            let err = *err.kind.clone();
            let err = T::from(err);
            return Err(err);
        }
        let client = client.unwrap();
        let database = client.database(database_name.as_str());

        //Our database should have at least one collection in it.  This is the only way to check if
        //our parameters are correct.  So we will either get some type of mongodb error or an empty
        //vector.
        let check_results = database.list_collection_names(None).await;
        if check_results.is_err() {
            let err = check_results.err().unwrap();
            let err = *err.kind;
            let err = T::from(err);
            return Err(err);
        }
        let check_results = check_results.unwrap();
        if check_results.len() == 0 {
            let err =  T::from_str("ServerSelectionError", glyphx_core::GlyphxErrorData::new(
                "The database does not contain any collections.  This is likely due to an incorrect database name.".to_string(),
                None,
                None,
            ));
            return Err(err);
        }
        Ok(MongoDbConnection {
            endpoint,
            database_name,
            username,
            password,
            client: Some(client),
            database: Some(database),
        })
    }
}

impl Default for MongoDbConnection {
    fn default() -> Self {
        Self {
            endpoint: "".to_string(),
            database_name: "".to_string(),
            username: "".to_string(),
            password: "".to_string(),
            client: None,
            database: None,
        }
    }
}
