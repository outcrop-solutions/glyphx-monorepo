use glyphx_core::{SecretBoundSingleton, GlyphxError, GlyphxErrorData, aws::secret_manager::GetSecretsValueError};

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("SecretBoundSingletonIntegrationTest")]
enum InitError {
    SecretBoundError(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

impl From<GetSecretsValueError> for InitError {
    fn from(err: GetSecretsValueError) -> Self {
        let message = "A secret error has occurred".to_string();
        let error_data = &err.get_glyphx_error_data();
        let data = GlyphxErrorData::new(message, error_data.data.clone(), None);
        Self::SecretBoundError(data)
    }
}

#[derive(Clone, Debug, SecretBoundSingleton)]
#[secret_binder({"secret_name": "test_secret", "initializer": "init", "initializer_error": "InitError"})]
struct Foo {
    #[bind_field({"secret_name": "foo"})]
    field1: String,
    #[bind_field({"secret_name": "bar"})]
    field2: u32,
}

impl Foo {
    async fn init<T>(field1: String, field2: u32) -> Result<Foo, T> {
        Ok(Foo { field1, field2 })
    }
}

#[tokio::test]
async fn secret_bound_singleton() {
    let foo = Foo::build_singleton().await.unwrap();
    assert_eq!(foo.field1, "bar");
    assert_eq!(foo.field2, 63);
}
