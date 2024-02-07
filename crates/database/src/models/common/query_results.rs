use serde::{Deserialize, Serialize};
use std::fmt::Debug;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QueryResults<T: Debug + Serialize + Clone> {
    pub results: Vec<T>,
    pub number_of_items: u64,
    pub page_number: u64,
    pub page_size: u64,
}
