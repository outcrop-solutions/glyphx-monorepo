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
    pub fn update_pipeline_z_order(&mut self, name: &str, z_order: u32) {
        for pipeline in &mut self.pipelines {
            if pipeline.name == name {
                pipeline.z_order = z_order;
            }
        }
        self.pipelines.sort_by(|a, b| a.z_order.cmp(&b.z_order));
    }
    pub fn get_pipeline(&self, name: &str) -> Option<&Box<dyn PipelineRunner>> {
        for pipeline in &self.pipelines {
            if pipeline.name == name {
                return Some(&pipeline.pipeline);
            }
        }
        None
    }

    pub fn get_pipeline_count(&self) -> usize {
        self.pipelines.len()
    }

    pub fn get_pipeline_by_z_order(&self, z_order: u32) -> Option<(String, &Box<dyn PipelineRunner>)> {
        for pipeline in &self.pipelines {
            if pipeline.z_order == z_order {
                return Some((pipeline.name.clone(),  &pipeline.pipeline));
            }
        }
        None
    }
}

