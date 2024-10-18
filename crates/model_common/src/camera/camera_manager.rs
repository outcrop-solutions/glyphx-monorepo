pub trait ICameraManager {
   fn add_yaw(&mut self, yaw: f32);
   fn add_pitch(&mut self, pitch: f32);
   fn add_distance(&mut self, distance: f32);
   fn update(&mut self);
}
