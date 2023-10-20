use crate::error::GlyphxErrorData;

#[derive(Debug)]
pub enum GetSecretsValueError {
    SecretNotDefined(GlyphxErrorData),
    InvalidJson(GlyphxErrorData),
    UnexpectedError(GlyphxErrorData),

}

