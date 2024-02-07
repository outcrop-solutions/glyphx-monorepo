use crate::types::error::GlyphxErrorData;

pub trait ErrorTypeParser {
    fn parse_error_type(&self) -> String;
    fn get_glyphx_error_data(&self) -> &GlyphxErrorData;
    fn from_str(variant_name: &str, error_data: GlyphxErrorData) -> Self;
    fn trace(&self);
    fn debug(&self);
    fn info(&self);
    fn warn(&self);
    fn error(&self);
    fn fatal(&self);

}
