use async_trait::async_trait;
use crate::SecretBoundError;
/// A trait for defining an immutable singleton.
#[async_trait]
pub trait Singleton<T1, T2>
where
    T1: Sized + std::fmt::Debug,
    T2: SecretBoundError, 
{
    fn get_instance() -> &'static T1;
    async fn build_singleton() -> Result<&'static T1, T2>;
}

pub trait SyncSingleton<T1, T2>
where
    T1: Sized + std::fmt::Debug,
    T2: SecretBoundError, 
{
    fn get_instance() -> &'static T1;
    fn build_singleton() -> Result<&'static T1, T2>;
}
