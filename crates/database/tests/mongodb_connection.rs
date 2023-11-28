use cool_asserts::assert_panics;
use glyphx_core::aws::SecretManager;
use glyphx_core::{logging::setup_logging, SecretBoundSingleton, Singleton};
use glyphx_database::MongoDbConnection;
use std::panic;
use futures::FutureExt;
use glyphx_database::errors::MongoDbConnectionConstructionError;

#[tokio::test]
async fn secret_bound_singleton() {
   //Runs through our new function
   MongoDbConnection::build_singleton().await;
   let instance = MongoDbConnection::get_instance();
   let db = &instance.database;
   let results = db.list_collection_names(None).await;
   assert!(results.is_ok());
   let results = results.unwrap();
   let user_collection_exists = results.iter().any(|x| x == "users");
   assert!(user_collection_exists);

}

#[tokio::test]
async fn invalid_server_endpoint() {
    let secret_manager = SecretManager::new("db/mongodb").await;
    let secret = secret_manager.get_secret_value().await;
    assert!(secret.is_ok());
    let secret = secret.unwrap();

    let database_name = secret["schema"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();

    let result = MongoDbConnection::new_impl(
            //endpoint,
            "m6kgmt4.mongodb.net/".to_string(),
            database_name,
            username,
            "invalid_password".to_string(),
        ).await;
    assert!(result.is_err());
    let msg = result.err().unwrap();
    match msg {
        MongoDbConnectionConstructionError::ServerSelectionError(_) => {
            assert!(true);
        },
        _ => {
            panic!("Unexpected Error Type");
        }
    }
}
#[tokio::test]
async fn invalid_credentials() {
    let secret_manager = SecretManager::new("db/mongodb").await;
    let secret = secret_manager.get_secret_value().await;
    assert!(secret.is_ok());
    let secret = secret.unwrap();
    let endpoint = secret["endpoint"].as_str().unwrap().to_string();
    let database_name = secret["schema"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();

    let result = MongoDbConnection::new_impl(
            endpoint,
            database_name,
            username,
            "invalid_password".to_string(),
        ).await;
    assert!(result.is_err());
    let msg = result.err().unwrap();
    match msg {
        MongoDbConnectionConstructionError::AuthenticationError(_) => {
            assert!(true);
        },
        _ => {
            panic!("Unexpected Error Type");
        }
    }
}
#[tokio::test]
async fn invalid_database_name() {
    let secret_manager = SecretManager::new("db/mongodb").await;
    let secret = secret_manager.get_secret_value().await;
    assert!(secret.is_ok());
    let secret = secret.unwrap();
    let endpoint = secret["endpoint"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();
    let password = secret["password"].as_str().unwrap().to_string();

    let result = MongoDbConnection::new_impl(
            endpoint,
            "foo".to_string(),
            username,
            password,
        ).await;
    assert!(result.is_err());
    let msg = result.err().unwrap();
    match msg {
        MongoDbConnectionConstructionError::ServerSelectionError(_) => {
            assert!(true);
        },
        _ => {
            panic!("Unexpected Error Type");
        }
    }
}

#[tokio::test]
#[should_panic]
async fn new_panics_on_error() {
    let secret_manager = SecretManager::new("db/mongodb").await;
    let secret = secret_manager.get_secret_value().await;
    assert!(secret.is_ok());
    let secret = secret.unwrap();
    let endpoint = secret["endpoint"].as_str().unwrap().to_string();
    let username = secret["user"].as_str().unwrap().to_string();
    let password = secret["password"].as_str().unwrap().to_string();

    MongoDbConnection::new(
            endpoint,
            "foo".to_string(),
            username,
            password,
        ).await;
}
