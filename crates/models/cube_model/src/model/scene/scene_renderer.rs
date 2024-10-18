use crate::model::BufferManager;
use crate::model::CameraManager;

use model_common::WgpuManager;

use smaa::*;
use std::{cell::RefCell, rc::Rc};
use wgpu::SurfaceError;

pub struct SceneRenderer {
    buffer_manager: Rc<RefCell<BufferManager>>,
    wgpu_manager: Rc<RefCell<WgpuManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
    smaa_target: SmaaTarget,
}

//impl SceneRenderer {
//    pub fn new(
//        buffer_manager: Rc<RefCell<BufferManager>>,
//        wgpu_manager: Rc<RefCell<WgpuManager>>,
//        camera_manager: Rc<RefCell<CameraManager>>,
//    ) -> Self {
//        let wm = wgpu_manager.clone();
//        let wm = wm.borrow();
//        let d = wm.device();
//        let d = d.borrow();
//        let smaa_target = SmaaTarget::new(
//            &d,
//            wm.queue(),
//            wm.size().width,
//            wm.size().height,
//            wm.config().format,
//            SmaaMode::Smaa1X,
//        );
//        Self {
//            buffer_manager,
//            wgpu_manager,
//            camera_manager,
//            smaa_target,
//        }
//    }

//    pub fn render_scene(&mut self, view: &wgpu::TextureView) -> Result<(), SurfaceError> {
//        let buffer_manager = self.buffer_manager.borrow();
//        let wgpu_manager = self.wgpu_manager.borrow();
//        let queue = wgpu_manager.queue();
//        let device = wgpu_manager.device();
//        let device = device.borrow();

//        let background_color = buffer_manager.color_table_uniform().background_color();

//        //This is yet another way to skin this mutible borrow cat.  Here, we can borrow the
//        //camera_manager and we don't have to worry about the immutable borrow of self since
//        //it is wrapped in () and is dropped after the borrow is executed.
//        let cm = (&mut self.camera_manager).borrow();

//        queue.write_buffer(
//            &buffer_manager.camera_buffer(),
//            0,
//            bytemuck::cast_slice(&[cm.get_camera_uniform()]),
//        );

//        queue.write_buffer(
//            &buffer_manager.color_table_buffer(),
//            0,
//            bytemuck::cast_slice(&[*buffer_manager.color_table_uniform()]),
//        );

//        queue.write_buffer(
//            buffer_manager.light_buffer(),
//            0,
//            bytemuck::cast_slice(&[*buffer_manager.light_uniform()]),
//        );

//        queue.write_buffer(
//            buffer_manager.glyph_uniform_buffer(),
//            0,
//            bytemuck::cast_slice(&[*buffer_manager.glyph_uniform_data()]),
//        );
//        let size = wgpu_manager.size().clone();

//        let smaa_frame = self.smaa_target.start_frame(&device, queue, &view);
//        let mut commands = Vec::new();

//        self.pipeline_manager
//            .clear_screen(background_color, &*smaa_frame, &mut commands);

//        //// self.pipeline_manager
//        ////     .run_charms_pipeline(&*smaa_frame, &mut commands);

//        let string_order = self.orientation_manager.z_order();

//        for name in string_order {
//            //Glyphs has it's own logic to render in rank order so we can't really use the pipeline
//            //manager trait to render it.  So, we will handle it directly.
//            if name == "glyphs" {
//                self.pipeline_manager.run_glyph_pipeline(
//                    &self.selected_glyphs,
//                    self.orientation_manager.rank(),
//                    self.orientation_manager.rank_direction(),
//                    &*smaa_frame,
//                    &mut commands,
//                );
//            } else if self.axis_visible {
//                let pipeline = match name {
//                    "x-axis-line" => AxisLineDirection::X,
//                    "y-axis-line" => AxisLineDirection::Y,
//                    "z-axis-line" => AxisLineDirection::Z,
//                    _ => panic!("Unknown pipeline name"),
//                };
//                self.pipeline_manager
//                    .run_axis_pipeline(pipeline, &*smaa_frame, &mut commands);
//            }
//        }
//        // Copy the texture to the buffer
//        queue.submit(commands);

//        smaa_frame.resolve();

//        Ok(())
//    }
//}
