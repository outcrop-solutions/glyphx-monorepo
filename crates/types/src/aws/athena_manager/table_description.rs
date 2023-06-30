///! This module contains types for use with the get_table_description method.


///This enum represents the available column data types in Athena.
#[derive(Debug)]
pub enum ColumnDataType {
  ///Double precision floating point value.
  NUMBER,
  ///A String or varchar value.
  STRING,
  ///A Bigint
  INTEGER,
  ///A Date in Double format.
  DATE,
  ///Other data types that we do not support.
  UNKNOWN,

}

///Describes the columns in an athena table.
#[derive(Debug)]
pub struct ColumnDescription {
    ///The name of the column.
    pub name: String,
    ///The data type of the column.
    pub data_type: ColumnDataType,
}
