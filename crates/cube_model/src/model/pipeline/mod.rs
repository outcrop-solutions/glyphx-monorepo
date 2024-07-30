pub(crate) mod axis_lines;
pub(crate) mod glyphs;
pub(crate) mod pipeline_manager;
pub(crate) mod glyph_data;
pub(crate) mod new_hit_detection;
use smaa::SmaaFrame;

pub trait PipelineRunner {
    fn run_pipeline<'a>(
        &'a self,
        encoder: &'a mut wgpu::CommandEncoder,
        smaa_frame: &SmaaFrame
    );
}
