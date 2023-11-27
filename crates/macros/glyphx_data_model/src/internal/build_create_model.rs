use syn::Ident;
use quote::format_ident;
use super::{FieldDefinition, build_to_bson_function};
use proc_macro2::TokenStream;
use quote::quote;

fn build_creatable_fields(field_definitions: &Vec<&FieldDefinition>) -> TokenStream {
    let mut output = TokenStream::new();
    for field in field_definitions.iter() {
        let field_name_ident = format_ident!("{}", field.name);
        let field_type_token_stream: TokenStream = field.field_type.parse().unwrap();
        let pass_through_attributes = field
            .pass_through_attributes
            .iter()
            .map(|attr| {
                let attr = attr.parse::<proc_macro2::TokenStream>().unwrap();
                quote!(
                    #attr
                )
            })
            .collect::<Vec<TokenStream>>();
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
        let builder_attr = builder_attr.parse::<TokenStream>().unwrap();
        output.extend(quote!(
          #builder_attr
          #(#pass_through_attributes)*
          #field_name_ident : #field_type_token_stream,
        ));
    }
    output
}



pub fn build_create_model(
    ident: &Ident,
    field_definitions: &Vec<FieldDefinition>,
) -> TokenStream {
    let struct_ident = format_ident!("Create{}", ident);
    let createable_fields = field_definitions
        .iter()
        .filter(|field_definition| {
            field_definition.is_createable.is_some() || field_definition.default_value.is_some()
        })
        .collect::<Vec<&FieldDefinition>>();
    let createable_field_definitions = build_creatable_fields(&createable_fields);
    let bson_impl = build_to_bson_function(&createable_fields, None, None);
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
