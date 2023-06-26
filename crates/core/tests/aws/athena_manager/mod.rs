use glyphx_types::aws::athena_manager::athena_manager_errors::*;
use glyphx_core::aws::athena_manager::AthenaManager;


#[tokio::test]
async fn database_does_not_exist() {
    let catalog = String::from("AwsDataCatalog");
    let database = String::from("glyphx");
    let athena_manager = AthenaManager::new(&catalog, &database).await;
    assert!(athena_manager.is_err());
}

#[tokio::test]
async fn database_does_exist() {
    let catalog = String::from("AwsDataCatalog");
    let database = String::from("jpstestdatabase");
    let athena_manager = AthenaManager::new(&catalog, &database).await;
    assert!(athena_manager.is_ok());
}
