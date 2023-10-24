use glyphx_core::SecretBoundSingleton;
#[derive(Clone, Debug, SecretBoundSingleton)]
#[secret_binder({"secret_name": "test_secret", "initializer": "init"})]
struct Foo {
    foo: String,
    bar: Option<u32>,
}
impl Foo {
    async fn init(foo: String, bar: Option<u32>) -> Foo {
        Foo { foo, bar }
    }
}

#[tokio::main]
async fn main() {
    let foo = Foo::build_singleton().await;
    println!("foo: {:?}", foo);
   
    
    let foo2 = Foo::get_instance();
    println!("foo2: {:?}", foo2);
    println!("foo: {:?}", foo);
}
