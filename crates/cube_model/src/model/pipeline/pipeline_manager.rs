 use crate::model::pipeline::PipelineRunner;

pub struct PipelineDefinition {
    pipeline: Box<dyn PipelineRunner>,
    name: String,
    z_order: u32,
}

pub struct PipelineManager {
    pipelines: Vec<PipelineDefinition>,
}

impl PipelineManager {
    pub fn new() -> PipelineManager {
        PipelineManager {
            pipelines: Vec::new(),
        }
    }

    pub fn add_pipeline(&mut self, name: &str, pipeline: Box<dyn PipelineRunner>, z_order: u32) {
        self.pipelines.push(PipelineDefinition {
            pipeline,
            name: name.to_string(),
            z_order,
        });
    }

    pub fn get_pipeline(&self, name: &str) -> Option<&Box<dyn PipelineRunner>> {
        for pipeline in &self.pipelines {
            if pipeline.name == name {
                return Some(&pipeline.pipeline);
            }
        }
        None
    }
}

