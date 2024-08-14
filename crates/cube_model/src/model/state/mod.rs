//NOTE: I am using this module to layout the beginning of a standard style for defining out modules
//and imports.  This is a work in progress, and will be updated/changed as I figure out this
//aspect of the style.
//1. Define any submodules
pub(crate) mod data_manager;
mod errors;
pub(crate) mod selected_glyph;

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
            new_hit_detection::{decode_glyph_id, NewHitDetection},
            PipelineRunner,
        },
    },
    Order,
};

//3. Define any imports from submodules.
pub use data_manager::{CameraManager, DataManager};
pub use errors::*;
pub use selected_glyph::{GlyphDescription, SelectedGlyph};

//4. Define any imports from external Glyphx Crates.
use model_common::Stats;

//5. Define any imports from external 3rd party crates.
use glam::Vec3;
use smaa::*;
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::{
    util::DeviceExt, CommandBuffer, Device, Queue, Surface, SurfaceConfiguration,
    TextureViewDescriptor,
};
use winit::{
    dpi::{PhysicalPosition, PhysicalSize},
    event::DeviceEvent,
    window::Window,
};

const Z_ORDERS: [[&str; 4]; 4] = [
    ["x-axis-line", "z-axis-line", "y-axis-line", "glyphs"],
    ["z-axis-line", "glyphs", "x-axis-line", "y-axis-line"],
    ["glyphs", "x-axis-line", "z-axis-line", "y-axis-line"],
    ["x-axis-line", "glyphs", "z-axis-line", "y-axis-line"],
];

enum Face {
    Front,
    Right,
    Back,
    Left,
}

struct Pipelines {
    x_axis_line: axis_lines::AxisLines,
    y_axis_line: axis_lines::AxisLines,
    z_axis_line: axis_lines::AxisLines,
    glyphs: Glyphs,
}

pub struct State {
    surface: wgpu::Surface,
    device: Rc<RefCell<wgpu::Device>>,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
    window: Window,
    camera_manager: Rc<RefCell<CameraManager>>,
    camera_buffer: wgpu::Buffer,
    camera_controller: CameraController,
    color_table_uniform: ColorTableUniform,
    color_table_buffer: wgpu::Buffer,
    light_uniform: LightUniform,
    light_buffer: wgpu::Buffer,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    smaa_target: SmaaTarget,
    glyph_uniform_data: GlyphUniformData,
    glyph_uniform_buffer: wgpu::Buffer,
    rank: Rank,
    rank_direction: RankDirection,
    pipelines: Pipelines,
    glyph_data_pipeline: GlyphData,
    new_hit_detection_pipeline: NewHitDetection,
    z_order: usize,
    data_manager: Rc<RefCell<DataManager>>,
    forward_face: Face,
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
        let size = window.inner_size();

        let (surface, adapter) = Self::init_wgpu(&window).await;

        let (device, queue) = Self::init_device(&adapter).await;
        let device = Rc::new(RefCell::new(device));
        let d_clone = device.clone();
        let d = d_clone.as_ref().borrow();
        let config = Self::configure_surface(&surface, adapter, size, &d);

        let mc = model_configuration.clone();

        let dm = data_manager.clone();
        let dm = dm.borrow();

        let glyph_uniform_data = Self::build_glyph_uniform_data(&mc, &dm);

        let mc = mc.borrow();

        let cm_clone = camera_manager.clone();
        let cm = &mut cm_clone.borrow_mut();

        let (camera_buffer, camera_uniform, camera_controller) =
            Self::configure_camera(&config, &d, &glyph_uniform_data, cm);

        let color_table_uniform = ColorTableUniform::new(
            mc.min_color,
            mc.max_color,
            mc.x_axis_color,
            mc.y_axis_color,
            mc.z_axis_color,
            mc.background_color,
        );

        let color_table_buffer = d.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Color Table Buffer"),
            contents: bytemuck::cast_slice(&[color_table_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        let light_uniform = LightUniform::new(
            mc.light_location,
            [
                mc.light_color[0] / 255.0,
                mc.light_color[1] / 255.0,
                mc.light_color[2] / 255.0,
            ],
            mc.light_intensity,
        );

        let light_buffer = d.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Light Buffer"),
            contents: bytemuck::cast_slice(&[light_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        //let ranked_glyph_data = Self::build_instance_data();

        let glyph_uniform_buffer = d.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Glyph Uniform Buffer"),
            contents: bytemuck::cast_slice(&[glyph_uniform_data]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        //We are cloning device here, because we are storing it in the
        //axis pipelines to handle config updates
        let pipelines = Self::build_pipelines(
            device.clone(),
            &config,
            &camera_buffer,
            &camera_uniform,
            &color_table_buffer,
            &color_table_uniform,
            &light_buffer,
            &light_uniform,
            model_configuration.clone(),
            &glyph_uniform_buffer,
            &glyph_uniform_data,
        );

        let smaa_target = SmaaTarget::new(
            &d,
            &queue,
            window.inner_size().width,
            window.inner_size().height,
            config.format,
            SmaaMode::Smaa1X,
        );
        let glyph_data_pipeline = GlyphData::new(
            &glyph_uniform_buffer,
            device.clone(),
            model_configuration.clone(),
            data_manager.clone(),
        );
        let new_hit_detection_pipeline =
            NewHitDetection::new(device.clone(), &config, &camera_buffer, &camera_uniform);

        let mut model = Self {
            window,
            surface,
            device,
            queue,
            config,
            size,
            camera_manager,
            camera_buffer,
            camera_controller,
            model_configuration,
            color_table_buffer,
            color_table_uniform,
            glyph_uniform_buffer,
            glyph_uniform_data,
            smaa_target,
            rank: Rank::Z,
            rank_direction: RankDirection::Ascending,
            pipelines,
            light_buffer,
            light_uniform,
            z_order: 0,
            data_manager,
            forward_face: Face::Front,
            axis_visible: true,
            glyph_data_pipeline,
            //The hit detection pipeline cannot be constructed until the compute pass
            //has been run.  We will just reconstrut it at the end of every compute pass
            new_hit_detection_pipeline,
            first_render: true,
            //This should be updated pretty quickly after the model loads.
            cursor_position: PhysicalPosition { x: 0.0, y: 0.0 },
            selected_glyphs: Vec::new(),

            model_filter: Query::default(),
        };
        //This allows us to initialize out camera with a pitch and yaw that is not 0
        model.update_z_order_and_rank(cm);
        model
    }

    pub fn window(&self) -> &Window {
        &self.window
    }

    pub fn size(&self) -> &PhysicalSize<u32> {
        &self.size
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            let d = self.device.as_ref().borrow();
            self.surface.configure(&d, &self.config);
        }
    }

    pub fn update_cursor_position(&mut self, position: PhysicalPosition<f64>) {
        self.cursor_position = position;
    }

    pub fn input(&mut self, event: &DeviceEvent, is_shift_pressed: bool) -> bool {
        let mut camera_result = MouseEvent::Unhandled;
        {
            let cm = self.camera_manager.clone();
            let cm = &mut cm.borrow_mut();
            camera_result = self.camera_controller.process_events(event, cm);
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
            let glyph_desc = dm.get_glyph_description(sg );
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
        let device = self.device.clone();
        let device = device.as_ref().borrow();
        self.run_hit_detection_pipeline(&device, x_pos, y_pos, is_shift_pressed);
        &self.selected_glyphs
    }
    pub fn move_camera(&mut self, direction: &str, amount: f32) {
        let cm = self.camera_manager.clone();
        let cm = &mut cm.borrow_mut();
        match direction {
            "distance" => {
                cm.add_distance(amount * self.camera_controller.zoom_speed);
                self.update(cm);
            }
            "yaw" => {
                cm.add_yaw(amount * self.camera_controller.rotate_speed);
                self.update(cm);
            }
            "pitch" => {
                cm.add_pitch(amount * self.camera_controller.rotate_speed);
                self.update(cm);
            }
            "up" => {
                cm.add_y_offset(amount);
            }
            "down" => {
                cm.add_y_offset(-1.0 * amount);
            }
            "left" => match self.forward_face {
                Face::Front => {
                    cm.add_x_offset(-1.0 * amount);
                }
                Face::Right => {
                    cm.add_z_offset(amount);
                }
                Face::Back => {
                    cm.add_x_offset(amount);
                }
                Face::Left => {
                    cm.add_z_offset(-1.0 * amount);
                }
            },
            "right" => match self.forward_face {
                Face::Front => {
                    cm.add_x_offset(amount);
                }
                Face::Right => {
                    cm.add_z_offset(-1.0 * amount);
                }
                Face::Back => {
                    cm.add_x_offset(-1.0 * amount);
                }
                Face::Left => {
                    cm.add_z_offset(amount);
                }
            },
            "x_axis" => {
                self.reset_camera(cm);
                cm.set_yaw(3.14159);
                cm.set_pitch(0.0);
                self.update_z_order_and_rank(cm);
            }

            "y_axis" => {
                self.reset_camera(cm);
                cm.set_yaw(4.71239);
                cm.set_pitch(0.0);
                self.update_z_order_and_rank(cm);
            }

            "z_axis" => {
                self.reset_camera(cm);
                cm.set_yaw(0.0);
                cm.set_pitch(1.5708);
                self.update_z_order_and_rank(cm);
            }
            _ => (),
        };
    }

    pub fn reset_camera_from_client(&mut self) {
        let cm = self.camera_manager.clone();
        let cm = &mut cm.borrow_mut();
        self.reset_camera(cm);
    }

    pub fn reset_camera(&mut self, camera_manager: &mut CameraManager) {
        Self::build_camera_and_uniform(camera_manager, &self.glyph_uniform_data, &self.config);
        self.update_z_order_and_rank(camera_manager);
        self.update(camera_manager);
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

    fn update_glyph_uniform_buffer(&mut self) {
        let config = self.model_configuration.borrow();
        let uniform_data = &mut self.glyph_uniform_data;
        let mut flags = GlyphUniformFlags::default();
        //Y and Z are flipped from our config to our uniform buffer.
        flags.x_interp_type = config.x_interpolation;
        flags.y_interp_type = config.z_interpolation;
        flags.z_interp_type = config.y_interpolation;
        flags.x_order = config.x_order;
        flags.y_order = config.z_order;
        flags.z_order = config.y_order;
        flags.color_flip = config.color_flip;
        flags.glyph_selected = self.selected_glyphs.len() > 0;
        let flags = flags.encode();
        uniform_data.flags = flags;
        self.glyph_uniform_data = uniform_data.clone();
        self.glyph_uniform_buffer =
            self.device
                .as_ref()
                .borrow()
                .create_buffer_init(&wgpu::util::BufferInitDescriptor {
                    label: Some("Glyph Uniform Buffer"),
                    contents: bytemuck::cast_slice(&[self.glyph_uniform_data]),
                    usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
                });
    }

    pub fn update_model_filter(&mut self, model_filter: Query) {
        self.model_filter = model_filter;
    }
    pub fn update_config(&mut self) {
        //Update our glyph information based on the updated configuration.
        //TODO: at some point, we will want to split out or function to only run the compute
        //pipeline if necessary for now, we will just run it whenever the config changes
        self.update_glyph_uniform_buffer();
        self.glyph_data_pipeline
            .update_vertices(&self.glyph_uniform_buffer, &self.model_filter);

        self.run_compute_pipeline();

        let config = self.model_configuration.borrow();
        let color_table_uniform = &mut self.color_table_uniform;
        color_table_uniform.set_x_axis_color(config.x_axis_color);
        color_table_uniform.set_y_axis_color(config.y_axis_color);
        color_table_uniform.set_z_axis_color(config.z_axis_color);
        color_table_uniform.set_background_color(config.background_color);
        color_table_uniform.update_colors(config.min_color, config.max_color);
        self.pipelines
            .x_axis_line
            .set_axis_start(config.model_origin[0]);
        self.pipelines.x_axis_line.update_vertex_buffer();
        self.pipelines
            .y_axis_line
            .set_axis_start(config.model_origin[1]);
        self.pipelines.y_axis_line.update_vertex_buffer();
        self.pipelines
            .z_axis_line
            .set_axis_start(config.model_origin[2]);
        self.pipelines.z_axis_line.update_vertex_buffer();
        self.light_uniform
            .upate_position(config.light_location.clone());
        self.light_uniform.upate_color([
            config.light_color[0] / 255.0,
            config.light_color[1] / 255.0,
            config.light_color[2] / 255.0,
        ]);
        self.light_uniform
            .upate_intensity(config.light_intensity.clone());
        self.glyph_uniform_data.y_offset = config.min_glyph_height;
    }

    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        if self.first_render {
            self.run_compute_pipeline();
            self.first_render = false;
        }

        let background_color = self.color_table_uniform.background_color();
        let cm = self.camera_manager.clone();
        let cm = cm.borrow();
        self.queue.write_buffer(
            &self.camera_buffer,
            0,
            bytemuck::cast_slice(&[cm.get_camera_uniform()]),
        );
        self.queue.write_buffer(
            &self.color_table_buffer,
            0,
            bytemuck::cast_slice(&[self.color_table_uniform]),
        );

        self.queue.write_buffer(
            &self.light_buffer,
            0,
            bytemuck::cast_slice(&[self.light_uniform]),
        );

        self.queue.write_buffer(
            &self.glyph_uniform_buffer,
            0,
            bytemuck::cast_slice(&[self.glyph_uniform_data]),
        );
        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&TextureViewDescriptor::default());

        let d = self.device.as_ref().borrow();
        let smaa_frame = self.smaa_target.start_frame(&d, &self.queue, &view);

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
        let string_order = Z_ORDERS[self.z_order];
        let d = self.device.as_ref().borrow();
        for name in string_order {
            //Glyphs has it's own logic to render in rank order so we can't really use the pipeline
            //manager trait to render it.  So, we will handle it directly.
            if name == "glyphs" {
                let dm = self.data_manager.borrow();
                let ranked_glyph_data = dm.get_glyphs();
                if ranked_glyph_data.is_some() {
                    let ranked_glyph_data = ranked_glyph_data.unwrap();
                    Self::run_glyphs_pipeline(
                        &d,
                        &smaa_frame,
                        &self.pipelines.glyphs,
                        self.rank,
                        self.rank_direction,
                        ranked_glyph_data,
                        &name,
                        &mut commands,
                        &self.selected_glyphs,
                    );
                }
            } else if self.axis_visible {
                let pipeline = match name {
                    "x-axis-line" => &self.pipelines.x_axis_line,
                    "y-axis-line" => &self.pipelines.y_axis_line,
                    "z-axis-line" => &self.pipelines.z_axis_line,
                    _ => panic!("Unknown pipeline name"),
                };
                commands.push(Self::run_axis_pipeline(&d, &smaa_frame, pipeline, &name));
            }
        }
        self.queue.submit(commands);

        smaa_frame.resolve();
        output.present();

        Ok(())
    }

    fn run_glyphs_pipeline(
        device: &Device,
        smaa_frame: &SmaaFrame,
        pipeline: &Glyphs,
        rank: Rank,
        rank_direction: RankDirection,
        ranked_glyph_data: &RankedGlyphData,
        pipeline_name: &str,
        commands: &mut Vec<CommandBuffer>,
        selected_glyphs: &Vec<SelectedGlyph>,
    ) {
        let rank_iteratror = ranked_glyph_data.iter(rank, rank_direction);
        for rank in rank_iteratror {
            let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some((format!("{} Encoder", pipeline_name)).as_str()),
            });
            let clean_rank = rank
                .iter()
                .map(|rgd| {
                    let rgd = rgd.borrow();
                    let flags = if selected_glyphs.len() > 0
                        && selected_glyphs.iter().any(|sg| sg.glyph_id == rgd.glyph_id)
                    {
                        1
                    } else if selected_glyphs.len() > 0 {
                        0
                    } else {
                        1
                    };
                    GlyphVertexData {
                        glyph_id: rgd.glyph_id,
                        position: rgd.position,
                        normal: rgd.normal,
                        color: rgd.color,
                        x_rank: rgd.x_rank,
                        z_rank: rgd.z_rank,
                        flags,
                    }
                })
                .collect::<Vec<GlyphVertexData>>();
            let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("Vertex Buffer"),
                contents: bytemuck::cast_slice(&clean_rank),
                usage: wgpu::BufferUsages::VERTEX,
            });
            pipeline.run_pipeline(&mut encoder, smaa_frame, &vertex_buffer, rank.len() as u32);
            commands.push(encoder.finish());
        }
    }

    fn run_axis_pipeline(
        device: &Device,
        smaa_frame: &SmaaFrame,
        pipeline: &axis_lines::AxisLines,
        pipeline_name: &str,
    ) -> CommandBuffer {
        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some((format!("{} Encoder", pipeline_name)).as_str()),
        });

        pipeline.run_pipeline(&mut encoder, smaa_frame);

        encoder.finish()
    }

    fn configure_surface(
        surface: &Surface,
        adapter: wgpu::Adapter,
        size: PhysicalSize<u32>,
        device: &Device,
    ) -> SurfaceConfiguration {
        // Get the capabilities of our surface
        let surface_caps = surface.get_capabilities(&adapter);
        // Shader code in this crate assumes an sRGB surface texture. Using a different
        // one will result all the colors coming out darker.
        let surface_format = surface_caps
            .formats
            .iter()
            .copied()
            .find(|f| f.is_srgb())
            .unwrap_or(surface_caps.formats[0]);

        //TODO: remove copy source as a usage.  This is only here to test our new hit detection
        //pipeline
        //define the surface configuration
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
            format: surface_format,
            width: size.width,
            height: size.height,
            present_mode: surface_caps.present_modes[0],
            alpha_mode: surface_caps.alpha_modes[0],
            view_formats: vec![],
        };
        //and apply it to our surface
        surface.configure(device, &config);
        config
    }

    pub fn run_compute_pipeline(&mut self) {
        let d = self.device.as_ref().borrow();
        let mut encoder = d.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("ScreenClear Encoder"),
        });
        let output_buffer = self.glyph_data_pipeline.run_pipeline(&mut encoder);
        self.queue.submit([encoder.finish()]);

        let buffer_slice = output_buffer.slice(..);
        buffer_slice.map_async(wgpu::MapMode::Read, |_| {});
        d.poll(wgpu::Maintain::Wait);

        let view = buffer_slice.get_mapped_range();
        //our data is already in the correct order so we can
        //just push the verticies into a traingle list and attach
        //the normals
        let output_data: Vec<InstanceOutput> = bytemuck::cast_slice(&view).to_vec();

        let dm = &mut self.data_manager.as_ref().borrow_mut();
        dm.clear_glyphs();

        let mut i = 0;
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
        let cm = self.camera_manager.clone();
        let cm = cm.borrow();
        let config = &self.config;

        let picking_texture_desc = wgpu::TextureDescriptor {
            label: Some("Picking Texture"),
            size: wgpu::Extent3d {
                width: config.width,
                height: config.height,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: wgpu::TextureFormat::Rgba8Unorm, // Adjust as needed
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
            view_formats: &[],
        };

        let picking_texture = device.create_texture(&picking_texture_desc);
        let picking_texture_view =
            picking_texture.create_view(&wgpu::TextureViewDescriptor::default());

        let align = wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
        let padded_bytes_per_row = ((4 * config.width + align - 1) / align) * align; // Round up to nearest multiple of align
        let buffer_size = (config.height * padded_bytes_per_row) as wgpu::BufferAddress; // Assuming Rgba8Unorm format
        let output_buffer = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Output Buffer"),
            size: buffer_size,
            usage: wgpu::BufferUsages::COPY_DST | wgpu::BufferUsages::MAP_READ,
            mapped_at_creation: false,
        });

        self.queue.write_buffer(
            &self.camera_buffer,
            0,
            bytemuck::cast_slice(&[cm.get_camera_uniform()]),
        );

        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("ScreenClear Encoder"),
        });

        let screen_clear_render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &picking_texture_view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: 1.0 as f64,
                        g: 1.0 as f64,
                        b: 1.0 as f64,
                        a: 1.0,
                    }),
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });
        let mut commands = Vec::new();

        drop(screen_clear_render_pass);
        commands.push(encoder.finish());
        let dm = self.data_manager.clone();
        let dm = dm.as_ref().borrow();
        let ranked_glyph_data = dm.get_glyphs();

        if ranked_glyph_data.is_some() {
            let ranked_glyph_data = ranked_glyph_data.unwrap();

            let rank_iteratror = ranked_glyph_data.iter(self.rank, self.rank_direction);
            for rank in rank_iteratror {
                let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                    label: Some("Hit Detection Encoder"),
                });
                let clean_rank = rank
                    .iter()
                    .map(|rgd| {
                        let rgd = rgd.borrow();
                        GlyphVertexData {
                            glyph_id: rgd.glyph_id,
                            position: rgd.position,
                            normal: rgd.normal,
                            color: rgd.color,
                            x_rank: rgd.x_rank,
                            z_rank: rgd.z_rank,
                            flags: rgd.flags,
                        }
                    })
                    .collect::<Vec<GlyphVertexData>>();
                let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                    label: Some("Instance Buffer"),
                    contents: bytemuck::cast_slice(&clean_rank),
                    usage: wgpu::BufferUsages::VERTEX,
                });
                self.new_hit_detection_pipeline.run_pipeline(
                    &mut encoder,
                    &picking_texture_view,
                    &vertex_buffer,
                    rank.len() as u32,
                );
                //pipeline.run_pipeline(&mut encoder, smaa_frame, &vertex_buffer, rank.len() as u32);
                commands.push(encoder.finish());
            }
            let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Copy Buffer Encoder"),
            });

            encoder.copy_texture_to_buffer(
                wgpu::ImageCopyTexture {
                    texture: &picking_texture,
                    mip_level: 0,
                    origin: wgpu::Origin3d::ZERO,
                    aspect: wgpu::TextureAspect::All,
                },
                wgpu::ImageCopyBuffer {
                    buffer: &output_buffer,
                    layout: wgpu::ImageDataLayout {
                        offset: 0,
                        bytes_per_row: Some(padded_bytes_per_row),
                        rows_per_image: None,
                    },
                },
                picking_texture_desc.size,
            );

            commands.push(encoder.finish());
            self.queue.submit(commands);

            let buffer_slice = output_buffer.slice(..);
            buffer_slice.map_async(wgpu::MapMode::Read, |_| {});
            device.poll(wgpu::Maintain::Wait);

            let view = buffer_slice.get_mapped_range();
            let pixel_pos = (y_pos as u32 * padded_bytes_per_row + x_pos as u32 * 4) as usize;
            let val = &view[pixel_pos..pixel_pos + 4];

            let glyph_id = decode_glyph_id([val[0], val[1], val[2], val[3]]);
            if glyph_id != 16777215 {
                let glyph_desc = dm.get_glyph_description(glyph_id).unwrap();
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
        }

        Ok(())
    }

    async fn init_device(adapter: &wgpu::Adapter) -> (Device, Queue) {
        // The device is a logical GPU device pointing to the physical device identified by the adapter.
        // The queue a command queue for the device to execute.  We write our operation to the
        // queue to be rendered on the physical device for display on the surface
        let (device, queue) = adapter
            .request_device(
                &wgpu::DeviceDescriptor {
                    features: wgpu::Features::default(),
                    // WebGL doesn't support all of wgpu's features, so if
                    // we're building for the web we'll have to disable some.
                    limits: if cfg!(target_arch = "wasm32") {
                        wgpu::Limits::downlevel_webgl2_defaults()
                    } else {
                        wgpu::Limits::default()
                    },
                    label: None,
                },
                None, // Trace path
            )
            .await
            .unwrap();
        (device, queue)
    }

    async fn init_wgpu(window: &Window) -> (Surface, wgpu::Adapter) {
        // The instance is a handle to our GPU api (WGPU)
        // Backends::all => Vulkan + Metal + DX12 + Browser WebGPU
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::all(),
            dx12_shader_compiler: Default::default(),
        });

        // The Surface is our connection to the window on which we are drawing.
        // # Safety
        //
        // The surface needs to live as long as the window that created it.
        // State owns the window so this should be safe.
        let surface = unsafe { instance.create_surface(window) }.unwrap();

        // The adapter is a handle to a physical GPU device.
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::default(),
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .unwrap();
        (surface, adapter)
    }

    fn build_pipelines(
        device: Rc<RefCell<Device>>,
        config: &SurfaceConfiguration,
        camera_buffer: &wgpu::Buffer,
        camera_uniform: &CameraUniform,
        color_table_buffer: &wgpu::Buffer,
        color_table_uniform: &ColorTableUniform,
        light_buffer: &wgpu::Buffer,
        light_uniform: &LightUniform,
        model_configuration: Rc<RefCell<ModelConfiguration>>,
        glyph_uniform_buffer: &wgpu::Buffer,
        glyph_uniform_data: &GlyphUniformData,
    ) -> Pipelines {
        let mc = model_configuration.borrow();
        let x_axis_line = axis_lines::AxisLines::new(
            device.clone(),
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            model_configuration.clone(),
            axis_lines::AxisLineDirection::X,
            mc.model_origin[0],
            glyph_uniform_data.min_interp_x,
            glyph_uniform_data.max_interp_x,
        );

        let y_axis_line = axis_lines::AxisLines::new(
            device.clone(),
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            model_configuration.clone(),
            axis_lines::AxisLineDirection::Y,
            mc.model_origin[1],
            glyph_uniform_data.min_interp_y,
            glyph_uniform_data.max_interp_y,
        );

        let z_axis_line = axis_lines::AxisLines::new(
            device.clone(),
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            model_configuration.clone(),
            axis_lines::AxisLineDirection::Z,
            mc.model_origin[2],
            glyph_uniform_data.min_interp_z,
            glyph_uniform_data.max_interp_z,
        );
        let glyphs = Glyphs::new(
            device.clone(),
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            glyph_uniform_buffer,
            glyph_uniform_data,
        );
        Pipelines {
            x_axis_line,
            y_axis_line,
            z_axis_line,
            glyphs,
        }
    }
    fn configure_camera(
        config: &SurfaceConfiguration,
        device: &Device,
        glyph_uniform_data: &GlyphUniformData,
        camera_manager: &mut CameraManager,
    ) -> (wgpu::Buffer, CameraUniform, CameraController) {
        let camera_uniform =
            Self::build_camera_and_uniform(camera_manager, glyph_uniform_data, config);

        let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Camera Buffer"),
            contents: bytemuck::cast_slice(&[camera_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        let camera_controller = CameraController::new(0.025, 0.006);
        (camera_buffer, camera_uniform, camera_controller)
    }

    fn build_glyph_uniform_data(
        model_configuration: &Rc<RefCell<ModelConfiguration>>,
        data_manager: &DataManager,
    ) -> GlyphUniformData {
        let mc = model_configuration.clone();
        let mut mc = mc.borrow_mut();
        let radius = if mc.grid_cylinder_radius > mc.grid_cone_radius {
            mc.grid_cylinder_radius
        } else {
            mc.grid_cone_radius
        };

        let x_stats = data_manager.get_stats("x").unwrap();
        let min_x = x_stats.min;
        let max_x = x_stats.max;
        let x_rank_count = x_stats.max_rank;

        let y_stats = data_manager.get_stats("y").unwrap();
        let min_y = y_stats.min;
        let max_y = y_stats.max;

        let z_stats = data_manager.get_stats("z").unwrap();
        let min_z = z_stats.min;
        let max_z = z_stats.max;
        let z_rank_count = z_stats.max_rank;

        let x_z_offset = radius + mc.glyph_offset;
        let glyph_size = mc.glyph_size;

        //How much space will our glyphs take up?
        let x_size = x_rank_count as f32 * glyph_size + x_z_offset;
        let z_size = z_rank_count as f32 * glyph_size + x_z_offset;

        let y_size = (if x_size > z_size { x_size } else { z_size }) * mc.z_height_ratio;

        let x_half = (x_size / 2.0) as u32 + 1;

        let z_half = (z_size / 2.0) as u32 + 1;
        let x_z_half = if x_half > z_half { x_half } else { z_half };
        let model_origin =
            (x_z_half as f32 + mc.glyph_offset / 2.0 + mc.grid_cone_radius / 2.0) * -1.0;
        mc.model_origin = [model_origin, model_origin, model_origin];

        let mut flags = GlyphUniformFlags::default();
        //Y and Z are flipped from our config to our uniform buffer.
        flags.x_interp_type = mc.x_interpolation;
        flags.y_interp_type = mc.z_interpolation;
        flags.z_interp_type = mc.y_interpolation;
        flags.x_order = mc.x_order;
        flags.y_order = mc.z_order;
        flags.z_order = mc.y_order;
        flags.color_flip = mc.color_flip;

        let flags = flags.encode();

        let glyph_uniform_data = GlyphUniformData {
            min_x: min_x as f32,
            max_x: max_x as f32,
            min_interp_x: -1.0 * x_z_half as f32,
            max_interp_x: x_z_half as f32,
            min_y: min_y as f32,
            max_y: max_y as f32,
            //TODO: Why is this tied to model origin but the other axis are not?
            min_interp_y: model_origin, // * y_half as f32,
            max_interp_y: model_origin + y_size as f32,
            min_z: min_z as f32,
            max_z: max_z as f32,
            min_interp_z: -1.0 * x_z_half as f32,
            max_interp_z: x_z_half as f32,
            flags,
            x_z_offset,
            y_offset: mc.min_glyph_height,
            _padding: 0,
        };
        glyph_uniform_data
    }

    fn cacluate_rotation_change(&self, camera_manager: &CameraManager) -> f32 {
        const RADS_PER_ROTATION: f32 = 6.283;
        let yaw = camera_manager.get_yaw();
        let distance = camera_manager.get_distance();

        let rotation_rads = yaw % RADS_PER_ROTATION;
        let rotation_rads = if rotation_rads < 0.0 {
            RADS_PER_ROTATION + rotation_rads
        } else {
            rotation_rads
        };
        let degrees_of_rotation = rotation_rads * 180.0 / std::f32::consts::PI;
        let distance_ratio = distance
            / (self.glyph_uniform_data.max_interp_x - self.glyph_uniform_data.min_interp_x);
        let distance_off_set = if distance_ratio > 1.0 {
            0.0
        } else if distance_ratio >= 0.9 {
            1.0
        } else if distance_ratio >= 0.8 {
            7.0
        } else if distance_ratio >= 0.7 {
            13.0
        } else {
            23.0
        };
        degrees_of_rotation - distance_off_set
    }
    //These cubes are square at least on the x/z axis
    pub fn update_z_order_and_rank(&mut self, camera_manager: &CameraManager) {
        let rotation_angle = self.cacluate_rotation_change(camera_manager);
        let flags = GlyphUniformFlags::decode(self.glyph_uniform_data.flags).unwrap();
        //When we gerate the vectors in the glyph_data pipeline, ordering can be modified which
        //moves the glyphs through space, but the rank is not changed.  So in these cases, we need
        //to flip our rank direction to keep the ordering of the glyphs corect.
        let is_z_desc = flags.z_order == Order::Descending;
        let is_x_desc = flags.x_order == Order::Descending;
        let (z_order_index, rank, rank_direction) =
            if rotation_angle >= 301.0 || rotation_angle < 31.0 {
                //Front
                (
                    0,
                    Rank::Z,
                    if !is_z_desc {
                        RankDirection::Ascending
                    } else {
                        RankDirection::Descending
                    },
                )
            } else if rotation_angle >= 31.0 && rotation_angle < 121.0 {
                //Right
                (
                    0,
                    Rank::X,
                    if !is_x_desc {
                        RankDirection::Ascending
                    } else {
                        RankDirection::Descending
                    },
                )
            } else if rotation_angle >= 121.0 && rotation_angle < 211.0 {
                //Back
                (
                    1,
                    Rank::Z,
                    if !is_z_desc {
                        RankDirection::Descending
                    } else {
                        RankDirection::Ascending
                    },
                )
            } else if rotation_angle >= 211.0 && rotation_angle < 301.0 {
                //Left
                (
                    3,
                    Rank::X,
                    if !is_x_desc {
                        RankDirection::Descending
                    } else {
                        RankDirection::Ascending
                    },
                )
            } else {
                //This will never happen but rust was trying to be helpful
                (0, Rank::Z, RankDirection::Ascending)
            };

        let forward_face = if rotation_angle >= 316.0 || rotation_angle < 46.0 {
            //Front
            Face::Front
        } else if rotation_angle >= 46.0 && rotation_angle < 136.0 {
            //Right
            Face::Right
        } else if rotation_angle >= 136.0 && rotation_angle < 226.0 {
            //Back
            Face::Back
        } else if rotation_angle >= 226.0 && rotation_angle < 316.0 {
            //Left
            Face::Left
        } else {
            //This will never happen but rust was trying to be helpful
            Face::Front
        };
        self.z_order = z_order_index;
        self.rank = rank;
        self.rank_direction = rank_direction;
        self.forward_face = forward_face;
    }

    fn build_camera_and_uniform(
        camera_manager: &mut CameraManager,
        glyph_uniform_data: &GlyphUniformData,
        config: &SurfaceConfiguration,
    ) -> CameraUniform {
        let distance = (glyph_uniform_data.max_interp_x - glyph_uniform_data.min_interp_x) * 0.9;
        let y_offset = (glyph_uniform_data.max_interp_y - glyph_uniform_data.min_interp_y) / 2.0;
        let y_offset = (glyph_uniform_data.min_interp_y + y_offset) * -1.0;
        camera_manager.initialize(
            0.3,
            -1.5708,
            distance,
            config.width as f32 / config.height as f32,
            y_offset,
        )
    }
}
