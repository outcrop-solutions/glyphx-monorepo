#[cfg(test)]
mod unit_tests {
    use super::*;
    use crate::data::ModelVectors;
    use crate::model::pipeline::glyphs;
    use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;
    use model_common::{Stats, Vector, VectorOrigionalValue};
    use statrs::statistics::*;
    type comparison_fn = fn(&f64, &f64) -> bool;
    type value_extraction_fn = fn(&GlyphInstanceData, &ModelVectors, Stats, ComparisonValue) -> f64;

    #[derive(Clone, Debug)]
    enum ComparisonValue {
        Number(f64),
        Integer(u64),
        String(String),
    }

    impl ComparisonValue {
        fn into_vector_origional_value(&self) -> VectorOrigionalValue {
            match self {
                Self::Number(value) => VectorOrigionalValue::F64(value.clone()),
                Self::Integer(value) => VectorOrigionalValue::U64(value.clone()),
                Self::String(value) => VectorOrigionalValue::String(value.clone()),
            }
        }
    }

    #[derive(Clone, Debug)]
    enum VectorType {
        Number,
        Integer,
        String(String),
    }

    #[derive(Clone, Debug)]
    enum Operator {
        GreaterThan,
    }

    #[derive(Clone, Debug)]
    enum SubType {
        Value(ComparisonValue),
    }

    #[derive(Clone, Debug)]
    enum QueryType {
        Include {
            sub_type: SubType,
            operator: Operator,
        },
        Exclude {
            sub_type: SubType,
            operator: Operator,
        },
        NoOp,
    }

    struct Query {
        x: Option<QueryType>,
    }

    impl Query {
        fn get_query_type(query_type: &Option<QueryType>) -> QueryType {
            match query_type {
                None => QueryType::NoOp,
                _ => query_type.as_ref().unwrap().clone(),
            }
        }

        fn get_expected_query_result(query_type: &QueryType) -> bool {
            match query_type {
                QueryType::Exclude { .. } => false,
                _ => true,
            }
        }

        //Model filtering expects that the values passed in, match a value in the vector table
        //If we cannot match the comparison value to a vector then we need to return an error
        fn extract_vector_from_value(
            comparison_value: &ComparisonValue,
            axis_vectors: &ModelVectors,
        ) -> Option<f64> {
            let vector_origional_value = comparison_value.into_vector_origional_value();
            let value = axis_vectors.get_vector(vector_origional_value); //axis_vectors.//axis_vectors.
            value
        }
        //Convert world side value to a vector to pass it to the comparison_fn
        fn extract_comparison_value(
            sub_type: &SubType,
            axis_vectors: &ModelVectors,
            axis_statistics: &Stats,
        ) -> Option<f64> {
            match sub_type {
                SubType::Value(comparison_value) => {
                    Self::extract_vector_from_value(&comparison_value, axis_vectors)
                }
            }
        }
        fn greater_than_fn(a: &f64, b: &f64) -> bool {
            a > b
        }
        fn compare_values( operator: &Operator, vector_value: f64, comparison_value: f64) -> bool {
            match operator {
                Operator::GreaterThan => Self::greater_than_fn(&vector_value, &comparison_value),
                _ => false
            }
        }
        fn evaluate_axis(
            axis_query: &QueryType,
            vector_value: f64,
            axis_vectors: &ModelVectors,
            axis_stats: &Stats,
        ) -> bool {
            match axis_query {
                QueryType::NoOp => true,
                QueryType::Include { sub_type, operator }
                | QueryType::Exclude { sub_type, operator } => {
                    let comparison_val =
                        Self::extract_comparison_value(sub_type, axis_vectors, axis_stats);
                    if comparison_val.is_none() {
                    return false;
                    }
                    let comparison_value = comparison_val.unwrap();
                    Self::compare_values( &operator, vector_value, comparison_value)
                }
            }
        }
        pub fn run(
            &self,
            glyph_data: &Vec<GlyphInstanceData>,
            x_vector_data: &ModelVectors,
            z_vector_data: &ModelVectors,
            x_statistics: &Stats,
            y_statistics: &Stats,
            z_statistics: &Stats,
        ) -> Vec<GlyphInstanceData> {
            glyph_data
                .iter()
                .filter(|g| {
                    let x_query_type = Self::get_query_type(&self.x);
                    let expected_x = Self::get_expected_query_result(&x_query_type);
                    let x_evaluated_value = Self::evaluate_axis(
                        &x_query_type,
                        g.x_value as f64,
                        x_vector_data,
                        x_statistics,
                    );
                    x_evaluated_value == expected_x
                })
                .map(|g| g.clone())
                .collect()
        }
    }


    fn build_glyph_data(x_rank_size: u32, z_rank_size: u32) -> Vec<GlyphInstanceData> {
        let mut glyph_data: Vec<GlyphInstanceData> = Vec::new();
        for x in 0..x_rank_size {
            for z in 0..z_rank_size {
                let glyph_id = x * z_rank_size + z;
                let glyph_instance =
                    GlyphInstanceData::new(glyph_id, x as f32, x, x as f32, (x * z) as f32, z, z);
                glyph_data.push(glyph_instance);
            }
        }
        glyph_data
    }

    fn build_stats_for_axis(axis_name: &str, max_rank: u64, data: &Vec<f64>) -> Stats {
        let data = data.clone();
        let mut stats_generator = statrs::statistics::Data::new(data);
        Stats {
            axis: axis_name.to_string(),
            min: stats_generator.min(),
            max: stats_generator.max(),
            mean: stats_generator.mean().unwrap_or_else(|| f64::NAN),
            median: stats_generator.median(),
            variance: stats_generator.variance().unwrap_or_else(|| f64::NAN),
            standard_deviation: stats_generator.std_dev().unwrap_or_else(|| f64::NAN),
            entropy: stats_generator.entropy().unwrap_or_else(|| f64::NAN),
            skewness: stats_generator.skewness().unwrap_or_else(|| f64::NAN),
            pct_0: stats_generator.percentile(0),
            pct_5: stats_generator.percentile(5),
            pct_10: stats_generator.percentile(10),
            pct_15: stats_generator.percentile(15),
            pct_20: stats_generator.percentile(20),
            pct_25: stats_generator.percentile(25),
            pct_30: stats_generator.percentile(30),
            pct_33: stats_generator.percentile(33),
            pct_35: stats_generator.percentile(35),
            pct_40: stats_generator.percentile(40),
            pct_45: stats_generator.percentile(45),
            pct_50: stats_generator.percentile(50),
            pct_55: stats_generator.percentile(55),
            pct_60: stats_generator.percentile(60),
            pct_65: stats_generator.percentile(65),
            pct_67: stats_generator.percentile(67),
            pct_70: stats_generator.percentile(70),
            pct_75: stats_generator.percentile(75),
            pct_80: stats_generator.percentile(80),
            pct_85: stats_generator.percentile(85),
            pct_90: stats_generator.percentile(90),
            pct_95: stats_generator.percentile(95),
            pct_99: stats_generator.percentile(99),
            max_rank,
        }
    }
    fn build_vectors(data: &Vec<f64>, vector_type: &VectorType) -> ModelVectors {
        let mut model_vectors = ModelVectors::new();
        let mut distinct_values: Vec<f64> = Vec::new();
        data.iter().for_each(|v| {
            if !distinct_values.contains(&v) {
                distinct_values.push(*v);
            }
        });
        distinct_values.iter().for_each(|v| {
            let rank = *v as u64;
            let vector = *v;
            let orig_value = match &vector_type {
                VectorType::Number => VectorOrigionalValue::F64(*v),
                VectorType::Integer => VectorOrigionalValue::U64(*v as u64),
                VectorType::String(prelude) => {
                    VectorOrigionalValue::String(format!("{}-{}", prelude, v))
                }
            };
            let vector = Vector::new(orig_value, vector, rank);
            let _ = model_vectors.insert_vector(vector);
        });

        model_vectors
    }
    fn build_test_data(
        x_size: u32,
        z_size: u32,
        vector_type: VectorType,
    ) -> (
        Vec<GlyphInstanceData>,
        Stats,
        Stats,
        Stats,
        ModelVectors,
        ModelVectors,
    ) {
        let glyph_data = build_glyph_data(x_size, z_size);
        let x_data: Vec<f64> = glyph_data.iter().map(|x| x.x_value as f64).collect();
        let x_stats = build_stats_for_axis("x", x_size as u64, &x_data);
        let z_data: Vec<f64> = glyph_data.iter().map(|z| z.z_value as f64).collect();
        let z_stats = build_stats_for_axis("z", z_size as u64, &z_data);
        let y_data : Vec<f64> = glyph_data.iter().map(|y| y.y_value as f64).collect();
        let y_stats = build_stats_for_axis("y", 0, &y_data);
        let x_vectors = build_vectors(&x_data, &vector_type);
        let z_vectors = build_vectors(&z_data, &vector_type);
        (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors)
    }

    #[test]
    fn x_greater_than_5() {
        // Test code here

        let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
            build_test_data(10, 10, VectorType::Number);
        let query = Query {
            x: Some(QueryType::Include {
                sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                operator: Operator::GreaterThan,
            }),
        };

        let results = query.run(&glyph_data, &x_vectors,& z_vectors, &x_stats,& z_stats,& y_stats);
        assert!(results.len() < glyph_data.len());
        results.iter().for_each(|g| {
            assert!(g.x_value > 5.0);
        });
    }
}
