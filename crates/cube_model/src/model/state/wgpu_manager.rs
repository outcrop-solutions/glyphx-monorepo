use std::{cell::RefCell, rc::Rc, sync::Arc};
use wgpu::{
    Adapter, Backends, Device, DeviceDescriptor, Features, Instance, InstanceDescriptor, InstanceFlags, Limits,
    PowerPreference, Queue, RequestAdapterOptions, Surface, SurfaceConfiguration, TextureUsages,
};
use winit::{dpi::PhysicalSize, window::Window};


pub struct WgpuManager {
    window: Arc<Window>,
    size: PhysicalSize<u32>,
    surface: Surface<'static>,
    device: Rc<RefCell<Device>>,
    queue: Queue,
    config: SurfaceConfiguration,
}

impl WgpuManager {
    pub async fn new(window: Window) -> Self {
        let size = window.inner_size();
        let window_arc = Arc::new(window);
        let (surface, adapter) = Self::init_wgpu(&window_arc).await;
        let (device, queue) = Self::init_device(&adapter).await;

        let config = Self::configure_surface(&surface, adapter, size, &device);

        //Drop device into a RefCell here so we can pass it around to the pipelines, buffer
        //manager, etc
        let device = Rc::new(RefCell::new(device));
        WgpuManager {
            window : window_arc,
            size,
            surface,
            device,
            queue,
            config,
        }
    }

    pub fn window(&self) -> &Window {
        &self.window
    }

    pub fn size(&self) -> &PhysicalSize<u32> {
        &self.size
    }

    pub fn surface(&self) -> &Surface {
        &self.surface
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

    pub fn set_size(&mut self, size: PhysicalSize<u32>) {
        self.size = size;
        self.config.width = size.width;
        self.config.height = size.height;
        self.reconfigure_surface();
    }

    pub fn reconfigure_surface(&mut self) {
        let d = self.device();
        let d = d.borrow();
        self.surface.configure(&d, self.config());
    }

    async fn init_wgpu(arc_window: &Arc<Window>) -> (Surface<'static>, Adapter) {
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
        let surface =  instance.create_surface(arc_window.clone()).unwrap();

        // The adapter is a handle to a physical GPU device.
        let adapter = instance
            .request_adapter(&RequestAdapterOptions {
                power_preference: PowerPreference::default(),
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
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
        surface: &Surface,
        adapter: Adapter,
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

        let config = SurfaceConfiguration {
            usage: TextureUsages::RENDER_ATTACHMENT,
            format: surface_format,
            width: size.width,
            height: size.height,
            present_mode: surface_caps.present_modes[0],
            alpha_mode: surface_caps.alpha_modes[0],
            view_formats: vec![],
            desired_maximum_frame_latency: 2
        };
        //and apply it to our surface
        surface.configure(device, &config);
        config
    }
}
