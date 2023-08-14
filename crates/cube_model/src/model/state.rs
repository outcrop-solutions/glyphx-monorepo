use crate::camera::{camera_controller::CameraController, uniform_buffer::CameraUniform, Camera};
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::model_configuration::ModelConfiguration;
use crate::model::pipeline::{axis_lines, glyphs};
use smaa::*;
use std::rc::Rc;
use wgpu::util::DeviceExt;
use wgpu::{ Device, Queue, Surface, SurfaceConfiguration, TextureViewDescriptor};
use winit::dpi::PhysicalSize;
use winit::event::WindowEvent;
use winit::window::Window;

pub struct State {
    surface: wgpu::Surface,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
    window: Window,
    camera: Camera,
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

        let glyph_uniform_data: glyphs::glyph_instance_data::GlyphUniformData =
            glyphs::glyph_instance_data::GlyphUniformData {
                x: glyphs::glyph_instance_data::FieldUniformDescription {
                    field_type: 0,
                    field_min_value: 0.0,
                    field_max_value: 1.0,
                    _padding: 0,
                },

                y: glyphs::glyph_instance_data::FieldUniformDescription {
                    field_type: 0,
                    field_min_value: 0.0,
                    field_max_value: 1.0,
                    _padding: 0,
                },

                z: glyphs::glyph_instance_data::FieldUniformDescription {
                    field_type: 0,
                    field_min_value: 0.0,
                    field_max_value: 1.0,
                    _padding: 0,
                },

                min_x: -1.0,
                max_x: 1.0,
                min_y: -1.0,
                max_y: 1.0,
                min_z: -1.0,
                max_z: 1.0,
            };

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

    pub fn input(&mut self, event: &WindowEvent) -> bool {
        self.camera_controller.process_events(event)
    }

    pub fn move_camera(&mut self, direction: &str, on_or_off: bool) {
        if direction == "forward" {
            self.camera_controller.move_forward(on_or_off);
        } else if direction == "backward" {
            self.camera_controller.move_backward(on_or_off);
        } else if direction == "left" {
            self.camera_controller.move_left(on_or_off);
        } else if direction == "right" {
            self.camera_controller.move_right(on_or_off);
        }
        self.update();
    }
    pub fn update(&mut self) {
        self.camera_controller.update_camera(&mut self.camera);
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

        
        let smaa_frame = self.smaa_target.start_frame(&self.device, &self.queue, &view);
        let mut encoder = self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("Axis Lines Render Encoder"),
        });

        self.axis_lines_pipeline.run_pipeline(
            &mut encoder,
            &smaa_frame,
            &background_color,
        );

        let axis_commands = encoder.finish();

        let mut encoder = self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("Glyph Render Encoder"),
        });


        self.glyphs_pipeline.run_pipeline(
            &mut encoder,
            &smaa_frame,
        );

        let glyph_commands = encoder.finish();
        
        self.queue.submit([axis_commands, glyph_commands]);

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
            &Vec::new(),
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
    ) -> (Camera, wgpu::Buffer, CameraUniform, CameraController) {
        let camera = Camera::new(config);
        let mut camera_uniform = CameraUniform::new();
        camera_uniform.update_view_proj(&camera);

        let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Camera Buffer"),
            contents: bytemuck::cast_slice(&[camera_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        let camera_controller = CameraController::new(0.2);
        (camera, camera_buffer, camera_uniform, camera_controller)
    }
}
