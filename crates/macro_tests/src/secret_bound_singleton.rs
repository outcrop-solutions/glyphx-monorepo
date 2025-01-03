use glyphx_core::aws::secret_manager::GetSecretsValueError;
use glyphx_core::{GlyphxError, GlyphxErrorData, SecretBoundError};

#[derive(Debug, Clone, GlyphxError)]
#[error_definition("SecretBoundSingletonTest")]
enum FooInitError {
    SecretBoundError(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),
}

impl From<GetSecretsValueError> for FooInitError {
    fn from(err: GetSecretsValueError) -> Self {
        let message = "A secret error has occurred".to_string();
        let error_data = &err.get_glyphx_error_data();
        let data = GlyphxErrorData::new(message, error_data.data.clone(), None);
        Self::SecretBoundError(data)
    }
}

impl SecretBoundError for FooInitError { }

#[cfg(test)]
mod secret_bound_singleton {
    use super::*;
    use glyphx_core::SecretBoundSingleton;
    #[tokio::test]
    async fn regular_fields() {
        #[derive(Clone, Debug, SecretBoundSingleton)]
        #[secret_binder({"secret_name": "test_secret", "initializer": "init", "initializer_error": "FooInitError", "fake_secret": {"field1": "hi mom", "field2": 1, "field3": 2, "field4": 3, "field5": 4, "field6": 10.0, "field7": 11.0, "field8": true}})]
        struct Foo {
            field1: String,
            field2: u32,
            field3: u64,
            field4: i32,
            field5: i64,
            field6: f32,
            field7: f64,
            field8: bool,
        }

        impl Foo {
            async fn init<T>(
                field1: String,
                field2: u32,
                field3: u64,
                field4: i32,
                field5: i64,
                field6: f32,
                field7: f64,
                field8: bool,
            ) -> Result<Foo, T> {
                Ok(Foo {
                    field1,
                    field2,
                    field3,
                    field4,
                    field5,
                    field6,
                    field7,
                    field8,
                })
            }
        }

        let foo = Foo::build_singleton().await;
        let foo = foo.unwrap();
        assert_eq!(foo.field1, "hi mom");
        assert_eq!(foo.field2, 1);
        assert_eq!(foo.field3, 2);
        assert_eq!(foo.field4, 3);
        assert_eq!(foo.field5, 4);
        assert_eq!(foo.field6, 10.0);
        assert_eq!(foo.field7, 11.0);
        assert_eq!(foo.field8, true);
    }
    #[tokio::test]
    async fn optional_fields() {
        #[derive(Clone, Debug, SecretBoundSingleton)]
        #[secret_binder({"secret_name": "test_secret", "initializer": "init", "initializer_error": "FooInitError", "fake_secret": {"field1": "hi mom", "field2": 1, "field3": 2, "field4": 3, "field5": 4, "field6": 10.0, "field7": 11.0, "field8": true}})]
        struct Foo {
            field1: Option<String>,
            field2:Option< u32>,
            field3: Option<u64>,
            field4: Option<i32>,
            field5: Option<i64>,
            field6: Option<f32>,
            field7: Option<f64>,
            field8: Option<bool>,
        }

        impl Foo {
            async fn init<T>(field1: Option<String>, field2: Option<u32>, field3: Option<u64>, field4: Option<i32>, field5: Option<i64>, field6: Option<f32>, field7: Option<f64>, field8: Option<bool>) -> Result<Foo, T> {
                Ok(Foo { field1, field2, field3, field4, field5, field6, field7, field8 })
            }
        }

        let foo = Foo::build_singleton().await.unwrap();
        assert_eq!(&foo.field1.clone().unwrap(), "hi mom");
        assert_eq!(foo.field2.unwrap(), 1);
        assert_eq!(foo.field3.unwrap(), 2);
        assert_eq!(foo.field4.unwrap(), 3);
        assert_eq!(foo.field5.unwrap(), 4);
        assert_eq!(foo.field6.unwrap(), 10.0);
        assert_eq!(foo.field7.unwrap(), 11.0);
        assert_eq!(foo.field8.unwrap(), true);

    }

    #[tokio::test]
    async fn alternate_secret_names() {
        #[derive(Clone, Debug, SecretBoundSingleton)]
        #[secret_binder({"secret_name": "test_secret", "initializer": "init", "initializer_error": "FooInitError", "fake_secret": {"field11": "hi mom", "field12": 1, "field13": 2, "field14": 3, "field15": 4, "field16": 10.0, "field17": 11.0, "field18": true}})]
        struct Foo {
            #[bind_field({"secret_name": "field11"})]
            field1: Option<String>,
            #[bind_field({"secret_name": "field12"})]
            field2:Option< u32>,
            #[bind_field({"secret_name": "field13"})]
            field3: Option<u64>,
            #[bind_field({"secret_name": "field14"})]
            field4: Option<i32>,
            #[bind_field({"secret_name": "field15"})]
            field5: Option<i64>,
            #[bind_field({"secret_name": "field16"})]
            field6: Option<f32>,
            #[bind_field({"secret_name": "field17"})]
            field7: Option<f64>,
            #[bind_field({"secret_name": "field18"})]
            field8: Option<bool>,
        }

        impl Foo {
            async fn init<T>(field1: Option<String>, field2: Option<u32>, field3: Option<u64>, field4: Option<i32>, field5: Option<i64>, field6: Option<f32>, field7: Option<f64>, field8: Option<bool>) -> Result<Foo, T> {
                Ok(Foo { field1, field2, field3, field4, field5, field6, field7, field8 })
            }
        }

        let foo = Foo::build_singleton().await.unwrap();
        assert_eq!(&foo.field1.clone().unwrap(), "hi mom");
        assert_eq!(foo.field2.unwrap(), 1);
        assert_eq!(foo.field3.unwrap(), 2);
        assert_eq!(foo.field4.unwrap(), 3);
        assert_eq!(foo.field5.unwrap(), 4);
        assert_eq!(foo.field6.unwrap(), 10.0);
        assert_eq!(foo.field7.unwrap(), 11.0);
        assert_eq!(foo.field8.unwrap(), true);

    }

    #[tokio::test]
    async fn not_bound() {
        #[derive(Clone, Debug, SecretBoundSingleton)]
        #[secret_binder({"secret_name": "test_secret", "initializer": "init", "initializer_error": "FooInitError", "fake_secret": {"field11": "hi mom", "field12": 1, "field13": 2, "field14": 3, "field15": 4, "field16": 10.0, "field17": 11.0, "field18": true}})]
        struct Foo {
            #[bind_field({"secret_name": "field11", "is_bound": false})]
            field1: Option<String>,
            #[bind_field({"secret_name": "field12"})]
            field2:Option< u32>,
            #[bind_field({"secret_name": "field13"})]
            field3: Option<u64>,
            #[bind_field({"secret_name": "field14"})]
            field4: Option<i32>,
            #[bind_field({"secret_name": "field15"})]
            field5: Option<i64>,
            #[bind_field({"secret_name": "field16"})]
            field6: Option<f32>,
            #[bind_field({"secret_name": "field17"})]
            field7: Option<f64>,
            #[bind_field({"secret_name": "field18"})]
            field8: Option<bool>,
        }

        impl Foo {
            async fn init<T>( field2: Option<u32>, field3: Option<u64>, field4: Option<i32>, field5: Option<i64>, field6: Option<f32>, field7: Option<f64>, field8: Option<bool>) -> Result<Foo, T> {
                Ok(Foo { field1: Some("I am not bound".to_string()), field2, field3, field4, field5, field6, field7, field8 })
            }
        }

        let foo = Foo::build_singleton().await.unwrap();
        assert_eq!(&foo.field1.clone().unwrap(), "I am not bound");
        assert_eq!(foo.field2.unwrap(), 1);
        assert_eq!(foo.field3.unwrap(), 2);
        assert_eq!(foo.field4.unwrap(), 3);
        assert_eq!(foo.field5.unwrap(), 4);
        assert_eq!(foo.field6.unwrap(), 10.0);
        assert_eq!(foo.field7.unwrap(), 11.0);
        assert_eq!(foo.field8.unwrap(), true);

    }

    #[tokio::test]
    async fn un_bound_non_primative_field() {
        #[derive(Clone, Debug)]
        struct Bar {
            field1: String,
        }
        #[derive(Clone, Debug, SecretBoundSingleton)]
        #[secret_binder({"secret_name": "test_secret", "initializer": "init", "initializer_error": "FooInitError", "fake_secret": {"field1": "hi mom", "field2": 1, "field3": 2, "field4": 3, "field5": 4, "field6": 10.0, "field7": 11.0, "field8": true}})]
        struct Foo {
            field1: String,
            #[bind_field({"is_bound": false})]
            field2: Bar
        }

        impl Foo {
            async fn init<T>(field1: String) -> Result<Foo, T> {
                let bar_field1 = field1.clone();
                Ok(Foo { field1, field2 : Bar{field1: bar_field1} })
            }
        }

        let foo = Foo::build_singleton().await.unwrap();
        assert_eq!(foo.field1, "hi mom");
        assert_eq!(foo.field2.field1, "hi mom");

    }
}
