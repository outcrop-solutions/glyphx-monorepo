use crate::types::vectorizer_parameters::field_definition::accumulated_field_definition_errors::FromJsonError as AccumulatorFieldDefinitionFromJsonError;
use crate::types::vectorizer_parameters::field_definition::date_field_definition_errors::FromJsonError as DateFieldDefinitionFromJsonError;
use crate::types::vectorizer_parameters::field_definition::standard_field_definition_errors::FromJsonError as StandardFieldDefinitionFromJsonError;
use crate::types::vectorizer_parameters::helper_functions::JsonHasFieldError;
use glyphx_core::GlyphxError;
use glyphx_core::GlyphxErrorData;

use serde_json::{from_str, Value};
#[derive(Debug, Clone, GlyphxError)]
#[error_definition("FieldDefinition")]
pub enum FromJsonError {
    FieldNotDefined(GlyphxErrorData),
    InvalidFieldType(GlyphxErrorData),
    InvalidFieldDefinitionType(GlyphxErrorData),
    StandardFieldDefinitionError(GlyphxErrorData),
    DateFieldDefinitionError(GlyphxErrorData),
    AccumulatorFieldDefinitionError(GlyphxErrorData),
}

impl FromJsonError {
    pub fn from_json_has_field_error(input: JsonHasFieldError) -> Self {
        match input {
            JsonHasFieldError::JsonValidationError(data) => Self::FieldNotDefined(data),
        }
    }

    pub fn from_standard_field_from_json_error(
        input: StandardFieldDefinitionFromJsonError,
    ) -> Self {
        match input {
            StandardFieldDefinitionFromJsonError::FieldNotDefined(data) => {
                FromJsonError::StandardFieldDefinitionError(data)
            }
        }
    }

    pub fn from_date_field_from_json_error(input: DateFieldDefinitionFromJsonError) -> Self {
        match input {
            DateFieldDefinitionFromJsonError::FieldNotDefined(data) => {
                FromJsonError::DateFieldDefinitionError(data)
            }
        }
    }

    pub fn from_accumulated_field_from_json_error(
        input: AccumulatorFieldDefinitionFromJsonError,
    ) -> Self {
        match &input {
            AccumulatorFieldDefinitionFromJsonError::FieldNotDefined(data) => {
                Self::reformat_accumlator_error(&input, data, "FieldNotDefined")
            }
            AccumulatorFieldDefinitionFromJsonError::InvalidFieldDefinitionType(data) => {
                Self::reformat_accumlator_error(&input, data, "InvalidFieldDefinitionType")
            }
            AccumulatorFieldDefinitionFromJsonError::StandardFieldDefinitionFromJsonError(
                 data,
            ) => Self::reformat_accumlator_error(
                &input,
                data,
                "StandardFieldDefinitionFromJsonError",
            ),
            AccumulatorFieldDefinitionFromJsonError::DateFieldDefinitionFromJsonError(data) => {
                Self::reformat_accumlator_error(
                    &input,
                    data,
                    "DateFieldDefinitionFromJsonError",
                )
            }
        }
    }

    fn reformat_accumlator_error(
        input: &AccumulatorFieldDefinitionFromJsonError,
        data: &GlyphxErrorData,
        error_type: &str,
    ) -> FromJsonError {
        let j: Value = from_str(&input.to_string()).unwrap();
        let d = data.clone();
        let mut d = d.data.unwrap();
        d["errorType"] = error_type.into();
        let glyphx_error_data = GlyphxErrorData::new(data.message.clone(), Some(d), Some(j));
        FromJsonError::AccumulatorFieldDefinitionError(glyphx_error_data)
    }
}
