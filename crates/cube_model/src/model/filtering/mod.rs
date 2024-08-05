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
        Statistic(String),
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
        z: Option<QueryType>,
        y: Option<QueryType>,
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
        fn extract_statistic(value: &str, statistics: &Stats) -> Option<f64> {
            match value {
                "mean" => Some(statistics.mean),
                "median" => Some(statistics.median),
                "pct_0" => Some(statistics.pct_0),
                "pct_5" => Some(statistics.pct_5),
                "pct_10" => Some(statistics.pct_10),
                "pct_15" => Some(statistics.pct_15),
                "pct_20" => Some(statistics.pct_20),
                "pct_25" => Some(statistics.pct_25),
                "pct_30" => Some(statistics.pct_30),
                "pct_33" => Some(statistics.pct_33),
                "pct_35" => Some(statistics.pct_35),
                "pct_40" => Some(statistics.pct_40),
                "pct_45" => Some(statistics.pct_45),
                "pct_50" => Some(statistics.pct_50),
                "pct_55" => Some(statistics.pct_55),
                "pct_60" => Some(statistics.pct_60),
                "pct_65" => Some(statistics.pct_65),
                "pct_67" => Some(statistics.pct_67),
                "pct_70" => Some(statistics.pct_70),
                "pct_75" => Some(statistics.pct_75),
                "pct_80" => Some(statistics.pct_80),
                "pct_85" => Some(statistics.pct_85),
                "pct_90" => Some(statistics.pct_90),
                "pct_95" => Some(statistics.pct_95),
                "pct_99" => Some(statistics.pct_99),
                _ => None,
            }
        }
        fn extract_comparison_value(
            sub_type: &SubType,
            axis_vectors: &Option<&ModelVectors>,
            axis_stats: &Stats,
        ) -> Option<f64> {
            match sub_type {
                SubType::Value(comparison_value) => {
                    if axis_vectors.is_some() {
                        Self::extract_vector_from_value(&comparison_value, axis_vectors.unwrap())
                    } else {
                        //Y axis does not have vectors, it is already a number
                        match comparison_value {
                            ComparisonValue::Number(f) => Some(*f),
                            ComparisonValue::Integer(i) => Some(*i as f64),
                            _ => None,
                        }
                    }
                }
                SubType::Statistic(value) => Self::extract_statistic(value.as_str(), axis_stats),
            }
        }
        fn greater_than_fn(a: &f64, b: &f64) -> bool {
            a > b
        }
        fn compare_values(operator: &Operator, vector_value: f64, comparison_value: f64) -> bool {
            match operator {
                Operator::GreaterThan => Self::greater_than_fn(&vector_value, &comparison_value),
                _ => false,
            }
        }
        fn evaluate_axis(
            axis_query: &QueryType,
            vector_value: f64,
            axis_vectors: &Option<&ModelVectors>,
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
                    Self::compare_values(&operator, vector_value, comparison_value)
                }
            }
        }
        fn process_axis_query(
            query_type: &Option<QueryType>,
            vector_value: f64,
            axis_vectors: &Option<&ModelVectors>,
            axis_stats: &Stats,
        ) -> bool {
            let query_type = Self::get_query_type(query_type);
            let expected_value = Self::get_expected_query_result(&query_type);
            let evaluated_value =
                Self::evaluate_axis(&query_type, vector_value, axis_vectors, axis_stats);

            expected_value == evaluated_value
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
                    let x_query_result = Self::process_axis_query(
                        &self.x,
                        g.x_value as f64,
                        &Some(&x_vector_data),
                        x_statistics,
                    );

                    let z_query_result = Self::process_axis_query(
                        &self.z,
                        g.z_value as f64,
                        &Some(&z_vector_data),
                        z_statistics,
                    );

                    let y_query_result =
                        Self::process_axis_query(&self.y, g.y_value as f64, &None, y_statistics);
                    x_query_result && z_query_result && y_query_result
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
                    GlyphInstanceData::new(glyph_id, x as f32, x, (x * z) as f32, z as f32, z, z);
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
        let y_data: Vec<f64> = glyph_data.iter().map(|y| y.y_value as f64).collect();
        let y_stats = build_stats_for_axis("y", 0, &y_data);
        let x_vectors = build_vectors(&x_data, &vector_type);
        let z_vectors = build_vectors(&z_data, &vector_type);
        (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors)
    }
    mod include {
        use super::*;

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
                z: None,
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            assert!(results.len() < glyph_data.len());
            //We are only filtering on x so we should have z values less than our filter -- due` to the
            //way we build the glyphs
            let mut z_less_than_filter = false;
            results.iter().for_each(|g| {
                assert!(g.x_value > 5.0);
                if g.z_value <= 5.0 {
                    z_less_than_filter = true;
                }
            });

            assert!(z_less_than_filter);
        }

        #[test]
        fn z_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                z: Some(QueryType::Include {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                x: None,
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            //We are only filtering on z so we should have x values less than our filter -- due to the
            //way we build the glyphs
            let mut x_less_than_filter = false;
            assert!(results.len() < glyph_data.len());
            results.iter().for_each(|g| {
                assert!(g.z_value > 5.0);
                if g.x_value < 5.0 {
                    x_less_than_filter = true;
                }
            });
            assert!(x_less_than_filter);
        }

        #[test]
        fn y_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                y: Some(QueryType::Include {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                x: None,
                z: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            assert!(results.len() < glyph_data.len());
            //We are only filtering on y so we should have x & z values less than our filter -- due` to the
            //way we build the glyphs
            let mut z_less_than_filter = false;
            let mut x_less_than_filter = false;
            results.iter().for_each(|g| {
                assert!(g.y_value > 5.0);
                if g.z_value <= 5.0 {
                    z_less_than_filter = true;
                }
                if g.x_value <= 5.0 {
                    x_less_than_filter = true;
                }
            });

            assert!(z_less_than_filter);
            assert!(x_less_than_filter);
        }

        #[test]
        fn x_and_z_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                z: Some(QueryType::Include {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                x: Some(QueryType::Include {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            //We are only filtering on z so we should have x values less than our filter -- due to the
            //way we build the glyphs
            assert!(results.len() < glyph_data.len());
            results.iter().for_each(|g| {
                assert!(g.z_value > 5.0);
                assert!(g.x_value > 5.0);
            });
        }
    }

    mod exclude {
        use super::*;

        #[test]
        fn x_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                x: Some(QueryType::Exclude {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                z: None,
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            assert!(results.len() < glyph_data.len());
            //We are only filtering on x so we should have z values less than our filter -- due` to the
            //way we build the glyphs
            let mut z_greater_than_filter = false;
            results.iter().for_each(|g| {
                assert!(g.x_value <= 5.0);
                if g.z_value > 5.0 {
                    z_greater_than_filter = true;
                }
            });

            assert!(z_greater_than_filter);
        }

        #[test]
        fn z_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                z: Some(QueryType::Exclude {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                x: None,
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            //We are only filtering on z so we should have x values less than our filter -- due to the
            //way we build the glyphs
            let mut x_greater_than_filter = false;
            assert!(results.len() < glyph_data.len());
            results.iter().for_each(|g| {
                assert!(g.z_value <= 5.0);
                if g.x_value > 5.0 {
                    x_greater_than_filter = true;
                }
            });
            assert!(x_greater_than_filter);
        }

        #[test]
        fn y_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                y: Some(QueryType::Exclude {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                x: None,
                z: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            assert!(results.len() < glyph_data.len());
            //We are only filtering on y so we should have x & z values less than our filter -- due` to the
            //way we build the glyphs
            let mut z_greater_than_filter = false;
            let mut x_greater_than_filter = false;
            results.iter().for_each(|g| {
                assert!(g.y_value <= 5.0);
                if g.z_value > 5.0 {
                    z_greater_than_filter = true;
                }
                if g.x_value > 5.0 {
                    x_greater_than_filter = true;
                }
            });

            assert!(z_greater_than_filter);
            assert!(x_greater_than_filter);
        }

        #[test]
        fn x_and_z_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                z: Some(QueryType::Exclude {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                x: Some(QueryType::Exclude {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            //We are only filtering on z so we should have x values less than our filter -- due to the
            //way we build the glyphs
            assert!(results.len() < glyph_data.len());
            results.iter().for_each(|g| {
                assert!(g.z_value <= 5.0);
                assert!(g.x_value <= 5.0);
            });
        }
    }

    mod mixed_queries {
        use super::*;

        #[test]
        fn include_x_and_exclude_z_greater_than_5() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let query = Query {
                z: Some(QueryType::Exclude {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                x: Some(QueryType::Include {
                    sub_type: SubType::Value(ComparisonValue::Number(5.0)),
                    operator: Operator::GreaterThan,
                }),
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            //We are only filtering on z so we should have x values less than our filter -- due to the
            //way we build the glyphs
            assert!(results.len() < glyph_data.len());
            results.iter().for_each(|g| {
                assert!(g.z_value <= 5.0);
                assert!(g.x_value > 5.0);
            });
        }
    }
    mod extract_comparison_value {
        use super::*;

        #[test]
        fn number_is_ok() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::Number);
            let value = Query::extract_vector_from_value(&ComparisonValue::Number(5.0), &vectors);
            assert!(value.is_some() );
            let value = value.unwrap();
            assert_eq!(value, 5.0);

        }

        #[test]
        fn number_is_none() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::Number);
            let value = Query::extract_vector_from_value(&ComparisonValue::Number(105.0), &vectors);
            assert!(value.is_none() );

        }

        #[test]
        fn number_is_mismatched_type() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::Number);
            let value = Query::extract_vector_from_value(&ComparisonValue::String("I am a test".to_string()), &vectors);
            assert!(value.is_none() );

        }

        #[test]
        fn integer_is_ok() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::Integer);
            let value = Query::extract_vector_from_value(&&ComparisonValue::Integer(5), &vectors);
            assert!(value.is_some() );
            let value = value.unwrap();
            assert_eq!(value, 5.0);

        }

        #[test]
        fn integer_is_none() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::Integer);
            let value = Query::extract_vector_from_value(&ComparisonValue::Integer(105), &vectors);
            assert!(value.is_none() );

        }

        #[test]
        fn integer_is_mismatched_type() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::Integer);
            let value = Query::extract_vector_from_value(&ComparisonValue::String("I am a test".to_string()), &vectors);
            assert!(value.is_none() );

        }

        #[test]
        fn string_is_ok() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::String("String".to_string()));
            let value = Query::extract_vector_from_value(&&ComparisonValue::String("String-5".to_string()), &vectors);
            assert!(value.is_some() );
            let value = value.unwrap();
            assert_eq!(value, 5.0);

        }

        #[test]
        fn string_is_none() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::String("String".to_string()));
            let value = Query::extract_vector_from_value(&ComparisonValue::String("String-105".to_string()), &vectors);
            assert!(value.is_none() );

        }

        #[test]
        fn string_is_mismatched_type() {
            let values: Vec<f64>= (0 .. 100).collect::<Vec<u32>>().iter().map(|v| *v as f64).collect();
            let vectors = build_vectors(&values, &VectorType::String("String".to_string()));
            let value = Query::extract_vector_from_value(&ComparisonValue::Number(5.0), &vectors);
            assert!(value.is_none() );

        }
    }

    mod stats {
        use super::*;

        fn build_test_stats() -> Stats {
            Stats {
                axis: "test".to_string(),
                min: 0.0,
                max: 999.0,
                mean: 500.0,
                median: 550.0,
                variance: f64::NAN,
                standard_deviation: f64::NAN,
                entropy: f64::NAN,
                skewness: f64::NAN,
                pct_0: 0.0,
                pct_5: 5.0,
                pct_10: 10.0,
                pct_15: 15.0,
                pct_20: 20.0,
                pct_25: 25.0,
                pct_30: 30.0,
                pct_33: 33.0,
                pct_35: 35.0,
                pct_40: 40.0,
                pct_45: 45.0,
                pct_50: 50.0,
                pct_55: 55.0,
                pct_60: 60.0,
                pct_65: 65.0,
                pct_67: 67.0,
                pct_70: 70.0,
                pct_75: 75.0,
                pct_80: 80.0,
                pct_85: 85.0,
                pct_90: 90.0,
                pct_95: 95.0,
                pct_99: 99.0,
                max_rank: 1000,
            }
        }

        #[test]
        fn mean() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("mean", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.mean);
        }

        #[test]
        fn median() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("median", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.median);
        }

        #[test]
        fn pct_0() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_0", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_0);
        }
        
        #[test]
        fn pct_5() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_5", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_5);
        }

        #[test]
        fn pct_10() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_10", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_10);
        }

        #[test]
        fn pct_15() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_15", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_15);
        }
        
        #[test]
        fn pct_20() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_20", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_20);
        }

        #[test]
        fn pct_25() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_25", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_25);
        }

        #[test]
        fn pct_30() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_30", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_30);
        }

        #[test]
        fn pct_33() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_33", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_33);
        }

        #[test]
        fn pct_35() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_35", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_35);
        }

        #[test]
        fn pct_40() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_40", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_40);
        }

        #[test]
        fn pct_45() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_45", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_45);
        }

        #[test]
        fn pct_50() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_50", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_50);
        }

        #[test]
        fn pct_55() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_55", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_55);
        }

        #[test]
        fn pct_60() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_60", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_60);
        }

        #[test]
        fn pct_65() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_65", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_65);
        }

        #[test]
        fn pct_67() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_67", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_67);
        }

        #[test]
        fn pct_70() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_70", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_70);
        }

        #[test]
        fn pct_75() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_75", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_75);
        }

        #[test]
        fn pct_80() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_80", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_80);
        }

        #[test]
        fn pct_90() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_90", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_90);
        }

        #[test]
        fn pct_95() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_95", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_95);
        }

        #[test]
        fn pct_99() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("pct_99", &stats);
            assert!(result.is_some());
            let result = result.unwrap();
            assert_eq!(result, stats.pct_99);
        }

        #[test]
        fn is_none() {
            let stats = build_test_stats();
            let result = Query::extract_statistic("something else", &stats);
            assert!(result.is_none());
        }

        #[test]
        fn x_greater_than_65_pct() {
            // Test code here

            let (glyph_data, x_stats, z_stats, y_stats, x_vectors, z_vectors) =
                build_test_data(10, 10, VectorType::Number);
            let comp_value = x_stats.pct_65 as f32;

            let query = Query {
                x: Some(QueryType::Include {
                    sub_type: SubType::Statistic("pct_65".to_string()),
                    operator: Operator::GreaterThan,
                }),
                z: None,
                y: None,
            };

            let results = query.run(
                &glyph_data,
                &x_vectors,
                &z_vectors,
                &x_stats,
                &z_stats,
                &y_stats,
            );
            assert!(results.len() < glyph_data.len());
            //We are only filtering on x so we should have z values less than our filter -- due` to the
            //way we build the glyphs
            let mut z_less_than_filter = false;
            results.iter().for_each(|g| {
                assert!(g.x_value > comp_value);
                if g.z_value <= comp_value {
                    z_less_than_filter = true;
                }
            });

            assert!(z_less_than_filter);
        }
    }
}
