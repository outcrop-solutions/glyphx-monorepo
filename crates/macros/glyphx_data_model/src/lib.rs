use proc_macro::TokenStream;
use quote::{format_ident, quote, ToTokens};
use serde::Deserialize;
use serde_json::{from_str, Value};
use syn::{parse_macro_input, Data, DataEnum, DeriveInput, Ident};

#[derive(Debug, Deserialize, Clone)]
struct ModelDefinition {
    collection: String,
}

#[derive(Debug, Deserialize, Clone)]
enum PushType {
    Push,
    Shift,
}

#[derive(Debug, Deserialize, Clone)]
struct VectorFieldDefinition {
    push_type: PushType,
}

#[derive(Debug, Deserialize, Clone)]
struct FieldDefinition {
    name: String,
    field_type: String,
    is_option: Option<()>,
    is_vector: Option<VectorFieldDefinition>,
    is_updateable: Option<()>,
    is_createable: Option<()>,
    is_object_id: Option<()>,
    pass_through_attributes: Vec<String>,
    default_value: Option<String>,
}

#[proc_macro_derive(GlyphxDataModel, attributes(model_definition, field_definition))]
pub fn derive(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);
    let struct_ident = ast.ident.clone();
    let model_definition = get_model_definition(&ast);
    let field_definitions = get_field_definitions(&ast);
    let build_create_model = build_create_model(&struct_ident, &field_definitions);
    let q: TokenStream =  quote! {
        #build_create_model
    }.into();
    println!("q: {}", q.to_string());
    q
}

fn build_to_bson_function(field_definitions: &Vec<&FieldDefinition>) -> proc_macro2::TokenStream {

  let mut object_id_fields = field_definitions.iter().filter(|field_definition| {
      field_definition.is_object_id.is_some()
  }).map(|field_definition| { format!("key == \"{}\"",field_definition.name.as_str())}).collect::<Vec<String>>().join(" || ").parse::<proc_macro2::TokenStream>().unwrap();  

  //It is entirely possible for updates and creates to not have an id field.  This is my lazy way
  //of handling this condition.  If there are no object_id fields, then we will just pass through
  //false to our conditional below ensureing that it will never be hit.
  //TODO: WE need to add logic for handling vectors of ids
  if object_id_fields.is_empty() {
      object_id_fields = "false".parse::<proc_macro2::TokenStream>().unwrap();
  }
  quote!( pub fn to_bson(&self) -> Result<mongodb::bson::Document, mongodb::bson::ser::Error> {
        let bson = to_bson(&self);
        if bson.is_err() {
            return Err(bson.err().unwrap());
        }
        let bson = bson.unwrap();
        let bson = bson.as_document().unwrap();
        let mut document = Document::new();
        bson.keys().for_each(|key| {
            if #object_id_fields {
                let str_value = bson.get(key).unwrap().as_str().unwrap();
                let object_id = ObjectId::parse_str(str_value).unwrap();
                document.insert(key, mongodb::bson::Bson::ObjectId(object_id)); 
            } else {
                let v = bson.get(key).unwrap().clone();
                document.insert(key, v);
            }
        });
        
       Ok(document) 
    })

}

fn build_creatable_fields(field_definitions: &Vec<&FieldDefinition>) -> proc_macro2::TokenStream {
    let mut output = proc_macro2::TokenStream::new();
    for field in field_definitions.iter() {
      let field_name_ident = format_ident!("{}", field.name);
      let field_type_token_stream : proc_macro2::TokenStream  = field.field_type.parse().unwrap();  
      let pass_through_attributes = field.pass_through_attributes.iter().map(|attr| {
        let attr = attr.parse::<proc_macro2::TokenStream>().unwrap();
        quote!(
            #attr
        )
      }).collect::<Vec<proc_macro2::TokenStream>>();
      let builder_default = if field.default_value.is_some() {
          format!(", default = \"{}\"", field.default_value.as_ref().unwrap())
      } else {
            String::new()
      };
      let creatable = if field.is_createable.is_some() {
            "setter(into)".to_string()
      } else {
            "setter(skip)".to_string()
            
      };
      let builder_attr = format!("#[builder({} {})]", creatable, builder_default);
      let builder_attr = builder_attr.parse::<proc_macro2::TokenStream>().unwrap();
      output.extend(quote!(
        #builder_attr
        #(#pass_through_attributes)*
        #field_name_ident : #field_type_token_stream,
      ));
    }
    output
}

fn build_create_model(ident: &syn::Ident, field_definitions: &Vec<FieldDefinition>) -> proc_macro2::TokenStream {
   let struct_ident = format_ident!("Create{}", ident);
   let createable_fields = field_definitions.iter().filter(|field_definition| {
       field_definition.is_createable.is_some() || field_definition.default_value.is_some()
   }).collect::<Vec<&FieldDefinition>>();
   let createable_field_definitions = build_creatable_fields(&createable_fields);
   let bson_impl = build_to_bson_function(&createable_fields);
   println!("bson_impl: {}", bson_impl.to_string());
   quote!(
        #[derive(Clone, Debug, serde::Serialize, serde::Deserialize, derive_builder::Builder)]
        pub struct #struct_ident {
          #createable_field_definitions
        }

        impl #struct_ident {
            #bson_impl
        }
   )
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

fn get_field_type(field_type: &syn::Type) -> (String, Option<()>, Option<()>) {
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
            return (result, is_option, is_vector);
        }
        if let syn::PathArguments::AngleBracketed(angle_bracketed) = &segment.arguments {
            let args = &angle_bracketed.args;
            if args.len() != 1 {
                panic!("field_type must have a single argument");
            }
            let arg = args.first().unwrap();
            if let syn::GenericArgument::Type(inner_type) = arg {
                let (inner_type, _, _) = get_field_type(inner_type);
                let type_ = format!("{}<{}>", result, inner_type);
                return (type_, is_option, is_vector);
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
            if field_type != "String" && field_type != "Option<String>"  && field_type != "Vec<String>" {
                panic!("object_id is only supported on String, Option<String>, and Vec<String> fields");
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

fn get_pass_through_attributes(field : &syn::Field) -> Vec<String> {
    let mut attrs = Vec::new();
    
    let attr: Vec<&syn::Attribute> = field.attrs.iter().filter(|attr| {
        let path = &attr.path();
        if path.segments.len() != 1 {
            return false;
        }
        let segment = path.segments.first().unwrap();
        &segment.ident != "field_definition"
    }).collect();
    if attr.len() == 0 {
        return attrs;
    } 
    attr.iter().for_each(|token| {
        let token = token.into_token_stream().to_string();
        if !token.is_empty() {
            attrs.push(token.to_string());
        }
    });
    attrs
}
fn get_field_definition(field: &syn::Field) -> FieldDefinition {
    let ident = field.ident.as_ref().unwrap();
    let name = ident.to_string();
    let (field_type, is_option, is_vector) = get_field_type(&field.ty);
    let mut is_vector = if is_vector.is_none() {
        None
    } else {
        Some(VectorFieldDefinition {
            push_type: PushType::Push,
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

    let pass_through_attributes = get_pass_through_attributes(&field);
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
mod create_model {
    use super::*;

    #[test]
    fn is_ok() {

        let token_stream = quote!(
        #[model_definition({"collection" : "processtrackings"})]
        pub struct ProcessTrackingModel {
            #[serde(rename = "_id", deserialize_with = "deserialize_object_id")]
            #[field_definition({"updateable" : false, "createable" : false, "object_id" : true})]
            pub id: String,
            #[serde(rename = "processId")]
            pub process_id: String,
            #[serde(rename = "processName")]
            pub process_name: String,
            #[serde(rename = "processStatus")]
            #[field_definition({"default_value" : "ProcessStatus::Running"})]
            pub process_status: ProcessStatus,
            #[serde(rename = "processStartTime")]
            #[field_definition({"createable" : false, "default_value" : "Some(DateTime::now())"})]
            pub process_start_time: DateTime,
            #[serde(rename = "processEndTime", skip_serializing_if = "Option::is_none")]
            #[field_definition({"createable" : false})]
            pub process_end_time: Option<DateTime>,
            #[serde(rename = "processMessages")]
            #[field_definition({"createable" : false, "default_value" : "Vec::new()"})]
            pub process_messages: Vec<String>,
            #[serde(rename = "processError")]
            #[field_definition({"createable" : false, "default_value" : "Vec::new()"})]
            pub process_error: Vec<Value>,
            #[serde(rename = "processResult", skip_serializing_if = "Option::is_none")]
            #[field_definition({"createable" : false})]
            pub process_result: Option<Value>,
            #[serde(rename = "processHeartbeat", skip_serializing_if = "Option::is_none")]
            #[field_definition({"createable" : false})]
            pub process_heartbeat: Option<DateTime>,
}
        )
        .to_string();
        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let field_definitions = get_field_definitions(&ast);
        let ident = syn::Ident::new("ProcessTrackingModel", proc_macro2::Span::call_site());
        let create_model = build_create_model(&ident, &field_definitions);
        println!("create_model: {}", create_model.to_string());

    }

}
