use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Stats {
    pub axis: String,
    pub min: f64,
    pub max: f64,
    pub mean: f64,
    pub median: f64,
    pub variance: f64,
    pub standard_deviation: f64,
    pub entropy: f64,
    pub skewness: f64,
    pub pct_0: f64,
    pub pct_5: f64,
    pub pct_10: f64,
    pub pct_15: f64,
    pub pct_20: f64,
    pub pct_25: f64,
    pub pct_30: f64,
    pub pct_33: f64,
    pub pct_35: f64,
    pub pct_40: f64,
    pub pct_45: f64,
    pub pct_50: f64,
    pub pct_55: f64,
    pub pct_60: f64,
    pub pct_65: f64,
    pub pct_67: f64,
    pub pct_70: f64,
    pub pct_75: f64,
    pub pct_80: f64,
    pub pct_85: f64,
    pub pct_90: f64,
    pub pct_95: f64,
    pub pct_99: f64,
    pub max_rank: u64,
}

impl Stats {
    pub fn get_binary_size(&self) -> usize {
        //32 stat fields + the size of axis plus 1 byte per character
        (8 * 32) + 8 + self.axis.len()
    }
}

impl Default for Stats {
    fn default() -> Self {
        Stats {
            axis: "".to_string(),
            min: 0.0,
            max: 0.0,
            mean: 0.0,
            median: 0.0,
            variance: 0.0,
            standard_deviation: 0.0,
            entropy: 0.0,
            skewness: 0.0,
            pct_0: 0.0,
            pct_5: 0.0,
            pct_10: 0.0,
            pct_15: 0.0,
            pct_20: 0.0,
            pct_25: 0.0,
            pct_30: 0.0,
            pct_33: 0.0,
            pct_35: 0.0,
            pct_40: 0.0,
            pct_45: 0.0,
            pct_50: 0.0,
            pct_55: 0.0,
            pct_60: 0.0,
            pct_65: 0.0,
            pct_67: 0.0,
            pct_70: 0.0,
            pct_75: 0.0,
            pct_80: 0.0,
            pct_85: 0.0,
            pct_90: 0.0,
            pct_95: 0.0,
            pct_99: 0.0,
            max_rank: 0,
        }
    }
}

#[cfg(test)]
mod get_binary_size {
    use super::*;
    use bincode::serialize;

    #[test]
    fn is_ok() {
        let stats = Stats {
            axis: "x".to_string(),
            min: 0.0,
            max: 1.0,
            mean: 0.5,
            median: 0.5,
            variance: 0.25,
            standard_deviation: 0.5,
            entropy: 0.5,
            skewness: 0.5,
            pct_0: 0.0,
            pct_5: 0.05,
            pct_10: 0.1,
            pct_15: 0.15,
            pct_20: 0.2,
            pct_25: 0.25,
            pct_30: 0.3,
            pct_33: 0.33,
            pct_35: 0.35,
            pct_40: 0.4,
            pct_45: 0.45,
            pct_50: 0.5,
            pct_55: 0.55,
            pct_60: 0.6,
            pct_65: 0.65,
            pct_67: 0.67,
            pct_70: 0.7,
            pct_75: 0.75,
            pct_80: 0.8,
            pct_85: 0.85,
            pct_90: 0.9,
            pct_95: 0.95,
            pct_99: 0.99,
            max_rank: 100,
        };
        let result = stats.get_binary_size();
        let ser = serialize(&stats).unwrap();
        assert_eq!(result, ser.len());
    }
}
