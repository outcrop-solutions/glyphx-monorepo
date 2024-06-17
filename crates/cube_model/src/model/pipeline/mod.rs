pub(crate) mod axis_lines;
pub(crate) mod glyphs;
pub(crate) mod pipeline_manager;
pub(crate) mod glyph_data;
use smaa::SmaaFrame;

pub trait PipelineRunner {
    fn run_pipeline<'a>(
        &'a self,
        encoder: &'a mut wgpu::CommandEncoder,
        smaa_frame: &SmaaFrame
    );
}
