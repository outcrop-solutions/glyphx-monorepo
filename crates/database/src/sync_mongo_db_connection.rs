use glyphx_core::SecretBoundSingleton;
use mockall::automock;
use async_trait::async_trait;
use mongodb::sync::{Client, Database};
use crate::errors::MongoDbConnectionConstructionError;
use glyphx_core::SecretBoundError;
use mongodb::error::ErrorKind;

#[automock]
#[async_trait]
trait SyncMongoDbConnectionOps {
    async fn build_mongodb_connection(
        &self,
        endpoint: String,
        database_name: String,
        username: String,
        password: String,
    ) -> SyncMongoDbConnection;
}



#[derive(SecretBoundSingleton, Debug, Clone)]
#[secret_binder({"secret_name" : "db/mongodb", "initializer": "new", "initializer_error": "MongoDbConnectionConstructionError"})]
pub struct SyncMongoDbConnection {
    endpoint: String,
    #[bind_field({"secret_name" : "schema" })]
    database_name: String,
    #[bind_field({"secret_name" : "user" })]
    username: String,
    password: String,
    #[bind_field({"is_bound": false})]
    pub client: Client,
    #[bind_field({"is_bound": false})]
    pub database: Database,
}

impl SyncMongoDbConnection {
    pub async fn new<T>(
        endpoint: String,
        database_name: String,
        username: String,
        password: String,
    ) -> Result<Self, T> 
     where T : SecretBoundError + From<ErrorKind> {
        let client = Self::new_impl(endpoint, database_name, username, password).await;
        if client.is_err() {
            let err : T = client.err().unwrap();
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
     where T : SecretBoundError + From<ErrorKind> {
        let uri = format!(
            "mongodb+srv://{}:{}@{}?retryWrites=true&w=majority",
            username, password, endpoint
        );
        let client = Client::with_uri_str(uri);
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
        let check_results = database.list_collection_names(None);
        if check_results.is_err() {
            let err = check_results.err().unwrap();
            let err = *err.kind;
            let err = T::from(err);
            return Err(err)
        }
        let check_results = check_results.unwrap();
        if check_results.len() == 0 {
            let err = T::from_str("ServerSelectionError", glyphx_core::GlyphxErrorData::new(
                "The database does not contain any collections.  This is likely due to an incorrect database name.".to_string(),
                None,
                None,
            ));
            return Err(err);
        }
        Ok(SyncMongoDbConnection {
            endpoint,
            database_name,
            username,
            password,
            client,
            database,
        })
    }
}
