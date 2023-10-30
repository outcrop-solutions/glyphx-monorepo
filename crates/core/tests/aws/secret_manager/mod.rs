use glyphx_core::aws::SecretManager;

const SECRET_NAME: &str = "test_secret";

#[tokio::test]
async fn integration() {
    let secret_manager = SecretManager::new(SECRET_NAME).await;
    let secret_value = secret_manager.get_secret_value().await;
    assert!(secret_value.is_ok());
    let secret_value = secret_value.unwrap();
    assert_eq!(secret_value["foo"], "bar");
}
