use crate::types::FieldType;
use crate::types::field_definition_type::FieldDefinitionType;
pub enum FieldDefinition {
    Standard {
        field_display_name: String,
        field_data_type: FieldType,
        field_definition: StandardFieldDefinition,
    },
    //    Formula(FormulaFieldDefinition),
    //    Date(DateFieldDefinition),
    //   Accumulated(AccumulatedFieldDefinition),
       Unknown(),
}
pub struct StandardFieldDefinition {
   pub field_type: FieldDefinitionType,
   pub field_name: String
}
