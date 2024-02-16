use crate::errors::{MongoDbConnectionConstructionError, MongoDbInitializationError};
use glyphx_core::{GlyphxErrorData, SyncSecretBoundSingleton};
use mockall::automock;

use mongodb::sync::{Client, Database};
#[automock]
trait MongoDbConnectionOps {
    fn build_mongodb_connection(
        &self,
        uri: &str
    ) -> Result<Option<Client>, MongoDbConnectionConstructionError>;

    fn get_database(&self, client: &Option<Client>, database_name: &str) -> Option<Database>;
    fn validate_database(&self, database: &Option<Database>) -> Result<(), MongoDbConnectionConstructionError>;
}

struct MongoDbConnectionOpsImpl;
impl MongoDbConnectionOps for MongoDbConnectionOpsImpl {
    fn build_mongodb_connection(
        &self,
        uri: &str
    ) -> Result<Option<Client>, MongoDbConnectionConstructionError> {
        let client = Client::with_uri_str(uri);
        if client.is_err() {
            let err = client.err().unwrap();
            let err = *err.kind.clone();
            let err = MongoDbConnectionConstructionError::from(err);
            return Err(err);
        }
        let client = client.unwrap();
        Ok(Some(client))
    }

    fn get_database(&self, client: &Option<Client>, database_name: &str) -> Option<Database> {
        if client.is_none() {
            return None;
        }
        let client = client.as_ref().unwrap();
        let database = client.database(database_name);
        Some(database)
    }
    fn validate_database(&self, database: &Option<Database>) -> Result<(), MongoDbConnectionConstructionError> {
        if database.is_none() {
            let err = MongoDbConnectionConstructionError::from_str("ServerSelectionError", GlyphxErrorData::new("The database is not initialized.".to_string(), None, None));
            return Err(err);

        }
        let database = &database.as_ref().unwrap();
        let check_results = database.list_collection_names(None);
        if check_results.is_err() {
            let err = check_results.err().unwrap();
            let err = *err.kind;
            let err = MongoDbConnectionConstructionError::from(err);
            return Err(err);
        }
        let check_results = check_results.unwrap();
        if check_results.len() == 0 {
            let err =  MongoDbConnectionConstructionError::from_str("ServerSelectionError", glyphx_core::GlyphxErrorData::new(
                "The database does not contain any collections.  This is likely due to an incorrect database name.".to_string(),
                None,
                None,
            ));
            return Err(err);
        }

        Ok(())
    }
}

#[derive(SyncSecretBoundSingleton, Debug, Clone)]
#[secret_binder({"secret_name" : "db/mongodb", "initializer": "new", "initializer_error": "MongoDbConnectionConstructionError"})]
pub struct SyncMongoDbConnection {
    endpoint: String,
    #[bind_field({"secret_name" : "schema" })]
    database_name: String,
    #[bind_field({"secret_name" : "user" })]
    username: String,
    password: String,
    #[bind_field({"is_bound": false})]
    client: Option<Client>,
    #[bind_field({"is_bound": false})]
    database: Option<Database>,
}

impl SyncMongoDbConnection {
    pub fn get_client(&self) -> Result<&Client, MongoDbInitializationError> {
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
    pub fn get_database(&self) -> Result<&Database, MongoDbInitializationError> {
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
    pub fn new(
        endpoint: String,
        database_name: String,
        username: String,
        password: String,
    ) -> Result<Self, MongoDbConnectionConstructionError>
    {
       Self::new_impl(endpoint, database_name, username, password, &MongoDbConnectionOpsImpl) 
    }
    //Mongo has made it difficult to test this, so we are going to have an impl function that will
    //return a Result<Self, MongoDbConnectionConstructionError>.  This way we can test the error
    //mapping in our integration tests.  Then the actual new call will panic.  We know that
    //error.fatal() will panic, calling to_string() on the error so all we will really need to
    //test is that new panics.
    fn new_impl<T: MongoDbConnectionOps>(
        endpoint: String,
        database_name: String,
        username: String,
        password: String,
        operations: &T,
    ) -> Result<Self, MongoDbConnectionConstructionError>
    {
        let uri = format!(
            "mongodb+srv://{}:{}@{}?retryWrites=true&w=majority",
            username, password, endpoint
        );
        let client = operations.build_mongodb_connection(&uri)?;
        let database = operations.get_database(&client, &database_name);

        //Our database should have at least one collection in it.  This is the only way to check if
        //our parameters are correct.  So we will either get some type of mongodb error or an empty
        //vector.
        let _ =  operations.validate_database(&database)?;
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

impl Default for SyncMongoDbConnection {
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

#[cfg(test)]
mod tests {
    use super::*;

    mod constructror {
        use super::*;
        use std::sync::Arc;
        use mongodb::error::ErrorKind;
        #[test]
        fn is_ok() {
            let endpoint = "test".to_string();
            let database_name = "test".to_string();
            let username = "test".to_string();
            let password = "test".to_string();

            let mut mocks = MockMongoDbConnectionOps::new();
            mocks.expect_build_mongodb_connection()
                .times(1)
                .returning(|_| Ok(None));
    
            mocks.expect_get_database()
                .times(1)
                .returning(|_, _| None);
            mocks.expect_validate_database()
                .times(1)
                .returning(|_| Ok(()));

            let result = SyncMongoDbConnection::new_impl(endpoint, database_name, username, password, &mocks);
            assert!(result.is_ok());
        }

        #[test]
         fn get_client_fails() {
            let endpoint = "test".to_string();
            let database_name = "test".to_string();
            let username = "test".to_string();
            let password = "test".to_string();

            let mut mocks = MockMongoDbConnectionOps::new();
            mocks.expect_build_mongodb_connection()
                .times(1)
                .returning(|_| Err(MongoDbConnectionConstructionError::from(ErrorKind::Custom(Arc::new("An Error has Occurred".to_string())))));
    
            mocks.expect_get_database()
                .times(0)
                .returning(|_, _| None);
            mocks.expect_validate_database()
                .times(0)
                .returning(|_| Ok(()));

            let result = SyncMongoDbConnection::new_impl(endpoint, database_name, username, password, &mocks);
            assert!(result.is_err());
            let result = result.err().unwrap();
            match result {
                MongoDbConnectionConstructionError::UnexpectedError(_) => (),
                _ => panic!("Expected ClientConstructionError"),
            }
        }

        #[test]
        fn get_collection_names_fails() {
            let endpoint = "test".to_string();
            let database_name = "test".to_string();
            let username = "test".to_string();
            let password = "test".to_string();

            let mut mocks = MockMongoDbConnectionOps::new();
            mocks.expect_build_mongodb_connection()
                .times(1)
                .returning(|_| Ok(None));
    
            mocks.expect_get_database()
                .times(1)
                .returning(|_, _| None);
            mocks.expect_validate_database()
                .times(1)
                .returning(|_| Err(MongoDbConnectionConstructionError::from(ErrorKind::Custom(Arc::new("An Error has Occurred".to_string())))));

            let result = SyncMongoDbConnection::new_impl(endpoint, database_name, username, password, &mocks);
            assert!(result.is_err());
            let result = result.err().unwrap();
            match result {
                MongoDbConnectionConstructionError::UnexpectedError(_) => (),
                _ => panic!("Expected ClientConstructionError"),
            }
        }

        #[test]
        fn get_database_fails() {
            let endpoint = "test".to_string();
            let database_name = "test".to_string();
            let username = "test".to_string();
            let password = "test".to_string();

            let mut mocks = MockMongoDbConnectionOps::new();
            mocks.expect_build_mongodb_connection()
                .times(1)
                .returning(|_| Ok(None));
    
            mocks.expect_get_database()
                .times(1)
                .returning(|_, _| None);
            mocks.expect_validate_database()
                .times(1)
                .returning(|_| Ok(()));

            let result = SyncMongoDbConnection::new_impl(endpoint, database_name, username, password, &mocks);
            assert!(result.is_ok());
            let result = result.unwrap();
            let database = result.get_database();
            assert!(database.is_err());
            let database = database.err().unwrap();
            match database {
                MongoDbInitializationError::DatabaseNotInitialized(_) => (),
                _ => panic!("Expected DatabaseNotInitialized"),
            }
        }

        #[test]
        fn get_client_accessor_fails() {
            let endpoint = "test".to_string();
            let database_name = "test".to_string();
            let username = "test".to_string();
            let password = "test".to_string();

            let mut mocks = MockMongoDbConnectionOps::new();
            mocks.expect_build_mongodb_connection()
                .times(1)
                .returning(|_| Ok(None));
    
            mocks.expect_get_database()
                .times(1)
                .returning(|_, _| None);
            mocks.expect_validate_database()
                .times(1)
                .returning(|_| Ok(()));

            let result = SyncMongoDbConnection::new_impl(endpoint, database_name, username, password, &mocks);
            assert!(result.is_ok());
            let result = result.unwrap();
            let client = result.get_client();
            assert!(client.is_err());
            let client = client.err().unwrap();
            match client {
                MongoDbInitializationError::ClientNotInitialized(_) => (),
                _ => panic!("Expected ClientNotInitialized"),
            }
        }
    }
}
