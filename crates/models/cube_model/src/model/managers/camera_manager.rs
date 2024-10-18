use crate::model::uniforms::CameraUniform;
use glam::Vec3;
use model_common::{ICameraManager, OrbitCamera, Vector3};
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraData {
    pub yaw: f32,
    pub pitch: f32,
    pub distance: f32,
    pub target: Vector3,
    pub y_offset: f32,
    pub x_offset: f32,
    pub z_offset: f32,
}

#[derive(Debug, Clone)]
pub struct CameraManager {
    pub camera: Option<OrbitCamera>,
    pub camera_uniform: Option<CameraUniform>,
}

impl CameraManager {
    pub fn new() -> CameraManager {
        CameraManager {
            camera: None,
            camera_uniform: None,
        }
    }

    pub fn initialize(
        &mut self,
        pitch: f32,
        yaw: f32,
        distance: f32,
        aspect_ratio: f32,
        y_offset: f32,
    ) -> CameraUniform {
        let mut camera =
            OrbitCamera::new(distance, pitch, yaw, Vec3::new(0.0, 0.0, 0.0), aspect_ratio);

        camera.bounds.min_distance = None;
        //camera.bounds.min_distance = Some(1.1);
        let mut camera_uniform = CameraUniform::default();
        camera_uniform.y_offset = y_offset;
        camera_uniform.update_view_proj(&camera);
        let camera_uniform_clone = camera_uniform.clone();
        self.camera = Some(camera);
        self.camera_uniform = Some(camera_uniform);

        self.update();
        //We return clones here so that these can be used to build the buffers.
        //All mut actions on these will be performed internally through methods on the CameraManager
        camera_uniform_clone
    }

    pub fn update_aspect_ratio(&mut self, aspect_ratio: f32) {
        if self.camera.is_none() {
            return;
        }
        let camera = self.camera.as_ref().unwrap();
        let mut camera = camera.clone();
        camera.update_aspect(aspect_ratio);
        //Here we need to pull out the x,y and z offsets so that we can replace the model into the
        //correct position
        let y_offset = self.get_y_offset();
        let z_offset = self.get_z_offset();
        let x_offset = self.get_x_offset();
        //default sets x,y,z_offset to 0.0
        let mut camera_uniform = CameraUniform::default();
        camera_uniform.y_offset = y_offset;
        camera_uniform.x_offset = x_offset;
        camera_uniform.z_offset = z_offset;
        camera_uniform.update_view_proj(&camera);
        self.camera = Some(camera);
        self.camera_uniform = Some(camera_uniform);
    }

    pub fn get_camera_data(&self) -> String {
        let camera_data = if self.camera.is_none() {
            CameraData {
                yaw: 0.0,
                pitch: 0.0,
                distance: 0.0,
                target: Vector3::new(0.0, 0.0, 0.0),
                y_offset: 0.0,
                x_offset: 0.0,
                z_offset: 0.0,
            }
        } else {
            let camera = self.camera.as_ref().unwrap();
            CameraData {
                yaw: camera.yaw,
                pitch: camera.pitch,
                distance: camera.distance,
                target: camera.target,
                y_offset: self.camera_uniform.as_ref().unwrap().y_offset,
                x_offset: self.camera_uniform.as_ref().unwrap().x_offset,
                z_offset: self.camera_uniform.as_ref().unwrap().z_offset,
            }
        };
        to_string(&camera_data).unwrap()
    }

    pub fn set_camera_data(&mut self, camera_data: String, aspect_ratio: f32) {
        let camera_data: CameraData = from_str(&camera_data).unwrap();
        let mut camera = OrbitCamera::new(
            camera_data.distance,
            camera_data.pitch,
            camera_data.yaw,
            camera_data.target.to_vec3(),
            aspect_ratio,
        );
        camera.bounds.min_distance = Some(1.1);
        let mut camera_uniform = CameraUniform::default();
        camera_uniform.y_offset = camera_data.y_offset;
        camera_uniform.x_offset = camera_data.x_offset;
        camera_uniform.z_offset = camera_data.z_offset;
        camera_uniform.update_view_proj(&camera);
        self.camera = Some(camera);
        self.camera_uniform = Some(camera_uniform);
    }

    pub fn get_yaw(&self) -> f32 {
        if self.camera.is_none() {
            return 0.0;
        }
        self.camera.as_ref().unwrap().yaw
    }

    pub fn set_yaw(&mut self, yaw: f32) {
        if self.camera.is_none() {
            return;
        }
        self.camera.as_mut().unwrap().set_yaw(yaw);
    }

    #[allow(dead_code)]
    pub fn get_pitch(&self) -> f32 {
        if self.camera.is_none() {
            return 0.0;
        }
        self.camera.as_ref().unwrap().pitch
    }

    pub fn set_pitch(&mut self, pitch: f32) {
        if self.camera.is_none() {
            return;
        }
        self.camera.as_mut().unwrap().set_pitch(pitch);
    }
    pub fn get_distance(&self) -> f32 {
        if self.camera.is_none() {
            return 0.0;
        }
        self.camera.as_ref().unwrap().distance
    }

    #[allow(dead_code)]
    pub fn get_y_offset(&self) -> f32 {
        if self.camera_uniform.is_none() {
            return 0.0;
        }
        self.camera_uniform.as_ref().unwrap().y_offset
    }

    pub fn add_y_offset(&mut self, y_offset: f32) {
        if self.camera_uniform.is_none() {
            return;
        }
        self.camera_uniform
            .as_mut()
            .unwrap()
            .update_y_offset(y_offset);
    }

    #[allow(dead_code)]
    pub fn get_x_offset(&self) -> f32 {
        if self.camera_uniform.is_none() {
            return 0.0;
        }
        self.camera_uniform.as_ref().unwrap().x_offset
    }

    pub fn add_x_offset(&mut self, x_offset: f32) {
        if self.camera_uniform.is_none() {
            return;
        }
        self.camera_uniform
            .as_mut()
            .unwrap()
            .update_x_offset(x_offset);
    }

    #[allow(dead_code)]
    pub fn get_z_offset(&self) -> f32 {
        if self.camera_uniform.is_none() {
            return 0.0;
        }
        self.camera_uniform.as_ref().unwrap().z_offset
    }

    pub fn add_z_offset(&mut self, z_offset: f32) {
        if self.camera_uniform.is_none() {
            return;
        }
        self.camera_uniform
            .as_mut()
            .unwrap()
            .update_z_offset(z_offset);
    }

    pub fn get_camera_uniform(&self) -> CameraUniform {
        let cm = self.camera_uniform.clone().unwrap();
        cm
    }
}
impl ICameraManager for CameraManager {
    fn add_yaw(&mut self, yaw: f32) {
        if self.camera.is_none() {
            return;
        }
        let camera = &mut self.camera.as_mut().unwrap();
        camera.add_yaw(yaw);
    }
    
    fn add_pitch(&mut self, pitch: f32) {
        if self.camera.is_none() {
            return;
        }
        self.camera.as_mut().unwrap().add_pitch(pitch);
    }

    fn add_distance(&mut self, distance: f32) {
        if self.camera.is_none() {
            return;
        }
        self.camera.as_mut().unwrap().add_distance(distance);
    }

    fn update(&mut self) {
        if self.camera.is_none() {
            return;
        }

        let camera = self.camera.as_ref().unwrap();
        let camera_uniform = &mut self.camera_uniform.as_mut().unwrap();
        camera_uniform.update_view_proj(camera);
    }
}
