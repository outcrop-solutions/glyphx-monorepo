use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Screenshot{
    pub width: u32,
    pub height: u32,
    pub pixels: Vec<u8>,
}
