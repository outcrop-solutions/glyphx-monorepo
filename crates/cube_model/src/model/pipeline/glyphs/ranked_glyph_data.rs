use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;
use std::rc::Rc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum RankedGlyphDataError {
    InvalidXRank(usize),
    InvalidZRank(usize),
}

#[derive(Debug, Copy, Clone)]
pub enum Rank {
    X,
    Z,
}

#[derive(Debug, Copy, Clone)]
pub enum RankDirection {
    Ascending,
    Descending,
}

#[derive(Debug, Clone)]
pub struct RankedGlyphIterator<'a> {
    rank: Rank,
    rank_direction: RankDirection,
    index: usize,
    data: &'a Vec<Vec<Rc<GlyphInstanceData>>>,
}

impl<'a> RankedGlyphIterator<'a> {
    pub fn new(
        rank: Rank,
        rank_direction: RankDirection,
        data: &'a Vec<Vec<Rc<GlyphInstanceData>>>,
    ) -> RankedGlyphIterator<'a> {
        let index = match rank_direction {
            RankDirection::Ascending => 0,
            RankDirection::Descending => data.len(),
        };
        RankedGlyphIterator {
            rank,
            rank_direction,
            index,
            data,
        }
    }
}

impl <'a> Iterator for RankedGlyphIterator<'a> {
    type Item = &'a Vec<Rc<GlyphInstanceData>>;

    fn next(&mut self) -> Option<Self::Item> {
        match self.rank_direction {
            RankDirection::Ascending => {
                if self.index >= self.data.len() {
                    return None;
                }
                let result = &self.data[self.index];
                self.index += 1;
                Some(result)
            }
            RankDirection::Descending => {
                if self.index == 0 {
                    return None;
                }
                let result = &self.data[self.index -1];
                self.index -= 1;
                Some(result)
            }
        }
    }
}
#[derive(Debug, Clone)]
pub struct RankedGlyphData {
    x_rank_size: usize,
    z_rank_size: usize,
    core_data: Vec<Rc<GlyphInstanceData>>,
    x_rank: Vec<Vec<Rc<GlyphInstanceData>>>,
    z_rank: Vec<Vec<Rc<GlyphInstanceData>>>,
}
impl RankedGlyphData {
    pub fn new(x_rank_size: usize, z_rank_size: usize) -> RankedGlyphData {
        let x_rank = Self::build_index(x_rank_size);
        let z_rank = Self::build_index(z_rank_size);

        let core_data = Vec::new();
        RankedGlyphData {
            x_rank_size,
            z_rank_size,
            core_data,
            x_rank,
            z_rank,
        }
    }

    fn build_index(size: usize) -> Vec<Vec<Rc<GlyphInstanceData>>> {
        let mut index = Vec::new();
        let mut i = 0;
        while i < size {
            index.push(Vec::new());
            i += 1;
        }
        index
    }
    pub fn add(
        &mut self,
        x_rank: usize,
        z_rank: usize,
        data: GlyphInstanceData,
    ) -> Result<(), RankedGlyphDataError> {
        if x_rank >= self.x_rank_size {
            return Err(RankedGlyphDataError::InvalidXRank(x_rank));
        }
        if z_rank >= self.z_rank_size {
            return Err(RankedGlyphDataError::InvalidZRank(z_rank));
        }

        let rc = Rc::new(data);
        let core_data = &mut self.core_data;

        let x_rank = &mut self.x_rank[x_rank];
        x_rank.push(Rc::clone(&rc));

        let z_rank = &mut self.z_rank[z_rank];
        z_rank.push(Rc::clone(&rc));
       // core_data.push(rc);
        Ok(())
    }

    pub fn iter(&self, rank: Rank, rank_direction: RankDirection) -> RankedGlyphIterator {
        let data = match rank {
            Rank::X => { 
            &self.x_rank

            }
            Rank::Z => { 
                &self.z_rank
            }
        };

        RankedGlyphIterator::new(rank, rank_direction, data)
    }

    pub fn get_x_rank_size(&self) -> usize {
        self.x_rank_size
    }

    pub fn get_z_rank_size(&self) -> usize {
        self.z_rank_size
    }
}

#[cfg(test)]
mod constructor {
    use super::*;
    #[test]
    fn is_ok() {
        let x_rank_size = 10;
        let z_rank_size = 10;
        let ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        assert_eq!(ranked_glyph_data.x_rank_size, x_rank_size);
        assert_eq!(ranked_glyph_data.z_rank_size, z_rank_size);
        assert_eq!(ranked_glyph_data.x_rank.len(), x_rank_size);
        assert_eq!(ranked_glyph_data.z_rank.len(), z_rank_size);
        assert_eq!(ranked_glyph_data.core_data.len(), 0);
    }
}

#[cfg(test)]
mod add {
    use super::*;
    #[test]
    fn is_ok() {
        let x_rank_size = 10;
        let z_rank_size = 10;
        let mut ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        let first_glyph = GlyphInstanceData {
            glyph_id: 0,
            x_value: 0.0,
            y_value: 0.0,
            z_value: 0.0,
            glyph_selected: 0,
        };

        let second_glyph = GlyphInstanceData {
            glyph_id: 1,
            x_value: 1.0,
            y_value: 1.0,
            z_value: 1.0,
            glyph_selected: 1,
        };

        assert!(ranked_glyph_data.add(0, 0, first_glyph).is_ok());
        assert!(ranked_glyph_data.add(7, 4, second_glyph).is_ok());

        assert_eq!(ranked_glyph_data.core_data.len(), 0);

        assert_eq!(ranked_glyph_data.x_rank[0].len(), 1);
        assert_eq!(ranked_glyph_data.z_rank[0].len(), 1);

        let glyph = &ranked_glyph_data.x_rank[0][0];
        assert_eq!(glyph.glyph_id, first_glyph.glyph_id);
        assert_eq!(glyph.x_value, first_glyph.x_value);
        assert_eq!(glyph.y_value, first_glyph.y_value);
        assert_eq!(glyph.z_value, first_glyph.z_value);
        assert_eq!(glyph.glyph_selected, first_glyph.glyph_selected);

        let glyph = &ranked_glyph_data.z_rank[0][0];
        assert_eq!(glyph.glyph_id, first_glyph.glyph_id);
        assert_eq!(glyph.x_value, first_glyph.x_value);
        assert_eq!(glyph.y_value, first_glyph.y_value);
        assert_eq!(glyph.z_value, first_glyph.z_value);
        assert_eq!(glyph.glyph_selected, first_glyph.glyph_selected);

        assert_eq!(ranked_glyph_data.x_rank[7].len(), 1);
        assert_eq!(ranked_glyph_data.z_rank[4].len(), 1);

        let glyph = &ranked_glyph_data.x_rank[7][0];
        assert_eq!(glyph.glyph_id, second_glyph.glyph_id);
        assert_eq!(glyph.x_value, second_glyph.x_value);
        assert_eq!(glyph.y_value, second_glyph.y_value);
        assert_eq!(glyph.z_value, second_glyph.z_value);
        assert_eq!(glyph.glyph_selected, second_glyph.glyph_selected);

        let glyph = &ranked_glyph_data.z_rank[4][0];
        assert_eq!(glyph.glyph_id, second_glyph.glyph_id);
        assert_eq!(glyph.x_value, second_glyph.x_value);
        assert_eq!(glyph.y_value, second_glyph.y_value);
        assert_eq!(glyph.z_value, second_glyph.z_value);
        assert_eq!(glyph.glyph_selected, second_glyph.glyph_selected);
    }

    #[test]
    fn invalid_x_rank() {
        let x_rank_size = 10;
        let z_rank_size = 10;
        let mut ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        let glyph = GlyphInstanceData {
            glyph_id: 0,
            x_value: 0.0,
            y_value: 0.0,
            z_value: 0.0,
            glyph_selected: 0,
        };

        let result = ranked_glyph_data.add(11, 0, glyph);
        assert!(result.is_err());
        let err_value = match result.unwrap_err() {
            RankedGlyphDataError::InvalidXRank(value) => value,
            _ => 999999,
        };
        assert_eq!(err_value, 11);
        assert_eq!(ranked_glyph_data.core_data.len(), 0);
    }

    #[test]
    fn invalid_z_rank() {
        let x_rank_size = 10;
        let z_rank_size = 10;
        let mut ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        let glyph = GlyphInstanceData {
            glyph_id: 0,
            x_value: 0.0,
            y_value: 0.0,
            z_value: 0.0,
            glyph_selected: 0,
        };

        let result = ranked_glyph_data.add(0, 11, glyph);
        assert!(result.is_err());
        let err_value = match result.unwrap_err() {
            RankedGlyphDataError::InvalidZRank(value) => value,
            _ => 999999,
        };
        assert_eq!(err_value, 11);
        assert_eq!(ranked_glyph_data.core_data.len(), 0);
    }
}

#[cfg(test)]
mod iter {
    use super::*;
    fn build_test_set() -> RankedGlyphData {
        let mut ranked_glyph_data = RankedGlyphData::new(10, 10);
        let mut x = 0;
        let mut z = 0;
        while x < 10 {
            while z < 10 {
                let glyph = GlyphInstanceData {
                    glyph_id: 0,
                    x_value: x as f32,
                    y_value: 0.0,
                    z_value: z as f32,
                    glyph_selected: 0,
                };
                ranked_glyph_data.add(x, z, glyph).unwrap();
                z += 1;
            }
            z = 0;
            x += 1;
        }

        ranked_glyph_data
    }
    #[test]
    fn x_rank_ascending() {
        let ranked_glyph_data = build_test_set();
        let mut iter = ranked_glyph_data.iter(Rank::X, RankDirection::Ascending);
        let mut x = 0;
        let mut z = 0;
        while let Some(glyphs) = iter.next() {
            for glyph in glyphs {
                assert_eq!(glyph.x_value, x as f32);
                assert_eq!(glyph.z_value, z as f32);
                z += 1;
            }
            z = 0;
            x += 1;
        }
    }

    #[test]
    fn x_rank_descending() {
        let ranked_glyph_data = build_test_set();
        let mut iter = ranked_glyph_data.iter(Rank::X, RankDirection::Descending);
        let mut x = 9;
        let mut z = 0;
        while let Some(glyphs) = iter.next() {
            for glyph in glyphs {
                assert_eq!(glyph.x_value, x as f32);
                assert_eq!(glyph.z_value, z as f32);
                z += 1;
            }
            z = 0;
            x -= 1;
        }
    }

    #[test]
    fn z_rank_ascending() {
        let ranked_glyph_data = build_test_set();
        let mut iter = ranked_glyph_data.iter(Rank::Z, RankDirection::Ascending);
        let mut x = 0;
        let mut z = 0;
        while let Some(glyphs) = iter.next() {
            for glyph in glyphs {
                assert_eq!(glyph.x_value, x as f32);
                assert_eq!(glyph.z_value, z as f32);
                x += 1;
            }
            x = 0;
            z += 1;
        }
    }

    #[test]
    fn z_rank_descending() {
        let ranked_glyph_data = build_test_set();
        let mut iter = ranked_glyph_data.iter(Rank::Z, RankDirection::Descending);
        let mut x = 0;
        let mut z = 9;
        while let Some(glyphs) = iter.next() {
            for glyph in glyphs {
                assert_eq!(glyph.x_value, x as f32);
                assert_eq!(glyph.z_value, z as f32);
                x += 1;
            }
            x = 0;
            z -= 1;
        }
    }
}
