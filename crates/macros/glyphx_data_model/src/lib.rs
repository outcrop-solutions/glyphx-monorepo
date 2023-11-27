mod internal;

use internal::*;

use proc_macro::TokenStream;
use quote::{ quote, ToTokens};
use regex::Regex;
use serde_json::{from_str, Value};
use syn::{parse_macro_input, Data,  DeriveInput};

#[proc_macro_derive(GlyphxDataModel, attributes(model_definition, field_definition))]
pub fn derive(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);
    let struct_ident = ast.ident.clone();
    let model_definition = get_model_definition(&ast);
    let field_definitions = get_field_definitions(&ast);

    let create_model_struct = build_create_model(&struct_ident, &field_definitions);
    let update_model_struct = build_update_model(&struct_ident, &field_definitions);
    let glyphx_data_model_impl =
        build_glyphx_data_model(&struct_ident, &model_definition, &field_definitions);
    let database_operations_trait = build_database_operations_trait(&struct_ident);
     
    let database_operations_impl = build_database_operations_impl(&struct_ident, &model_definition, &field_definitions);


    let model_impl = build_model_impl(&struct_ident, &model_definition, &field_definitions);

    let q: TokenStream = quote! {
        use glyphx_core::Singleton;
        use futures::stream::TryStreamExt;
        #create_model_struct

        #update_model_struct

        #glyphx_data_model_impl

        #database_operations_trait

        #database_operations_impl

        #model_impl
    }
    .into();
    q
}

fn parse_rename_attribute(attribute_str: &str) -> (Option<String>, Option<String>) {
    //Our traditional rename attribute as a string (rename="foo")
    let simple_regex = Regex::new(r#"rename\s*=\s*"(\w*)""#).unwrap();
    let matches = simple_regex.captures(attribute_str);
    if matches.is_some() {
        let matches = matches.unwrap();
        let rename_value = matches.get(1).unwrap().as_str();
        return (
            Some(rename_value.to_string()),
            Some(rename_value.to_string()),
        );
    }

    let complex_regex = Regex::new(r#"rename\s*\((.*)\)"#).unwrap();
    let matches = complex_regex.captures(attribute_str);
    if matches.is_some() {
        let mut se_rename = None;
        let mut de_rename = None;
        let matches = matches.unwrap();
        let rename_value = matches.get(1).unwrap().as_str();
        let rename_value = rename_value.split(",").map(|value| value.trim()).collect::<Vec<&str>>();
        rename_value.iter().for_each(|value|  {
            let splits = value.split("=").map(|value| value.trim()).collect::<Vec<&str>>();
            if splits.len() != 2 {
                panic!("Unable to parse rename attribute: {}", attribute_str);
            }
            if splits[0] == "serialize" {
                se_rename = Some(splits[1].replace("\"", "").trim().to_string());
            } else if splits[0] == "deserialize" {
                de_rename = Some(splits[1].replace("\"", "").trim().to_string());
            } else {
                panic!("Unable to parse rename attribute: {}", attribute_str);
            }
        });
        return (se_rename, de_rename);
    }
    (None, None)
}

fn get_model_definition(ast: &DeriveInput) -> ModelDefinition {
    let attr = ast.attrs.iter().find(|attr| {
        let path = &attr.path();
        if path.segments.len() != 1 {
            return false;
        }
        let segment = path.segments.first().unwrap();
        return &segment.ident == "model_definition";
    });

    if attr.is_none() {
        panic!("model_definition attribute not found");
    }

    let attr = attr.unwrap();

    let meta_list = match &attr.meta {
        syn::Meta::List(meta_list) => meta_list,
        _ => panic!("model_definition attribute must be a list"),
    };
    let tokens = meta_list.tokens.to_string();
    if tokens.is_empty() {
        panic!("model_definition attribute must have a value");
    }
    let model_definition = from_str::<ModelDefinition>(&tokens);
    if model_definition.is_err() {
        panic!("{}, model_definition attribute must be a valid json object which can be deserialized into a ModelDefinition struct", tokens);
    }
    model_definition.unwrap()
}

fn get_field_definitions(ast: &DeriveInput) -> Vec<FieldDefinition> {
    let data = &ast.data;
    let mut has_at_least_one_object_id_field = false;

    let fields = match data {
        Data::Struct(data_struct) => &data_struct.fields,
        _ => panic!("GlyphxDataModel can only be derived on structs"),
    };
    let fields = match fields {
        syn::Fields::Named(fields_named) => &fields_named.named,
        _ => panic!("GlyphxDataModel can only be derived on structs with named fields"),
    };
    let mut field_definitions = Vec::new();
    fields.iter().for_each(|field| {
        let field_definition = get_field_definition(field);
        if field_definition.is_object_id.is_some() {
            has_at_least_one_object_id_field = true;
        }
        field_definitions.push(field_definition);
    });
    if !has_at_least_one_object_id_field {
        panic!("at least one field must be marked as object_id");
    }
    field_definitions
}

fn get_field_type(field_type: &syn::Type) -> (String, Option<()>, Option<()>, Option<String>) {
    if let syn::Type::Path(type_path) = field_type {
        let mut is_vector: Option<()> = None;
        let mut is_option: Option<()> = None;
        let path = &type_path.path;
        if path.segments.len() != 1 {
            panic!("field_type must be a single segment");
        }
        let segment = path.segments.first().unwrap();
        let result = segment.ident.to_string();
        if result == "Option" {
            is_option = Some(());
        } else if result == "Vec" {
            is_vector = Some(());
        }
        if segment.arguments.is_empty() {
            return (result, is_option, is_vector, None);
        }
        if let syn::PathArguments::AngleBracketed(angle_bracketed) = &segment.arguments {
            let args = &angle_bracketed.args;
            if args.len() != 1 {
                panic!("field_type must have a single argument");
            }
            let arg = args.first().unwrap();
            if let syn::GenericArgument::Type(inner_type) = arg {
                let (inner_type, _, _, _) = get_field_type(inner_type);
                let type_ = format!("{}<{}>", result, inner_type);
                let mut vec_inner_type = None;
                if result == "Vec" {
                    vec_inner_type = Some(inner_type);
                }
                return (type_, is_option, is_vector, vec_inner_type);
            }
        }
    }
    panic!("unexpected or unsupoorted field_type: {:?}", field_type);
}

fn parse_field_attribute(
    field: &syn::Field,
    field_type: &str,
    is_updateable: &mut Option<()>,
    is_createable: &mut Option<()>,
    is_object_id: &mut Option<()>,
    default_value: &mut Option<String>,
    is_vector: &mut Option<VectorFieldDefinition>,
) {
    let attr = field.attrs.iter().find(|attr| {
        let path = &attr.path();
        if path.segments.len() != 1 {
            return false;
        }
        let segment = path.segments.first().unwrap();
        &segment.ident == "field_definition"
    });
    if attr.is_none() {
        return;
    }
    let attr = attr.unwrap();
    let meta_list = match &attr.meta {
        syn::Meta::List(meta_list) => meta_list,
        _ => panic!("field_definition attribute must be a list"),
    };
    let tokens = &meta_list.tokens.to_string();
    let json_value = serde_json::from_str::<Value>(tokens);
    if json_value.is_err() {
        let err = json_value.err().unwrap();
        let msg = err.to_string();
        let msg = format!("field_definition attribute must be a valid json: {}", msg);
        panic!("{}", &msg);
    }
    let json_value = json_value.unwrap();
    if json_value["updateable"].is_boolean() {
        let updateable = json_value["updateable"].as_bool().unwrap();
        if updateable && is_vector.is_some() {
            panic!("updateable is not supported on vector fields");
        }

        if updateable {
            *is_updateable = Some(());
        } else {
            *is_updateable = None;
        }
    }

    if json_value["createable"].is_boolean() {
        let createable = json_value["createable"].as_bool().unwrap();
        if createable {
            *is_createable = Some(());
        } else {
            *is_createable = None;
        }
    }

    if json_value["object_id"].is_boolean() {
        let object_id = json_value["object_id"].as_bool().unwrap();
        if object_id {
            if field_type != "String"
                && field_type != "Option<String>"
                && field_type != "Vec<String>"
            {
                panic!(
                    "object_id is only supported on String, Option<String>, and Vec<String> fields"
                );
            }
            *is_object_id = Some(());
        } else {
            *is_object_id = None;
        }
    }
    if json_value["vector_sort_direction"].is_string() {
        let vector_sort_direction = json_value["vector_sort_direction"]
            .as_str()
            .unwrap()
            .to_lowercase();
        if vector_sort_direction == "desc" {
            is_vector.as_mut().unwrap().push_type = PushType::Shift;
        }
    }
    if json_value["default_value"].is_string() {
        let default_str = json_value["default_value"].as_str().unwrap();
        *default_value = Some(default_str.to_string());
    }
}

fn parse_pass_through_attributes(field: &syn::Field) -> (Vec<String>, String) {
    let mut attrs = Vec::new();
    let field_name = field.ident.as_ref().unwrap().to_string();
    let mut database_name = field_name.clone();
    let attr: Vec<&syn::Attribute> = field
        .attrs
        .iter()
        .filter(|attr| {
            let path = &attr.path();
            if path.segments.len() != 1 {
                return false;
            }
            let segment = path.segments.first().unwrap();
            &segment.ident != "field_definition"
        })
        .collect();
    if attr.len() == 0 {
        return (attrs, database_name);
    }
    attr.iter().for_each(|token| {
        let ident = token.path().get_ident();
        if ident.is_some() {
            let ident = ident.unwrap().to_string();
            if ident == "serde" {
                let inner_meta: syn::Result<proc_macro2::TokenStream> = token.parse_args();
                if inner_meta.is_err() {
                    panic!("Unable to parse serde attribute");
                }
                let inner_meta = inner_meta.unwrap();
                let inner_meta = inner_meta.to_string();
                let (ser, der) = parse_rename_attribute(&inner_meta);
                if ser.is_some() {
                    database_name = ser.unwrap();   
                }
            }
        }
        let token = token.into_token_stream().to_string();
        if !token.is_empty() {
            attrs.push(token.to_string());
        }
    });
    (attrs, database_name)
}

fn get_field_definition(field: &syn::Field) -> FieldDefinition {
    let ident = field.ident.as_ref().unwrap();
    let name = ident.to_string();
    let (field_type, is_option, is_vector, vector_inner_type) = get_field_type(&field.ty);
    let mut is_vector = if is_vector.is_none() {
        None
    } else {
        Some(VectorFieldDefinition {
            push_type: PushType::Push,
            vector_type: vector_inner_type.unwrap(),
        })
    };
    let mut is_updateable = if is_vector.is_none() { Some(()) } else { None };
    let mut is_createable = Some(());
    let mut is_object_id = None;
    let mut default_value = None;

    parse_field_attribute(
        field,
        &field_type,
        &mut is_updateable,
        &mut is_createable,
        &mut is_object_id,
        &mut default_value,
        &mut is_vector,
    );

    let (pass_through_attributes, database_name) = parse_pass_through_attributes(&field);
    FieldDefinition {
        name,
        field_type,
        is_option,
        is_vector,
        is_updateable,
        is_createable,
        is_object_id,
        pass_through_attributes,
        default_value,
        database_name,
    }
}

#[cfg(test)]
mod get_model_definition {
    use super::*;
    use cool_asserts::assert_panics;

    #[test]
    fn is_ok() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let model_definition = get_model_definition(&ast);
        assert_eq!(model_definition.collection, "process_tracking");
    }

    #[test]
    fn is_err() {
        let token_stream = quote!(
            #[model_definition("collection" : "process_tracking")]
            struct test {
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        assert_panics! {
            get_model_definition(&ast)
        }
    }
}

#[cfg(test)]
mod get_field_definition {
    use super::*;
    use cool_asserts::assert_panics;

    #[test]
    fn simple_field_no_decortation() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"object_id" : true})]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "String");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_none());
        assert!(field_definition.is_updateable.is_some());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn simple_option_field_no_decortation() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"object_id" : true})]
                id: Option<String>,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "Option<String>");
        assert!(field_definition.is_option.is_some());
        assert!(field_definition.is_vector.is_none());
        assert!(field_definition.is_updateable.is_some());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn simple_vector_field_no_decortation() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"object_id" : true})]
                id: Vec<String>,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "Vec<String>");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_some());
        let vector_field_definition = field_definition.is_vector.as_ref().unwrap();
        match vector_field_definition.push_type {
            PushType::Push => {}
            _ => panic!("unexpected push_type"),
        }
        assert!(field_definition.is_updateable.is_none());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn vector_field_with_sort_direction() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"vector_sort_direction" : "desc", "object_id" : true})]
                id: Vec<String>,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "Vec<String>");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_some());
        let vector_field_definition = field_definition.is_vector.as_ref().unwrap();
        match vector_field_definition.push_type {
            PushType::Shift => {}
            _ => panic!("unexpected push_type"),
        }
        assert!(field_definition.is_updateable.is_none());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn simple_id_field() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"object_id" : true})]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "String");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_none());
        assert!(field_definition.is_updateable.is_some());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn optional_id_field() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"object_id" : true})]
                id: Option<String>,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "Option<String>");
        assert!(field_definition.is_option.is_some());
        assert!(field_definition.is_vector.is_none());
        assert!(field_definition.is_updateable.is_some());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn vector_id_field() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"object_id" : true})]
                id: Vec<String>,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "Vec<String>");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_some());
        assert!(field_definition.is_updateable.is_none());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn simple_field_is_not_updateable() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"updateable" : false, "object_id" : true})]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "String");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_none());
        assert!(field_definition.is_updateable.is_none());
        assert!(field_definition.is_createable.is_some());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn simple_field_is_not_creatable() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"createable" : false, "object_id" : true})]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "String");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_none());
        assert!(field_definition.is_updateable.is_some());
        assert!(field_definition.is_createable.is_none());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert!(field_definition.default_value.is_none());
    }

    #[test]
    fn err_invalid_json() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        assert_panics! {
            get_field_definitions(&ast),
            includes("field_definition attribute must be a list")
        }
    }

    #[test]
    fn err_no_json() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition()]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        assert_panics! {
            get_field_definitions(&ast),
            includes("field_definition attribute must be a valid json:")
        }
    }

    #[test]
    fn err_updateable_on_vector() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"updateable" : true, "object_id" : true})]
                id: Vec<String>,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        assert_panics! {
            get_field_definitions(&ast),
            includes("updateable is not supported on vector fields")
        }
    }

    #[test]
    fn err_object_id_on_non_string_field() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"object_id" : true})]
                id: usize,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        assert_panics! {
            get_field_definitions(&ast),
            includes("object_id is only supported on String, Option<String>, and Vec<String> fields")
        }
    }

    #[test]
    fn err_no_object_id() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                id: usize,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        assert_panics! {
            get_field_definitions(&ast),
            includes("at least one field must be marked as object_id")
        }
    }
    #[test]
    fn attributes() {
        let token_stream = quote!(
            #[derive(Serialize)]
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"createable" : false, "object_id" : true})]
                #[serde(rename = "id")]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.pass_through_attributes.len(), 1);
        assert!(field_definition.pass_through_attributes[0].contains("serde"));
    }

    #[test]
    fn default_value() {
        let token_stream = quote!(
            #[model_definition({"collection" : "process_tracking"})]
            struct test {
                #[field_definition({"createable" : false, "default_value" : "test", "object_id" : true})]
                id: String,
            }
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        assert_eq!(field_definitions.len(), 1);
        let field_definition = &field_definitions[0];
        assert_eq!(field_definition.name, "id");
        assert_eq!(field_definition.field_type, "String");
        assert!(field_definition.is_option.is_none());
        assert!(field_definition.is_vector.is_none());
        assert!(field_definition.is_updateable.is_some());
        assert!(field_definition.is_createable.is_none());
        assert!(field_definition.is_object_id.is_some());
        assert!(field_definition.pass_through_attributes.len() == 0);
        assert_eq!(field_definition.default_value.as_ref().unwrap(), "test");
    }
}

#[cfg(test)]
mod parse_rename_attribute {
    use super::*;

    #[test]
    fn simple_rename() {
        let args = "rename = \"test\"";
        let (ser, des) = parse_rename_attribute(args);
        let ser = ser.unwrap();
        let des = des.unwrap();
        assert_eq!(ser, "test");
        assert_eq!(des, "test");
    }

    #[test]
    fn complex_rename() {
        let args = "rename(serialize=\"test\", deserialize=\"me\")";
        let (ser, des) = parse_rename_attribute(args);
        let ser = ser.unwrap();
        let des = des.unwrap();
        assert_eq!(ser, "test");
        assert_eq!(des, "me");
    }

    #[test]
    fn complex_rename_no_deserialize() {
        let args = "rename(serialize=\"test\")";
        let (ser, des) = parse_rename_attribute(args);
        let ser = ser.unwrap();
        assert_eq!(ser, "test");
        assert!(des.is_none());
    }

    #[test]
    fn complex_rename_no_serialize() {
        let args = "rename(deserialize=\"test\")";
        let (ser, des) = parse_rename_attribute(args);
        let des = des.unwrap();
        assert_eq!(des, "test");
        assert!(ser.is_none());
    }
}
