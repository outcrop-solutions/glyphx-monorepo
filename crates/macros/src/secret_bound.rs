use crate::Singleton;
use async_trait::async_trait;

#[async_trait]
pub trait SecretBound<T> {
    async fn bind_secrets() -> T;
}


#[async_trait]
pub trait SecretBoundSingleton<T> : SecretBound<T> + Singleton<T> {}

struct Foo{}

#[async_trait]
impl SecretBound<Foo> for Foo {
    async fn bind_secrets() -> Foo {
        Foo{}
    }
}

#[async_trait]
impl Singleton<Foo> for Foo {
    fn get_instance() -> std::sync::Arc<Foo> {
        std::sync::Arc::new(Foo{})
    }

    async fn build_singleton() -> Foo {
        Foo{}
    }
}

impl SecretBoundSingleton<Foo> for Foo {}


#[cfg(test)]
mod secret_binder_attribute {
    use super::*;
    use secret_bound_singleton_impl::SecretBoundSingleton;

    #[derive(Debug, SecretBoundSingleton)]
    #[secret_binder(secretName="foo", initializer="init")]
    struct Bar {

        field_a: u32,
        field_b: u32,
    }

    impl Bar {
        fn baz(&self) -> u32 {
            self.field_a + self.field_b
        }
    }

    #[test]
    fn is_ok() {

    #[derive(Debug, SecretBoundSingleton)]
    #[secret_binder(secret_name="baz", initializer="baz_init")]
    struct Baz{}
        let b = Bar{ field_a: 1, field_b: 2};
        b.baz();
        assert!(true);
    }

}
