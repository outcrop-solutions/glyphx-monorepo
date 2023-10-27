use proc_macro::TokenStream;
use quote::{format_ident, quote};
use syn::{parse_macro_input, Data, DataEnum, DeriveInput, Ident};
#[proc_macro_derive(GlyphxError, attributes(error_definition))]
pub fn derive(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);
    let error_ident = ast.ident.clone();
    let data = get_enum_data(&ast);
    let module = get_module(&ast);
    let error_type_parser_trait = generate_error_type_parser_trait(&ast.ident, &data);
    let q = quote!(
    use glyphx_core::traits::ErrorTypeParser;
    #error_type_parser_trait

    impl std::fmt::Display for #error_ident {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            let json = glyphx_core::json!({
                "module": #module,
                "errorType" : stringify!(#error_ident),
                "error": self.parse_error_type(),
                "glyphxErrorData": self.get_glyphx_error_data().to_json(),
            });
            write!(f, "{}", json)
        }
    }
    );
    q.into()
}

fn generate_parse_error_type(idents: &Vec<Ident>) -> proc_macro2::TokenStream {
    let mut parse_error_match_arms = quote!();
    for ident in idents {
        parse_error_match_arms = quote!(
            #parse_error_match_arms
            Self::#ident(_) => stringify!(#ident).to_string(),
        );
    }

    quote!(
    fn parse_error_type(&self) -> String {
    let error_data = match self {
        #parse_error_match_arms
        _ => panic!("unknown error type"),
    };
    error_data
    }
    )
}

fn generate_get_glyphx_error_data(idents: &Vec<Ident>) -> proc_macro2::TokenStream {
    let mut parse_error_match_arms = quote!();
    for ident in idents {
        parse_error_match_arms = quote!(
            #parse_error_match_arms
            Self::#ident(data) => data,
        );
    }

    quote!(
    fn get_glyphx_error_data(&self) -> &GlyphxErrorData {
    let error_type = match self {
        #parse_error_match_arms
        _ => panic!("unknown error type"),
    };
    error_type
    }
    )
}

fn generate_logging_functions() -> proc_macro2::TokenStream {
    quote!(
        fn trace(&self) {
            glyphx_core::trace!("{}", self);
        }
        fn debug(&self) {
            glyphx_core::debug!("{}", self);
        }
        fn info(&self) {
            glyphx_core::info!("{}", self);
        }
        fn warn(&self) {
            glyphx_core::warn!("{}", self);
        }
        fn error(&self) {
            glyphx_core::error!("{}", self);
        }
        fn fatal(&self) {
            glyphx_core::error!("{}", self);
            panic!("A Fatal Error has Occurred : error : {}", self);
        }
    )
}

fn generate_error_type_parser_trait(
    struct_ident: &Ident,
    enum_data: &DataEnum,
) -> proc_macro2::TokenStream {
    let variant_idents = get_variant_idents(enum_data);
    let parse_errors = generate_parse_error_type(&variant_idents);
    let get_data = generate_get_glyphx_error_data(&variant_idents);
    let logging_functions = generate_logging_functions();
    quote!(
        impl ErrorTypeParser for #struct_ident {
            #parse_errors
            #get_data
            #logging_functions
    }
    )
}

fn get_variant_idents(enum_data: &DataEnum) -> Vec<Ident> {
    enum_data
        .variants
        .iter()
        .map(|variant| variant.ident.clone())
        .collect()
}

fn get_enum_data(ast: &DeriveInput) -> &syn::DataEnum {
    match &ast.data {
        Data::Enum(data) => data,
        _ => panic!("GlyphxError can only be used on enums"),
    }
}

fn get_module(ast: &DeriveInput) -> String {
    let attr = ast.attrs.iter().find(|attr| {
        let path = &attr.path();
        if path.segments.len() != 1 {
            return false;
        }
        let segment = path.segments.first().unwrap();
        return &segment.ident == "error_definition";
    });

    if attr.is_none() {
        panic!("error_definition attribute not found");
    }

    let attr = attr.unwrap();

    let meta_list = match &attr.meta {
        syn::Meta::List(meta_list) => meta_list,
        _ => panic!("error_definition attribute must be a list"),
    };
    let tokens = meta_list.tokens.to_string().replace("\"", "");
    if tokens.is_empty() {
        panic!("error_definition attribute must have a value");
    }

    tokens
}

#[cfg(test)]
mod get_enum_data {
    use super::*;

    #[test]
    fn is_ok() {
        let token_stream = quote!(
            #[error_definition("test")]
            enum TestError {
                TestError1,
                TestError2,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        get_enum_data(&ast);
        assert!(true);
    }

    #[test]
    #[should_panic(expected = "GlyphxError can only be used on enums")]
    fn is_err() {
        let token_stream = quote!(
            #[error_definition("test")]
            struct TestError {
                TestError1: String,
                TestError2: String,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream);
        eprintln!("ast: {:?}", &ast);
        let ast = ast.unwrap();
        get_enum_data(&ast);
    }
}

#[cfg(test)]
mod get_ident {
    use super::*;

    #[test]
    fn is_ok() {
        let token_stream = quote!(
            #[error_definition("test")]
            enum TestError {
                TestError1,
                TestError2,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let ident = get_module(&ast);
        assert_eq!(ident, "test::TestError");
    }

    #[test]
    #[should_panic(expected = "error_definition attribute not found")]
    fn no_error_definition_attribute() {
        let token_stream = quote!(
            enum TestError {
                TestError1,
                TestError2,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        get_module(&ast);
    }

    #[test]
    #[should_panic(expected = "error_definition attribute must be a list")]
    fn no_value_for_secret_binder_attribute() {
        let token_stream = quote!(
            #[error_definition]
            enum TestError {
                TestError1,
                TestError2,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        get_module(&ast);
    }

    #[test]
    #[should_panic(expected = "error_definition attribute must have a value")]
    fn empty_value_for_secret_binder_attribute() {
        let token_stream = quote!(
            #[error_definition()]
            enum TestError {
                TestError1,
                TestError2,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        get_module(&ast);
    }
}

#[cfg(test)]
mod get_variant_idents {
    use super::*;

    #[test]
    fn is_ok() {
        let token_stream = quote!(
            #[error_definition("test")]
            enum TestError {
                TestError1,
                TestError2,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let enum_data = match &ast.data {
            Data::Enum(data) => data,
            _ => panic!("not an enum"),
        };
        let result = get_variant_idents(&enum_data);
        let variant1 = result[0].to_string();
        let variant2 = result[1].to_string();
        assert_eq!(variant1, "TestError1");
        assert_eq!(variant2, "TestError2");
    }
}

#[cfg(test)]
mod generate_error_type_parser_trait {
    use super::*;

    #[test]
    fn is_ok() {
        let token_stream = quote!(
            #[error_definition("test")]
            enum TestError {
                TestError1,
                TestError2,
            }
        )
        .to_string();

        let ast = syn::parse_str::<syn::DeriveInput>(&token_stream).unwrap();
        let enum_data = match &ast.data {
            Data::Enum(data) => data,
            _ => panic!("not an enum"),
        };
        let result = generate_error_type_parser_trait(&ast.ident, &enum_data);
        eprintln!("result: {}", result);
    }
}
