use crate::{Singleton, SyncSingleton};
use async_trait::async_trait;
use crate::SecretBoundError;
#[async_trait]
pub trait SecretBound<T, T2> 
where T:  Sized + std::fmt::Debug,
      T2: SecretBoundError {
    async fn bind_secrets() -> Result<T, T2>
; 
}


pub trait SyncSecretBound<T, T2> 
where T:  Sized + std::fmt::Debug,
      T2: SecretBoundError {
    fn bind_secrets() -> Result<T, T2>
; 
}
#[async_trait]
pub trait SecretBoundSingleton<T, T2> : SecretBound<T, T2> + Singleton<T, T2> 
where T:  Sized + std::fmt::Debug,
      T2: SecretBoundError {}


pub trait SyncSecretBoundSingleton<T, T2> : SyncSecretBound<T, T2> + SyncSingleton<T, T2> 
where T:  Sized + std::fmt::Debug,
      T2: SecretBoundError {}
