//1. Holds DataManager which is passed to sub structs.
//2. Sets up physical infrastructure, i.e. device etc
//3. Shared buffers -- camera, color table, light  -- Create a Buffer Manager
//4. Create a wgpu manager
//NOTE: I am using this module to layout the beginning of a standard style for defining out modules
//and imports.  This is a work in progress, and will be updated/changed as I figure out this
//aspect of the style.
//1. Define any submodules
mod buffer_manager;
pub(crate) mod data_manager;
mod errors;
mod orientation_manager;
mod pipeline_manager;
pub(crate) mod selected_glyph;
mod wgpu_manager;

//2. Define any imports from the current crate.
use crate::{
    camera::{
        camera_controller::{CameraController, MouseEvent},
        uniform_buffer::CameraUniform,
    },
    data::{DeserializeVectorError, ModelVectors},
    light::light_uniform::LightUniform,
    model::{
        color_table_uniform::ColorTableUniform,
        filtering::Query,
        model_configuration::ModelConfiguration,
        pipeline::{
            axis_lines,
            glyph_data::{GlyphData, InstanceOutput},
            glyphs::{
                glyph_id_data::GlyphIdManager,
                glyph_instance_data::GlyphInstanceData,
                glyph_uniform_data::{GlyphUniformData, GlyphUniformFlags},
                glyph_vertex_data::GlyphVertexData,
                ranked_glyph_data::{Rank, RankDirection, RankedGlyphData},
                Glyphs,
            },
            hit_detection::{decode_glyph_id, HitDetection},
            PipelineRunner,
        },
    },
    Order,
};

//3. Define any imports from submodules.
use buffer_manager::BufferManager;
pub use data_manager::{CameraManager, DataManager};
pub use errors::*;
use orientation_manager::{Face, OrientationManager};
use pipeline_manager::PipelineManager;
pub use selected_glyph::{GlyphDescription, SelectedGlyph};
use wgpu_manager::WgpuManager;

//4. Define any imports from external Glyphx Crates.
use model_common::Stats;

//5. Define any imports from external 3rd party crates.
use glam::Vec3;
use smaa::*;
use std::rc::Rc;
use std::{borrow::BorrowMut, cell::RefCell};
use wgpu::{
    util::DeviceExt, CommandBuffer, Device, Queue, Surface, SurfaceConfiguration,
    TextureViewDescriptor,
};
use winit::{
    dpi::{PhysicalPosition, PhysicalSize},
    event::DeviceEvent,
    window::Window,
};

use super::pipeline::axis_lines::AxisLineDirection;

pub struct State {
    wgpu_manager: Rc<RefCell<WgpuManager>>,
    orientation_manager: OrientationManager,
    buffer_manager: Rc<RefCell<BufferManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
    pipeline_manager: PipelineManager,
    data_manager: Rc<RefCell<DataManager>>,
    camera_controller: CameraController,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    smaa_target: SmaaTarget,
    axis_visible: bool,
    first_render: bool,
    cursor_position: PhysicalPosition<f64>,
    selected_glyphs: Vec<SelectedGlyph>,
    model_filter: Query,
}

impl State {
    pub async fn new(
        window: Window,
        model_configuration: Rc<RefCell<ModelConfiguration>>,
        data_manager: Rc<RefCell<DataManager>>,
        camera_manager: Rc<RefCell<CameraManager>>,
    ) -> State {
        let wgpu_manager = Rc::new(RefCell::new(WgpuManager::new(window).await));
        //Make a local version that we can use to pass to our configuration functions
        let wm = wgpu_manager.clone();
        let wm = wm.borrow();

        let orientation_manager = OrientationManager::new();

        let dm = data_manager.clone();
        let dm = dm.borrow();

        let mc = model_configuration.clone();
        let mut mc = mc.as_ref().borrow_mut();

        let buffer_manager = Rc::new(RefCell::new(BufferManager::new(
            wgpu_manager.clone(),
            camera_manager.clone(),
            &mc,
            &dm,
        )));
        let bm = buffer_manager.clone();
        let bm = bm.borrow();

        mc.model_origin = *bm.model_origin();
        drop(mc);

        let camera_controller = CameraController::new(0.025, 0.006);

        let device = wm.device();
        let d = device.borrow();

        //We are cloning device here, because we are storing it in the
        //axis pipelines to handle config updates
        let pipeline_manager = PipelineManager::new(
            wgpu_manager.clone(),
            buffer_manager.clone(),
            model_configuration.clone(),
            data_manager.clone(),
        );
        let smaa_target = SmaaTarget::new(
            &d,
            wm.queue(),
            wm.window().inner_size().width,
            wm.window().inner_size().height,
            wm.config().format,
            SmaaMode::Smaa1X,
        );

        let mut model = Self {
            wgpu_manager,
            orientation_manager,
            buffer_manager,
            camera_manager,
            pipeline_manager,
            camera_controller,
            model_configuration,
            smaa_target,
            data_manager,
            axis_visible: true,
            first_render: true,
            //This should be updated pretty quickly after the model loads.
            cursor_position: PhysicalPosition { x: 0.0, y: 0.0 },
            selected_glyphs: Vec::new(),

            model_filter: Query::default(),
        };
        //This allows us to initialize out camera with a pitch and yaw that is not 0
        let cm_clone = model.camera_manager.clone();
        let cm = cm_clone.as_ref().borrow_mut();
        model.update_z_order_and_rank(&cm);
        model
    }

    pub fn get_window_id(&self) -> winit::window::WindowId {
        let id = self.wgpu_manager.as_ref().borrow().window().id();
        id
    }

    pub fn request_window_redraw(&self) {
        let wm = self.wgpu_manager.borrow();
        let window = wm.window();
        window.request_redraw()
    }

    pub fn size(&self) -> PhysicalSize<u32> {
        let wm = self.wgpu_manager.borrow();
        let size = wm.size().clone();
        size
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.wgpu_manager.as_ref().borrow_mut().set_size(new_size);
        }
    }

    pub fn update_cursor_position(&mut self, position: PhysicalPosition<f64>) {
        self.cursor_position = position;
    }

    pub fn input(&mut self, event: &DeviceEvent, is_shift_pressed: bool) -> bool {
        let mut camera_result = MouseEvent::Unhandled;
        {
            let cm = self.camera_manager.clone();
            let mut cm = cm.as_ref().borrow_mut();
            camera_result = self.camera_controller.process_events(event, &mut cm);
        }

        let handled = match camera_result {
            MouseEvent::MouseMotion => {
                let cm = self.camera_manager.clone();
                let cm = &mut cm.borrow();
                self.update_z_order_and_rank(cm);
                true
            }
            MouseEvent::MouseClick => {
                self.hit_detection(
                    self.cursor_position.x as u32,
                    self.cursor_position.y as u32,
                    is_shift_pressed,
                );
                true
            }
            MouseEvent::MouseScroll => true,
            MouseEvent::Handled => true,
            MouseEvent::MouseDown => true,
            MouseEvent::Unhandled => false,
        };
        handled
    }

    pub fn update_selected_glyphs(&mut self, selected_glyphs: Vec<u32>) -> &Vec<SelectedGlyph> {
        let mut selected: Vec<SelectedGlyph> = Vec::new();
        let dm = self.data_manager.clone();
        let dm = dm.borrow();
        for sg in selected_glyphs {
            let glyph_desc = dm.get_glyph_description(sg);
            if glyph_desc.is_some() {
                let glyph_desc = glyph_desc.unwrap();
                selected.push(glyph_desc);
            }
        }
        self.selected_glyphs = selected;
        &self.selected_glyphs
    }

    pub fn hit_detection(
        &mut self,
        x_pos: u32,
        y_pos: u32,
        is_shift_pressed: bool,
    ) -> &Vec<SelectedGlyph> {
        let device = self.wgpu_manager.borrow().device();
        let device = device.borrow();
        self.run_hit_detection_pipeline(&device, x_pos, y_pos, is_shift_pressed);
        &self.selected_glyphs
    }

    pub fn move_camera(&mut self, direction: &str, amount: f32) {
        let cm = self.camera_manager.clone();
        match direction {
            "distance" => {
                let mut cm = cm.as_ref().borrow_mut();
                cm.add_distance(amount * self.camera_controller.zoom_speed);
                self.update(&mut cm);
            }
            "yaw" => {
                let mut cm = cm.as_ref().borrow_mut();
                cm.add_yaw(amount * self.camera_controller.rotate_speed);
                self.update(&mut cm);
            }
            "pitch" => {
                let mut cm = cm.as_ref().borrow_mut();
                cm.add_pitch(amount * self.camera_controller.rotate_speed);
                self.update(&mut cm);
            }
            "up" => {
                let mut cm = cm.as_ref().borrow_mut();
                cm.add_y_offset(amount);
            }
            "down" => {
                let mut cm = cm.as_ref().borrow_mut();
                cm.add_y_offset(-1.0 * amount);
            }
            "left" => match self.orientation_manager.forward_face() {
                Face::Front => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(-1.0 * amount);
                }
                Face::Right => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(amount);
                }
                Face::Back => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(amount);
                }
                Face::Left => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(-1.0 * amount);
                }
            },

            "right" => match self.orientation_manager.forward_face() {
                Face::Front => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(amount);
                }
                Face::Right => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(-1.0 * amount);
                }
                Face::Back => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(-1.0 * amount);
                }
                Face::Left => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(amount);
                }
            },
            "x_axis" => {
                self.reset_camera();
                let mut cm = cm.as_ref().borrow_mut();
                cm.set_yaw(3.14159);
                cm.set_pitch(0.0);
                self.update_z_order_and_rank(&mut cm);
            }

            "y_axis" => {
                self.reset_camera();
                let mut cm = cm.as_ref().borrow_mut();
                cm.set_yaw(4.71239);
                cm.set_pitch(0.0);
                self.update_z_order_and_rank(&mut cm);
            }

            "z_axis" => {
                self.reset_camera();
                let mut cm = cm.as_ref().borrow_mut();
                cm.set_yaw(0.0);
                cm.set_pitch(1.5708);
                self.update_z_order_and_rank(&mut cm);
            }
            _ => (),
        };
    }

    pub fn reset_camera(&mut self) {
        self.buffer_manager
            .as_ref()
            .borrow_mut()
            .build_camera_and_uniform();

        let cm = self.camera_manager.clone();
        self.update_z_order_and_rank(&cm.borrow());
        self.update(&mut cm.as_ref().borrow_mut());
    }

    pub fn toggle_axis_visibility(&mut self) {
        self.axis_visible = !self.axis_visible;
    }

    pub fn update_from_client(&mut self) {
        let cm = self.camera_manager.clone();
        let cm = &mut cm.as_ref().borrow_mut();
        self.update(cm);
    }

    pub fn update(&mut self, camera_manager: &mut CameraManager) {
        camera_manager.update();
    }

    pub fn update_model_filter(&mut self, model_filter: Query) {
        self.model_filter = model_filter;
    }

    pub fn update_config(&mut self) {
        //Update our glyph information based on the updated configuration.
        //TODO: at some point, we will want to split out or function to only run the compute
        //pipeline if necessary for now, we will just run it whenever the config changes

        self.buffer_manager
            .as_ref()
            .borrow_mut()
            .update_glyph_uniform_buffer(
                &self.model_configuration.as_ref().borrow(),
                self.selected_glyphs.len() > 0,
            );

        self.pipeline_manager
            .upate_glyph_data_verticies(&self.model_filter);

        self.run_compute_pipeline();

        let config = self.model_configuration.borrow();
        self.buffer_manager
            .as_ref()
            .borrow_mut()
            .update_color_table(
                config.x_axis_color,
                config.y_axis_color,
                config.z_axis_color,
                config.background_color,
                config.min_color,
                config.max_color,
            );

        self.pipeline_manager
            .set_axis_start(axis_lines::AxisLineDirection::X, config.model_origin[0]);
        self.pipeline_manager
            .update_vertex_buffer(axis_lines::AxisLineDirection::X);
        self.pipeline_manager
            .set_axis_start(axis_lines::AxisLineDirection::Y, config.model_origin[1]);
        self.pipeline_manager
            .update_vertex_buffer(axis_lines::AxisLineDirection::Y);
        self.pipeline_manager
            .set_axis_start(axis_lines::AxisLineDirection::Z, config.model_origin[2]);
        self.pipeline_manager
            .update_vertex_buffer(axis_lines::AxisLineDirection::Z);

        self.buffer_manager
            .as_ref()
            .borrow_mut()
            .update_light_uniform(
                config.light_location,
                [
                    config.light_color[0] / 255.0,
                    config.light_color[1] / 255.0,
                    config.light_color[2] / 255.0,
                ],
                config.light_intensity,
            );
        self.buffer_manager
            .as_ref()
            .borrow_mut()
            .update_glyph_uniform_y_offset(config.min_glyph_height);
    }

    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        if self.first_render {
            self.run_compute_pipeline();
            self.first_render = false;
        }

        let background_color = self.buffer_manager.as_ref().borrow().color_table_uniform().background_color();
        let cm = self.camera_manager.clone();
        let cm = cm.borrow();
        
        self.wgpu_manager.borrow().queue().write_buffer(
            &self.buffer_manager.as_ref().borrow().camera_buffer(),
            0,
            bytemuck::cast_slice(&[cm.get_camera_uniform()]),
        );

        self.wgpu_manager.borrow().queue().write_buffer(
            &self.buffer_manager.as_ref().borrow().color_table_buffer(),
            0,
            bytemuck::cast_slice(&[*self.buffer_manager.as_ref().borrow().color_table_uniform()]),
        );

        self.wgpu_manager.borrow().queue().write_buffer(
            self.buffer_manager.as_ref().borrow().light_buffer(),
            0,
            bytemuck::cast_slice(&[*self.buffer_manager.as_ref().borrow().light_uniform()]),
        );

        self.wgpu_manager.borrow().queue().write_buffer(
            self.buffer_manager.as_ref().borrow().glyph_uniform_buffer(),
            0,
            bytemuck::cast_slice(&[*self.buffer_manager.as_ref().borrow().glyph_uniform_data()]),
        );

        let output = self.wgpu_manager.borrow().surface().get_current_texture()?;
        let view = output
            .texture
            .create_view(&TextureViewDescriptor::default());

        let d = self.wgpu_manager.borrow().device();
        let d = d.borrow();
        let wm = self.wgpu_manager.as_ref().borrow();
        let smaa_frame = self.smaa_target.start_frame(&d, wm.queue(), &view);

        let mut encoder = d.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("ScreenClear Encoder"),
        });

        let screen_clear_render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &*smaa_frame,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: background_color[0] as f64,
                        g: background_color[1] as f64,
                        b: background_color[2] as f64,
                        a: 1.0,
                    }),
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });

        drop(screen_clear_render_pass);

        let mut commands = Vec::new();
        commands.push(encoder.finish());
        let string_order = self.orientation_manager.z_order();
        let d = self.wgpu_manager.borrow().device();
        let d = d.borrow();
        for name in string_order {
            //Glyphs has it's own logic to render in rank order so we can't really use the pipeline
            //manager trait to render it.  So, we will handle it directly.
            if name == "glyphs" {
                self.pipeline_manager.run_glyph_pipeline(&self.selected_glyphs, self.orientation_manager.rank(), self.orientation_manager.rank_direction(), &smaa_frame, &mut commands);
            } else if self.axis_visible {
                
                let pipeline = match name {
                    "x-axis-line" => AxisLineDirection::X,
                    "y-axis-line" => AxisLineDirection::Y,
                    "z-axis-line" => AxisLineDirection::Z,
                    _ => panic!("Unknown pipeline name"),
                };
                self.pipeline_manager.run_axis_pipeline(pipeline, &smaa_frame, &mut commands);
            }
        }
        self.wgpu_manager.borrow().queue().submit(commands);

        smaa_frame.resolve();
        output.present();

        Ok(())
    }


    pub fn run_compute_pipeline(&mut self) {
        let output_buffer = self.pipeline_manager.run_glyph_data_pipeline();
        let buffer_slice = output_buffer.slice(..);
        buffer_slice.map_async(wgpu::MapMode::Read, |_| {});

        let wm = self.wgpu_manager.borrow();
        let d = wm.device();
        let d = d.borrow();
        d.poll(wgpu::Maintain::Wait);

        let view = buffer_slice.get_mapped_range();
        //our data is already in the correct order so we can
        //just push the verticies into a traingle list and attach
        //the normals
        let output_data: Vec<InstanceOutput> = bytemuck::cast_slice(&view).to_vec();

        let dm = &mut self.data_manager.as_ref().borrow_mut();
        dm.clear_glyphs();

        for glyph_instance in output_data.iter() {
            let _ = dm.add_ranked_glyph(GlyphVertexData::from(glyph_instance));
        }
        drop(view);
        output_buffer.unmap();
    }

    fn run_hit_detection_pipeline(
        &mut self,
        device: &Device,
        x_pos: u32,
        y_pos: u32,
        is_shift_pressed: bool,
    ) -> Result<(), wgpu::SurfaceError> {
            let (output_buffer, bytes_per_row) = self.pipeline_manager.run_hit_detection_pipeline(self.orientation_manager.rank(), self.orientation_manager.rank_direction());
            let buffer_slice = output_buffer.slice(..);
            buffer_slice.map_async(wgpu::MapMode::Read, |_| {});
            device.poll(wgpu::Maintain::Wait);

            let view = buffer_slice.get_mapped_range();
            let pixel_pos = (y_pos as u32 * bytes_per_row + x_pos as u32 * 4) as usize;
            let val = &view[pixel_pos..pixel_pos + 4];

            let glyph_id = decode_glyph_id([val[0], val[1], val[2], val[3]]);
            if glyph_id != 16777215 {
                let glyph_desc = self.data_manager.borrow().get_glyph_description(glyph_id).unwrap();
                if !self
                    .selected_glyphs
                    .iter()
                    .any(|sg| sg.glyph_id == glyph_id)
                {
                    if !is_shift_pressed {
                        self.selected_glyphs.clear();
                    }
                    self.selected_glyphs.push(glyph_desc);
                } else {
                    let index = self
                        .selected_glyphs
                        .iter()
                        .position(|r| r.glyph_id == glyph_id);
                    if let Some(index) = index {
                        self.selected_glyphs.remove(index);
                    }
                }
            } else if !is_shift_pressed {
                self.selected_glyphs.clear();
            }
            drop(view);
            output_buffer.unmap();
        
        Ok(())
    }

    fn update_z_order_and_rank(&mut self, camera_manager: &CameraManager) {
        let cube_size = self.buffer_manager.borrow().glyph_uniform_data().max_interp_x
            - self.buffer_manager.borrow().glyph_uniform_data().min_interp_x;
        let flags =
            GlyphUniformFlags::decode(self.buffer_manager.borrow().glyph_uniform_data().flags).unwrap();
        let is_x_desc = flags.x_order == Order::Descending;
        let is_z_desc = flags.z_order == Order::Descending;
        self.orientation_manager.update_z_order_and_rank(
            camera_manager.get_yaw(),
            camera_manager.get_distance(),
            is_x_desc,
            is_z_desc,
            cube_size,
        );
    }
}
