use lazy_static::lazy_static;
use std::sync::{Mutex, MutexGuard};

pub struct base_structure {
    pub field_a: i32,
    pub field_b: i32,
}

impl base_structure {
    pub fn new() -> base_structure {
        base_structure {
            field_a: 0,
            field_b: 0,
        }
    }
}

impl Default for base_structure {
    fn default() -> base_structure {
        base_structure{
            field_a: 36,
            field_b: 63
        }
    }
}

pub trait Singleton {
    fn get_instance() -> MutexGuard<'static, base_structure>;
    fn get_instance2() -> std::sync::Arc<base_structure>; 
    fn build_singleton() -> base_structure;
}
lazy_static!{static ref INSTANCE: Mutex<base_structure> = Mutex::new(base_structure::build_singleton());}
lazy_static!{static ref INSTANCE2: std::sync::Arc<base_structure> = std::sync::Arc::new(base_structure::build_singleton());}
impl Singleton for base_structure {
    fn build_singleton() -> base_structure {
        base_structure::default()
    }
    fn get_instance() -> MutexGuard<'static, base_structure> {
          INSTANCE.lock().unwrap()
    }

    fn get_instance2() -> std::sync::Arc<base_structure> {
        INSTANCE2.clone()
    }
}


#[cfg(test)]
mod singleton {
    use super::*;

    #[test]
    fn test_singleton() {
        {
        let mut instance = base_structure::get_instance();
        assert_eq!(instance.field_a, 36);
        assert_eq!(instance.field_b, 63);
        instance.field_a = 1;
        instance.field_b = 2;
        assert_eq!(instance.field_a, 1);
        assert_eq!(instance.field_b, 2);
        }
        {
        let mut instance2 = base_structure::get_instance();
        assert_eq!(instance2.field_a, 1);
        assert_eq!(instance2.field_b, 2);
        instance2.field_a = 3;
        instance2.field_b = 4;
        assert_eq!(instance2.field_a, 3);
        assert_eq!(instance2.field_b, 4);
        }
    }

    #[test]
    fn arc_test() {
        let instance = base_structure::get_instance2();
        assert_eq!(instance.field_a, 36);
        assert_eq!(instance.field_b, 63);
    }
}
