use proc_macro::TokenStream;
use quote::quote;
use serde_json::{json, Value};
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(SecretBoundSingleton, attributes(secret_binder))]
pub fn derive(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);
    let (secret_name, initializer, fake_secret) = parse_secret_binder(&ast);
    let name = &ast.ident;
    let gen = quote! {
        #[async_trait]
        impl SecretBoundSingleton<#name> for #name {}
    };
    gen.into()
}

fn get_secret_binder_attr(input: &DeriveInput) -> Option<&syn::Attribute> {
    let attr = input.attrs.iter().find(|attr| {
        let path = &attr.path();
        if path.segments.len() != 1 {
            return false;
        }
        let segment = path.segments.first().unwrap();
        return &segment.ident == "secret_binder";
    });
    attr
}

fn get_arg_value_from_attribute(input: &syn::Attribute, arg_name: &str) -> Option<String> {
    let meta_list = match &input.meta {
        syn::Meta::List(meta_list) => meta_list,
        _ => panic!("secret_binder attribute must be a list"),
    };
    let tokens = &meta_list.tokens.to_string();
    let json_value = serde_json::from_str::<Value>(tokens);
    if json_value.is_err() {
        panic!("secret_binder attribute must be a valid json");
    }
    let json_value = json_value.unwrap();
    let value = &json_value[arg_name];
        match value {
            Value::String(s) => return Some(s.clone()),
            Value::Null => return None,
            _ => Some(value.to_string()),
        }
}
fn parse_secret_binder(input: &DeriveInput) -> (String, String, Option<Value>) {
    let secret_name;
    let initializer;
    let attr = get_secret_binder_attr(input);
    if attr.is_none() {
        panic!("secret_binder attribute is required");
    }
    let attr = attr.unwrap();

    let looked_up_secret_name = get_arg_value_from_attribute(attr, "secret_name");
    if looked_up_secret_name.is_none() {
        panic!("secret_name argument is required");
    }
    secret_name = looked_up_secret_name.unwrap();
    let looked_up_initializer = get_arg_value_from_attribute(attr, "initializer");
    if looked_up_initializer.is_none() {
        panic!("initializer argument is required");
    }
    initializer = looked_up_initializer.unwrap();

    let looked_up_fake_secret = get_arg_value_from_attribute(attr, "fake_secret");
    let mut fake_secret: Option<Value> = None;
    if looked_up_fake_secret.is_some() {
        let parsed_fake_secret = serde_json::from_str::<Value>(&looked_up_fake_secret.unwrap()).unwrap();
        if !parsed_fake_secret.is_object() {
            panic!("fake_secret is not a valid json value");
        }
        fake_secret = Some(parsed_fake_secret);
    }

    (secret_name, initializer, fake_secret)
}

#[cfg(test)]
mod secret_binder_attribute {
    use super::*;

    #[test]
    fn is_ok() {
        let token_stream = quote!(
            #[secret_binder({"secret_name": "foo", "initializer": "init", "fake_secret": {"foo":"bar", "baz": 1}})]
            struct Bar {
                field_a: u32,
                field_b: u32,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let (secret_name, initializer, fake_secret) = parse_secret_binder(&ast);
        assert_eq!(secret_name, "foo");
        assert_eq!(initializer, "init");
        assert!(fake_secret.is_some());
        let fake_secret = fake_secret.unwrap();
        assert_eq!(fake_secret["foo"], "bar");
    }

    #[test]
    #[should_panic(expected = "secret_binder attribute is required")]
    fn missing_secret_binder_attribute() {
        let token_stream = quote!(
            struct Bar {
                field_a: u32,
                field_b: u32,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        parse_secret_binder(&ast);
    }

    #[test]
    #[should_panic(expected = "secret_binder attribute must be a valid json")]
    fn args_are_invalid_json() {
        let token_stream = quote!(
            #[secret_binder("initializer": "init", "fake_secret": {"foo":"bar", "baz": 1})]
            #[secret_binder(initializer = "init")]
            struct Bar {
                field_a: u32,
                field_b: u32,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        parse_secret_binder(&ast);
    }

    #[test]
    #[should_panic(expected = "secret_name argument is required")]
    fn missing_secret_name() {
        let token_stream = quote!(
            #[secret_binder({"initializer": "init", "fake_secret": {"foo":"bar", "baz": 1}})]
            #[secret_binder(initializer = "init")]
            struct Bar {
                field_a: u32,
                field_b: u32,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        parse_secret_binder(&ast);
    }

    #[test]
    #[should_panic(expected = "initializer argument is required")]
    fn missing_initializer() {
        let token_stream = quote!(
            #[secret_binder({"secret_name": "foo", "fake_secret": {"foo":"bar", "baz": 1}})]
            struct Bar {
                field_a: u32,
                field_b: u32,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        parse_secret_binder(&ast);
    }

    #[test]
    #[should_panic(expected = "fake_secret is not a valid json value")]
    fn fake_secret_is_invalid() {
        let token_stream = quote!(
            #[secret_binder({"secret_name": "foo", "initializer": "init", "fake_secret":63 })]
            struct Bar {
                field_a: u32,
                field_b: u32,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        parse_secret_binder(&ast);
    }
}
