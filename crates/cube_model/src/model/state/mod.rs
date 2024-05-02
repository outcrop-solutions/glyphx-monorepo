mod data_manager;

mod errors;
use crate::camera::{
    camera_controller::CameraController, orbit_camera::OrbitCamera, uniform_buffer::CameraUniform,
};
use crate::data::{DeserializeVectorError, ModelVectors};
use crate::light::light_uniform::LightUniform;
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::model_configuration::ModelConfiguration;
use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;
use crate::model::pipeline::glyphs::ranked_glyph_data::{Rank, RankDirection, RankedGlyphData};
use crate::model::pipeline::{axis_lines, glyphs, PipelineRunner};
pub use data_manager::DataManager;
pub use errors::*;
use model_common::Stats;

use smaa::*;
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::util::DeviceExt;
use wgpu::{CommandBuffer, Device, Queue, Surface, SurfaceConfiguration, TextureViewDescriptor};
use winit::dpi::PhysicalSize;
use winit::event::DeviceEvent;
use winit::window::Window;

use glam::Vec3;
use rand::Rng;
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
    glyphs: glyphs::Glyphs,
}
pub struct State {
    surface: wgpu::Surface,
    device: Rc<RefCell<wgpu::Device>>,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
    window: Window,
    camera: OrbitCamera,
    camera_buffer: wgpu::Buffer,
    camera_uniform: CameraUniform,
    camera_controller: CameraController,
    color_table_uniform: ColorTableUniform,
    color_table_buffer: wgpu::Buffer,
    light_uniform: LightUniform,
    light_buffer: wgpu::Buffer,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    smaa_target: SmaaTarget,
    glyph_uniform_data: glyphs::glyph_instance_data::GlyphUniformData,
    glyph_uniform_buffer: wgpu::Buffer,
    rank: Rank,
    rank_direction: RankDirection,
    pipelines: Pipelines,
    z_order: usize,
    data_manager: Rc<RefCell<DataManager>>,
    forward_face: Face,
    axis_visible: bool,
}

impl State {
    pub async fn new(
        window: Window,
        model_configuration: Rc<RefCell<ModelConfiguration>>,
        data_manager: Rc<RefCell<DataManager>>,
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
        let (camera, camera_buffer, camera_uniform, camera_controller) =
            Self::configure_camera(&config, &d, &glyph_uniform_data);

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
            &glyph_uniform_data,
            &glyph_uniform_buffer,
        );

        let smaa_target = SmaaTarget::new(
            &d,
            &queue,
            window.inner_size().width,
            window.inner_size().height,
            config.format,
            SmaaMode::Smaa1X,
        );
        let mut model = Self {
            window,
            surface,
            device,
            queue,
            config,
            size,
            camera,
            camera_buffer,
            camera_uniform,
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
        };
        //This allows us to initialize out camera with a pitch and yaw that is not 0
        model.update_z_order_and_rank();
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

    pub fn input(&mut self, event: &DeviceEvent) -> bool {
        let camera_result = self
            .camera_controller
            .process_events(event, &mut self.camera);
        if camera_result {
            self.update_z_order_and_rank();
        };
        camera_result
    }

    pub fn move_camera(&mut self, direction: &str, amount: f32) {
        match direction {
            "distance" => {
                self.camera
                    .add_distance(amount * self.camera_controller.zoom_speed);
                self.update();
            }
            "yaw" => {
                self.camera
                    .add_yaw(amount * self.camera_controller.rotate_speed);
                self.update();
            }
            "pitch" => {
                self.camera
                    .add_pitch(amount * self.camera_controller.rotate_speed);
                self.update();
            }
            "up" => {
                self.camera_uniform.update_y_offset(amount);
            }
            "down" => {
                self.camera_uniform.update_y_offset(-1.0 * amount);
            }
            "left" => match self.forward_face {
                Face::Front => {
                    self.camera_uniform.update_x_offset(-1.0 * amount);
                }
                Face::Right => {
                    self.camera_uniform.update_z_offset(amount);
                }
                Face::Back => {
                    self.camera_uniform.update_x_offset(amount);
                }
                Face::Left => {
                    self.camera_uniform.update_z_offset(-1.0 * amount);
                }
            },
            "right" => match self.forward_face {
                Face::Front => {
                    self.camera_uniform.update_x_offset(amount);
                }
                Face::Right => {
                    self.camera_uniform.update_z_offset(-1.0 * amount);
                }
                Face::Back => {
                    self.camera_uniform.update_x_offset(-1.0 * amount);
                }
                Face::Left => {
                    self.camera_uniform.update_z_offset(amount);
                }
            },
            "x_axis" => {
                self.reset_camera();
                self.camera.set_yaw(3.14159);
                self.camera.set_pitch(0.0);
                self.update_z_order_and_rank();
            },

            "y_axis" => {
                self.reset_camera();
                self.camera.set_yaw(4.71239);
                self.camera.set_pitch(0.0);
                self.update_z_order_and_rank();
            }

            "z_axis" => {
                self.reset_camera();
                self.camera.set_yaw(0.0);
                self.camera.set_pitch(1.5708);
                self.update_z_order_and_rank();
            }
            _ => (),
        };
    }

    pub fn reset_camera(&mut self) {
        let (camera, camera_uniform) = Self::build_camera_and_uniform(
            &self.glyph_uniform_data,
            &self.config,
        );
        self.camera = camera;
        self.camera_uniform = camera_uniform;
        self.update_z_order_and_rank();
        self.update();
    }
    pub fn toggle_axis_visibility(&mut self) {
        self.axis_visible = !self.axis_visible;
    }
    pub fn update(&mut self) {
        self.camera_uniform.update_view_proj(&self.camera);
        //eprintln!("Camera: {:?}, GlyphUniform: {:?}", self.camera, self.glyph_uniform_data);
    }

    pub fn update_config(&mut self) {
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
        self.pipelines
            .glyphs
            .update_vertex_buffer(&self.glyph_uniform_data);
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
        let background_color = self.color_table_uniform.background_color();
        self.queue.write_buffer(
            &self.camera_buffer,
            0,
            bytemuck::cast_slice(&[self.camera_uniform]),
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
        let mut i: usize = 0;
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
                    );
                }
            } else if self.axis_visible{
                let pipeline = match name {
                    "x-axis-line" => &self.pipelines.x_axis_line,
                    "y-axis-line" => &self.pipelines.y_axis_line,
                    "z-axis-line" => &self.pipelines.z_axis_line,
                    _ => panic!("Unknown pipeline name"),
                };
                commands.push(Self::run_axis_pipeline(&d, &smaa_frame, pipeline, &name));
            }
            i += 1;
        }
        self.queue.submit(commands);

        smaa_frame.resolve();
        output.present();

        Ok(())
    }

    fn run_glyphs_pipeline(
        device: &Device,
        smaa_frame: &SmaaFrame,
        pipeline: &glyphs::Glyphs,
        rank: Rank,
        rank_direction: RankDirection,
        ranked_glyph_data: &RankedGlyphData,
        pipeline_name: &str,
        commands: &mut Vec<CommandBuffer>,
    ) {
        let rank_iteratror = ranked_glyph_data.iter(rank, rank_direction);
        for rank in rank_iteratror {
            let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some((format!("{} Encoder", pipeline_name)).as_str()),
            });
            let clean_rank = rank
                .iter()
                .map(|rc| GlyphInstanceData {
                    glyph_id: rc.glyph_id,
                    x_value: rc.x_value,
                    y_value: rc.y_value,
                    z_value: rc.z_value,
                    glyph_selected: rc.glyph_selected,
                })
                .collect::<Vec<GlyphInstanceData>>();
            let instance_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("Instance Buffer"),
                contents: bytemuck::cast_slice(&clean_rank),
                usage: wgpu::BufferUsages::VERTEX,
            });
            pipeline.run_pipeline(
                &mut encoder,
                smaa_frame,
                &instance_buffer,
                rank.len() as u32,
            );
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

        //define the surface configuration
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
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
        glyph_uniform_data: &glyphs::glyph_instance_data::GlyphUniformData,
        glyph_uniform_buffer: &wgpu::Buffer,
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
        let d = device.as_ref().borrow();
        let glyphs = glyphs::Glyphs::new(
            glyph_uniform_data,
            glyph_uniform_buffer,
            device.clone(),
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            model_configuration.clone(),
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
        glyph_uniform_data: &glyphs::glyph_instance_data::GlyphUniformData,
    ) -> (OrbitCamera, wgpu::Buffer, CameraUniform, CameraController) {
        //{ distance: 4.079997, pitch: 0.420797, yaw: -39.125065, eye: Vector3 { x: -3.6850765, y: 1.66663, z: 0.537523 }, target: Vector3 { x: 0.0, y: 0.0, z: 0.0 }, up: Vector3 { x: 0.0, y: 1.0, z: 0.0 }, bounds: OrbitCameraBounds { min_distance: Some(1.1), max_distance: None, min_pitch: -1.5707963, max_pitch: 1.5707963, min_yaw: None, max_yaw: None }, aspect: 1.5, fovy: 1.5707964, znear: 0.1, zfar: 1000.0 }
        // let mut camera = OrbitCamera::new(
        //     4.07,
        //     0.42,
        //     -32.12,
        //     Vec3::new(0.0, 0.0, 0.0),
        //     config.width as f32 / config.height as f32,
        // );
        let (camera, camera_uniform) = Self::build_camera_and_uniform(glyph_uniform_data, config);

        let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Camera Buffer"),
            contents: bytemuck::cast_slice(&[camera_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        let camera_controller = CameraController::new(0.025, 0.006);
        (camera, camera_buffer, camera_uniform, camera_controller)
    }

    fn build_glyph_uniform_data(
        model_configuration: &Rc<RefCell<ModelConfiguration>>,
        data_manager: &DataManager,
    ) -> glyphs::glyph_instance_data::GlyphUniformData {
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
        let y_rank_count = y_stats.max_rank;

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
        let y_half = (y_size / 2.0) as u32 + 1;
        let x_z_half = if x_half > z_half { x_half } else { z_half };
        let model_origin =
            (x_z_half as f32 + mc.glyph_offset / 2.0 + mc.grid_cone_radius / 2.0) * -1.0;
        mc.model_origin = [model_origin, model_origin, model_origin];
        let glyph_uniform_data: glyphs::glyph_instance_data::GlyphUniformData =
            glyphs::glyph_instance_data::GlyphUniformData {
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

                x_z_offset,
                y_offset: mc.min_glyph_height,
                _padding: [0u32; 2],
            };
        glyph_uniform_data
    }
    fn cacluate_rotation_change(&self) -> f32 {
        const RADS_PER_ROTATION: f32 = 6.283;
        let rotation_rads = self.camera.yaw % RADS_PER_ROTATION;
        let rotation_rads = if rotation_rads < 0.0 {
            RADS_PER_ROTATION + rotation_rads
        } else {
            rotation_rads
        };
        let degrees_of_rotation = rotation_rads * 180.0 / std::f32::consts::PI;
        //eprintln!("Pitch: {} Yaw : {}, rotation_rads: {}: Degrees of rotation: {}, Model Width: {}, Distance : {}, %of Width {}", self.camera.pitch,  self.camera.yaw, rotation_rads, degrees_of_rotation, self.glyph_uniform_data.max_interp_x - self.glyph_uniform_data.min_interp_x, self.camera.distance, self.camera.distance / (self.glyph_uniform_data.max_interp_x - self.glyph_uniform_data.min_interp_x));
        let distance_ratio = self.camera.distance
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
    pub fn update_z_order_and_rank(&mut self) {
        let rotation_angle = self.cacluate_rotation_change();

        let (z_order_index, rank, rank_direction) =
            if rotation_angle >= 301.0 || rotation_angle < 31.0 {
                //Front
                (0, Rank::Z, RankDirection::Ascending)
            } else if rotation_angle >= 31.0 && rotation_angle < 121.0 {
                //Right
                (0, Rank::X, RankDirection::Ascending)
            } else if rotation_angle >= 121.0 && rotation_angle < 211.0 {
                //Back
                (1, Rank::Z, RankDirection::Descending)
            } else if rotation_angle >= 211.0 && rotation_angle < 301.0 {
                //Left
                (3, Rank::X, RankDirection::Descending)
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
        glyph_uniform_data: &glyphs::glyph_instance_data::GlyphUniformData,
        config: &SurfaceConfiguration,
    ) -> (OrbitCamera, CameraUniform) {
        let distance = (glyph_uniform_data.max_interp_x - glyph_uniform_data.min_interp_x) * 0.9;
        let y_offset = (glyph_uniform_data.max_interp_y - glyph_uniform_data.min_interp_y) / 2.0;
        let y_offset = (glyph_uniform_data.min_interp_y + y_offset) * -1.0;
        let mut camera = OrbitCamera::new(
            distance,
            0.3,
            //0.0,
            //rotate counter clockwise 90 degrees
            -1.5708,
            //0.0,
            Vec3::new(0.0, 0.0, 0.0),
            config.width as f32 / config.height as f32,
        );
        //let mut camera = OrbitCamera::new(2.0, 1.5, 1.25, Vec3::new(0.0, 0.0, 0.0), config.width as f32 / config.height as f32);
        camera.bounds.min_distance = Some(1.1);
        let mut camera_uniform = CameraUniform::default();
        camera_uniform.y_offset = y_offset;
        camera_uniform.update_view_proj(&camera);
        (camera, camera_uniform)
    }
}
