use std::str::FromStr;

use aws_sdk_athena::types::{ColumnNullable, ResultSet, ResultSetMetadata};
use serde_json::{json, Map, Value};

///This enum holds the legal datatypes that can be returned from Athena and converted to JSON.
#[derive(Debug)]
enum LegalDataTypes {
    Bool(String),
    Number(String),
    String(String),
    Illegal(String),
}
///This internal struct holds information about the columns that were returned in the ResultSet from Athena.
///This repesents a conversion of the metadata information from the ResultSetMetadata struct into
///something useful for this task.
struct ColumnInformation {
    name: String,
    data_type: LegalDataTypes,
    nullable: bool,
}

///This function will take the input Athena type and convert it into the appropriate LegalDataTypes enum.
///# Arguments
///* `input` - A string that represents the Athena data type.
fn convert_data_type_to_legal_type(input: &str) -> LegalDataTypes {
    let clone = input.to_string();
    match input {
        "boolean" => LegalDataTypes::Bool(clone),
        "tinyint" => LegalDataTypes::Number(clone),
        "smallint" => LegalDataTypes::Number(clone),
        "int" => LegalDataTypes::Number(clone),
        "integer" => LegalDataTypes::Number(clone),
        "bigint" => LegalDataTypes::Number(clone),
        "double" => LegalDataTypes::Number(clone),
        "float" => LegalDataTypes::Number(clone),
        "decimal" => LegalDataTypes::Number(clone),
        "string" => LegalDataTypes::String(clone),
        value if value.starts_with("char") => LegalDataTypes::String(String::from("char")),
        value if value.starts_with("varchar") => LegalDataTypes::String(String::from("varchar")),
        _ => LegalDataTypes::Illegal(clone),
    }
}

///This function will take in a ResultSetMetadata struct from a ResultSet and convert it into a Vec of ColumnInformation structs.
///# Arguments
///`metadata` - A ResultSetMetadata struct that contains information about the columns returned from Athena.
fn get_column_info(metadata: &ResultSetMetadata) -> Vec<ColumnInformation> {
    let mut column_information: Vec<ColumnInformation> = Vec::new();
    for column in metadata.column_info() {
        let name = column.name();
        let data_type = column.r#type();
        let nullable = match column.nullable().unwrap() {
            ColumnNullable::Nullable => true,
            _ => false,
        };
        column_information.push(ColumnInformation {
            name: name.to_string(),
            data_type: convert_data_type_to_legal_type(data_type),
            nullable,
        });
    }
    column_information
}

///This conversion function will take in a &str from a result set and attempt to convert it to a
///JSON Boolean value. 
///# Arguments
///`input` - A &str that represents a value from a result set.
fn convert_str_to_json_bool(input: &str) -> Value {
    let clean_input = input.trim().to_lowercase();
    match clean_input.as_str() {
        "true" => Value::Bool(true),
        "false" => Value::Bool(false),
        "t" => Value::Bool(true),
        "f" => Value::Bool(false),
        "yes" => Value::Bool(true),
        "no" => Value::Bool(false),
        "y" => Value::Bool(true),
        "n" => Value::Bool(false),
        "1" => Value::Bool(true),
        "0" => Value::Bool(false),
        _ => Value::Null,
    }
}

///This conversion function will take in a &str from a result set and attempt to convert it to a
///JSON Number value.
///# Arguments
///`input` - A &str that represents a value from a result set.
fn convert_str_to_json_number(input: &str) -> Value {
    let clean_input = input.trim().to_lowercase();
    let nu = serde_json::Number::from_str(&clean_input);
    if nu.is_ok() {
        return Value::Number(nu.unwrap());
    } else {
        return Value::Null;
    }
}

///This conversion function will convert the input into a JSON Boolean.  It also handles null
///processing.
///# Arguments
///`input` - An Option<&str> that represents a value from a result set.
///`nullable` - A boolean that indicates if the field is nullable. If the field is nullable and the
///input is None or cannot be converted to a JSON Boolean, then a JSON Null will be returned.
///If the field is not nullable Null will be converted to false.
fn convert_boolean_field(input: &Option<&str>, nullable: bool) -> Value {
    if input.is_some() {
        let input = input.unwrap();
        let value = convert_str_to_json_bool(input);
        if value.is_null() && !nullable {
            return Value::Bool(false);
        } else {
            return value;
        }
    } else {
        if nullable {
            return Value::Null;
        } else {
            return Value::Bool(false);
        }
    }
}

///This conversion function will convert the input into a JSON Number.  It also handles null
///processing.
///# Arguments
///`input` - An Option<&str> that represents a value from a result set.
///`nullable` - A boolean that indicates if the field is nullable. If the field is nullable and the
///input is None or cannot be converted to a JSON Number, then a JSON Null will be returned.
///If the field is not nullable Null will be converted to 0.
fn convert_number_field(input: &Option<&str>, nullable: bool) -> Value {
    if input.is_some() {
        let input = input.unwrap();
        let value = convert_str_to_json_number(input);
        if value.is_null() && !nullable {
            return Value::Number(serde_json::Number::from(0));
        } else {
            return value;
        }
    } else {
        if nullable {
            return Value::Null;
        } else {
            return Value::Number(serde_json::Number::from(0));
        }
    }
}
///This conversion function will convert the input into a JSON String.  It also handles null
///processing.
///# Arguments
///`input` - An Option<&str> that represents a value from a result set.
///`nullable` - A boolean that indicates if the field is nullable. If the field is nullable and the
///input is None then a JSON Null will be returned.
///If the field is not nullable Null will be converted to an empty string.
fn convert_string_field(input: &Option<&str>, nullable: bool) -> Value {
    if input.is_none() && !nullable {
        return Value::String(String::from(""));
    } else if input.is_none() {
        return Value::Null;
    } else {
        let value = input.unwrap().trim().to_string();
        return Value::String(value);
    }
}

///This conversion function will convert the ResultSet into a JSON String. There is also an
///optional paramter to exlcude the first row of the result set.  This is useful, because some 
///queries/commands in athena will include a header row in the data as well as the information in
///the resultMetadata.  The includes_header_row will tell the function to skip the first row.
///# Arguments
///`result_set` - A ResultSet from the athena client.
///`includes_header_row` - An optional boolean that indicates if the first row should be skipped.
pub fn convert_to_json(result_set: &ResultSet, includes_header_row: Option<bool>) -> Vec<Value> {
    let includes_header_row = includes_header_row.unwrap_or(false);
    let metadata = result_set.result_set_metadata().unwrap();
    let column_information = get_column_info(&metadata);
    let mut rows: Vec<Value> = Vec::new();
    let mut first = true;
    if result_set.rows().is_empty() {
        return rows;
    }
    for row in result_set.rows() {
        if first && includes_header_row {
            first = false;
            continue;
        }
        let mut key_values: Map<String, Value> = Map::new();
        let mut column_num = 0;
        for column in row.data() {
            let column_value = column.var_char_value();
            let column_information = &column_information[column_num];
            let column_name = &column_information.name;
            let column_type = &column_information.data_type;
            let column_nullable = &column_information.nullable;
            let column_value = match column_type {
                LegalDataTypes::Bool(_) => convert_boolean_field(&column_value, *column_nullable),
                LegalDataTypes::Number(_) => convert_number_field(&column_value, *column_nullable),
                LegalDataTypes::String(_) => convert_string_field(&column_value, *column_nullable),
                // Illeagal data types will never be included.
                LegalDataTypes::Illegal(_) => Value::Null,
            };
            key_values.insert(column_name.to_string(), column_value);
            column_num += 1;
        }
        rows.push(Value::Object(key_values));

        first = false;
    }
    rows
}

#[cfg(test)]
mod convert_data_type_to_legal_type {
    use super::*;
    #[test]
    fn is_bool() {
        let input = "boolean";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Bool(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_tinyint() {
        let input = "tinyint";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_smallint() {
        let input = "smallint";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_int() {
        let input = "int";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_integer() {
        let input = "integer";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_bigint() {
        let input = "bigint";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_double() {
        let input = "double";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_float() {
        let input = "float";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_number_decimal() {
        let input = "decimal";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Number(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_string() {
        let input = "string";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::String(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_string_char() {
        let input = "char(10)";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::String(_) => assert!(true),
            _ => assert!(false),
        }
        let input = "char";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::String(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_string_varchar() {
        let input = "varchar(10)";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::String(_) => assert!(true),
            _ => assert!(false),
        }

        let input = "varchar";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::String(_) => assert!(true),
            _ => assert!(false),
        }
    }

    #[test]
    fn is_illegal() {
        let input = "illegal";
        let result = convert_data_type_to_legal_type(input);
        match result {
            LegalDataTypes::Illegal(_) => assert!(true),
            _ => assert!(false),
        }
    }
}
#[cfg(test)]
mod get_column_info {
    use super::*;
    use aws_sdk_athena::types::ColumnInfo;

    #[test]
    fn is_ok() {
        let metadata = ResultSetMetadata::builder()
            .set_column_info(Some(vec![
                ColumnInfo::builder()
                    .name("col1".to_string())
                    .r#type("varchar".to_string())
                    .nullable(ColumnNullable::Nullable)
                    .build().unwrap(),
                ColumnInfo::builder()
                    .name("col2".to_string())
                    .r#type("bigint".to_string())
                    .nullable(ColumnNullable::NotNull)
                    .build().unwrap(),
            ]))
            .build();

        let result = get_column_info(&metadata);
        assert_eq!(result.len(), 2);
        assert_eq!(result[0].name, "col1");
        assert!(match &result[0].data_type {
            LegalDataTypes::String(s) => s == "varchar",
            _ => false,
        });
        assert_eq!(result[0].nullable, true);

        assert_eq!(result[1].name, "col2");
        assert!(match &result[1].data_type {
            LegalDataTypes::Number(s) => s == "bigint",
            _ => false,
        });
        assert_eq!(result[1].nullable, false);
    }
}

#[cfg(test)]
mod conver_str_to_json_bool {
    use super::*;

    #[test]
    fn true_is_true() {
        let input = "true";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, true);
    }

    #[test]
    fn t_is_true() {
        let input = "t";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, true);
    }

    #[test]
    fn yes_is_true() {
        let input = "yes";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, true);
    }

    #[test]
    fn y_is_true() {
        let input = "y";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, true);
    }

    #[test]
    fn one_is_true() {
        let input = "1";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, true);
    }

    #[test]
    fn false_is_false() {
        let input = "false";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, false);
    }

    #[test]
    fn f_is_true() {
        let input = "f";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, false);
    }

    #[test]
    fn no_is_false() {
        let input = "no";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, false);
    }

    #[test]
    fn n_is_false() {
        let input = "n";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, false);
    }

    #[test]
    fn zero_is_false() {
        let input = "0";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, false);
    }

    #[test]
    fn anything_else_is_null() {
        let input = "some value";
        let result = convert_str_to_json_bool(input);
        assert_eq!(result, Value::Null);
    }
}

#[cfg(test)]
mod convert_str_to_json_number {
    use super::*;

    #[test]
    fn simple_int() {
        let input = "123";
        let result = convert_str_to_json_number(input);
        assert_eq!(result, 123);
    }
    #[test]
    fn simple_decimal() {
        let input = "123.09";
        let result = convert_str_to_json_number(input);
        assert_eq!(result, 123.09);
    }

    #[test]
    fn is_err() {
        let input = "abc";
        let result = convert_str_to_json_number(input);
        assert_eq!(result, Value::Null);
    }
}

#[cfg(test)]
mod convert_boolean_field {
    use super::*;

    #[test]
    fn convert_to_true() {
        let input = "true";
        let result = convert_boolean_field(&Some(input), false);
        assert_eq!(result, true);
    }

    #[test]
    fn convert_to_false() {
        let input = "false";
        let result = convert_boolean_field(&Some(input), false);
        assert_eq!(result, false);
    }

    #[test]
    fn convert_empty_is_nullable() {
        let input = "";
        let result = convert_boolean_field(&Some(input), true);
        assert_eq!(result, Value::Null);
    }

    #[test]
    fn convert_empty_is_not_nullable() {
        let input = "";
        let result = convert_boolean_field(&Some(input), false);
        assert_eq!(result, false);
    }

    #[test]
    fn convert_none_is_nullable() {
        let result = convert_boolean_field(&None, true);
        assert_eq!(result, Value::Null);
    }

    #[test]
    fn convert_none_is_not_nullable() {
        let result = convert_boolean_field(&None, false);
        assert_eq!(result, false);
    }
}

#[cfg(test)]
mod convert_number_field {
    use super::*;

    #[test]
    fn convert_to_number() {
        let input = "123";
        let result = convert_number_field(&Some(input), false);
        assert_eq!(result, 123);
    }

    #[test]
    fn convert_empty_is_nullable() {
        let input = "";
        let result = convert_number_field(&Some(input), true);
        assert_eq!(result, Value::Null);
    }

    #[test]
    fn convert_empty_is_not_nullable() {
        let input = "";
        let result = convert_number_field(&Some(input), false);
        assert_eq!(result, 0);
    }

    #[test]
    fn convert_none_is_nullable() {
        let result = convert_number_field(&None, true);
        assert_eq!(result, Value::Null);
    }

    #[test]
    fn convert_none_is_not_nullable() {
        let result = convert_number_field(&None, false);
        assert_eq!(result, 0);
    }
}

#[cfg(test)]
mod convert_string_field {
    use super::*;

    #[test]
    fn convert_to_string() {
        let input = "123";
        let result = convert_string_field(&Some(input), false);
        assert_eq!(result, "123");
    }

    #[test]
    fn convert_empty_is_nullable() {
        let input = "";
        let result = convert_string_field(&Some(input), true);
        assert_eq!(result, String::from(""));
    }

    #[test]
    fn convert_none_is_not_nullable() {
        let result = convert_string_field(&None, false);
        assert_eq!(result, String::from(""));
    }

    #[test]
    fn convert_none_is_nullable() {
        let result = convert_string_field(&None,true);
        assert_eq!(result, Value::Null);
    }
}

#[cfg(test)]
mod convert_to_json{
  use super::*;
  use aws_sdk_athena::types::{Row, Datum, ColumnInfo};

  #[test]
  fn convert_result_set() {
        let metadata = ResultSetMetadata::builder()
            .set_column_info(Some(vec![
                ColumnInfo::builder()
                    .name("col1".to_string())
                    .r#type("varchar".to_string())
                    .nullable(ColumnNullable::Nullable)
                    .build().unwrap(),
                ColumnInfo::builder()
                    .name("col2".to_string())
                    .r#type("bigint".to_string())
                    .nullable(ColumnNullable::NotNull)
                    .build().unwrap(),
            ]))
            .build();

        let mut result_set = ResultSet::builder().result_set_metadata(metadata);

            result_set = result_set.rows(Row::builder()
                .set_data(Some(vec![
                    Datum::builder().set_var_char_value(Some("abc".to_string())).build(),
                    Datum::builder().set_var_char_value(Some("123".to_string())).build(),
                ]))
                .build());

            result_set = result_set.rows(Row::builder()
                .set_data(Some(vec![
                    Datum::builder().set_var_char_value(Some("cba".to_string())).build(),
                    Datum::builder().set_var_char_value(Some("321".to_string())).build(),
                ]))
                .build());
            let result_set = result_set.build();

            let result = convert_to_json(&result_set, None);

            assert_eq!(result.len(), 2);

            let row1 = &result[0];
            assert!(row1.is_object());
            let row1 = row1.as_object();
            assert!(row1.is_some());
            let row1 = row1.unwrap();
            assert_eq!(row1.len(), 2);
            assert_eq!(row1.get("col1").unwrap(), "abc");
            assert_eq!(row1.get("col2").unwrap(), 123);

            let row2 = &result[1];
            assert!(row2.is_object());
            let row2 = row2.as_object();
            assert!(row2.is_some());
            let row2 = row2.unwrap();
            assert_eq!(row2.len(), 2);
            assert_eq!(row2.get("col1").unwrap(), "cba");
            assert_eq!(row2.get("col2").unwrap(), 321);

  }

  #[test]
  fn convert_result_set_exclude_header_row() {
        let metadata = ResultSetMetadata::builder()
            .set_column_info(Some(vec![
                ColumnInfo::builder()
                    .name("col1".to_string())
                    .r#type("varchar".to_string())
                    .nullable(ColumnNullable::Nullable)
                    .build().unwrap(),
                ColumnInfo::builder()
                    .name("col2".to_string())
                    .r#type("bigint".to_string())
                    .nullable(ColumnNullable::NotNull)
                    .build().unwrap(),
            ]))
            .build();

        let mut result_set = ResultSet::builder().result_set_metadata(metadata);

            result_set = result_set.rows(Row::builder()
                .set_data(Some(vec![
                    Datum::builder().set_var_char_value(Some("abc".to_string())).build(),
                    Datum::builder().set_var_char_value(Some("123".to_string())).build(),
                ]))
                .build());

            result_set = result_set.rows(Row::builder()
                .set_data(Some(vec![
                    Datum::builder().set_var_char_value(Some("cba".to_string())).build(),
                    Datum::builder().set_var_char_value(Some("321".to_string())).build(),
                ]))
                .build());
            let result_set = result_set.build();

            let result = convert_to_json(&result_set, Some(true));
            assert_eq!(result.len(), 1);

            let row = &result[0];
            assert!(row.is_object());
            let row = row.as_object();
            assert!(row.is_some());
            let row = row.unwrap();
            assert_eq!(row.len(), 2);
            assert_eq!(row.get("col1").unwrap(), "cba");
            assert_eq!(row.get("col2").unwrap(), 321);

  }

  #[test]
  fn convert_result_set_no_rows() {
        let metadata = ResultSetMetadata::builder()
            .set_column_info(Some(vec![
                ColumnInfo::builder()
                    .name("col1".to_string())
                    .r#type("varchar".to_string())
                    .nullable(ColumnNullable::Nullable)
                    .build().unwrap(),
                ColumnInfo::builder()
                    .name("col2".to_string())
                    .r#type("bigint".to_string())
                    .nullable(ColumnNullable::NotNull)
                    .build().unwrap(),
            ]))
            .build();

        let result_set = ResultSet::builder().result_set_metadata(metadata);

            let result_set = result_set.build();

            let result = convert_to_json(&result_set, None);
            assert!(result.len() == 0);
  }
}
