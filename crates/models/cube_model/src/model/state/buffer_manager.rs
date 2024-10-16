use super::{
    CameraManager, CameraUniform, ColorTableUniform, DataManager, GlyphUniformData,
    GlyphUniformFlags, LightUniform, ModelConfiguration, WgpuManager,
};

use std::{cell::RefCell, rc::Rc};
use wgpu::{util::DeviceExt, Buffer, Device, SurfaceConfiguration};

type Color = [f32; 4];

pub struct BufferManager {
    wgpu_manager: Rc<RefCell<WgpuManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
    camera_uniform: CameraUniform,
    camera_buffer: Buffer,
    color_table_uniform: ColorTableUniform,
    color_table_buffer: Buffer,
    light_uniform: LightUniform,
    light_buffer: Buffer,
    glyph_uniform_data: GlyphUniformData,
    glyph_uniform_buffer: Buffer,
    model_origin: [f32; 3],
}

impl BufferManager {
    pub fn new(
        wgpu_manager: Rc<RefCell<WgpuManager>>,
        camera_manager: Rc<RefCell<CameraManager>>,
        model_configuration: &ModelConfiguration,
        data_manager: &DataManager,
    ) -> BufferManager {
        let cm = camera_manager.clone();
        let mut cm = cm.as_ref().borrow_mut();

        let wm = wgpu_manager.clone();
        let wm = wm.as_ref().borrow();

        let (glyph_uniform_data, model_origin, glyph_uniform_buffer) =
            Self::build_glyph_uniform_data(
                model_configuration,
                data_manager,
                &wm.device().borrow(),
            );

        let (camera_uniform, camera_buffer) = Self::configure_camera_impl(
            &mut cm,
            &glyph_uniform_data,
            wm.config(),
            &wm.device().as_ref().borrow(),
        );
        let (color_table_uniform, color_table_buffer) =
            Self::configure_color_table(model_configuration, &wm.device().borrow());
        let (light_uniform, light_buffer) =
            Self::configure_light(model_configuration, &wm.device().borrow());
        BufferManager {
            wgpu_manager,
            camera_manager,
            camera_uniform,
            camera_buffer,
            color_table_uniform,
            color_table_buffer,
            light_uniform,
            light_buffer,
            glyph_uniform_data,
            glyph_uniform_buffer,
            model_origin,
        }
    }

    fn configure_light(
        model_configuration: &ModelConfiguration,
        device: &Device,
    ) -> (LightUniform, Buffer) {
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
        (light_uniform, light_buffer)
    }

    fn configure_color_table(
        model_configuration: &ModelConfiguration,
        device: &Device,
    ) -> (ColorTableUniform, Buffer) {
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
        (color_table_uniform, color_table_buffer)
    }
    fn configure_camera_impl(
        camera_manager: &mut CameraManager,
        glyph_uniform_data: &GlyphUniformData,
        config: &SurfaceConfiguration,
        device: &Device,
    ) -> (CameraUniform, Buffer) {
        let camera_uniform =
            Self::build_camera_and_uniform_impl(camera_manager, glyph_uniform_data, config);

        let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Camera Buffer"),
            contents: bytemuck::cast_slice(&[camera_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        (camera_uniform, camera_buffer)
    }

    fn build_camera_and_uniform_impl(
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

    pub fn build_camera_and_uniform(&mut self) -> CameraUniform {
        let mut cm = self.camera_manager.as_ref().borrow_mut();
        let wm = self.wgpu_manager.as_ref().borrow();

        let camera_uniform =
            Self::build_camera_and_uniform_impl(&mut cm, &self.glyph_uniform_data, wm.config());
        self.camera_uniform = camera_uniform;
        self.camera_uniform
    }
    pub fn update_color_table(
        &mut self,
        x_axis_color: Color,
        y_axis_color: Color,
        z_axis_color: Color,
        background_color: Color,
        min_color: Color,
        max_color: Color,
    ) {
        self.color_table_uniform.set_x_axis_color(x_axis_color);
        self.color_table_uniform.set_y_axis_color(y_axis_color);
        self.color_table_uniform.set_z_axis_color(z_axis_color);
        self.color_table_uniform
            .set_background_color(background_color);
        self.color_table_uniform.update_colors(min_color, max_color);
    }
    pub fn update_light_uniform(&mut self, location: [f32; 3], color: [f32; 3], intensity: f32) {
        self.light_uniform.upate_position(location);
        self.light_uniform.upate_color(color);
        self.light_uniform.upate_intensity(intensity);
    }

    fn build_glyph_uniform_data(
        mc: &ModelConfiguration,
        data_manager: &DataManager,
        d: &Device,
    ) -> (GlyphUniformData, [f32; 3], Buffer) {
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
        let full_model_origin = [model_origin, model_origin, model_origin];

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
            max_interp_y: model_origin + y_size.clamp(0.0, 2.0),
            min_z: min_z as f32,
            max_z: max_z as f32,
            min_interp_z: -1.0 * x_z_half as f32,
            max_interp_z: x_z_half as f32,
            flags,
            x_z_offset,
            y_offset: mc.min_glyph_height,
            _padding: 0,
        };

        let glyph_uniform_buffer = d.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Glyph Uniform Buffer"),
            contents: bytemuck::cast_slice(&[glyph_uniform_data]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        (glyph_uniform_data, full_model_origin, glyph_uniform_buffer)
    }

    pub fn update_glyph_uniform_buffer(
        &mut self,
        config: &ModelConfiguration,
        glyph_selected: bool,
    ) {
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
        flags.glyph_selected = glyph_selected;
        let flags = flags.encode();
        uniform_data.flags = flags;

        self.glyph_uniform_data = uniform_data.clone();

        self.glyph_uniform_buffer = self
            .wgpu_manager
            .borrow()
            .device()
            .borrow()
            .create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("Glyph Uniform Buffer"),
                contents: bytemuck::cast_slice(&[self.glyph_uniform_data]),
                usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            });
    }
    pub fn update_glyph_uniform_y_offset(&mut self, y_offset: f32) {
        self.glyph_uniform_data.y_offset = y_offset;
    }

    pub fn camera_buffer(&self) -> &Buffer {
        &self.camera_buffer
    }

    //You may be wondering why this is not returning a borrow of the camera uniform.
    //it is because the camera uniform is owned by the camera manager and doing 
    //so will choke on the fact that cm goes out of scope when this function returns.
    pub fn camera_uniform(&self) -> CameraUniform {
        let cm = self.camera_manager.borrow();
        let camera_uniform = cm.get_camera_uniform();
        camera_uniform
    }

    pub fn color_table_buffer(&self) -> &Buffer {
        &self.color_table_buffer
    }

    pub fn color_table_uniform(&self) -> &ColorTableUniform {
        &self.color_table_uniform
    }

    pub fn light_buffer(&self) -> &Buffer {
        &self.light_buffer
    }

    pub fn light_uniform(&self) -> &LightUniform {
        &self.light_uniform
    }

    pub fn glyph_uniform_buffer(&self) -> &Buffer {
        &self.glyph_uniform_buffer
    }

    pub fn glyph_uniform_data(&self) -> &GlyphUniformData {
        &self.glyph_uniform_data
    }

    pub fn model_origin(&self) -> &[f32; 3] {
        &self.model_origin
    }
}
