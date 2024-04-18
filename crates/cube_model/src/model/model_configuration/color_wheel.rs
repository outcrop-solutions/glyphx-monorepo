type Color = [f32; 4];
#[derive(Debug, Clone)]
pub struct ColorWheel {
    color_table: Vec<Color>,
}

impl ColorWheel {
    pub fn new() -> ColorWheel {
        let mut color_table: Vec<Color> = Vec::new();
        //Red
        color_table.push([255.0, 0.0, 0.0, 1.0]);
        // Generate colors transitioning from red to green
        for i in 0..8 {
            let t = i as f32 / 7.0;
            let red = ((1.0 - t) * 255.0) as f32;
            let green = (t * 255.0) as f32;
            color_table.push([red, green, 0.0, 1.0]); // Alpha set to 255 for fully opaque
        }
        // Green
        color_table.push([0.0, 255.0, 0.0, 1.0]);
        for i in 0..8 {
            let t = i as f32 / 7.0;
            let green = ((1.0 - t) * 255.0) as f32;
            let blue = (t * 255.0) as f32;
            color_table.push([0.0, green, blue, 1.0]);
        }

        // Blue
        color_table.push([0.0, 0.0, 255.0, 1.0]);
        ColorWheel { color_table }
    }

    pub fn get_color(&self, index: isize) -> Color {
        let len = self.color_table.len() as isize;
        let clean_index = index % len;
        let clean_index: usize = if clean_index < 0 {
            (clean_index + len) as usize
        } else {
            clean_index as usize
        };
        self.color_table[clean_index]
    }
}
