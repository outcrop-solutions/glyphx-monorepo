use glyphx_core::SecretBoundSingleton;

#[derive(Clone, Debug, SecretBoundSingleton)]
#[secret_binder({"secret_name": "test_secret", "initializer": "init"})]
struct Foo {
    #[bind_field({"secret_name": "foo"})]
    field1: String,
    #[bind_field({"secret_name": "bar"})]
    field2: u32,
}

impl Foo {
    async fn init(field1: String, field2: u32) -> Foo {
        Foo { field1, field2 }
    }
}

#[tokio::test]
async fn secret_bound_singleton() {
    let foo = Foo::build_singleton().await;
    assert_eq!(foo.field1, "bar");
    assert_eq!(foo.field2, 63);
}
