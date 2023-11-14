pub trait EnumDataModelField {
    fn get_validation_variants() -> Vec<String>;
    fn from_str(value: &str) -> Self;
}
