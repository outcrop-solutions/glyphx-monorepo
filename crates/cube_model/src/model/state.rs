use crate::model::pipeline::pipeline_manager::PipeLines;
use crate::model::pipeline::{ model_artifacts, axis_lines};
use crate::camera::{camera_controller::CameraController, uniform_buffer::CameraUniform, Camera};
use crate::assets::color::{ColorTable, build_color_table, Color};
use crate::model::model_configuration::ModelConfiguration;
use crate::model::color_table_uniform::ColorTableUniform;
use wgpu::util::DeviceExt;
use wgpu::{Device, Queue, Surface, SurfaceConfiguration};
use winit::dpi::PhysicalSize;
use winit::event::WindowEvent;
use winit::window::Window;
use std::sync::Arc;
use smaa::*;
use std::rc::Rc;
pub struct State {
    surface: wgpu::Surface,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
    window: Window,
    pipelines: PipeLines,
    camera: Camera,
    camera_buffer: wgpu::Buffer,
    camera_uniform: CameraUniform,
    camera_controller: CameraController,
    color_table_uniform: ColorTableUniform,
    model_configuration: Rc<ModelConfiguration>,
    smaa_target: SmaaTarget,
}

impl State {
    pub async fn new(window: Window, model_configuration: Rc<ModelConfiguration>) -> Self {
        let size = window.inner_size();

        let (surface, adapter) = Self::init_wgpu(&window).await;

        let (device, queue) = Self::init_device(&adapter).await;

        let config = Self::configure_surface(&surface, adapter, size, &device);

        let (camera, camera_buffer, camera_uniform, camera_controller) =
            Self::configure_camera(&config, &device);

        let color_table_uniform = ColorTableUniform::new(model_configuration.min_color, model_configuration.max_color, model_configuration.x_axis_color, model_configuration.y_axis_color, model_configuration.z_axis_color, model_configuration.background_color);

        let model_configuration = model_configuration.clone();

        let pipelines = Self::build_pipelines(&device, &config, &camera_uniform, &color_table_uniform, &model_configuration);

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
            pipelines,
            camera,
            camera_buffer,
            camera_uniform,
            camera_controller,
            model_configuration,
            color_table_uniform,
            smaa_target,
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
        self.pipelines.run_pipeline(
            "axis_lines",
            &self.surface,
            &self.device,
            &self.queue,
            Some(&self.camera_uniform),
            Some(&self.color_table_uniform),
            Some(&mut self.smaa_target),
        )
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
        camera_uniform: &CameraUniform,
        color_table_uniform: &ColorTableUniform,
        model_configuration: &Rc<ModelConfiguration>,
    ) -> PipeLines {
        let mut pipelines = PipeLines::new();


        let model_artifacts = Arc::new(model_artifacts::ModelArtifacts::new(
            device,
            config,
            camera_uniform,
            color_table_uniform

        ));
        pipelines.add_pipeline("model_artifacts".to_string(), model_artifacts);

        let axis_lines = Arc::new(axis_lines::AxisLines::new(
            device,
            config,
            camera_uniform,
            color_table_uniform,
            model_configuration.clone(),

        ));
        pipelines.add_pipeline("axis_lines".to_string(), axis_lines);

        pipelines
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
