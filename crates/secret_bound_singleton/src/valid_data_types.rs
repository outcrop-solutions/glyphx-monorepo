#[derive(Debug)]
pub enum ValidDataTypes {
    String,
    U32,
    U64,
    I32,
    I64,
    F32,
    F64,
    Bool,
}

impl ValidDataTypes {
    pub fn from_ident(ident: &str) -> ValidDataTypes {
        match ident {
            "String" => ValidDataTypes::String,
            "u32" => ValidDataTypes::U32,
            "u64" => ValidDataTypes::U64,
            "i32" => ValidDataTypes::I32,
            "i64" => ValidDataTypes::I64,
            "f32" => ValidDataTypes::F32,
            "f64" => ValidDataTypes::F64,
            "bool" => ValidDataTypes::Bool,
            _ => panic!("Invalid data type"),
        }
    }
}

#[cfg(test)]
mod from_ident {
    use super::*;

    #[test]
    #[ignore]
    fn string() {
        match ValidDataTypes::from_ident("String") {
            ValidDataTypes::String => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[ignore]
    fn u32() {
        match ValidDataTypes::from_ident("u32") {
            ValidDataTypes::U32 => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[ignore]
    fn u64() {
        match ValidDataTypes::from_ident("u64") {
            ValidDataTypes::U64 => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[ignore]
    fn i32() {
        match ValidDataTypes::from_ident("i32") {
            ValidDataTypes::I32 => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[ignore]
    fn i64() {
        match ValidDataTypes::from_ident("i64") {
            ValidDataTypes::I64 => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[ignore]
    fn f32() {
        match ValidDataTypes::from_ident("f32") {
            ValidDataTypes::F32 => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[ignore]
    fn f64() {
        match ValidDataTypes::from_ident("f64") {
            ValidDataTypes::F64 => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[ignore]
    fn bool() {
        match ValidDataTypes::from_ident("bool") {
            ValidDataTypes::Bool => (),
            _ => panic!("Invalid data type"),
        }
    }

    #[test]
    #[should_panic(expected="Invalid data type")]
    #[ignore]
    fn invalid() {
        match ValidDataTypes::from_ident("invalid") {
            _ => panic!("I should not get here"),
        }
    }
}
