use std::sync::Arc;
use async_trait::async_trait;

/// A trait for defining an immutable singleton.
#[async_trait]
pub trait Singleton<T> {
    fn get_instance() -> &'static T;
    async fn build_singleton()-> &'static T;
}
