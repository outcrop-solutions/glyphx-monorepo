use super::{Rank, RankDirection};

const Z_ORDERS: [[&str; 4]; 4] = [
    ["x-axis-line", "z-axis-line", "y-axis-line", "glyphs"],
    ["z-axis-line", "glyphs", "x-axis-line", "y-axis-line"],
    ["glyphs", "x-axis-line", "z-axis-line", "y-axis-line"],
    ["x-axis-line", "glyphs", "z-axis-line", "y-axis-line"],
];

pub enum Face {
    Front,
    Right,
    Back,
    Left,
}

pub struct OrientationManager {
    rank: Rank,
    rank_direction: RankDirection,
    forward_face: Face,
    z_order: u8,
}

impl OrientationManager {
    pub fn new() -> Self {
        OrientationManager {
            rank: Rank::Z,
            rank_direction: RankDirection::Ascending,
            forward_face: Face::Front,
            z_order: 0,
        }
    }

    pub fn rank(&self) -> Rank {
        self.rank
    }

    pub fn rank_direction(&self) -> RankDirection {
        self.rank_direction
    }

    pub fn forward_face(&self) -> &Face {
        &self.forward_face
    }

    pub fn z_order(&self) -> [&str; 4] {
        Z_ORDERS[self.z_order as usize]
    }

    fn cacluate_rotation_change(&self, yaw: f32, distance: f32, cube_size: f32) -> f32 {
        const RADS_PER_ROTATION: f32 = 6.283;

        let rotation_rads = yaw % RADS_PER_ROTATION;
        let rotation_rads = if rotation_rads < 0.0 {
            RADS_PER_ROTATION + rotation_rads
        } else {
            rotation_rads
        };
        let degrees_of_rotation = rotation_rads * 180.0 / std::f32::consts::PI;
        let distance_ratio = distance / cube_size;
        let distance_off_set = if distance_ratio > 1.0 {
            0.0
        } else if distance_ratio >= 0.9 {
            1.0
        } else if distance_ratio >= 0.8 {
            7.0
        } else if distance_ratio >= 0.7 {
            13.0
        } else {
            23.0
        };
        degrees_of_rotation - distance_off_set
    }

    //These cubes are square at least on the x/z axis
    pub fn update_z_order_and_rank(
        &mut self,
        yaw: f32,
        distance: f32,
        is_x_desc: bool,
        is_z_desc: bool,
        cube_size: f32,
    ) {
        let rotation_angle = self.cacluate_rotation_change(yaw, distance, cube_size);

        //When we gerate the vectors in the glyph_data pipeline,
        //ordering can be modified which moves the glyphs through
        //space, but the rank is not changed.  So in these cases,
        //we need to flip our rank direction to keep the ordering
        //of the glyphs corect.
        let (z_order_index, rank, rank_direction) =
            if rotation_angle >= 301.0 || rotation_angle < 31.0 {
                //Front
                (
                    0,
                    Rank::Z,
                    if !is_z_desc {
                        RankDirection::Ascending
                    } else {
                        RankDirection::Descending
                    },
                )
            } else if rotation_angle >= 31.0 && rotation_angle < 121.0 {
                //Right
                (
                    0,
                    Rank::X,
                    if !is_x_desc {
                        RankDirection::Ascending
                    } else {
                        RankDirection::Descending
                    },
                )
            } else if rotation_angle >= 121.0 && rotation_angle < 211.0 {
                //Back
                (
                    1,
                    Rank::Z,
                    if !is_z_desc {
                        RankDirection::Descending
                    } else {
                        RankDirection::Ascending
                    },
                )
            } else if rotation_angle >= 211.0 && rotation_angle < 301.0 {
                //Left
                (
                    3,
                    Rank::X,
                    if !is_x_desc {
                        RankDirection::Descending
                    } else {
                        RankDirection::Ascending
                    },
                )
            } else {
                //This will never happen but rust was trying to be helpful
                (0, Rank::Z, RankDirection::Ascending)
            };

        let forward_face = if rotation_angle >= 316.0 || rotation_angle < 46.0 {
            //Front
            Face::Front
        } else if rotation_angle >= 46.0 && rotation_angle < 136.0 {
            //Right
            Face::Right
        } else if rotation_angle >= 136.0 && rotation_angle < 226.0 {
            //Back
            Face::Back
        } else if rotation_angle >= 226.0 && rotation_angle < 316.0 {
            //Left
            Face::Left
        } else {
            //This will never happen but rust was trying to be helpful
            Face::Front
        };
        self.z_order = z_order_index;
        self.rank = rank;
        self.rank_direction = rank_direction;
        self.forward_face = forward_face;
    }
}
