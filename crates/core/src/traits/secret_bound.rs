use crate::Singleton;
use async_trait::async_trait;
use crate::SecretBoundError;
#[async_trait]
pub trait SecretBound<T, T2> 
where T:  Sized + std::fmt::Debug,
      T2: SecretBoundError {
    async fn bind_secrets() -> Result<T, T2>
; 
}


#[async_trait]
pub trait SecretBoundSingleton<T, T2> : SecretBound<T, T2> + Singleton<T, T2> 
where T:  Sized + std::fmt::Debug,
      T2: SecretBoundError {}

