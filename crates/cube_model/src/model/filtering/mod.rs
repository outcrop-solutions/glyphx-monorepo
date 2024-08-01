#[cfg(test)]
mod unit_tests {
    use super::*;
    use crate::model::pipeline::glyphs;
    use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;

    use model_common::{Stats};
    
    
    fn build_stats(axis: &str, min_value: f64, max_value: f64) -> Stats {
        Stats {
            axis: axis.to_string(),
            min: min_value,
            max: max_value,
            mean: min_value + max_value / 2.0,
            median: min_value + max_value / 2.0,
            variance: ,
            std_dsv: 0.0,
            entropy: 0.0,
            skewness: 0.0,
            kurtosis: 0.0,
            histogram: vec![0.0, 0.0, 0.0, 0.0, 0.0],
        }
    }
    fn build_glyph_data(x_rank_size:u32, z_rank_size: u32 ) -> Vec<GlyphInstanceData> {
        let mut glyph_data : Vec<GlyphInstanceData> = Vec::new(); 
            for x in 0..x_rank_size {
                for z in 0..z_rank_size {
                    let glyph_id = x * z_rank_size + z;
                    let glyph_instance = GlyphInstanceData::new(glyph_id, x as f32, x, x as f32, (x*z) as f32, z, z);
                    glyph_data.push(glyph_instance);
                }
            }
            glyph_data
    }

    fn build_test_data() -> Stats {
        Stats {
            min: 0.0,
            max: 1.0,
            mean: 0.5,
            std_dsv: 0.5,
            median: 0.5,
            mode: 0.5,
            variance: 0.25,
            skewness: 0.0,
            kurtosis: -1.2,
            entropy: 0.0,
            histogram: vec![0.0, 0.0, 0.0, 0.0, 0.0],
        }
    }

    #[test]
    fn is_ok() {
        // Test code here
        assert_eq!(1, 1);
    }
}
