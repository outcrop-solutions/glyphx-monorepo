//1. Holds DataManager which is passed to sub structs.
//2. Sets up physical infrastructure, i.e. device etc
//3. Shared buffers -- camera, color table, light  -- Create a Buffer Manager
//4. Create a wgpu manager
//NOTE: I am using this module to layout the beginning of a standard style for defining out modules
//and imports.  This is a work in progress, and will be updated/changed as I figure out this
//aspect of the style.
//1. Define any submodules

//2. Define any imports from the current crate.
use crate::{
    model::{
        data::{
            DeserializeVectorError, GlyphDescription, GlyphInstanceData, GlyphUniformData,
            GlyphUniformFlags, GlyphVertexData, Hit, InstanceOutput, ModelVectors, Rank,
            RankDirection, RankedGlyphData, SelectedGlyph,
        },
        filtering::Query,
        managers::{
            BufferManager, CameraManager, DataManager, Face, OrientationManager, PipelineManager,
        },
        model_configuration::ModelConfiguration,
        pipeline::{
            decode_glyph_id, AxisLineDirection, AxisLines, Charms, GlyphData, Glyphs, HitDetection,
        },
        scene::SceneRenderer,
    },
    Order,
};

use super::model_event::{Screenshot, ModelEvent};
//3. Define any imports from submodules.

//4. Define any imports from external Glyphx Crates.
use model_common::{
    CameraController, CameraUniform, ColorTableUniform, ICameraManager, LightUniform, MouseEvent,
    Stats, WgpuManager,
};

//5. Define any imports from external 3rd party crates.
use glam::Vec3;
use image::{codecs::png::PngEncoder, ExtendedColorType, ImageEncoder};
use smaa::*;
use std::{cell::RefCell, rc::Rc};
use wgpu::{Device, Maintain, MapMode, SurfaceError, TextureViewDescriptor};
use winit::{
    dpi::{PhysicalPosition, PhysicalSize},
    event::DeviceEvent,
    window::Window,
};

pub struct State {
    wgpu_manager: Rc<RefCell<WgpuManager>>,
    orientation_manager: Rc<RefCell<OrientationManager>>,
    buffer_manager: Rc<RefCell<BufferManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
    pipeline_manager: Rc<RefCell<PipelineManager>>,
    data_manager: Rc<RefCell<DataManager>>,
    camera_controller: CameraController,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    axis_visible: bool,
    render_count: u32,
    cursor_position: PhysicalPosition<f64>,
    model_filter: Query,
    scene_renderer: SceneRenderer,
}

impl State {
    pub fn get_windows_size(&self) -> (PhysicalSize<u32>, PhysicalSize<u32>) {
        let wm = self.wgpu_manager.borrow();
        let inner_size = wm.window().unwrap().inner_size();
        let outer_size = wm.window().unwrap().outer_size();
        (inner_size, outer_size)
    }
    pub async fn new(
        window: Window,
        model_configuration: Rc<RefCell<ModelConfiguration>>,
        data_manager: Rc<RefCell<DataManager>>,
        camera_manager: Rc<RefCell<CameraManager>>,
        width: u32,
        height: u32,
    ) -> State {
        let wgpu_manager = Rc::new(RefCell::new(WgpuManager::new(Some(window), width, height).await));
        //Make a local version that we can use to pass to our configuration functions
        //Anytime we clone, we need to assign the clone to a local variable so that it does not
        //get dropped.
        let wm = wgpu_manager.clone();
        let wm = wm.borrow();

        let orientation_manager = Rc::new(RefCell::new(OrientationManager::new()));

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

        //This is a similar pattern to what was described above involving clone.
        //In this case the wgpu_manager is cloning device for us but it is the
        //same pattern we have to assign the cloned device in a local variable
        //so that it does not get dropped.
        let device = wm.device();
        let d = device.borrow();

        let pipeline_manager = Rc::new(RefCell::new(PipelineManager::new(
            wgpu_manager.clone(),
            buffer_manager.clone(),
            model_configuration.clone(),
            data_manager.clone(),
        )));


        let scene_renderer = SceneRenderer::new(
            buffer_manager.clone(),
            wgpu_manager.clone(),
            camera_manager.clone(),
            data_manager.clone(),
            pipeline_manager.clone(),
            orientation_manager.clone(),
        );

        let mut model = Self {
            wgpu_manager,
            orientation_manager,
            buffer_manager,
            camera_manager,
            pipeline_manager,
            camera_controller,
            model_configuration,
            data_manager,
            axis_visible: true,
            render_count: 0,
            //This should be updated pretty quickly after the model loads.
            cursor_position: PhysicalPosition { x: 0.0, y: 0.0 },

            model_filter: Query::default(),
            scene_renderer,
        };
        //This allows us to initialize our camera with a pitch and yaw that is not 0
        let cm_clone = model.camera_manager.clone();
        let cm = cm_clone.as_ref().borrow_mut();
        model.update_z_order_and_rank(&cm);

        model
    }
    pub fn reset_data(&mut self) {
        self.render_count = 0;
        self.data_manager.borrow_mut().clear_selected_glyphs();
        self.buffer_manager.borrow_mut().reset_glyph_uniform(&self.model_configuration.clone().borrow(), self.data_manager.clone());
        self.reset_camera();
        self.update_z_order_and_rank(&self.camera_manager.clone().borrow());
    }

    pub fn get_window_id(&self) -> winit::window::WindowId {
        let id = self.wgpu_manager.as_ref().borrow().window().unwrap().id();
        id
    }
    pub fn set_window_size(&mut self, width: u32, height: u32) {
        self.wgpu_manager.borrow_mut().resize_window(width, height);
    }

    pub fn request_window_redraw(&self) {
        let wm = self.wgpu_manager.borrow();
        let window = wm.window();
        window.unwrap().request_redraw()
    }

    pub fn size(&self) -> PhysicalSize<u32> {
        let wm = self.wgpu_manager.borrow();
        let size = wm.size().clone();
        size
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.wgpu_manager.borrow_mut().set_size(new_size);
            self.pipeline_manager.borrow_mut().update_depth_textures();
            self.camera_manager
                .borrow_mut()
                .update_aspect_ratio(new_size.width as f32 / new_size.height as f32);
            self.scene_renderer.resize();
        }
    }

    pub fn update_cursor_position(&mut self, position: PhysicalPosition<f64>) {
        self.cursor_position = position;
    }

    pub fn input(&mut self, event: &DeviceEvent, is_shift_pressed: bool) -> bool {
        //This is a little rust thing that we need to pay more attention too.  Instead of
        //persisting the mutable borrow we can just pass it through to the underlying function as
        //such.  This will only scope the borrow to the function call and not the entire block, so
        //no already borrowed as mutable errors.
        let camera_result = self
            .camera_controller
            .process_events(event, (&mut *self.camera_manager.borrow_mut()));

        let handled = match camera_result {
            MouseEvent::MouseMotion => {
                //Cloning the camera manager here gets around a mutible borrow error involving self
                //This is slightly different than the pattern we discussed in the new functio.  In
                //this case cloning and borrowing in the function call does not cause the cloned
                //value to be dropped.
                self.update_z_order_and_rank(&self.camera_manager.clone().borrow());
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
            MouseEvent::Handled => false,
            MouseEvent::MouseDown => false,
            MouseEvent::Unhandled => false,
        };
        handled
    }

    pub fn update_selected_glyphs(&mut self, selected_glyphs: Vec<u32>) -> Vec<SelectedGlyph> {
        let mut selected: Vec<SelectedGlyph> = Vec::new();
        let dm = &mut self.data_manager.borrow_mut();
        for sg in selected_glyphs {
            let glyph_desc = dm.get_glyph_description(sg);
            if glyph_desc.is_some() {
                let glyph_desc = glyph_desc.unwrap();
                dm.add_selected_glyph(glyph_desc);
            }
        }
        dm.get_selected_glyphs()
    }

    pub fn hit_detection(&mut self, x_pos: u32, y_pos: u32, is_shift_pressed: bool) {
        let device = self.wgpu_manager.borrow().device();
        let device = device.borrow();

        //TODO: we should really react to an error here.
        let _ = self.run_hit_detection_pipeline(
            &device,
            self.cursor_position.x as u32,
            self.cursor_position.y as u32,
            is_shift_pressed,
        );
    }

    pub fn move_camera(&mut self, direction: &str, amount: f32) {
        //Ok we have to clone the camera here because if we don't we
        //get a mutable borrow error related to self.
        let cm = self.camera_manager.clone();
        match direction {
            "distance" => {
                let mut cm = cm.borrow_mut();
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
                self.update(&mut cm);
            }
            "down" => {
                let mut cm = cm.as_ref().borrow_mut();
                cm.add_y_offset(-1.0 * amount);
                self.update(&mut cm);
            }
            "left" => match self.orientation_manager.clone().borrow().forward_face() {
                Face::Front => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(-1.0 * amount);
                    self.update(&mut cm);
                }
                Face::Right => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(amount);
                    self.update(&mut cm);
                }
                Face::Back => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(amount);
                    self.update(&mut cm);
                }
                Face::Left => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(-1.0 * amount);
                    self.update(&mut cm);
                }
            },

            "right" => match &self.orientation_manager.clone().borrow().forward_face() {
                Face::Front => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(amount);
                    self.update(&mut cm);
                }
                Face::Right => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(-1.0 * amount);
                    self.update(&mut cm);
                }
                Face::Back => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_x_offset(-1.0 * amount);
                    self.update(&mut cm);
                }
                Face::Left => {
                    let mut cm = cm.as_ref().borrow_mut();
                    cm.add_z_offset(amount);
                    self.update(&mut cm);
                }
            },
            "x_axis" => {
                //reset camera creates a mutable borrow of our camera manager, so we need to
                //let reset_camera finish before taking our borrow.
                self.reset_camera();
                let mut cm = cm.as_ref().borrow_mut();
                cm.set_yaw(3.14159);
                cm.set_pitch(0.0);
                self.update_z_order_and_rank(&mut cm);
                self.update(&mut cm);
            }

            "y_axis" => {
                self.reset_camera();
                let mut cm = cm.as_ref().borrow_mut();
                cm.set_yaw(4.71239);
                cm.set_pitch(0.0);
                self.update_z_order_and_rank(&mut cm);
                self.update(&mut cm);
            }

            "z_axis" => {
                self.reset_camera();
                let mut cm = cm.as_ref().borrow_mut();
                cm.set_yaw(0.0);
                cm.set_pitch(1.5708);
                self.update_z_order_and_rank(&mut cm);
                self.update(&mut cm);
            }
            _ => (),
        };
    }

    pub fn reset_camera(&mut self) {
        self.buffer_manager.borrow_mut().build_camera_and_uniform();

        let cm = self.camera_manager.clone();
        self.update_z_order_and_rank(&cm.borrow());
        self.update(&mut cm.borrow_mut());
    }

    pub fn toggle_axis_visibility(&mut self) {
        self.axis_visible = !self.axis_visible;
    }

    pub fn update_from_client(&mut self) {
        let cm = self.camera_manager.clone();
        let cm = &mut cm.borrow_mut();
        self.update(cm);
    }

    pub fn update(&mut self, camera_manager: &mut CameraManager) {
        camera_manager.update();
    }

    pub fn update_model_filter(&mut self, model_filter: Query) {
        self.model_filter = model_filter;
        //Required so that the vertexes can be updated with the new filter.
        self.update_config();
    }

    pub fn update_config(&mut self) {
        //Update our glyph information based on the updated configuration.
        //TODO: at some point, we will want to split out or function to only run the compute
        //pipeline if necessary for now, we will just run it whenever the config changes

        //Ok, you are probably asking yourself, why we are not creating a local variable for the
        //buffer manager and referencing it instead of borrowing mut every time.  The reason
        //is that run compute pipeline also borrows the buffer manager mutably.  And it can
        //be called from several different places.  So for now we will just borrow mut every time.

        self.buffer_manager
            .borrow_mut()
            .update_glyph_uniform_buffer(
                &self.model_configuration.borrow(),
                self.data_manager
                    .as_ref()
                    .borrow()
                    .get_selected_glyphs_len()
                    > 0,
            );

        let pipeline_manager = self.pipeline_manager.clone();
        let pipeline_manager = &mut pipeline_manager.borrow_mut();
        pipeline_manager.upate_glyph_data_verticies(&self.model_filter);

        let config = self.model_configuration.clone();
        let config = config.borrow();
        self.buffer_manager.borrow_mut().update_color_table(
            config.x_axis_color,
            config.y_axis_color,
            config.z_axis_color,
            config.background_color,
            config.min_color,
            config.max_color,
        );

        pipeline_manager.set_axis_start(AxisLineDirection::X, config.model_origin[0]);
        pipeline_manager.update_vertex_buffer(AxisLineDirection::X);
        pipeline_manager.set_axis_start(AxisLineDirection::Y, config.model_origin[1]);
        pipeline_manager.update_vertex_buffer(AxisLineDirection::Y);
        pipeline_manager.set_axis_start(AxisLineDirection::Z, config.model_origin[2]);
        pipeline_manager.update_vertex_buffer(AxisLineDirection::Z);

        self.buffer_manager.borrow_mut().update_light_uniform(
            config.light_location,
            [
                config.light_color[0] / 255.0,
                config.light_color[1] / 255.0,
                config.light_color[2] / 255.0,
            ],
            config.light_intensity,
        );
        self.buffer_manager
            .borrow_mut()
            .update_glyph_uniform_y_offset(config.min_glyph_height);

        self.run_compute_pipeline();
    }

    pub fn resolve_picking_textures(&mut self) {
        let window_size = self.get_windows_size();
        let config_size = self.wgpu_manager.as_ref().borrow().get_config_size();
        if window_size.0.width != config_size.width || window_size.0.height != config_size.height {
            self.wgpu_manager.borrow_mut().set_size(window_size.0);
            self.pipeline_manager.borrow_mut().update_depth_textures();
        }
    }
    pub fn render(&mut self) -> Result<(), SurfaceError> {
        if self.render_count == 0 {
            self.render_count += 1;
            self.run_compute_pipeline();
            //This will get run again once the compute pipeline is finished
            return Ok(());
        }
        let dm = self.data_manager.clone();
        let dm = dm.borrow();
        let output = self.wgpu_manager.borrow().surface().get_current_texture()?;
        let view = output.texture.create_view(&TextureViewDescriptor {
            ..Default::default()
        });
        self.render_scene(&view)?;
        output.present();
        Ok(())
    }

    fn render_scene(&mut self, view: &wgpu::TextureView) -> Result<(), SurfaceError> {
        self.scene_renderer.render_scene(view, self.axis_visible)
    }

    pub fn take_screenshot(&mut self, is_state_creation: bool) -> Result<(), SurfaceError> {
        let size = self.wgpu_manager.borrow().size().clone();

        let output =
            self.wgpu_manager
                .borrow()
                .device()
                .borrow()
                .create_texture(&wgpu::TextureDescriptor {
                    label: Some("screenshot_texture"),
                    size: wgpu::Extent3d {
                        width: size.width,
                        height: size.height,
                        depth_or_array_layers: 1,
                    },
                    mip_level_count: 1,
                    sample_count: 1,
                    dimension: wgpu::TextureDimension::D2,
                    format: wgpu::TextureFormat::Bgra8Unorm,
                    // Choose your desired format
                    usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
                    view_formats: &[],
                });

        let view = output.create_view(&TextureViewDescriptor {
            ..Default::default()
        });

        self.render_scene(&view)?;

        let align = wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
        let padded_bytes_per_row = ((4 * size.width + align - 1) / align) * align;
        let buffer_size = (padded_bytes_per_row * size.height) as wgpu::BufferAddress;

        let screenshot_buffer =
            self.wgpu_manager
                .borrow()
                .device()
                .borrow()
                .create_buffer(&wgpu::BufferDescriptor {
                    label: Some("screenshot_buffer"),
                    size: buffer_size,
                    usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
                    mapped_at_creation: false,
                });

        let mut encoder = self
            .wgpu_manager
            .borrow()
            .device()
            .borrow()
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("screenshot_encoder"),
            });

        encoder.copy_texture_to_buffer(
            wgpu::ImageCopyTexture {
                texture: &output,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
                aspect: wgpu::TextureAspect::All,
            },
            wgpu::ImageCopyBuffer {
                buffer: &screenshot_buffer,

                layout: wgpu::ImageDataLayout {
                    offset: 0,
                    bytes_per_row: Some(padded_bytes_per_row),
                    rows_per_image: None,
                },
            },
            output.size(),
        );
        self.wgpu_manager
            .borrow()
            .queue()
            .submit([encoder.finish()]);

        let screenshot_buffer = std::sync::Arc::new(screenshot_buffer);
        let capturable = screenshot_buffer.clone();
        screenshot_buffer
            .slice(..)
            .map_async(MapMode::Read, move |result| {
                if result.is_ok() {
                    let view = capturable.slice(..).get_mapped_range();
                    let data = view.to_vec();
                    let mut output_vector =
                        Vec::<u8>::with_capacity(size.width as usize * size.height as usize * 4);
                    for y in 0..size.height {
                        let offset = (y * padded_bytes_per_row) as usize;
                        let row_start = offset;
                        let row_end = offset + (size.width * 4) as usize;
                        let mut raw_row = data[row_start..row_end].to_vec();
                        for x in 0..raw_row.len() / 4 {
                            let start = x * 4;
                            raw_row.swap(start, start + 2);
                        }
                        output_vector.extend_from_slice(raw_row.as_slice());
                    }
                    let mut png_data = Vec::new();
                    let encoder = PngEncoder::new(&mut png_data);
                    let result = encoder.write_image(
                        &output_vector,
                        size.width,
                        size.height,
                        ExtendedColorType::Rgba8,
                    );

                    unsafe {
                        let _ = super::EVENT_LOOP_PROXY.as_ref().unwrap().send_event(
                            ModelEvent::ScreenshotTaken(
                                Screenshot {
                                    width: size.width,
                                    height: size.height,
                                    pixels: png_data,
                                },
                                is_state_creation,
                            ),
                        );
                    }
                    drop(view);
                }
                capturable.unmap();
            });
        Ok(())
    }
    pub fn run_compute_pipeline(&mut self) {
        let output_buffer = self.pipeline_manager.borrow_mut().run_glyph_data_pipeline();
        let output_buffer = std::sync::Arc::new(output_buffer);
        let capturable = output_buffer.clone();

        output_buffer
            .slice(..)
            .map_async(MapMode::Read, move |result| {
                if result.is_ok() {
                    let view = capturable.slice(..).get_mapped_range();
                    //our data is already in the correct order so we can
                    //just push the verticies into a traingle list and attach
                    //the normals
                    let output_data: Vec<InstanceOutput> = bytemuck::cast_slice(&view).to_vec();

                    let data: Vec<GlyphVertexData> = output_data
                        .iter()
                        .map(|x| GlyphVertexData::from(x))
                        .collect();
                    unsafe {
                        let _ = crate::EVENT_LOOP_PROXY
                            .as_ref()
                            .unwrap()
                            .send_event(ModelEvent::GlyphsUpdated(data));
                    }
                    drop(view);
                }

                capturable.unmap();
            });
    }
    pub fn process_hit(&mut self, hit: Hit) -> Vec<SelectedGlyph> {
        let mut reprocess = false;
        let data_manager = self.data_manager.clone();
        let data_manager = &mut data_manager.borrow_mut();
        if hit.glyph_id != 16777215 {
            let glyph_desc = data_manager.get_glyph_description(hit.glyph_id).unwrap();
            if !data_manager.glyph_is_selected(hit.glyph_id) {
                if !hit.shift_pressed {
                    data_manager.clear_selected_glyphs();
                }
                data_manager.add_selected_glyph(glyph_desc);
                reprocess = true;
            } else {
                if data_manager.glyph_is_selected(hit.glyph_id) {
                    data_manager.remove_selected_glyph(hit.glyph_id);
                    reprocess = true;
                }
            }
        } else if !hit.shift_pressed {
            if data_manager.get_selected_glyphs_len() > 0 {
                reprocess = true;
                data_manager.clear_selected_glyphs();
            }
        }
        if reprocess == true {
            self.run_compute_pipeline();
        }

        data_manager.get_selected_glyphs()
    }

    fn run_hit_detection_pipeline(
        &mut self,
        _device: &Device,
        x_pos: u32,
        y_pos: u32,
        is_shift_pressed: bool,
    ) -> Result<(), SurfaceError> {
        let (output_buffer, bytes_per_row) =
            self.pipeline_manager.borrow().run_hit_detection_pipeline(
                self.orientation_manager.borrow().rank(),
                self.orientation_manager.borrow().rank_direction(),
            );
        let output_buffer = std::sync::Arc::new(output_buffer);
        let captuable = output_buffer.clone();

        output_buffer
            .slice(..)
            .map_async(MapMode::Read, move |result| {
                let mut glyph_id = 0;
                let mut send_event = false;
                if result.is_ok() {
                    let view = captuable.slice(..).get_mapped_range();
                    let pixel_pos = (y_pos as u32 * bytes_per_row + x_pos as u32 * 4) as usize;
                    let val = &view[pixel_pos..pixel_pos + 4];

                    glyph_id = decode_glyph_id([val[0], val[1], val[2], val[3]]);
                    drop(view);
                    send_event = true;
                }

                captuable.unmap();
                if send_event {
                    unsafe {
                        let _ = crate::EVENT_LOOP_PROXY.as_ref().unwrap().send_event(
                            ModelEvent::HitDetection(Hit {
                                glyph_id,
                                shift_pressed: is_shift_pressed,
                            }),
                        );
                    }
                }
            });
        Ok(())
    }

    fn update_z_order_and_rank(&mut self, camera_manager: &CameraManager) {
        let buffer_manager = self.buffer_manager.borrow();
        let glyph_uniform_data = buffer_manager.glyph_uniform_data();

        let cube_size = glyph_uniform_data.max_interp_x - glyph_uniform_data.min_interp_x;
        let flags = GlyphUniformFlags::decode(glyph_uniform_data.flags).unwrap();
        let is_x_desc = flags.x_order == Order::Descending;
        let is_z_desc = flags.z_order == Order::Descending;
        self.orientation_manager
            .borrow_mut()
            .update_z_order_and_rank(
                camera_manager.get_yaw(),
                camera_manager.get_distance(),
                is_x_desc,
                is_z_desc,
                cube_size,
            );
    }
}