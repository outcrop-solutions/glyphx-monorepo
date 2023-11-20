use glyphx_common::AthenaConnection;
use glyphx_core::Singleton;

 #[tokio::test]
 async fn athena_connection() {
    let athena_connection = AthenaConnection::build_singleton().await;
    let athena_manager = athena_connection.get_athena_manager();
    let results = athena_manager.run_query("SHOW TABLES", None, Some(true)).await;
    assert!(results.is_ok());
 }
