mod standard_field_definition;
mod date_field_definition;

pub use standard_field_definition::StandardFieldDefinition;
pub use date_field_definition::{DateFieldDefinition, DateGrouping};

use crate::types::FieldType;
pub enum FieldDefinition {
    Standard {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: StandardFieldDefinition,
    },
    //    Formula(FormulaFieldDefinition),
    Date{ 
        field_display_name: String,
        field_data_type: FieldType,
        field_definition:DateFieldDefinition
    },
    //   Accumulated(AccumulatedFieldDefinition),
       Unknown(),
}
