use super::pipeline::pipeline_manager::PipeLines;
use super::pipeline::{basic_triangle, model_artifacts, simple_screen_clean};
use crate::camera::camera_controller;
use crate::camera::{uniform_buffer::CameraUniform, Camera, camera_controller::CameraController};
use wgpu::util::DeviceExt;
use wgpu::{Device, Queue, Surface, SurfaceConfiguration};
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
    pipelines: PipeLines,
    camera: Camera,
    camera_buffer: wgpu::Buffer,
    camera_uniform: CameraUniform,
    camera_controller: CameraController,
}

impl State {
    pub async fn new(window: Window) -> Self {
        let size = window.inner_size();

        let (surface, adapter) = Self::init_wgpu(&window).await;

        let (device, queue) = Self::init_device(&adapter).await;

        let config = Self::configure_surface(&surface, adapter, size, &device);

        let (camera, camera_buffer, camera_uniform, camera_controller) = Self::configure_camera(&config, &device);
        let pipelines = Self::build_pipelines(&device, &config, &camera_uniform);

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

    pub fn update(&mut self) {
        self.camera_controller.update_camera(&mut self.camera);
        self.camera_uniform.update_view_proj(&self.camera);
    }

    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        self.pipelines
            .run_pipeline("model_artifacts", &self.surface, &self.device, &self.queue, Some(&self.camera_uniform))
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

    fn build_pipelines(device: &Device, config: &SurfaceConfiguration, camera_uniform: &CameraUniform) -> PipeLines {
        let mut pipelines = PipeLines::new();

        let screen_clean = Box::new(simple_screen_clean::SimpleScreenClean::new(device));
        pipelines.add_pipeline("simple_screen_clean".to_string(), screen_clean);

        let basic_triangle = Box::new(basic_triangle::BasicTriangle::new(device, config));
        pipelines.add_pipeline("basic_triangle".to_string(), basic_triangle);

        let model_artifacts = Box::new(model_artifacts::ModelArtifacts::new(device, config, camera_uniform));
        pipelines.add_pipeline("model_artifacts".to_string(), model_artifacts);

        pipelines
    }

    fn configure_camera(config: &SurfaceConfiguration, device: &Device) -> (Camera, wgpu::Buffer, CameraUniform, CameraController) {
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