use cool_asserts::assert_panics;
use futures::FutureExt;
use glyphx_core::aws::SecretManager;
use glyphx_core::{logging::setup_logging, SyncSecretBoundSingleton, SyncSingleton};
use glyphx_database::errors::MongoDbConnectionConstructionError;
use glyphx_database::SyncMongoDbConnection;
use std::panic;

#[test]
fn secret_bound_singleton() {
    //Runs through our new function
    let _ = SyncMongoDbConnection::build_singleton();
    let instance = SyncMongoDbConnection::get_instance();
    let db = instance.get_database();
    assert!(db.is_ok());
    let db = db.unwrap();
    let results = db.list_collection_names().run();
    assert!(results.is_ok());
    let results = results.unwrap();
    let user_collection_exists = results.iter().any(|x| x == "users");
    assert!(user_collection_exists);
}

#[test]
fn invalid_server_endpoint() {
    let secret_manager;
    let secret;
    {
        let rt = tokio::runtime::Runtime::new().unwrap();
        secret_manager = rt.block_on(SecretManager::new("db/mongodb"));
        secret = rt.block_on(secret_manager.get_secret_value());
    }
    assert!(secret.is_ok());
    let secret = secret.unwrap();

    let database_name = secret["schema"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();

    let result = SyncMongoDbConnection::new(
        //endpoint,
        "m6kgmt4.mongodb.net/".to_string(),
        database_name,
        username,
        "invalid_password".to_string(),
    );
    assert!(result.is_err());
    let msg = result.err().unwrap();
    match msg {
        MongoDbConnectionConstructionError::ServerSelectionError(_) => {
            assert!(true);
        }
        _ => {
            panic!("Unexpected Error Type");
        }
    }
}
#[test]
fn invalid_credentials() {
    let secret_manager;
    let secret;
    {
        let rt = tokio::runtime::Runtime::new().unwrap();
        secret_manager = rt.block_on(SecretManager::new("db/mongodb"));
        secret = rt.block_on(secret_manager.get_secret_value());
    }
    assert!(secret.is_ok());
    let secret = secret.unwrap();
    let endpoint = secret["endpoint"].as_str().unwrap().to_string();
    let database_name = secret["schema"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();

    let result = SyncMongoDbConnection::new(
        endpoint,
        database_name,
        username,
        "invalid_password".to_string(),
    );
    assert!(result.is_err());
    let msg = result.err().unwrap();
    match msg {
        MongoDbConnectionConstructionError::AuthenticationError(_) => {
            assert!(true);
        }
        _ => {
            panic!("Unexpected Error Type");
        }
    }
}
#[test]
fn invalid_database_name() {
    let secret_manager;
    let secret;
    {
        let rt = tokio::runtime::Runtime::new().unwrap();
        secret_manager = rt.block_on(SecretManager::new("db/mongodb"));
        secret = rt.block_on(secret_manager.get_secret_value());
    }
    assert!(secret.is_ok());
    let secret = secret.unwrap();
    let endpoint = secret["endpoint"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();
    let password = secret["password"].as_str().unwrap().to_string();

    let result = SyncMongoDbConnection::new(endpoint, "foo".to_string(), username, password);
    assert!(result.is_err());
    let msg = result.err().unwrap();
    match msg {
        MongoDbConnectionConstructionError::ServerSelectionError(_) => {
            assert!(true);
        }
        _ => {
            panic!("Unexpected Error Type");
        }
    }
}

#[test]
fn new_panics_on_error() {
    let secret_manager;
    let secret;
    {
        let rt = tokio::runtime::Runtime::new().unwrap();
        secret_manager = rt.block_on(SecretManager::new("db/mongodb"));
        secret = rt.block_on(secret_manager.get_secret_value());
    }
    
    assert!(secret.is_ok());
    let secret = secret.unwrap();
    let endpoint = secret["endpoint"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();
    let password = secret["password"].as_str().unwrap().to_string();

    let result = SyncMongoDbConnection::new(endpoint, "foo".to_string(), username, password);
    assert!(result.is_err());
    let err = result.err().unwrap();
    match err {
        MongoDbConnectionConstructionError::ServerSelectionError(_) => {
            assert!(true);
        }
        _ => {
            panic!("Unexpected Error Type");
        }
    }
}
