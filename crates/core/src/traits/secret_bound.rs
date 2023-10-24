use crate::Singleton;
use async_trait::async_trait;

#[async_trait]
pub trait SecretBound<T> {
    async fn bind_secrets() -> T;
}


#[async_trait]
pub trait SecretBoundSingleton<T> : SecretBound<T> + Singleton<T> {}

