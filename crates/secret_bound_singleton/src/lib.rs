use proc_macro::TokenStream;
use quote::{quote, ToTokens};
use serde_json::{json, Value};
mod valid_data_types;
use valid_data_types::ValidDataTypes;
use syn::{parse_macro_input, DeriveInput};


#[derive(Debug)]
struct FieldDefinition {
    field_name: String, 
    data_type: ValidDataTypes,
    is_optional: bool,
    is_bound: bool,
    secret_name: String,

}

#[proc_macro_derive(SecretBoundSingleton, attributes(secret_binder, bind_field))]
pub fn derive(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);
    let (secret_name, initializer, fake_secret) = parse_secret_binder(&ast);
    let fields = process_fields(&ast);
    let name = &ast.ident;
    let gen = quote! {
        #[async_trait]
        impl SecretBoundSingleton<#name> for #name {}
    };
    gen.into()
}

fn build_secret_bound_impl(struct_name: &str, secret_name: &str, initializer_name: &str, fake_secret: Option<Value>, fields: &Vec<FieldDefinition>) ->  TokenStream {
    quote!(
        #[async_trait]
        impl Singleton<#struct_name> from #struct_name {
            async fn bind_secrets() -> #struct_name {

            }
        }
        )
}

fn get_optional_data_type(path_segment : &syn::PathSegment) -> ValidDataTypes {
     let args = match &path_segment.arguments {
         syn::PathArguments::AngleBracketed(args) => args,
         _ => panic!("Option Should have angle bracketed arguments"),
     }; 
     let arg = args.args.iter().next().unwrap();
     match arg {
         syn::GenericArgument::Type(ty) => {
             match ty {
                 syn::Type::Path(type_path) => {
                     let path_segment = type_path.path.segments.first().unwrap();
                     let type_ident = &path_segment.ident.to_string();
                     return ValidDataTypes::from_ident(&type_ident);
                 }
                 _ => panic!("Option should have a type argument"),
             }
         }
         _ => panic!("Option should have a type argument"),
     }
}

fn get_bind_field_attr(input: &syn::Field) -> Option<&syn::Attribute> {
    let attr = input.attrs.iter().find(|attr| {
        let path = &attr.path();
        if path.segments.len() != 1 {
            return false;
        }
        let segment = path.segments.first().unwrap();
        return &segment.ident == "bind_field";
    });
    attr
}
fn process_field_attribute_meta(input: &syn::Field, field_name: &str) -> (bool, String) {
    let mut is_bound = true;
    let mut secret_name = field_name.to_string();
    let attr = get_bind_field_attr(input);
    if attr.is_some() {
        let attr = attr.unwrap();
        let is_bound_defined = get_arg_value_from_attribute(attr, "is_bound");
        if is_bound_defined.is_some() {
            is_bound = is_bound_defined.unwrap().parse::<bool>().unwrap();
        }
        let secret_name_defined = get_arg_value_from_attribute(attr, "secret_name");
        if secret_name_defined.is_some() {
            secret_name = secret_name_defined.unwrap();
        }
    }
    (is_bound, secret_name)
}

fn process_fields(input: &DeriveInput) -> Vec<FieldDefinition> {
    let mut fields: Vec<FieldDefinition> = Vec::new();
    let struc_def = match input.data {
        syn::Data::Struct(ref struc_def) => struc_def,
        _ => panic!("SecretBoundSingleton can only be derived for structs"),
    };

    for field in &struc_def.fields {
        if field.ident.is_none() {
            //We can only operate on named fields
            continue;
        }

        let field_name = field.ident.as_ref().unwrap().to_token_stream().to_string();
            
        match field.ty {
            syn::Type::Path(ref type_path) => {
                //This is our simple case, We have a native type with no additional attributes
                let path_segment =&type_path.path.segments.first().unwrap();
                let type_ident = &path_segment.ident.to_string();
                let data_type : ValidDataTypes;
                let is_optional: bool;
                if type_ident == "Option" {
                    data_type = get_optional_data_type(&path_segment);
                    is_optional = true;
                } else {
                    data_type = ValidDataTypes::from_ident(&type_ident);
                    is_optional = false;
                }
                let (is_bound, secret_name) = process_field_attribute_meta(field, &field_name); 
                fields.push(FieldDefinition {
                    field_name: field_name.clone(),
                    data_type,
                    is_optional,
                    is_bound,
                    secret_name,
                });
            }
            //For now we are only supporting native types and Option<T> provided T is a native type
            _ => panic!("Invalid data type"),
        }
    }

    fields
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
        //For now, we expect our secrets to come back as json objects.  Perhaps in the future we
        //can support other formats in which to store our secret values.
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
    #[ignore]
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
    #[ignore]
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
    #[ignore]
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
    #[ignore]
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
    #[ignore]
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
    #[ignore]
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

#[cfg(test)]
mod process_field {
    use super::*;

    #[test]
    #[ignore]
    fn straight_mapping() {
        let token_stream = quote!(
            struct Bar {
                field_a: String,
                field_b: u32,
                field_c: u64,
                field_d: i32,
                field_e: i64,
                field_f: f32,
                field_g: f64,
                field_h: bool,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
       let results = process_fields(&ast); 

       let result = &results[0];
       assert_eq!(result.field_name, "field_a");
       match result.data_type {
           ValidDataTypes::String => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_a");

       let result = &results[1];
       assert_eq!(result.field_name, "field_b");
       match result.data_type {
           ValidDataTypes::U32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_b");

       let result = &results[2];
       assert_eq!(result.field_name, "field_c");
       match result.data_type {
           ValidDataTypes::U64 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_c");


       let result = &results[3];
       assert_eq!(result.field_name, "field_d");
       match result.data_type {
           ValidDataTypes::I32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_d");

       let result = &results[4];
       assert_eq!(result.field_name, "field_e");
       match result.data_type {
           ValidDataTypes::I64 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_e");

       let result = &results[5];
       assert_eq!(result.field_name, "field_f");
       match result.data_type {
           ValidDataTypes::F32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_f");

       let result = &results[6];
       assert_eq!(result.field_name, "field_g");
       match result.data_type {
           ValidDataTypes::F64 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_g");

       let result = &results[7];
       assert_eq!(result.field_name, "field_h");
       match result.data_type {
           ValidDataTypes::Bool => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_h");
    }

    #[test]
    #[should_panic(expected = "Invalid data type")]
    #[ignore]
    fn invalid_data_type() {
        let token_stream = quote!(
            struct Bar {
                field_a: Vec<String>,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
       process_fields(&ast); 
    }

    #[test]
    #[ignore]
    fn optional_field() {
        let token_stream = quote!(
            struct Bar {
                field_a: Option<String>,
                field_b: Option<u32>,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
       let results = process_fields(&ast); 

       let result = &results[0];
       assert_eq!(result.field_name, "field_a");
       match result.data_type {
           ValidDataTypes::String => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, true);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_a");

       let result = &results[1];
       assert_eq!(result.field_name, "field_b");
       match result.data_type {
           ValidDataTypes::U32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, true);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_b");
    }

    #[test]
    #[should_panic(expected = "Invalid data type")]
    #[ignore]
    fn invalid_optional_field() {
        let token_stream = quote!(
            struct Bar {
                field_a: Option<Vec<String>>,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
       process_fields(&ast); 
    }

    #[test]
    fn using_bind_field_attribute() {
        let token_stream = quote!(
            struct Bar {
                #[bind_field({"is_bound" : false})]
                field_a: String,
                #[bind_field({"is_bound" : true, "secret_name": "field_bb" })]
                field_b: u32,
                field_c: u64,
                #[bind_field({"secret_name": "field_dd" })]
                field_d: i32,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
       let results = process_fields(&ast); 

       let result = &results[0];
       assert_eq!(result.field_name, "field_a");
       match result.data_type {
           ValidDataTypes::String => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, false);
       assert_eq!(result.secret_name, "field_a");

       let result = &results[1];
       assert_eq!(result.field_name, "field_b");
       match result.data_type {
           ValidDataTypes::U32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_bb");

       let result = &results[2];
       assert_eq!(result.field_name, "field_c");
       match result.data_type {
           ValidDataTypes::U64 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_c");

       let result = &results[3];
       assert_eq!(result.field_name, "field_d");
       match result.data_type {
           ValidDataTypes::I32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_dd");

    }

    #[test]
    #[should_panic(expected = "secret_binder attribute must be a valid json")]
    fn bind_field_attribute_is_malformed() {
        let token_stream = quote!(
            struct Bar {
                #[bind_field({"is_bound" : f})]
                field_a: String,
                #[bind_field({"is_bound" : true, "secret_name": "field_bb" })]
                field_b: u32,
                field_c: u64,
                #[bind_field({"secret_name": "field_dd" })]
                field_d: i32,
            }
        ).to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
       let results = process_fields(&ast); 

       let result = &results[0];
       assert_eq!(result.field_name, "field_a");
       match result.data_type {
           ValidDataTypes::String => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, false);
       assert_eq!(result.secret_name, "field_a");

       let result = &results[1];
       assert_eq!(result.field_name, "field_b");
       match result.data_type {
           ValidDataTypes::U32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_bb");

       let result = &results[2];
       assert_eq!(result.field_name, "field_c");
       match result.data_type {
           ValidDataTypes::U64 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_c");

       let result = &results[3];
       assert_eq!(result.field_name, "field_d");
       match result.data_type {
           ValidDataTypes::I32 => (),
           _ => panic!("Invalid data type"),
       }
       assert_eq!(result.is_optional, false);
       assert_eq!(result.is_bound, true);
       assert_eq!(result.secret_name, "field_dd");

    }
}
