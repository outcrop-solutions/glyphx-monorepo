pub type Color = [f32; 4];
pub type ColorTable = Vec<Color>;
use crate::linear_interpolation;

pub fn build_color_table(min_color: Color, max_color: Color, num_colors: usize) -> ColorTable {
    let mut color_table: ColorTable = Vec::with_capacity(num_colors);

    let min_color = convert_rgb_to_hsv(&min_color);
    let max_color = convert_rgb_to_hsv(&max_color);


    for i in 0..num_colors  {
        let h:f32 = linear_interpolation(i as f32, 0.0, (num_colors -1) as f32, min_color[0] as f32, max_color[0] as f32).unwrap();
        let s = linear_interpolation(i as f32, 0.0, (num_colors -1) as f32, min_color[1], max_color[1]).unwrap();
        let v = linear_interpolation(i as f32, 0.0, (num_colors -1) as f32, min_color[2], max_color[2]).unwrap();
        let rgb_color = convert_hsv_to_rgb(&[h, s, v, 1.0]);
        color_table.push([rgb_color[0]/255.0, rgb_color[1]/255.0, rgb_color[2]/255.0, 1.0]);
    }
    color_table
}

fn get_min_max(color_vector: Vec<f32>) -> (f32, f32) {
    let mut max: f32 = 0.0;
    let mut min: f32 = 99999.0;
    for val in color_vector.iter() {
        if *val > max {
            max = *val;
        }
        if *val < min {
            min = *val;
        }
    }
    (max, min)
}

pub fn convert_rgb_to_hsv(input: &Color) -> Color {
    // Make inputRed, inputGreen, and inputBlue fractions of 1
    let input_red = input[0] / 255.0;
    let input_green = input[1] / 255.0;
    let input_blue = input[2] / 255.0;

    let color_vector = vec![input_red, input_green, input_blue];
    // Find the maximum and minimum values of inputRed, inputGreen, and inputBlue
    let (max, min) = get_min_max(color_vector);
    let diff = max - min;

    // Calculate hue
    let mut hue: f32;
    if diff == 0.0 {
        hue = 0.0;
    } else if max == input_red {
        hue = ((input_green - input_blue) / diff) % 6.0;
    } else if max == input_green {
        hue = (input_blue - input_red) / diff + 2.0;
    } else {
        hue = (input_red - input_green) / diff + 4.0;
    }
    hue = (hue * 60.0).round();
    if hue < 0.0 {
        hue += 360.0;
    }

    // Calculate saturation
    let mut saturation: f32 = 0.0;
    if max != 0.0 {
        saturation = diff / max;
    }
    saturation = (saturation * 100.0).round();

    // Calculate value
    let value = (max * 100.0).round();

    return [hue, saturation, value, input[3]];
}


////also courtasy of chatGpt
pub fn convert_hsv_to_rgb(
  input: &Color,
) -> Color {
    //
  // Convert the hue to a value between 0 and 360 degrees
  let mut hue = &input[0] % 360.0;
  if hue < 0.0 {
    hue += 360.0;
  }

  // Convert the saturation and value to fractions of 1
  let saturation = &input[1] / 100.0;
  let value = &input[2] / 100.0;

  // Calculate the chroma
   let c = value * saturation;

  // Calculate the x value
  let  x = c * (1.0 - (((hue / 60.0) % 2.0) - 1.0).abs());

  // Calculate the m value
  let m = value - c;

  // Calculate the RGB values
  let mut r;
  let mut g;
  let mut b;
  if hue >= 0.0 && hue < 60.0 {
    r = c;
    g = x;
    b = 0.0;
  } else if hue >= 60.0 && hue < 120.0 {
    r = x;
    g = c;
    b = 0.0;
  } else if hue >= 120.0 && hue < 180.0 {
    r = 0.0;
    g = c;
    b = x;
  } else if hue >= 180.0 && hue < 240.0 {
    r = 0.0;
    g = x;
    b = c;
  } else if hue >= 240.0 && hue < 300.0 {
    r = x;
    g = 0.0;
    b = c;
  } else {
    r = c;
    g = 0.0;
    b = x;
  }

  // Add the m value to each RGB component and convert to 8-bit integer
  r = ((r + m) * 255.0).round();
  g = ((g + m) * 255.0).round();
  b = ((b + m) * 255.0).round();

  return [r, g, b, input[3]];
}
