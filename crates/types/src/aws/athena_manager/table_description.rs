#[derive(Debug)]
pub enum ColumnDataType {
  NUMBER,
  STRING,
  INTEGER,
  DATE,
  UNKNOWN,

}

#[derive(Debug)]
pub struct ColumnDescription {
    pub name: String,
    pub data_type: ColumnDataType,
}
