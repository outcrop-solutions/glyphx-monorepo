use crate::camera::{camera_controller::CameraController, uniform_buffer::CameraUniform, orbit_camera::OrbitCamera};
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::model_configuration::ModelConfiguration;
use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;
use crate::model::pipeline::{axis_lines, glyphs};
use smaa::*;
use std::rc::Rc;
use wgpu::util::DeviceExt;
use wgpu::{Device, Queue, Surface, SurfaceConfiguration, TextureViewDescriptor };
use winit::dpi::PhysicalSize;
use winit::event::{WindowEvent, DeviceEvent};
use winit::window::Window;

use rand::Rng;
use super::pipeline::glyphs::glyph_instance_data;
use glam::Vec3;

pub struct State {
    surface: wgpu::Surface,
    device: wgpu::Device,
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
    model_configuration: Rc<ModelConfiguration>,
    axis_lines_pipeline: axis_lines::AxisLines,
    glyphs_pipeline: glyphs::Glyphs,
    smaa_target: SmaaTarget,
    glyph_uniform_data: glyphs::glyph_instance_data::GlyphUniformData,
    glyph_uniform_buffer: wgpu::Buffer,
    glyph_instance_data: Vec<GlyphInstanceData>,
}

impl State {
    pub async fn new(window: Window, model_configuration: Rc<ModelConfiguration>) -> Self {
        let size = window.inner_size();

        let (surface, adapter) = Self::init_wgpu(&window).await;

        let (device, queue) = Self::init_device(&adapter).await;

        let config = Self::configure_surface(&surface, adapter, size, &device);

        let (camera, camera_buffer, camera_uniform, camera_controller) =
            Self::configure_camera(&config, &device);

        let color_table_uniform = ColorTableUniform::new(
            model_configuration.min_color,
            model_configuration.max_color,
            model_configuration.x_axis_color,
            model_configuration.y_axis_color,
            model_configuration.z_axis_color,
            model_configuration.background_color,
        );

        let color_table_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Color Table Buffer"),
            contents: bytemuck::cast_slice(&[color_table_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        let model_configuration = model_configuration.clone();

        let glyph_uniform_data = Self::build_glyph_uniform_data(&model_configuration);

        let glyph_instance_data = Self::build_instance_data();

        let glyph_uniform_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Glyph Uniform Buffer"),
            contents: bytemuck::cast_slice(&[glyph_uniform_data]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        let (axis_lines_pipeline, glyphs_pipeline) = Self::build_pipelines(
            &device,
            &config,
            &camera_buffer,
            &camera_uniform,
            &color_table_buffer,
            &color_table_uniform,
            &model_configuration,
            &glyph_uniform_data,
            &glyph_uniform_buffer,
            &glyph_instance_data,
        );

        let smaa_target = SmaaTarget::new(
            &device,
            &queue,
            window.inner_size().width,
            window.inner_size().height,
            config.format,
            SmaaMode::Smaa1X,
        );
        Self {
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
            axis_lines_pipeline,
            glyphs_pipeline,
            glyph_instance_data,
        }
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
            self.surface.configure(&self.device, &self.config);
        }
    }

    pub fn input(&mut self, event: &DeviceEvent) -> bool {
        self.camera_controller.process_events(event, &mut self.camera)
    }

    pub fn move_camera(&mut self, direction: &str, on_or_off: bool) {
        // if direction == "forward" {
        //     self.camera_controller.move_forward(on_or_off);
        // } else if direction == "backward" {
        //     self.camera_controller.move_backward(on_or_off);
        // } else if direction == "left" {
        //     self.camera_controller.move_left(on_or_off);
        // } else if direction == "right" {
        //     self.camera_controller.move_right(on_or_off);
        // }
        self.update();
    }
    pub fn update(&mut self) {
//        self.camera_controller.update_camera(&mut self.camera);
        self.camera_uniform.update_view_proj(&self.camera);
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
            &self.glyph_uniform_buffer,
            0,
            bytemuck::cast_slice(&[self.glyph_uniform_data]),
        );

        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&TextureViewDescriptor::default());

        let smaa_frame = self
            .smaa_target
            .start_frame(&self.device, &self.queue, &view);

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
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
        let screen_clear_commands = encoder.finish();

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Axis Lines Render Encoder"),
            });

        self.axis_lines_pipeline
            .run_pipeline(&mut encoder, &smaa_frame, &background_color);

        let axis_commands = encoder.finish();

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Glyph Render Encoder"),
            });

        self.glyphs_pipeline
            .run_pipeline(&mut encoder, &smaa_frame, &self.glyph_instance_data);

        let glyph_commands = encoder.finish();

        self.queue.submit([screen_clear_commands, axis_commands, glyph_commands]);

        smaa_frame.resolve();
        output.present();

        Ok(())
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
        //an apply it to our surface
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

    fn build_instance_data() -> Vec<glyphs::glyph_instance_data::GlyphInstanceData> {
        // vec![
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 0,
        //         x_value: 0.0,
        //         y_value: 0.0,
        //         z_value: 0.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 1,
        //         x_value: 1.0,
        //         y_value: 1.0,
        //         z_value: 1.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 2,
        //         x_value: 2.0,
        //         y_value: 2.0,
        //         z_value: 2.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 3,
        //         x_value: 3.0,
        //         y_value: 3.0,
        //         z_value: 3.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 4,
        //         x_value: 4.0,
        //         y_value: 4.0,
        //         z_value: 4.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 5,
        //         x_value: 5.0,
        //         y_value: 5.0,
        //         z_value: 5.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 6,
        //         x_value: 6.0,
        //         y_value: 6.0,
        //         z_value: 6.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 7,
        //         x_value: 7.0,
        //         y_value: 7.0,
        //         z_value: 7.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 8,
        //         x_value: 8.0,
        //         y_value: 8.0,
        //         z_value: 8.0,
        //         glyph_selected: 0,
        //     },
        //     glyphs::glyph_instance_data::GlyphInstanceData {
        //         glyph_id: 9,
        //         x_value: 9.0,
        //         y_value: 9.0,
        //         z_value: 9.0,
        //         glyph_selected: 0,
        //     },
        // ]

        let mut instance_data: Vec<glyph_instance_data::GlyphInstanceData> = Vec::new();
        let mut rng = rand::thread_rng();
        let mut x = 0.0;
        let mut y = 0.0;
        let mut count = 0;
        while x < 100.0 {
            while y < 50.0 {
                
                let random_number: f32 = rng.gen_range(0.0..=9.0);
                instance_data.push(glyph_instance_data::GlyphInstanceData {
                    glyph_id: count,
                    x_value: x,
                    y_value: y,
                    z_value: random_number,
                    glyph_selected: 0,
                });
                y += 1.0;
                count += 1;
            }
            y = 0.0;
            x += 1.0;
        }
         instance_data
    }
    fn build_pipelines(
        device: &Device,
        config: &SurfaceConfiguration,
        camera_buffer: &wgpu::Buffer,
        camera_uniform: &CameraUniform,
        color_table_buffer: &wgpu::Buffer,
        color_table_uniform: &ColorTableUniform,
        model_configuration: &Rc<ModelConfiguration>,
        glyph_uniform_data: &glyphs::glyph_instance_data::GlyphUniformData,
        glyph_uniform_buffer: &wgpu::Buffer,
        glyph_instance_data: &Vec<GlyphInstanceData>,
    ) -> (axis_lines::AxisLines, glyphs::Glyphs) {
        let axis_lines = axis_lines::AxisLines::new(
            device,
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            model_configuration.clone(),
        );

        let glyphs = glyphs::Glyphs::new(
            glyph_uniform_data,
            glyph_uniform_buffer,
            glyph_instance_data,
            device,
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            model_configuration.clone(),
        );
        (axis_lines, glyphs)
    }
    fn configure_camera(
        config: &SurfaceConfiguration,
        device: &Device,
    ) -> (OrbitCamera, wgpu::Buffer, CameraUniform, CameraController) {
        //{ distance: 4.079997, pitch: 0.420797, yaw: -39.125065, eye: Vector3 { x: -3.6850765, y: 1.66663, z: 0.537523 }, target: Vector3 { x: 0.0, y: 0.0, z: 0.0 }, up: Vector3 { x: 0.0, y: 1.0, z: 0.0 }, bounds: OrbitCameraBounds { min_distance: Some(1.1), max_distance: None, min_pitch: -1.5707963, max_pitch: 1.5707963, min_yaw: None, max_yaw: None }, aspect: 1.5, fovy: 1.5707964, znear: 0.1, zfar: 1000.0 }
        let mut camera = OrbitCamera::new(4.07, 0.42, -32.12, Vec3::new(0.0, 0.0, 0.0), config.width as f32 / config.height as f32);
        //let mut camera = OrbitCamera::new(2.0, 1.5, 1.25, Vec3::new(0.0, 0.0, 0.0), config.width as f32 / config.height as f32);
        camera.bounds.min_distance = Some(1.1);
        let mut camera_uniform = CameraUniform::default();
        camera_uniform.update_view_proj(&camera);

        let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Camera Buffer"),
            contents: bytemuck::cast_slice(&[camera_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        let camera_controller = CameraController::new(0.025, 0.006);
        (camera, camera_buffer, camera_uniform, camera_controller)
    }

    fn build_glyph_uniform_data(
        model_configuration: &Rc<ModelConfiguration>,
    ) -> glyphs::glyph_instance_data::GlyphUniformData {
        let radius =
            if model_configuration.grid_cylinder_radius > model_configuration.grid_cone_radius {
                model_configuration.grid_cylinder_radius
            } else {
                model_configuration.grid_cone_radius
            };

        let x_y_offset = radius + model_configuration.glyph_offset;
        let glyph_uniform_data: glyphs::glyph_instance_data::GlyphUniformData =
            glyphs::glyph_instance_data::GlyphUniformData {
                min_x: 0.0,
                max_x: 100.0,
                min_interp_x: -5.0,
                max_interp_x: 5.0,

                min_y: 0.0,
                max_y: 50.0,
                min_interp_y: -5.0,
                max_interp_y: 5.0,

                min_z: 0.0,
                max_z: 9.0,
                min_interp_z: -1.0,
                max_interp_z: 1.0,

                x_y_offset,
                z_offset: model_configuration.z_offset,
                _padding: [0u32; 2],
            };
        glyph_uniform_data
    }
}
