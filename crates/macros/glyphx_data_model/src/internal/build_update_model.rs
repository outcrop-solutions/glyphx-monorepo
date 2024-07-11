use syn::Ident;
use proc_macro2::TokenStream;
use quote::{quote, format_ident};
use super::types::*;
use super::build_to_bson::build_to_bson_function;


fn build_is_valid_function(updateable_fields: &Vec<&FieldDefinition>) -> TokenStream {
    let mut output = TokenStream::new();
    let mut is_valid_checks = Vec::new();
    for field in updateable_fields.iter() {
        let is_valid_check = format!("self.{}.is_some()", field.name);
        is_valid_checks.push(is_valid_check);
    }
    let is_valid_checks = is_valid_checks.join(" || ");
    let is_valid_checks = is_valid_checks.parse::<TokenStream>().unwrap();
    output.extend(quote!(
        pub fn is_valid(&self) -> bool {
            #is_valid_checks
        }
    ));
    output
}

fn build_updateable_fields(field_definitions: &Vec<&FieldDefinition>) -> TokenStream {
    let mut output = TokenStream::new();
    for field in field_definitions.iter() {
        let field_name_ident = format_ident!("{}", field.name);
        let field_type_token_stream: TokenStream = if field.is_option.is_some() {
            field.field_type.parse().unwrap()
        } else {
            let raw_type = format!("Option<{}>", field.field_type);
            raw_type.parse().unwrap()
        };
        let pass_through_attributes = field
            .pass_through_attributes
            .iter()
            .map(|attr| {
                let attr = attr.parse::<TokenStream>().unwrap();
                quote!(
                    #attr
                )
            })
            .collect::<Vec<TokenStream>>();
        let _builder_default = if field.default_value.is_some() {
            format!(", default = \"{}\"", field.default_value.as_ref().unwrap())
        } else {
            String::new()
        };

        let serde_attribute = if field.pass_through_attributes.iter().any(|attr| {
            let attr = attr.to_string();
            attr.contains("skip_serializing_if")
        }) {
            String::new()
        } else {
            "#[serde(skip_serializing_if = \"Option::is_none\")]".to_string()
        };
        let serde_attribute = serde_attribute.parse::<TokenStream>().unwrap();

        output.extend(quote!(
          #[builder(setter(into, strip_option), default = "None")]
          #serde_attribute
          #(#pass_through_attributes)*
          #field_name_ident : #field_type_token_stream,
        ));
    }
    output
}
//TODO: something to consider here is to create an atribute that will allow us to set a default on
//an update, i.e. an updated_at date.
pub fn build_update_model(
    ident: &Ident,
    field_definitions: &Vec<FieldDefinition>,
) -> TokenStream {
    let struct_ident = format_ident!("Update{}", ident);
    let updateable_fields = field_definitions
        .iter()
        .filter(|field_definition| field_definition.is_updateable.is_some())
        .collect::<Vec<&FieldDefinition>>();
    let updateable_field_definitions = build_updateable_fields(&updateable_fields);
    let bson_impl = build_to_bson_function(&updateable_fields, Some(()), None);
    let is_valid_function = build_is_valid_function(&updateable_fields);
    quote!(
         #[derive(Clone, Debug, serde::Serialize, serde::Deserialize, derive_builder::Builder)]
         pub struct #struct_ident {
           #updateable_field_definitions
         }

         impl #struct_ident {
             #bson_impl

             #is_valid_function
         }
    )
}
