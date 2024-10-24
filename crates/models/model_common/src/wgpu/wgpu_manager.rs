use std::{cell::RefCell, rc::Rc, sync::Arc};
use wgpu::{
    Adapter, Backends, Device, DeviceDescriptor, Features, Instance, InstanceDescriptor, Limits,
    PowerPreference, Queue, RequestAdapterOptions, Sampler, Surface, SurfaceConfiguration, Texture,
    TextureUsages, TextureView,
};
use winit::{dpi::PhysicalSize, window::Window};

pub struct WgpuManager {
    window: Option<Arc<Window>>,
    size: PhysicalSize<u32>,
    surface: Option<Surface<'static>>,
    device: Rc<RefCell<Device>>,
    queue: Queue,
    config: SurfaceConfiguration,
}

impl WgpuManager {
    pub const DEPTH_FORMAT: wgpu::TextureFormat = wgpu::TextureFormat::Depth32Float;
    pub async fn new(window: Option<Window>, width: u32, height: u32) -> Self {
        let size = winit::dpi::PhysicalSize::new(width, height);
        let window_arc = if window.is_some() {
            Some(Arc::new(window.unwrap()))
        } else {
            None
        };
        let (surface, adapter) = Self::init_wgpu(window_arc.clone()).await;
        let (device, queue) = Self::init_device(&adapter).await;

        let config = Self::configure_surface(&surface, adapter, size, &device);

        //Drop device into a RefCell here so we can pass it around to the pipelines, buffer
        //manager, etc
        let device = Rc::new(RefCell::new(device));
        WgpuManager {
            window: window_arc,
            size,
            surface,
            device,
            queue,
            config,
        }
    }

    pub fn window(&self) -> Option<Arc<Window>> {
        self.window.clone()
    }

    pub fn size(&self) -> &PhysicalSize<u32> {
        &self.size
    }

    pub fn surface(&self) -> &Surface {
        &self.surface.as_ref().unwrap()
    }

    pub fn device(&self) -> Rc<RefCell<Device>> {
        self.device.clone()
    }

    pub fn queue(&self) -> &Queue {
        &self.queue
    }

    pub fn config(&self) -> &SurfaceConfiguration {
        &self.config
    }
    pub fn get_config_size(&self) -> PhysicalSize<u32> {
        PhysicalSize::new(self.config.width, self.config.height)
    }

    pub fn set_size(&mut self, size: PhysicalSize<u32>) {
        self.size = size;
        self.config.width = size.width;
        self.config.height = size.height;
        self.reconfigure_surface();
    }

    pub fn resize_window(&mut self, width: u32, height: u32) {
        let _ = self
            .window.as_ref().unwrap()
            .request_inner_size(winit::dpi::LogicalSize::new(width, height));
    }

    pub fn reconfigure_surface(&mut self) {
        let d = self.device();
        let d = d.borrow();
        self.surface.as_ref().unwrap().configure(&d, self.config());
    }

    async fn init_wgpu(arc_window: Option<Arc<Window>>) -> (Option<Surface<'static>>, Adapter) {
        // The instance is a handle to our GPU api (WGPU)
        // Backends::all => Vulkan + Metal + DX12 + Browser WebGPU
        let instance = Instance::new(InstanceDescriptor {
            backends: Backends::all(),
            ..Default::default()
        });
        // The Surface is our connection to the window on which we are drawing.
        // # Safety
        //
        // The surface needs to live as long as the window that created it.
        // State owns the window so this should be safe.
        let surface = if arc_window.is_some() {
            let window = arc_window.as_ref().unwrap();
            let window = window.clone();
            Some(instance.create_surface(window).unwrap())
        } else {
            None
        };

        let compatible_surface = if surface.is_some() {
            Some(surface.as_ref().unwrap())
        } else {
            None
        };
        // The adapter is a handle to a physical GPU device.
        let adapter = instance
            .request_adapter(&RequestAdapterOptions {
                power_preference: PowerPreference::default(),
                compatible_surface,
                //If a window is not provided then we are running in a headless environment and
                //only need a software adapter
                force_fallback_adapter: if arc_window.is_none() { true } else {false},
            })
            .await
            .unwrap();
        (surface, adapter)
    }

    async fn init_device(adapter: &Adapter) -> (Device, Queue) {
        // The device is a logical GPU device pointing to the physical device identified by the adapter.
        // The queue a command queue for the device to execute.  We write our operation to the
        // queue to be rendered on the physical device for display on the surface
        let (device, queue) = adapter
            .request_device(
                &DeviceDescriptor {
                    required_features: Features::default(),
                    // WebGL doesn't support all of wgpu's features, so if
                    // we're building for the web we'll have to disable some.
                    required_limits: if cfg!(target_arch = "wasm32") {
                        Limits::downlevel_webgl2_defaults()
                    } else {
                        Limits::default()
                    },
                    label: None,
                    ..Default::default()
                },
                None, // Trace path
            )
            .await
            .unwrap();
        (device, queue)
    }

    fn configure_surface(
        surface: &Option<Surface<'static>>,
        adapter: Adapter,
        size: PhysicalSize<u32>,
        device: &Device,
    ) -> SurfaceConfiguration {
        // Get the capabilities of our surface

        if surface.is_some() {
            let surface = surface.as_ref().unwrap();
            let surface_caps = surface.get_capabilities(&adapter);
            // Shader code in this crate assumes an sRGB surface texture. Using a different
            // one will result all the colors coming out darker.

            let surface_format = surface_caps
                .formats
                .iter()
                .copied()
                .find(|f| f.is_srgb())
                .unwrap_or(surface_caps.formats[0]);

            let config = SurfaceConfiguration {
                usage: TextureUsages::RENDER_ATTACHMENT
                    | TextureUsages::COPY_SRC
                    | TextureUsages::COPY_DST,
                format: surface_format,
                width: size.width,
                height: size.height,
                present_mode: surface_caps.present_modes[0],
                alpha_mode: surface_caps.alpha_modes[0],
                view_formats: vec![],
                desired_maximum_frame_latency: 2,
            };
            //and apply it to our surface
            surface.configure(device, &config);
            config
        } else {
            SurfaceConfiguration {
                usage: TextureUsages::RENDER_ATTACHMENT
                    | TextureUsages::COPY_SRC
                    | TextureUsages::COPY_DST,
                format: wgpu::TextureFormat::Rgba8Unorm,
                width: size.width,
                height: size.height,
                present_mode: wgpu::PresentMode::Fifo,
                alpha_mode: wgpu::CompositeAlphaMode::Auto,
                view_formats: vec![],
                desired_maximum_frame_latency: 2,
            }
        }
    }

    pub fn create_depth_texture(&self, texture_name: &str) -> (Texture, TextureView, Sampler) {
        let d = self.device().clone();
        let d = d.borrow();
        let size = wgpu::Extent3d {
            width: self.config.width,
            height: self.config.height,
            depth_or_array_layers: 1,
        };
        let description = wgpu::TextureDescriptor {
            label: Some(texture_name),
            size,
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: Self::DEPTH_FORMAT,
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING,
            view_formats: &[],
        };

        let texture = d.create_texture(&description);
        let view = texture.create_view(&wgpu::TextureViewDescriptor::default());

        let sampler = d.create_sampler(&wgpu::SamplerDescriptor {
            address_mode_u: wgpu::AddressMode::ClampToEdge,
            address_mode_v: wgpu::AddressMode::ClampToEdge,
            address_mode_w: wgpu::AddressMode::ClampToEdge,
            mag_filter: wgpu::FilterMode::Linear,
            min_filter: wgpu::FilterMode::Linear,
            mipmap_filter: wgpu::FilterMode::Nearest,
            compare: Some(wgpu::CompareFunction::LessEqual),
            lod_min_clamp: 0.0,
            lod_max_clamp: 100.0,
            ..Default::default()
        });
        (texture, view, sampler)
    }
}
