use wgpu::{Device, Surface, Queue};
use crate::camera::uniform_buffer::CameraUniform;
use crate::model::color_table_uniform::ColorTableUniform;
use std::sync::Arc;

pub trait Pipeline {
    fn run_pipeline(&self, surface: &Surface, device: &Device, queue: &Queue, camera_buffer: Option<&CameraUniform>, color_table_uniform: Option<&ColorTableUniform>) -> Result<(), wgpu::SurfaceError>;

}

pub struct PipeLineDefinition {
    name: String,
    pipeline: Arc<dyn Pipeline>,
}

pub struct PipeLines {
    pipelines: Vec<PipeLineDefinition>,
}

impl PipeLines {
    pub fn new() -> Self {
        Self {
            pipelines: Vec::new(),
        }
    }

    pub fn get_pipeline(&self, name: &str) -> Option<&Arc<dyn Pipeline>> {
        for pipeline in &self.pipelines {
            if pipeline.name == name {
                return Some(&pipeline.pipeline);
            }
        }
        None
    }

    pub fn add_pipeline(&mut self, name: String, pipeline: Arc<dyn Pipeline>) {
        self.pipelines.push(PipeLineDefinition {
            name,
            pipeline,
        });
    }

    pub fn run_pipeline(&self, name: &str, surface: &Surface, device: &Device, queue: &Queue, camera_uniform: Option<&CameraUniform>, color_table_uniform: Option<&ColorTableUniform>) -> Result<(), wgpu::SurfaceError> {
        let pipeline = self.get_pipeline(name);
        if pipeline.is_none() {
            return Err(wgpu::SurfaceError::Lost);
        } else {
            return pipeline.unwrap().run_pipeline(surface, device, queue, camera_uniform, color_table_uniform );
        }
    }
}
