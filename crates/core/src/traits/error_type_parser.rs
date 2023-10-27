use glyphx_types::error::GlyphxErrorData;
pub trait ErrorTypeParser {
    fn parse_error_type(&self) -> String;
    fn get_glyphx_error_data(&self) -> &GlyphxErrorData;
}
