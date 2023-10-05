use crate::camera::{
    camera_controller::CameraController, orbit_camera::OrbitCamera, uniform_buffer::CameraUniform,
};
use crate::light::light_uniform::LightUniform;
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::model_configuration::ModelConfiguration;
use crate::model::pipeline::glyphs::glyph_instance_data::GlyphInstanceData;
use crate::model::pipeline::glyphs::ranked_glyph_data::{Rank, RankDirection, RankedGlyphData};
use crate::model::pipeline::{axis_lines, glyphs, PipelineRunner};
use smaa::*;
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

struct Pipelines {
    x_axis_line: axis_lines::AxisLines,
    y_axis_line: axis_lines::AxisLines,
    z_axis_line: axis_lines::AxisLines,
    glyphs: glyphs::Glyphs,
}

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
    light_uniform: LightUniform,
    light_buffer: wgpu::Buffer,
    model_configuration: Rc<ModelConfiguration>,
    smaa_target: SmaaTarget,
    glyph_uniform_data: glyphs::glyph_instance_data::GlyphUniformData,
    glyph_uniform_buffer: wgpu::Buffer,
    ranked_glyph_data: Rc<RankedGlyphData>,
    rank: Rank,
    rank_direction: RankDirection,
    pipelines: Pipelines,
    z_order: usize,
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

        let light_uniform = LightUniform::new(
            model_configuration.light_location,
            [
                model_configuration.light_color[0] / 255.0,
                model_configuration.light_color[1] / 255.0,
                model_configuration.light_color[2] / 255.0,
            ],
            model_configuration.light_intensity,
        );

        let light_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Light Buffer"),
            contents: bytemuck::cast_slice(&[light_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        let model_configuration = model_configuration.clone();

        let glyph_uniform_data = Self::build_glyph_uniform_data(&model_configuration);

        let ranked_glyph_data = Self::build_instance_data();

        let glyph_uniform_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Glyph Uniform Buffer"),
            contents: bytemuck::cast_slice(&[glyph_uniform_data]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        let pipelines = Self::build_pipelines(
            &device,
            &config,
            &camera_buffer,
            &camera_uniform,
            &color_table_buffer,
            &color_table_uniform,
            &light_buffer,
            &light_uniform,
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
            ranked_glyph_data,
            rank: Rank::Z,
            rank_direction: RankDirection::Ascending,
            pipelines,
            light_buffer,
            light_uniform,
            z_order: 0,
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
        let camera_result = self
            .camera_controller
            .process_events(event, &mut self.camera);
        if camera_result {
            self.update_z_order();
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
            _ => (),
        };
    }
    pub fn update(&mut self) {
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
        let mut commands = Vec::new();
        commands.push(encoder.finish());
        let mut i: usize = 0;
        let string_order = Z_ORDERS[self.z_order];
        for name in string_order {
            //Glyphs has it's own logic to render in rank order so we can't really use the pipeline
            //manager trait to render it.  So, we will handle it directly.
            if name == "glyphs" {
                Self::run_glyphs_pipeline(
                    &self.device,
                    &smaa_frame,
                    &self.pipelines.glyphs,
                    self.rank,
                    self.rank_direction,
                    &self.ranked_glyph_data,
                    &name,
                    &mut commands,
                );
            } else {
                let pipeline = match name {
                    "x-axis-line" => &self.pipelines.x_axis_line,
                    "y-axis-line" => &self.pipelines.y_axis_line,
                    "z-axis-line" => &self.pipelines.z_axis_line,
                    _ => panic!("Unknown pipeline name"),
                };
                commands.push(Self::run_axis_pipeline(
                    &self.device,
                    &smaa_frame,
                    pipeline,
                    &name,
                ));
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
            pipeline.run_pipeline(&mut encoder, smaa_frame, &instance_buffer, rank.len() as u32);
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

    fn build_instance_data() -> Rc<RankedGlyphData> {
        // Rc::new (vec![
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
        // ])
        let mut ranked_glyph_data = RankedGlyphData::new(17, 12);
        let mut rng = rand::thread_rng();
        let mut x = 0.0;
        let mut z = 0.0;
        let mut count = 0;
        while x < 17.0 {
            while z < 12.0 {
                let random_number: f32 = rng.gen_range(0.0..=9.0);
                let _ = ranked_glyph_data.add(
                    x as usize,
                    z as usize,
                    GlyphInstanceData {
                        glyph_id: count,
                        x_value: x,
                        y_value: random_number,
                        z_value: z,
                        glyph_selected: 0,
                    },
                );
                z += 1.0;
                count += 1;
            }
            z = 0.0;
            x += 1.0;
        }
        Rc::new(ranked_glyph_data)
    }

    fn build_pipelines(
        device: &Device,
        config: &SurfaceConfiguration,
        camera_buffer: &wgpu::Buffer,
        camera_uniform: &CameraUniform,
        color_table_buffer: &wgpu::Buffer,
        color_table_uniform: &ColorTableUniform,
        light_buffer: &wgpu::Buffer,
        light_uniform: &LightUniform,
        model_configuration: &Rc<ModelConfiguration>,
        glyph_uniform_data: &glyphs::glyph_instance_data::GlyphUniformData,
        glyph_uniform_buffer: &wgpu::Buffer,
    ) -> Pipelines {
        let x_axis_line = axis_lines::AxisLines::new(
            device,
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            model_configuration.clone(),
            axis_lines::AxisLineDirection::X,
            model_configuration.model_origin[0],
        );

        let y_axis_line = axis_lines::AxisLines::new(
            device,
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            model_configuration.clone(),
            axis_lines::AxisLineDirection::Y,
            model_configuration.model_origin[1],
        );

        let z_axis_line = axis_lines::AxisLines::new(
            device,
            config,
            camera_buffer,
            camera_uniform,
            color_table_buffer,
            color_table_uniform,
            light_buffer,
            light_uniform,
            model_configuration.clone(),
            axis_lines::AxisLineDirection::Z,
            model_configuration.model_origin[2],
        );

        let glyphs = glyphs::Glyphs::new(
            glyph_uniform_data,
            glyph_uniform_buffer,
            device,
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
    ) -> (OrbitCamera, wgpu::Buffer, CameraUniform, CameraController) {
        //{ distance: 4.079997, pitch: 0.420797, yaw: -39.125065, eye: Vector3 { x: -3.6850765, y: 1.66663, z: 0.537523 }, target: Vector3 { x: 0.0, y: 0.0, z: 0.0 }, up: Vector3 { x: 0.0, y: 1.0, z: 0.0 }, bounds: OrbitCameraBounds { min_distance: Some(1.1), max_distance: None, min_pitch: -1.5707963, max_pitch: 1.5707963, min_yaw: None, max_yaw: None }, aspect: 1.5, fovy: 1.5707964, znear: 0.1, zfar: 1000.0 }
        // let mut camera = OrbitCamera::new(
        //     4.07,
        //     0.42,
        //     -32.12,
        //     Vec3::new(0.0, 0.0, 0.0),
        //     config.width as f32 / config.height as f32,
        // );
        let mut camera = OrbitCamera::new(
            11.0,
            0.0,
            0.0,
            Vec3::new(0.0, 0.0, 0.0),
            config.width as f32 / config.height as f32,
        );
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

        let x_z_offset = radius + model_configuration.glyph_offset;
        let glyph_uniform_data: glyphs::glyph_instance_data::GlyphUniformData =
            glyphs::glyph_instance_data::GlyphUniformData {
                min_x: 0.0,
                max_x: 17.0,
                min_interp_x: -5.0,
                max_interp_x: 5.0,

                min_y: 0.0,
                max_y: 9.0,
                min_interp_y: -5.0,
                max_interp_y: 6.0,

                min_z: 0.0,
                max_z: 12.0,
                min_interp_z: -5.0,
                max_interp_z: 5.0,

                x_z_offset,
                y_offset: model_configuration.min_glyph_height,
                _padding: [0u32; 2],
            };
        glyph_uniform_data
    }
    ///We call this wheniver the camera is moved so that we can recalulate
    ///the z order of the axis lines and glyphs in response.
    //TODO: This is 100% hacked together and needs someone with a better
    //grasp of the geometry to see if we can find the corerct algorithm
    //to calculate the Z order so that the grid lines do not overwrite the
    //glyphs and vice versa.
    pub fn calculate_rotation_change(
        width: f32,
        height: f32,
        cube_diameter: f32,
        yaw: f32,
        distance: f32,
    ) -> f32 {
        let afov_x = 2.0 * ((width as f32) / 2.0).atan2(distance);
        let afov_y = 2.0 * ((height as f32) / 2.0).atan2(distance);
        let max_yaw_change = afov_x / 2.0; // or use afov_y if you're considering vertical rotation
        let max_distance = cube_diameter * 10.0; // Maximum distance from scene center
                                                 // Calculate maximum yaw change for one full turn
        let max_yaw_full_turn = 2.0 * std::f32::consts::PI;
        let angle_per_distance = max_yaw_change / max_distance;

        let angular_rotation = distance * angle_per_distance;
        let calculated_angular_rotation = (yaw + angular_rotation) % max_yaw_full_turn;
        let max_angular_rotation = max_yaw_full_turn + angular_rotation;

        if calculated_angular_rotation < 0.0 {
            calculated_angular_rotation + max_angular_rotation
        } else {
            calculated_angular_rotation
        }
    }

    pub fn update_z_order(&mut self) {
        //TODO: This may need to be cleaned up a bit since cubes may not be square in the future.
        let cube_diameter = self.model_configuration.grid_cylinder_length
            + self.model_configuration.grid_cone_length;
        let rotation_angle = Self::calculate_rotation_change(
            cube_diameter, //self.config.width as f32,
            cube_diameter, //self.config.height as f32,
            cube_diameter,
            self.camera.yaw,
            self.camera.distance,
        );

        let z_order_index = if self.camera.pitch <= -2.0 || self.camera.pitch >= 1.0 {
            self.rank = Rank::Z;
            self.rank_direction = RankDirection::Ascending;
            0
        } else if rotation_angle >= 1.9727829 && rotation_angle < 3.6219294 {
            self.rank = Rank::Z;
            self.rank_direction = RankDirection::Descending;
            1 //-- right or back, z(green) is covered.
        } else if rotation_angle >= 3.6219294 && rotation_angle < 4.2965374 {
            self.rank = Rank::X;
            self.rank_direction = RankDirection::Ascending;
            2 //-- back all three axis lines are visible.

        } else if rotation_angle >= 4.2965374 && rotation_angle < 5.997787 {
            self.rank = Rank::X;
            self.rank_direction = RankDirection::Descending;
            3 //-- left or back, x(red) is covered.

        } else {
            self.rank = Rank::Z;
            self.rank_direction = RankDirection::Ascending;
            0 //-- normal glyphs last
        };
        self.z_order = z_order_index;
    }
}
