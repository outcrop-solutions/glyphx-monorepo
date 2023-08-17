pub(crate) mod axis_lines;
pub(crate) mod glyphs;
pub(crate) mod pipeline_manager;

use crate::assets::color::Color;
use smaa::SmaaFrame;

pub trait PipelineRunner {
    fn run_pipeline<'a>(
        &'a self,
        encoder: &'a mut wgpu::CommandEncoder,
        smaa_frame: &SmaaFrame,
    );
}
