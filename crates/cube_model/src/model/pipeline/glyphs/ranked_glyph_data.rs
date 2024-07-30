use super::GlyphVertexData;
use serde::{Deserialize, Serialize};
use std::{borrow::BorrowMut, cell::RefCell, rc::Rc};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum RankedGlyphDataError {
    InvalidXRank(u32),
    InvalidZRank(u32),
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
    #[allow(dead_code)]
    rank: Rank,
    rank_direction: RankDirection,
    index: usize,
    data: &'a Vec<Vec<Rc<RefCell<GlyphVertexData>>>>,
}

impl<'a> RankedGlyphIterator<'a> {
    pub fn new(
        rank: Rank,
        rank_direction: RankDirection,
        data: &'a Vec<Vec<Rc<RefCell<GlyphVertexData>>>>,
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

impl<'a> Iterator for RankedGlyphIterator<'a> {
    type Item = &'a Vec<Rc<RefCell<GlyphVertexData>>>;

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
                let result = &self.data[self.index - 1];
                self.index -= 1;
                Some(result)
            }
        }
    }
}
#[derive(Debug, Clone)]
pub struct RankedGlyphData {
    x_rank_size: u32,
    z_rank_size: u32,
    core_data: Vec<Rc<RefCell<GlyphVertexData>>>,
    x_rank: Vec<Vec<Rc<RefCell<GlyphVertexData>>>>,
    z_rank: Vec<Vec<Rc<RefCell<GlyphVertexData>>>>,
}
impl RankedGlyphData {
    pub fn new(x_rank_size: u32, z_rank_size: u32) -> RankedGlyphData {
        //adjustments to the rank sizes.
        let x_rank = Self::build_index(x_rank_size + 1);
        let z_rank = Self::build_index(z_rank_size + 1);

        let core_data = Vec::new();
        RankedGlyphData {
            x_rank_size: x_rank_size + 1,
            z_rank_size: z_rank_size + 1,
            core_data,
            x_rank,
            z_rank,
        }
    }

    fn build_index(size: u32) -> Vec<Vec<Rc<RefCell<GlyphVertexData>>>> {
        let mut index = Vec::new();
        let mut i = 0;
        while i < size {
            index.push(Vec::new());
            i += 1;
        }
        index
    }
    pub fn add(&mut self, data: GlyphVertexData) -> Result<(), RankedGlyphDataError> {
        let x_rank = data.x_rank;
        let z_rank = data.z_rank;
        if x_rank >= self.x_rank_size {
            return Err(RankedGlyphDataError::InvalidXRank(x_rank));
        }
        if z_rank >= self.z_rank_size {
            return Err(RankedGlyphDataError::InvalidZRank(z_rank));
        }

        let rc = Rc::new(RefCell::new(data));
        let core_data = &mut self.core_data;

        let x_rank = &mut self.x_rank[x_rank as usize];
        x_rank.push(rc.clone());

        let z_rank = &mut self.z_rank[z_rank as usize];
        z_rank.push(rc.clone());
        core_data.push(rc);
        Ok(())
    }

    pub fn iter(&self, rank: Rank, rank_direction: RankDirection) -> RankedGlyphIterator {
        let data = match rank {
            Rank::X => &self.x_rank,
            Rank::Z => &self.z_rank,
        };

        RankedGlyphIterator::new(rank, rank_direction, data)
    }
    ///Is useful for getting a vector of the glyphs.
    ///Order is not enforced, so this is not useful for rendering
    ///but it is useful for compute pipline operations.
    #[allow(dead_code)]
    pub fn get_glyphs_vector(&self) -> Vec<GlyphVertexData> {
        self.core_data
            .iter()
            .map(|rc| {
                let rc = rc.borrow();
                rc.clone()
            })
            .collect()
    }
    #[allow(dead_code)]
    pub fn get_x_rank_size(&self) -> u32 {
        self.x_rank_size
    }

    #[allow(dead_code)]
    pub fn get_z_rank_size(&self) -> u32 {
        self.z_rank_size
    }

    #[allow(dead_code)]
    pub fn get_number_of_glyphs(&self) -> usize {
        self.core_data.len()
    }

    pub fn select_glyph(&mut self, glyph_id: u32) {
        let glyph = self.core_data[glyph_id as usize].clone();
        let mut glyph = glyph.as_ref().borrow_mut();
        glyph.flags = 1;
    }
}

#[cfg(test)]
mod constructor {
    use super::*;
    #[test]
    fn is_ok() {
        let x_rank_size: u32 = 10;
        let z_rank_size: u32 = 10;
        let ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        assert_eq!(ranked_glyph_data.x_rank_size, x_rank_size + 1);
        assert_eq!(ranked_glyph_data.z_rank_size, z_rank_size + 1);
        assert_eq!(ranked_glyph_data.x_rank.len(), (x_rank_size + 1) as usize);
        assert_eq!(ranked_glyph_data.z_rank.len(), (z_rank_size + 1) as usize);
        assert_eq!(ranked_glyph_data.core_data.len(), 0);
    }
}

#[cfg(test)]
mod add {
    use super::*;
    use crate::assets::shape_vertex::ShapeVertex;
    #[test]
    fn is_ok() {
        let x_rank_size = 10;
        let z_rank_size = 10;
        let mut ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        let first_glyph = GlyphVertexData::new(
            0,
            ShapeVertex {
                position_vertex: [1.0, 2.0, 3.0],
                normal: [4.0, 5.0, 6.0],
                color: 7,
            },
            0,
            0,
            15,
        );

        let second_glyph = GlyphVertexData::new(
            1,
            ShapeVertex {
                position_vertex: [8.0, 9.0, 10.0],
                normal: [11.0, 12.0, 13.0],
                color: 14,
            },
            7,
            4,
            16,
        );

        assert!(ranked_glyph_data.add(first_glyph).is_ok());
        assert!(ranked_glyph_data.add(second_glyph).is_ok());

        assert_eq!(ranked_glyph_data.core_data.len(), 2);

        assert_eq!(ranked_glyph_data.x_rank[0].len(), 1);
        assert_eq!(ranked_glyph_data.z_rank[0].len(), 1);

        let glyph = &ranked_glyph_data.x_rank[0][0];
        let glyph = glyph.clone();
        let glyph = glyph.as_ref().borrow();
        assert_eq!(glyph.glyph_id, first_glyph.glyph_id);
        assert_eq!(glyph.position[0], first_glyph.position[0]);
        assert_eq!(glyph.position[1], first_glyph.position[1]);
        assert_eq!(glyph.position[2], first_glyph.position[2]);
        assert_eq!(glyph.normal[0], first_glyph.normal[0]);
        assert_eq!(glyph.normal[1], first_glyph.normal[1]);
        assert_eq!(glyph.normal[2], first_glyph.normal[2]);

        assert_eq!(glyph.color, first_glyph.color);
        assert_eq!(glyph.x_rank, first_glyph.x_rank);
        assert_eq!(glyph.z_rank, first_glyph.z_rank);
        assert_eq!(glyph.flags, first_glyph.flags);

        let glyph = &ranked_glyph_data.z_rank[0][0];
        let glyph = glyph.clone();
        let glyph = glyph.as_ref().borrow();
        assert_eq!(glyph.glyph_id, first_glyph.glyph_id);
        assert_eq!(glyph.position[0], first_glyph.position[0]);
        assert_eq!(glyph.position[1], first_glyph.position[1]);
        assert_eq!(glyph.position[2], first_glyph.position[2]);
        assert_eq!(glyph.position[0], first_glyph.position[0]);
        assert_eq!(glyph.normal[1], first_glyph.normal[1]);
        assert_eq!(glyph.normal[2], first_glyph.normal[2]);
        assert_eq!(glyph.color, first_glyph.color);
        assert_eq!(glyph.x_rank, first_glyph.x_rank);
        assert_eq!(glyph.z_rank, first_glyph.z_rank);
        assert_eq!(glyph.flags, first_glyph.flags);

        let glyph = &ranked_glyph_data.x_rank[7][0];
        let glyph = glyph.clone();
        let glyph = glyph.as_ref().borrow();
        assert_eq!(glyph.glyph_id, second_glyph.glyph_id);
        assert_eq!(glyph.position[0], second_glyph.position[0]);
        assert_eq!(glyph.position[1], second_glyph.position[1]);
        assert_eq!(glyph.position[2], second_glyph.position[2]);
        assert_eq!(glyph.normal[0], second_glyph.normal[0]);
        assert_eq!(glyph.normal[1], second_glyph.normal[1]);
        assert_eq!(glyph.normal[2], second_glyph.normal[2]);
        assert_eq!(glyph.color, second_glyph.color);
        assert_eq!(glyph.x_rank, second_glyph.x_rank);
        assert_eq!(glyph.z_rank, second_glyph.z_rank);
        assert_eq!(glyph.flags, second_glyph.flags);

        let glyph = &ranked_glyph_data.z_rank[4][0];
        let glyph = glyph.clone();
        let glyph = glyph.as_ref().borrow();
        assert_eq!(glyph.glyph_id, second_glyph.glyph_id);
        assert_eq!(glyph.position[0], second_glyph.position[0]);
        assert_eq!(glyph.position[1], second_glyph.position[1]);
        assert_eq!(glyph.position[2], second_glyph.position[2]);
        assert_eq!(glyph.normal[0], second_glyph.normal[0]);
        assert_eq!(glyph.normal[1], second_glyph.normal[1]);
        assert_eq!(glyph.normal[2], second_glyph.normal[2]);
        assert_eq!(glyph.color, second_glyph.color);
        assert_eq!(glyph.x_rank, second_glyph.x_rank);
        assert_eq!(glyph.z_rank, second_glyph.z_rank);
        assert_eq!(glyph.flags, second_glyph.flags);
    }

    #[test]
    fn invalid_x_rank() {
        let x_rank_size = 10;
        let z_rank_size = 10;
        let mut ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        let glyph = GlyphVertexData::new(
            0,
            ShapeVertex {
                position_vertex: [1.0, 2.0, 3.0],
                normal: [4.0, 5.0, 6.0],
                color: 7,
            },
            11,
            0,
            15,
        );

        let result = ranked_glyph_data.add(glyph);
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
        let glyph = GlyphVertexData::new(
            0,
            ShapeVertex {
                position_vertex: [1.0, 2.0, 3.0],
                normal: [4.0, 5.0, 6.0],
                color: 7,
            },
            0,
            11,
            15,
        );
        let result = ranked_glyph_data.add(glyph);
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
    use crate::assets::shape_vertex::ShapeVertex;
    fn build_test_set() -> RankedGlyphData {
        let mut ranked_glyph_data = RankedGlyphData::new(10, 10);
        let mut x = 0;
        let mut z = 0;
        while x < 10 {
            while z < 10 {
                let id = (x * 10 + z) as f32;
                let glyph = GlyphVertexData::new(
                    id as u32,
                    ShapeVertex {
                        position_vertex: [id + 1.0, id + 2.0, id + 3.0],
                        normal: [id + 4.0, id + 5.0, id + 6.0],
                        color: id as u32 + 7,
                    },
                    x,
                    z,
                    id as u32 + 15,
                );

                ranked_glyph_data.add(glyph).unwrap();
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
                let expected_id = (x * 10 + z) as u32;
                let glyph = glyph.clone();
                let glyph = glyph.as_ref().borrow();
                assert_eq!(glyph.glyph_id, expected_id);
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
        let mut x = 10;
        let mut z = 0;
        while let Some(glyphs) = iter.next() {
            for glyph in glyphs {
                let expected_id = (x * 10 + z) as u32;
                let glyph = glyph.clone();
                let glyph = glyph.as_ref().borrow();
                assert_eq!(glyph.glyph_id, expected_id);
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
                let expected_id = (x * 10 + z) as u32;
                let glyph = glyph.clone();
                let glyph = glyph.as_ref().borrow();
                assert_eq!(glyph.glyph_id, expected_id);
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
        let mut z = 10;
        while let Some(glyphs) = iter.next() {
            for glyph in glyphs {
                let expected_id = (x * 10 + z) as u32;
                let glyph = glyph.clone();
                let glyph = glyph.as_ref().borrow();
                assert_eq!(glyph.glyph_id, expected_id);
                x += 1;
            }
            x = 0;
            z -= 1;
        }
    }

    mod get_glyphs_vector {
        use super::*;
        use crate::assets::shape_vertex::ShapeVertex;

        #[test]
        fn is_ok() {
            let x_rank_size = 10;
            let z_rank_size = 10;
            let mut ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
            let first_glyph = GlyphVertexData::new(
                0,
                ShapeVertex {
                    position_vertex: [1.0, 2.0, 3.0],
                    normal: [4.0, 5.0, 6.0],
                    color: 7,
                },
                0,
                0,
                15,
            );

            let second_glyph = GlyphVertexData::new(
                1,
                ShapeVertex {
                    position_vertex: [8.0, 9.0, 10.0],
                    normal: [11.0, 12.0, 13.0],
                    color: 14,
                },
                7,
                4,
                16,
            );

            assert!(ranked_glyph_data.add(first_glyph).is_ok());
            assert!(ranked_glyph_data.add(second_glyph).is_ok());

            assert_eq!(ranked_glyph_data.core_data.len(), 2);

            let glyphs_vector = ranked_glyph_data.get_glyphs_vector();
            assert_eq!(glyphs_vector.len(), 2);
            let glyph = &glyphs_vector[0];
            assert_eq!(glyph.glyph_id, first_glyph.glyph_id);
            assert_eq!(glyph.position[0], first_glyph.position[0]);
            assert_eq!(glyph.position[1], first_glyph.position[1]);
            assert_eq!(glyph.position[2], first_glyph.position[2]);
            assert_eq!(glyph.position[0], first_glyph.position[0]);
            assert_eq!(glyph.position[1], first_glyph.position[1]);
            assert_eq!(glyph.normal[2], first_glyph.normal[2]);
            assert_eq!(glyph.color, first_glyph.color);
            assert_eq!(glyph.x_rank, first_glyph.x_rank);
            assert_eq!(glyph.z_rank, first_glyph.z_rank);
            assert_eq!(glyph.flags, first_glyph.flags);

            let glyph = &glyphs_vector[1];
            assert_eq!(glyph.glyph_id, second_glyph.glyph_id);
            assert_eq!(glyph.position[0], second_glyph.position[0]);
            assert_eq!(glyph.position[1], second_glyph.position[1]);
            assert_eq!(glyph.position[2], second_glyph.position[2]);
            assert_eq!(glyph.normal[0], second_glyph.normal[0]);
            assert_eq!(glyph.normal[1], second_glyph.normal[1]);
            assert_eq!(glyph.normal[2], second_glyph.normal[2]);
            assert_eq!(glyph.color, second_glyph.color);
            assert_eq!(glyph.x_rank, second_glyph.x_rank);
            assert_eq!(glyph.z_rank, second_glyph.z_rank);
            assert_eq!(glyph.flags, second_glyph.flags);
        }
    }
}

#[cfg(test)]
mod get_number_of_glyphs {
    use super::*;
    use crate::assets::shape_vertex::ShapeVertex;
    #[test]
    fn is_ok() {
        let x_rank_size = 10;
        let z_rank_size = 10;
        let mut ranked_glyph_data = RankedGlyphData::new(x_rank_size, z_rank_size);
        let first_glyph = GlyphVertexData::new(
            0,
            ShapeVertex {
                position_vertex: [1.0, 2.0, 3.0],
                normal: [4.0, 5.0, 6.0],
                color: 7,
            },
            0,
            0,
            15,
        );

        let second_glyph = GlyphVertexData::new(
            1,
            ShapeVertex {
                position_vertex: [8.0, 9.0, 10.0],
                normal: [11.0, 12.0, 13.0],
                color: 14,
            },
            7,
            4,
            16,
        );

        assert_eq!(ranked_glyph_data.get_number_of_glyphs(), 0);
        assert!(ranked_glyph_data.add(first_glyph).is_ok());
        assert_eq!(ranked_glyph_data.get_number_of_glyphs(), 1);
        assert!(ranked_glyph_data.add(second_glyph).is_ok());
        assert_eq!(ranked_glyph_data.get_number_of_glyphs(), 2);
    }
}
