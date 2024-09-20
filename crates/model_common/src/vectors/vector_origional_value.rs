use serde::{Deserialize, Serialize};
use serde_json::{json, Value};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VectorOrigionalValue {
    String(String),
    F64(f64),
    U64(u64),
    Empty,
}
impl VectorOrigionalValue {
    pub fn to_json(&self) -> Value {
        match self {
            VectorOrigionalValue::String(s) => json!(&s),
            VectorOrigionalValue::F64(f) => json!(&f),
            VectorOrigionalValue::U64(u) => json!(&u),
            VectorOrigionalValue::Empty => Value::Null,
        }
    }

    pub fn is_string(&self) -> bool {
        match self {
            Self::String(_) => true,
            _ => false,
        }
    }

    pub fn get_string(&self) -> Option<String> {
        match self {
            Self::String(s) => Some(s.clone()),
            _ => None,
        }
    }
    pub fn is_f64(&self) -> bool {
        match self {
            Self::F64(_) => true,
            _ => false,
        }
    }

    pub fn get_f64(&self) -> Option<f64> {
        match &self {
            Self::F64(v) => Some(*v),
            _ => None,
        }
    }

    pub fn is_u64(&self) -> bool {
        match self {
            Self::U64(_) => true,
            _ => false,
        }
    }

    pub fn get_u64(&self) -> Option<u64> {
        match &self {
            Self::U64(u) => Some(*u),
            _ => None,
        }
    }

    pub fn is_empty(&self) -> bool {
        match self {
            Self::Empty => true,
            _ => false,
        }
    }

}
impl PartialEq for VectorOrigionalValue {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (VectorOrigionalValue::String(a), VectorOrigionalValue::String(b)) => a == b,
            (VectorOrigionalValue::F64(a), VectorOrigionalValue::F64(b)) => a == b,
            (VectorOrigionalValue::U64(a), VectorOrigionalValue::U64(b)) => a == b,
            (VectorOrigionalValue::Empty, VectorOrigionalValue::Empty) => true,
            _ => false,
        }
    }
}

impl Eq for VectorOrigionalValue {}

impl PartialOrd for VectorOrigionalValue {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match (self, other) {
            (VectorOrigionalValue::String(a), VectorOrigionalValue::String(b)) => a.partial_cmp(b),
            (VectorOrigionalValue::F64(a), VectorOrigionalValue::F64(b)) => a.partial_cmp(b),
            (VectorOrigionalValue::U64(a), VectorOrigionalValue::U64(b)) => a.partial_cmp(b),
            (VectorOrigionalValue::Empty, VectorOrigionalValue::Empty) => {
                Some(std::cmp::Ordering::Equal)
            }
            _ => None,
        }
    }
}

impl Ord for VectorOrigionalValue {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        match (self, other) {
            (VectorOrigionalValue::String(a), VectorOrigionalValue::String(b)) => a.cmp(b),
            (VectorOrigionalValue::F64(a), VectorOrigionalValue::F64(b)) => {
                a.partial_cmp(b).unwrap()
            }
            (VectorOrigionalValue::U64(a), VectorOrigionalValue::U64(b)) => a.cmp(b),
            (VectorOrigionalValue::Empty, VectorOrigionalValue::Empty) => std::cmp::Ordering::Equal,
            _ => std::cmp::Ordering::Less,
        }
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    mod is_str {
        use super::*;

            #[test]
            fn is_true() {
                let value = "I am a string".to_string();
                let orig_value = VectorOrigionalValue::String(value.clone());
                assert!(orig_value.is_string());
                let out_val = orig_value.get_string();
                assert!(out_val.is_some());
                let out_val = out_val.unwrap();
                assert_eq!(out_val, value);
            }

            #[test]
            fn is_false() {
                let value = 63.0;
                let orig_value = VectorOrigionalValue::F64(value);
                assert!(!orig_value.is_string());
                let out_val = orig_value.get_string();
                assert!(out_val.is_none());
            }
    }

    mod is_f64 {
        use super::*;

            #[test]
            fn is_true() {
                let value = 63.0;
                let orig_value = VectorOrigionalValue::F64(value);
                assert!(orig_value.is_f64());
                let out_val = orig_value.get_f64();
                assert!(out_val.is_some());
                let out_val = out_val.unwrap();
                assert_eq!(out_val, value);
            }

            #[test]
            fn is_false() {
                let value = 63;
                let orig_value = VectorOrigionalValue::U64(value);
                assert!(!orig_value.is_f64());
                let out_val = orig_value.get_f64();
                assert!(out_val.is_none());
            }
    }

    mod is_u64 {
        use super::*;

            #[test]
            fn is_true() {
                let value = 63;
                let orig_value = VectorOrigionalValue::U64(value);
                assert!(orig_value.is_u64());
                let out_val = orig_value.get_u64();
                assert!(out_val.is_some());
                let out_val = out_val.unwrap();
                assert_eq!(out_val, value);
            }

            #[test]
            fn is_false() {
                let value = 63.0;
                let orig_value = VectorOrigionalValue::F64(value);
                assert!(!orig_value.is_u64());
                let out_val = orig_value.get_u64();
                assert!(out_val.is_none());
            }
    }

    mod is_empty {
        use super::*;

            #[test]
            fn is_true() {
                let orig_value = VectorOrigionalValue::Empty;
                assert!(orig_value.is_empty());
                let out_val = orig_value.get_u64();
                assert!(out_val.is_none());
            }

            #[test]
            fn is_false() {
                let value = 63.0;
                let orig_value = VectorOrigionalValue::F64(value);
                assert!(!orig_value.is_empty());
            }
    }
}
