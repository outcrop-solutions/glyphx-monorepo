use num_traits::Num;
pub fn linear_interpolation<T:Num + std::cmp::PartialOrd + std::fmt::Display + Copy>(
    data_value: T,
    min_data_value: T,
    max_data_value: T,
    min_interpolated_value: T,
    max_interpolated_value: T
) -> Result<T, String> {
    if data_value < min_data_value || data_value > max_data_value {
        //TODO: convert this to a core error
        return Err(format!("The value of dataValue: {} is outside the range of minDataValue: {} and maxDataValue: {}", data_value, min_data_value, max_data_value ));
    }


    if min_data_value == max_data_value {
        return Ok(max_interpolated_value);
    }

    let res = min_interpolated_value
        + ((max_interpolated_value - min_interpolated_value) * (data_value - min_data_value))
            / (max_data_value - min_data_value);

    return Ok(res);
}
//TODO: This can probably be made gerneric using libm and then functions like these can be moved to
//the core crate
pub fn _logaritmic_interpolation(
  data_value: f32,
  min_data_value: f32,
  max_data_value: f32,
  min_glyph_value: f32,
  max_glyph_value: f32
) -> Result<f32, String> {
  if data_value < min_data_value || data_value > max_data_value {
        return Err(format!("The value of dataValue: {} is outside the range of minDataValue: {} and maxDataValue: {}", data_value, min_data_value, max_data_value ));
  }
  if min_data_value == max_data_value {
    return Ok(max_glyph_value);

  }

  return Ok(
    ((data_value - min_data_value + 1.0).log10() *
      (max_glyph_value - min_glyph_value)) /
      (max_data_value - min_data_value + 1.0).log10() +
    min_glyph_value
  )
}
