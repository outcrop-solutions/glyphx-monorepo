use bytemuck::cast_slice;

use crate::model::{
    model_configuration,
    pipeline::{glyphs::ranked_glyph_data::RankedGlyphIterator, hit_detection},
};

use super::{
    AxisLineDirection, AxisLines,
    BufferManager, DataManager, GlyphData, GlyphVertexData, Glyphs, HitDetection,
    ModelConfiguration, Query, Rank, RankDirection, SelectedGlyph, WgpuManager,
};

use smaa::*;
use std::{cell::RefCell, rc::Rc};
use wgpu::{
    util::{BufferInitDescriptor, DeviceExt},
    Buffer, BufferAddress, BufferDescriptor, BufferUsages, Color, CommandBuffer,
    CommandEncoderDescriptor, Device, Extent3d, LoadOp, Operations, Origin3d,
    RenderPassColorAttachment, SurfaceConfiguration, Texture, TextureAspect,
    TextureDescriptor, TextureDimension, TextureFormat, TextureUsages, TextureView,
    TextureViewDescriptor, COPY_BYTES_PER_ROW_ALIGNMENT,
};

pub struct PipelineManager {
    wgpu_manager: Rc<RefCell<WgpuManager>>,
    buffer_manager: Rc<RefCell<BufferManager>>,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    data_manager: Rc<RefCell<DataManager>>,
    x_axis_line: AxisLines,
    y_axis_line: AxisLines,
    z_axis_line: AxisLines,
    glyphs: Glyphs,
    glyph_data: GlyphData,
    hit_detection: HitDetection,
}

impl PipelineManager {
    pub fn new(
        wgpu_manager: Rc<RefCell<WgpuManager>>,
        buffer_manager: Rc<RefCell<BufferManager>>,
        model_configuration: Rc<RefCell<ModelConfiguration>>,
        data_manager: Rc<RefCell<DataManager>>,
    ) -> Self {
        let mc = model_configuration.clone();
        let mc = mc.borrow();

        let wm = wgpu_manager.clone();
        let wm = wm.borrow();

        let bm = buffer_manager.clone();
        let bm = bm.borrow();

        let x_axis_line = AxisLines::new(
            wm.device(),
            wm.config(),
            bm.camera_buffer(),
            &bm.camera_uniform(),
            bm.color_table_buffer(),
            bm.color_table_uniform(),
            bm.light_buffer(),
            bm.light_uniform(),
            model_configuration.clone(),
            AxisLineDirection::X,
            mc.model_origin[0],
            bm.glyph_uniform_data().min_interp_x,
            bm.glyph_uniform_data().max_interp_x,
        );

        let y_axis_line = AxisLines::new(
            wm.device(),
            wm.config(),
            bm.camera_buffer(),
            &bm.camera_uniform(),
            bm.color_table_buffer(),
            bm.color_table_uniform(),
            bm.light_buffer(),
            bm.light_uniform(),
            model_configuration.clone(),
            AxisLineDirection::Y,
            mc.model_origin[1],
            bm.glyph_uniform_data().min_interp_y,
            bm.glyph_uniform_data().max_interp_y,
        );

        let z_axis_line = AxisLines::new(
            wm.device(),
            wm.config(),
            bm.camera_buffer(),
            &bm.camera_uniform(),
            bm.color_table_buffer(),
            bm.color_table_uniform(),
            bm.light_buffer(),
            bm.light_uniform(),
            model_configuration.clone(),
            AxisLineDirection::Z,
            mc.model_origin[2],
            bm.glyph_uniform_data().min_interp_z,
            bm.glyph_uniform_data().max_interp_z,
        );

        let glyphs = Glyphs::new(
            wm.device(),
            wm.config(),
            bm.camera_buffer(),
            &bm.camera_uniform(),
            bm.color_table_buffer(),
            bm.color_table_uniform(),
            bm.light_buffer(),
            bm.light_uniform(),
            bm.glyph_uniform_buffer(),
            bm.glyph_uniform_data(),
        );

        let glyph_data = GlyphData::new(
            bm.glyph_uniform_buffer(),
            wm.device(),
            model_configuration.clone(),
            data_manager.clone(),
        );

        let hit_detection = HitDetection::new(
            wm.device(),
            wm.config(),
            bm.camera_buffer(),
            &bm.camera_uniform(),
        );
        Self {
            wgpu_manager,
            buffer_manager,
            model_configuration,
            data_manager,
            x_axis_line,
            y_axis_line,
            z_axis_line,
            glyphs,
            glyph_data,
            hit_detection,
        }
    }

    pub fn x_axis_line(&self) -> &AxisLines {
        &self.x_axis_line
    }

    pub fn y_axis_line(&self) -> &AxisLines {
        &self.y_axis_line
    }

    pub fn z_axis_line(&self) -> &AxisLines {
        &self.z_axis_line
    }

    pub fn glyphs(&self) -> &Glyphs {
        &self.glyphs
    }

    pub fn glyph_data(&self) -> &GlyphData {
        &self.glyph_data
    }

    pub fn hit_detection(&self) -> &HitDetection {
        &self.hit_detection
    }

    pub fn upate_glyph_data_verticies(&mut self, model_filter: &Query) {
        self.glyph_data.update_vertices(
            self.buffer_manager.borrow().glyph_uniform_buffer(),
            model_filter,
        )
    }

    pub fn set_axis_start(&mut self, axis_direction: AxisLineDirection, origin: f32) {
        match axis_direction {
            AxisLineDirection::X => {
                self.x_axis_line.set_axis_start(origin);
            }
            AxisLineDirection::Y => {
                self.y_axis_line.set_axis_start(origin);
            }
            AxisLineDirection::Z => {
                self.z_axis_line.set_axis_start(origin);
            }
        };
    }

    pub fn update_vertex_buffer(&mut self, axis_direction: AxisLineDirection) {
        match axis_direction {
            AxisLineDirection::X => {
                self.x_axis_line.update_vertex_buffer();
            }
            AxisLineDirection::Y => {
                self.y_axis_line.update_vertex_buffer();
            }
            AxisLineDirection::Z => {
                self.z_axis_line.update_vertex_buffer();
            }
        }
    }

    pub fn clear_screen(
        &self,
        background_color: [f32; 4],
        texture_view: &TextureView,
        commands: &mut Vec<CommandBuffer>,
    ) {
        let wm = self.wgpu_manager.borrow();
        let device = wm.device();
        let device = device.borrow();
        let mut encoder = device.create_command_encoder(&CommandEncoderDescriptor {
            label: Some("Clear Screen Encoder"),
        });

        let color = Color {
            r: background_color[0] as f64,
            g: background_color[1] as f64,
            b: background_color[2] as f64,
            a: background_color[3] as f64,
        };

        let render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(RenderPassColorAttachment {
                view: texture_view,
                resolve_target: None,
                ops: Operations {
                    load: LoadOp::Clear(color),
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });
        drop(render_pass);

        commands.push(encoder.finish());
    }
    pub fn run_glyph_pipeline(
        &self,
        selected_glyphs: &Vec<SelectedGlyph>,
        rank: Rank,
        rank_direction: RankDirection,
        smaa_frame: &SmaaFrame,
        commands: &mut Vec<CommandBuffer>,
    ) {
        let wm = self.wgpu_manager.borrow();
        let device = wm.device();
        let device = device.borrow();

        let dm = self.data_manager.as_ref().borrow();
        let ranked_glyph_data = dm.get_glyphs().unwrap();
        let iter = ranked_glyph_data.iter(rank, rank_direction);
        for rank in iter {
            let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("glyph Encoder"),
            });
            let clean_rank = rank
                .iter()
                .map(|rgd| {
                    let rgd = rgd.borrow();
                    let flags = if selected_glyphs.len() > 0
                        && selected_glyphs.iter().any(|sg| sg.glyph_id == rgd.glyph_id)
                    {
                        1
                    } else if selected_glyphs.len() > 0 {
                        0
                    } else {
                        1
                    };
                    GlyphVertexData {
                        glyph_id: rgd.glyph_id,
                        position: rgd.position,
                        normal: rgd.normal,
                        color: rgd.color,
                        x_rank: rgd.x_rank,
                        z_rank: rgd.z_rank,
                        flags,
                    }
                })
                .collect::<Vec<GlyphVertexData>>();

            let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("Vertex Buffer"),
                contents: cast_slice(&clean_rank),
                usage: wgpu::BufferUsages::VERTEX,
            });
            self.glyphs
                .run_pipeline(&mut encoder, smaa_frame, &vertex_buffer, rank.len() as u32);
            commands.push(encoder.finish());
        }
    }

    pub fn run_axis_pipeline(
        &self,
        axis_direction: AxisLineDirection,
        smaa_frame: &SmaaFrame,
        commands: &mut Vec<CommandBuffer>,
    ) {
        let wm = self.wgpu_manager.borrow();
        let device = wm.device();
        let device = device.borrow();
        let (pipeline, pipeline_name) = match axis_direction {
            AxisLineDirection::X => (&self.x_axis_line, "x_axis_line"),
            AxisLineDirection::Y => (&self.y_axis_line, "y_axis_line"),
            AxisLineDirection::Z => (&self.z_axis_line, "z_axis_line"),
        };

        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some(format!("{}_encoder", pipeline_name).as_str()),
        });
        pipeline.run_pipeline(&mut encoder, smaa_frame);

        commands.push(encoder.finish());
    }

    pub fn run_glyph_data_pipeline(&self) -> Buffer {
        let wm = self.wgpu_manager.borrow();
        let device = wm.device();
        let device = device.borrow();

        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("Glyph Data Pipeline"),
        });
        let output_buffer = self.glyph_data.run_pipeline(&mut encoder);
        wm.queue().submit([encoder.finish()]);

        output_buffer
    }

    pub fn run_hit_detection_pipeline(
        &self,
        rank: Rank,
        rank_direction: RankDirection,
    ) -> (Buffer, u32) {
        let wm = self.wgpu_manager.borrow();
        let d = wm.device();
        let d = d.borrow();
        let config = wm.config();

        let (texture, texture_view) = Self::get_hit_detection_texture(config, &d);

        let (output_buffer, bytes_per_row) = Self::get_hit_detection_output_buffer(config, &d);

        self.wgpu_manager.borrow().queue().write_buffer(
            &self.buffer_manager.borrow().camera_buffer(),
            0,
            cast_slice(&[self.buffer_manager.borrow().camera_uniform()]),
        );

        let mut commands = Vec::new();

        self.clear_screen([1.0, 1.0, 1.0, 1.0], &texture_view, &mut commands);

        Self::encode_hit_detection_pipeline(
            &self.hit_detection,
            &d,
            &texture_view,
            &self.data_manager.borrow(),
            rank,
            rank_direction,
            &mut commands,
        );

        Self::encode_hit_detection_copy_output_buffer(
            &d,
            &texture,
            &output_buffer,
            bytes_per_row,
            &mut commands,
        );
        wm.queue().submit(commands);
        (output_buffer, bytes_per_row)
    }

    fn encode_hit_detection_pipeline(
        pipeline: &HitDetection,
        device: &Device,
        texture_view: &TextureView,
        data_manager: &DataManager,
        rank: Rank,
        rank_direction: RankDirection,
        commands: &mut Vec<CommandBuffer>,
    ) {
        let ranked_glyph_data = data_manager.get_glyphs();

        if ranked_glyph_data.is_some() {
            let ranked_glyph_data = ranked_glyph_data.unwrap();

            let rank_iteratror = ranked_glyph_data.iter(rank, rank_direction);

            for rank in rank_iteratror {
                let mut encoder = device.create_command_encoder(&CommandEncoderDescriptor {
                    label: Some("Hit Detection Encoder"),
                });
                let clean_rank = rank
                    .iter()
                    .map(|rgd| {
                        let rgd = rgd.borrow();
                        GlyphVertexData {
                            glyph_id: rgd.glyph_id,
                            position: rgd.position,
                            normal: rgd.normal,
                            color: rgd.color,
                            x_rank: rgd.x_rank,
                            z_rank: rgd.z_rank,
                            flags: rgd.flags,
                        }
                    })
                    .collect::<Vec<GlyphVertexData>>();
                let vertex_buffer = device.create_buffer_init(&BufferInitDescriptor {
                    label: Some("Instance Buffer"),
                    contents: cast_slice(&clean_rank),
                    usage: BufferUsages::VERTEX,
                });
                pipeline.run_pipeline(
                    &mut encoder,
                    &texture_view,
                    &vertex_buffer,
                    rank.len() as u32,
                );
                //pipeline.run_pipeline(&mut encoder, smaa_frame, &vertex_buffer, rank.len() as u32);
                commands.push(encoder.finish());
            }
        }
    }
    fn encode_hit_detection_copy_output_buffer(
        device: &Device,
        picking_texture: &Texture,
        output_buffer: &Buffer,
        bytes_per_row: u32,
        commands: &mut Vec<CommandBuffer>,
    ) {
        let mut encoder = device.create_command_encoder(&CommandEncoderDescriptor {
            label: Some("Copy Buffer Encoder"),
        });

        encoder.copy_texture_to_buffer(
            wgpu::ImageCopyTexture {
                texture: picking_texture,
                mip_level: 0,
                origin: Origin3d::ZERO,
                aspect: TextureAspect::All,
            },
            wgpu::ImageCopyBuffer {
                buffer: output_buffer,
                layout: wgpu::ImageDataLayout {
                    offset: 0,
                    bytes_per_row: Some(bytes_per_row),
                    rows_per_image: None,
                },
            },
            picking_texture.size(),
        );
        commands.push(encoder.finish())
    }
    fn get_hit_detection_texture(
        config: &SurfaceConfiguration,
        d: &Device,
    ) -> (Texture, TextureView) {
        let picking_texture_desc = TextureDescriptor {
            label: Some("Picking Texture"),
            size: Extent3d {
                width: config.width,
                height: config.height,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: TextureDimension::D2,
            format: TextureFormat::Rgba8Unorm, // Adjust as needed
            usage: TextureUsages::RENDER_ATTACHMENT | TextureUsages::COPY_SRC,
            view_formats: &[],
        };

        let picking_texture = d.create_texture(&picking_texture_desc);
        let picking_texture_view = picking_texture.create_view(&TextureViewDescriptor::default());
        (picking_texture, picking_texture_view)
    }
    fn get_hit_detection_output_buffer(
        config: &SurfaceConfiguration,
        device: &Device,
    ) -> (Buffer, u32) {
        let align = COPY_BYTES_PER_ROW_ALIGNMENT;
        let padded_bytes_per_row = ((4 * config.width + align - 1) / align) * align;
        // Round up to nearest multiple of align
        let buffer_size = (config.height * padded_bytes_per_row) as BufferAddress;
        // Assuming Rgba8Unorm format
        let output_buffer = device.create_buffer(&BufferDescriptor {
            label: Some("Output Buffer"),
            size: buffer_size,
            usage: BufferUsages::COPY_DST | BufferUsages::MAP_READ,
            mapped_at_creation: false,
        });
        (output_buffer, padded_bytes_per_row)
    }
}
