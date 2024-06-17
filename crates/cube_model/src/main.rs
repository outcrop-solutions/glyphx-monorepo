use bincode::serialize;
use glyphx_cube_model::ModelRunner;
use model_common::{
    vectors::{Vector, VectorOrigionalValue},
    Glyph, Stats,
};
use rand::Rng;
use std::io::{Cursor, Read};

fn read_usize<R: Read>(reader: &mut R) -> Result<usize, Box<dyn std::error::Error>> {
    let mut size_bytes = [0u8; 8];
    reader.read_exact(&mut size_bytes)?;
    let size = usize::from_le_bytes(size_bytes);
    Ok(size)
} 

fn main() {
    let runner = ModelRunner::new();
    const PREFIX: &str = "b05e0a4fdd3b75a1a28e65f407097cad";
    let x_vector_file_name = format!("./test_data/{}-x-axis.vec", PREFIX);
    let y_vector_file_name = format!("./test_data/{}-y-axis.vec", PREFIX);
    let glyph_file_name = format!("./test_data/{}.gly", PREFIX);
    let stats_file_name = format!("./test_data/{}.sts", PREFIX);

    let x_vector_file = std::fs::read(x_vector_file_name).unwrap();
    let mut x_vector_cursor = Cursor::new(x_vector_file);
    loop {
        let size = match read_usize(&mut x_vector_cursor) {
            Ok(size) => size,
            Err(_) => break,
        };

        let mut buffer = vec![0u8; size];
        x_vector_cursor.read_exact(&mut buffer).unwrap();
        let res = runner.add_vector("x", buffer);
        if let Err(e) = res {
            println!("Error adding x vector: {:?}", e);
        }
    
    }

    let y_vector_file = std::fs::read(y_vector_file_name).unwrap();
    let mut y_vector_cursor = Cursor::new(y_vector_file);
    loop {
        let size = match read_usize(&mut y_vector_cursor) {
            Ok(size) => size,
            Err(_) => break,
        };

        let mut buffer = vec![0u8; size];
        y_vector_cursor.read_exact(&mut buffer).unwrap();
        let res = runner.add_vector("y", buffer);
        if let Err(e) = res {
            println!("Error adding y vector: {:?}", e);
        }
    
    }

    let stats_file = std::fs::read(stats_file_name).unwrap();
    let mut stats_cursor = Cursor::new(stats_file);
    loop {
        let size = match read_usize(&mut stats_cursor) {
            Ok(size) => size,
            Err(_) => break,
        };

        let mut buffer = vec![0u8; size];
        stats_cursor.read_exact(&mut buffer).unwrap();
        let res = runner.add_statistics(buffer);
        if let Err(e) = res {
            println!("Error adding stats: {:?}", e);
        }
    
    }

    let glyph_file = std::fs::read(glyph_file_name).unwrap();
    let mut glyph_cursor = Cursor::new(glyph_file);
    loop {
        let size = match read_usize(&mut glyph_cursor) {
            Ok(size) => size,
            Err(_) => break,
        };

        let mut buffer = vec![0u8; size];
        glyph_cursor.read_exact(&mut buffer).unwrap();
        let res = runner.add_glyph(buffer);
        if let Err(e) = res {
            println!("Error adding glyph: {:?}", e);
        }
    
    }
    // let mut x_vectors: Vec<Vector> = Vec::new();
    // let mut y_vectors: Vec<Vector> = Vec::new();
    // let mut glyphs: Vec<Glyph> = Vec::new();
    //Build some vectors
    // for i in 0..100 {
    //     x_vectors.push(Vector::new(VectorOrigionalValue::U64(i), i as f64, i));
    //     y_vectors.push(Vector::new(VectorOrigionalValue::U64(i), i as f64, i));
    // }

    //Build some glyphs
    //let mut rng = rand::thread_rng();
    //for x in 0..25 {
    //    for y in 0..12 {
    //        let random_number: f64 = rng.gen_range(0.0..=9.0);
    //        let min_y = y as f64;
    //        let max_y = min_y + 0.999;
    //        let y_random_number: f64 = rng.gen_range(min_y..=max_y);
    //        glyphs.push(Glyph::new(
    //            x as f64,
    //            y_random_number as f64,
    //            random_number,
    //            vec![x + y],
    //        ));
    //    }
    //}
    ////find our distinct x values and create a vector for each
    //let mut distinct_x: Vec<f64> = Vec::new();
    //glyphs.iter().for_each(|glyph| {
    //    if !distinct_x.contains(&glyph.x_value) {
    //        distinct_x.push(glyph.x_value);
    //    }
    //});
    //distinct_x.sort_by(|a, b| a.partial_cmp(b).unwrap());
    //let mut rank = 0;
    //let mut max_x = 0.0;
    //distinct_x.iter().for_each(|x| {
    //    let x_vector = Vector::new(VectorOrigionalValue::F64(*x), *x, rank);
    //    x_vectors.push(x_vector);
    //    rank += 1;
    //    max_x = *x;
    //});
    //let mut x_stats = Stats::default();
    //x_stats.axis = "x".to_string();
    //x_stats.max_rank = rank;
    //x_stats.min = 0.0;
    //x_stats.max = max_x;    

    ////find our distinct y values and create a vector for each
    //let mut distinct_y: Vec<f64> = Vec::new();
    //glyphs.iter().for_each(|glyph| {
    //    if !distinct_y.contains(&glyph.y_value) {
    //        distinct_y.push(glyph.y_value);
    //    }
    //});
    //distinct_y.sort_by(|a, b| a.partial_cmp(b).unwrap());
    //let mut rank = 0;
    //let mut max_y = 0.0;

    //distinct_y.iter().for_each(|y| {
    //    let y_vector = Vector::new(VectorOrigionalValue::F64(*y), *y, rank);
    //    y_vectors.push(y_vector);
    //    rank += 1;
    //    max_y = *y;
    //});

    //let mut y_stats = Stats::default();
    //y_stats.axis = "y".to_string();
    //y_stats.max_rank = rank;
    //y_stats.min = 0.0;
    //y_stats.max = max_y;


    //let mut z_stats = Stats::default();
    //z_stats.axis = "z".to_string();
    //z_stats.max_rank = 0;
    //z_stats.min = 0.0;
    //z_stats.max = 9.0;

    //for x_vec in x_vectors {
    //    let _ = runner.add_vector("x", serialize(&x_vec).unwrap());
    //}

    //for y_vec in y_vectors {
    //    let _ = runner.add_vector("y", serialize(&y_vec).unwrap());
    //}

    //let _ = runner.add_statistics(serialize(&x_stats).unwrap());
    //let _ = runner.add_statistics(serialize(&y_stats).unwrap());
    //let _ = runner.add_statistics(serialize(&z_stats).unwrap());

    //for glyph in glyphs {
    //    let result = runner.add_glyph(serialize(&glyph).unwrap());
    //    if let Err(e) = result {
    //        println!("Error adding glyph: {:?}", e);
    //    }
    //}

    pollster::block_on(runner.run(1500, 1000));
}
