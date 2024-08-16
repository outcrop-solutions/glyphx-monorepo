use crate::camera::uniform_buffer::CameraUniform;
use crate::light::light_uniform;
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::state::ModelConfiguration;
use crate::light::light_uniform::LightUniform;
    
use super::CameraManager;
use super::GlyphUniformData;
use super::WgpuManager;

use std::borrow::BorrowMut;
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::util::DeviceExt;
use wgpu::Buffer;
use wgpu::Device;
use wgpu::SurfaceConfiguration;

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
}

impl BufferManager {
    pub fn new(
        wgpu_manager: Rc<RefCell<WgpuManager>>,
        camera_manager: Rc<RefCell<CameraManager>>,
        glyph_uniform_data: &GlyphUniformData,
        model_configuration: &ModelConfiguration,
    ) -> BufferManager {
        let cm = camera_manager.clone();
        let mut cm = cm.as_ref().borrow_mut();

        let wm = wgpu_manager.clone();
        let wm = wm.as_ref().borrow();

        let (camera_uniform, camera_buffer) = Self::configure_camera_impl(
            &mut cm,
            glyph_uniform_data,
            wm.config(),
            &wm.device().as_ref().borrow(),
        );
        let (color_table_uniform, color_table_buffer) =
            Self::configure_color_table(model_configuration, &wm.device().borrow());
        let (light_uniform, light_buffer) = Self::configure_light(model_configuration, &wm.device().borrow());
        BufferManager {
            wgpu_manager,
            camera_manager,
            camera_uniform,
            camera_buffer,
            color_table_uniform,
            color_table_buffer,
            light_uniform,
            light_buffer,
        }
    }
    
    fn configure_light(model_configuration: &ModelConfiguration, device: &Device) -> (LightUniform, Buffer) {
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

    pub fn configure_camera(
        &mut self,
        glyph_uniform_data: &GlyphUniformData,
    ) -> (&Buffer, &CameraUniform) {
        let (camera_uniform, camera_buffer) = Self::configure_camera_impl(
            &mut self.camera_manager.as_ref().borrow_mut(),
            glyph_uniform_data,
            self.wgpu_manager.borrow().config(),
            &self.wgpu_manager.borrow().device().borrow(),
        );
        self.camera_uniform = camera_uniform;
        self.camera_buffer = camera_buffer;

        (&self.camera_buffer, &self.camera_uniform)
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

    pub fn build_camera_and_uniform(
        &mut self,
        glyph_uniform_data: &GlyphUniformData,
    ) -> CameraUniform {
        let mut cm = self.camera_manager.as_ref().try_borrow_mut();
        if cm.is_err() {
            let i = 0;
        }
        let mut cm = cm.unwrap();
        let wm = self.wgpu_manager.as_ref().borrow();

        let camera_uniform =
            Self::build_camera_and_uniform_impl(&mut cm, glyph_uniform_data, wm.config());
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
    pub fn update_light_uniform(&mut self, location:[f32;3], color: [f32;3], intensity:f32) {
        self.light_uniform.upate_position(location);
        self.light_uniform.upate_color(location);
        self.light_uniform.upate_intensity(intensity);
    }

    pub fn camera_buffer(&self) -> &Buffer {
        &self.camera_buffer
    }
    pub fn camera_uniform(&self) -> &CameraUniform {
        &self.camera_uniform
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
}
