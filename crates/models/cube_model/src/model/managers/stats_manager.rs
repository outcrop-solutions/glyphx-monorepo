use super::{AddStatsError, GetStatsError};

use model_common::Stats;


use bincode::deserialize;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct StatsManager {
    x_axis_stats: Option<Stats>,
    y_axis_stats: Option<Stats>,
    z_axis_stats: Option<Stats>,
}

impl StatsManager {
    pub fn new() -> Self {
        StatsManager {
            x_axis_stats: None,
            y_axis_stats: None,
            z_axis_stats: None,
        }
    }

    pub fn get_stats(&self, axis: &str) -> Result<Stats, GetStatsError> {
        match axis {
            "x" => {
                if let Some(stats) = &self.x_axis_stats {
                    Ok(stats.clone())
                } else {
                    Err(GetStatsError::stats_not_defined("x"))
                }
            },
            "y" => {
                if let Some(stats) = &self.y_axis_stats {
                    Ok(stats.clone())
                } else {
                    Err(GetStatsError::stats_not_defined("y"))
                }
            },
            "z" =>  {
                if let Some(stats) = &self.z_axis_stats {
                    Ok(stats.clone())
                } else {
                    Err(GetStatsError::stats_not_defined("z"))
                }
            },
            axis_name => {
                Err(GetStatsError::invalid_axis_name(axis_name))
            }
        }
    }
    pub fn add_stats(&mut self, stats_bytes: Vec<u8>) -> Result<Stats, AddStatsError> {
        let stats = deserialize::<Stats>(&stats_bytes)?;
        //Ok pay attention to this, it is super important.  In WebGPU Y is up and Z is depth.  So
        //we will need to flip the Y and Z values.  We keep them in application order in the
        //glyph_engine but we need to flip them here so everything makes sense downstream.
        match stats.axis.as_str() {
            "x" => {
                if self.x_axis_stats.is_some() {
                    return Err(AddStatsError::axis_exists("x"));
                }
                self.x_axis_stats = Some(stats.clone());
            }
            "y" => {
                if self.z_axis_stats.is_some() {
                    return Err(AddStatsError::axis_exists("y"));
                }
                self.z_axis_stats = Some(stats.clone());
            }
            "z" => {
                if self.y_axis_stats.is_some() {
                    return Err(AddStatsError::axis_exists("z"));
                }
                self.y_axis_stats = Some(stats.clone());
            }
            invalid => {
                return Err(AddStatsError::invalid_axis_name(invalid));
            }
        };
        Ok(stats)
    }

    #[allow(dead_code)]
    pub fn swap_stats(&mut self, stats_bytes: Vec<u8>) -> Result<(), AddStatsError> {
        let stats = deserialize::<Stats>(&stats_bytes)?;
        //Ok pay attention to this, it is super important.  In WebGPU Y is up and Z is depth.  So
        //we will need to flip the Y and Z values.  We keep them in application order in the
        //glyph_engine but we need to flip them here so everything makes sense downstream.
        match stats.axis.as_str() {
            "x" => {
                self.x_axis_stats = Some(stats);
            }
            "y" => {
                self.z_axis_stats = Some(stats);
            }
            "z" => {
                self.y_axis_stats = Some(stats);
            }
            invalid => {
                return Err(AddStatsError::invalid_axis_name(invalid));
            }
        };
        Ok(())
    }

    pub fn len(&self) -> usize {
        let mut count = 0;
        if self.x_axis_stats.is_some() {
            count += 1;
        }
        if self.y_axis_stats.is_some() {
            count += 1;
        }
        if self.z_axis_stats.is_some() {
            count += 1;
        }
        count
    }
}

impl Default for StatsManager {
    fn default() -> Self {
        let mut base_stats = Stats::default();
        base_stats.axis = "x".to_string();
        let x_axis_stats = Some(base_stats.clone());
        base_stats.axis = "y".to_string();
        let y_axis_stats = Some(base_stats.clone());
        base_stats.axis = "z".to_string();
        let z_axis_stats = Some(base_stats.clone());
        StatsManager {
            x_axis_stats,
            y_axis_stats,
            z_axis_stats,
        }


    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;
    use bincode::serialize;

    mod add_stats {
       use super::*;
        #[test]
        fn x_is_ok() {
            let mut stats = Stats::default();
            stats.axis = "x".to_string();
            let mut stats_manager = StatsManager::new();

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());
            assert!(stats_manager.x_axis_stats.is_some());
        }

        #[test]
        fn x_is_duplicate() {
            let mut stats = Stats::default();
            stats.axis = "x".to_string();
            let mut stats_manager = StatsManager::new();

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());
            assert!(stats_manager.x_axis_stats.is_some());

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                AddStatsError::StatsAlreadyExists(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "x");
                }
                _ => {
                    panic!("Expected StatsAlreadyExists error");
                }
            }
        }
        #[test]
        fn y_is_ok() {
            let mut stats = Stats::default();
            //Testing y axis stats.  We flip the Y and Z values in the stats manager so that
            //everything makes sense downstream.
            stats.axis = "z".to_string();
            let mut stats_manager = StatsManager::new();

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());
            assert!(stats_manager.y_axis_stats.is_some());
        }

        #[test]
        fn y_is_duplicate() {
            let mut stats = Stats::default();
            stats.axis = "y".to_string();
            let mut stats_manager = StatsManager::new();

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());
            assert!(stats_manager.z_axis_stats.is_some());

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                AddStatsError::StatsAlreadyExists(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "y");
                }
                _ => {
                    panic!("Expected StatsAlreadyExists error");
                }
            }
        }
        #[test]
        fn z_is_ok() {
            let mut stats = Stats::default();
            //Testing y axis stats.  We flip the Y and Z values in the stats manager so that
            //everything makes sense downstream.
            stats.axis = "y".to_string();
            let mut stats_manager = StatsManager::new();

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());
            assert!(stats_manager.z_axis_stats.is_some());
        }

        #[test]
        fn z_is_duplicate() {
            let mut stats = Stats::default();
            stats.axis = "z".to_string();
            let mut stats_manager = StatsManager::new();

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_ok());
            assert!(stats_manager.y_axis_stats.is_some());

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                AddStatsError::StatsAlreadyExists(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "z");
                }
                _ => {
                    panic!("Expected StatsAlreadyExists error");
                }
            }
        }

        #[test]
        fn deserialization_fails() {
            let mut stats = Stats::default();
            stats.axis = "z".to_string();
            let mut stats_manager = StatsManager::new();

            let mut stats = serialize(&stats).unwrap();
            stats.pop().unwrap();
            let result = stats_manager.add_stats(stats);
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                AddStatsError::DeserializationError(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["ErrorKind"].as_str().unwrap(), "Io");
                }
                _ => {
                    panic!("Expected Deserialization error");
                }
            }
        }

        #[test]
        fn invalid_axis() {
            let mut stats = Stats::default();
            stats.axis = "invalid".to_string();
            let mut stats_manager = StatsManager::new();

            let result = stats_manager.add_stats(serialize(&stats).unwrap());
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                AddStatsError::InvalidAxisName(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "invalid");
                }
                _ => {
                    panic!("Expected InvalidAxisName error");
                }
            }
        }
    }

    mod get_stats {
        use super::*;

        #[test]
        fn x_is_ok() {
            let mut stats = Stats::default();
            stats.axis = "x".to_string();
            let stats_manager = StatsManager {
                x_axis_stats: Some(stats.clone()),
                y_axis_stats: None,
                z_axis_stats: None,
            };
            
            let result = stats_manager.get_stats("x");
            assert!(result.is_ok());
            let result = result.unwrap();
            assert_eq!(result.axis, "x");
        }

        #[test]
        fn x_is_none() {
            let stats_manager = StatsManager {
                x_axis_stats: None,
                y_axis_stats: None,
                z_axis_stats: None,
            };
            
            let result = stats_manager.get_stats("x");
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                GetStatsError::StatsNotDefined(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "x");
                }
                _ => {
                    panic!("Expected StatsNotDefined error");
                }
            }
        }

        #[test]
        fn y_is_ok() {
            let mut stats = Stats::default();
            stats.axis = "z".to_string();
            let stats_manager = StatsManager {
                x_axis_stats: None,
                y_axis_stats: Some(stats.clone()),
                z_axis_stats: None,
            };
            
            let result = stats_manager.get_stats("y");
            assert!(result.is_ok());
            let result = result.unwrap();
            assert_eq!(result.axis, "z");
        }

        #[test]
        fn y_is_none() {
            let stats_manager = StatsManager {
                x_axis_stats: None,
                y_axis_stats: None,
                z_axis_stats: None,
            };
            
            let result = stats_manager.get_stats("y");
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                GetStatsError::StatsNotDefined(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "y");
                }
                _ => {
                    panic!("Expected StatsNotDefined error");
                }
            }
        }

        #[test]
        fn z_is_ok() {
            let mut stats = Stats::default();
            stats.axis = "y".to_string();
            let stats_manager = StatsManager {
                x_axis_stats: None,
                y_axis_stats: None,
                z_axis_stats: Some(stats.clone()),
            };
            
            let result = stats_manager.get_stats("z");
            assert!(result.is_ok());
            let result = result.unwrap();
            assert_eq!(result.axis, "y");
        }

        #[test]
        fn z_is_none() {
            let stats_manager = StatsManager {
                x_axis_stats: None,
                y_axis_stats: None,
                z_axis_stats: None,
            };
            
            let result = stats_manager.get_stats("z");
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                GetStatsError::StatsNotDefined(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "z");
                }
                _ => {
                    panic!("Expected StatsNotDefined error");
                }
            }
        }

        #[test]
        fn invalid_axis() {
            let stats_manager = StatsManager {
                x_axis_stats: None,
                y_axis_stats: None,
                z_axis_stats: None,
            };
            
            let result = stats_manager.get_stats("invalid");
            assert!(result.is_err());
            let error = result.unwrap_err();
            match error {
                GetStatsError::InvalidAxisName(error_data) => {
                    let data = error_data.data.unwrap();
                    assert_eq!(data["axis_name"].as_str().unwrap(), "invalid");
                }
                _ => {
                    panic!("Expected InvalidAxisName error");
                }
            }
        }
    }

}
