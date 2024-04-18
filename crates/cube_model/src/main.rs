use bincode::serialize;
use glyphx_cube_model::ModelRunner;
use model_common::{
    vectors::{Vector, VectorOrigionalValue},
    Glyph, Stats,
};
use rand::Rng;

fn main() {
    let mut runner = ModelRunner::new();
    let mut x_vectors: Vec<Vector> = Vec::new();
    let mut y_vectors: Vec<Vector> = Vec::new();
    let mut glyphs: Vec<Glyph> = Vec::new();
    //Build some vectors
    for i in 0..100 {
        x_vectors.push(Vector::new(VectorOrigionalValue::U64(i), i as f64, 1));
        y_vectors.push(Vector::new(VectorOrigionalValue::U64(i), i as f64, 1));
    }

    //Build some glyphs
    let mut rng = rand::thread_rng();
    for x in 0..25 {
        for y in 0..12 {
            let random_number: f64 = rng.gen_range(0.0..=9.0);
            let y_random_number: u64 = rng.gen_range(0..12);
            glyphs.push(Glyph::new(x as f64, y_random_number as f64, random_number, vec![x + y]));
        }
    }

    let mut x_stats = Stats::default();
    x_stats.axis = "x".to_string();
    x_stats.max_rank = 99;

    let mut y_stats = Stats::default();
    y_stats.axis = "y".to_string();
    y_stats.max_rank = 49;

    for x_vec in x_vectors {
        runner.add_vector("x", serialize(&x_vec).unwrap());
    }

    for y_vec in y_vectors {
        runner.add_vector("y", serialize(&y_vec).unwrap());
    }

    runner.add_statstics(serialize(&x_stats).unwrap());
    runner.add_statstics(serialize(&y_stats).unwrap());

    for glyph in glyphs {
        runner.add_glyph(serialize(&glyph).unwrap());
    }

    pollster::block_on(runner.run());
}
