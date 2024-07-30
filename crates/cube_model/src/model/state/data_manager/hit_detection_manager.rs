use crate::model::pipeline::hit_detection::hit_detection_data::HitDetectionData;
pub struct HitDetectionManager {
   pub hit_detection_data: Vec<HitDetectionData>,
}

impl HitDetectionManager {
    pub fn new() -> HitDetectionManager {
        HitDetectionManager {
            hit_detection_data: Vec::new(),
        }
    }

    pub fn add_hit_detection_data(&mut self, hit_detection_data: HitDetectionData) {
        self.hit_detection_data.push(hit_detection_data);
    }

    pub fn get_hit_detection_data(&self) -> &Vec<HitDetectionData> {
        &self.hit_detection_data
    }

    pub fn len(&self) -> usize {
        self.hit_detection_data.len()
    }

    pub fn clear(&mut self) {
        self.hit_detection_data.clear();
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    mod contructor {
        use super::*;

        #[test]
        fn is_ok() {
            let hit_detection_manager = HitDetectionManager::new();
            assert_eq!(hit_detection_manager.len(), 0);
        }
    }

    mod add_hit_detection_data {
        use super::*;

        #[test]
        fn is_ok() {
            let mut hit_detection_manager = HitDetectionManager::new();
            let hit_detection_data = HitDetectionData {
                verticies: [[0.0, 0.0, 0.0], [1.0, 1.0, 1.0], [2.0, 2.0, 2.0]],
                glyph_id: 0,
                x_rank: 0,
                z_rank: 0,
            };
            hit_detection_manager.add_hit_detection_data(hit_detection_data);
            assert_eq!(hit_detection_manager.len(), 1);
            let hd = hit_detection_manager.hit_detection_data[0];

            assert_eq!(hd, hit_detection_data);
        }
    }

    mod get_hit_detection_data {
        use super::*;

        #[test]
        fn is_ok() {
            let mut hit_detection_manager = HitDetectionManager::new();
            let hit_detection_data = HitDetectionData {
                verticies: [[0.0, 0.0, 0.0], [1.0, 1.0, 1.0], [2.0, 2.0, 2.0]],
                glyph_id: 0,
                x_rank: 0,
                z_rank: 0,
            };
            hit_detection_manager.add_hit_detection_data(hit_detection_data);
            assert_eq!(hit_detection_manager.len(), 1);
            let hdd = hit_detection_manager.get_hit_detection_data();
            assert_eq!(hdd.len(), 1);
            let hd = hdd[0];
            assert_eq!(hd, hit_detection_data);
        }
    }

    mod clear {
        use super::*;

        #[test]
        fn is_ok() {
            let mut hit_detection_manager = HitDetectionManager::new();
            let hit_detection_data = HitDetectionData {
                verticies: [[0.0, 0.0, 0.0], [1.0, 1.0, 1.0], [2.0, 2.0, 2.0]],
                glyph_id: 0,
                x_rank: 0,
                z_rank: 0,
            };
            hit_detection_manager.add_hit_detection_data(hit_detection_data);
            assert_eq!(hit_detection_manager.len(), 1);
            hit_detection_manager.clear();
            assert_eq!(hit_detection_manager.len(), 0);
            let hdd = hit_detection_manager.get_hit_detection_data();
            assert_eq!(hdd.len(), 0);
        }
    }
}
