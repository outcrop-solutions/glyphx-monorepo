use proc_macro::TokenStream;
use quote::{format_ident, quote};
use syn::{parse_macro_input, Data, DataEnum, DeriveInput, Ident};
#[proc_macro_derive(GlyphxDataModel, attributes(model_definition))]
pub fn derive(input: TokenStream) -> TokenStream {
   quote!().into()
}
