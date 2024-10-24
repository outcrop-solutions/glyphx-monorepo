use crate::model::{
    data::InstanceOutput,   filtering::Query, managers::DataManager, model_configuration::ModelConfiguration,

};

use bytemuck::{Pod, Zeroable};
use model_common::{create_rectangular_prism, ShapeVertex, VertexData};
use std::{cell::RefCell, rc::Rc};
use wgpu::{
    util::{BufferInitDescriptor, DeviceExt},
    BindGroup, BindGroupDescriptor, BindGroupEntry, Buffer, BufferDescriptor, BufferUsages,
    CommandEncoder, ComputePassDescriptor, ComputePipeline, ComputePipelineDescriptor, Device,
    PipelineCompilationOptions, ShaderModule,
};

pub struct GlyphData {
    device: Rc<RefCell<Device>>,
    compute_pipeline: ComputePipeline,
    vertex_buffer: Buffer,
    vertex_bind_group: BindGroup,
    vertex_count: usize,
    instance_buffer: Buffer,
    instance_bind_group: BindGroup,
    instance_count: usize,
    output_buffer: Buffer,
    output_bind_group: BindGroup,
    output_size: usize,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    glyph_uniform_bind_group: BindGroup,
    data_manager: Rc<RefCell<DataManager>>,
    shader: ShaderModule,
}

impl GlyphData {
    pub fn new(
        glyph_uniform_buffer: &Buffer,
        device: Rc<RefCell<Device>>,
        model_configuration: Rc<RefCell<ModelConfiguration>>,
        data_manager: Rc<RefCell<DataManager>>,
    ) -> GlyphData {
        let d = device.clone();
        let d = d.borrow();

        let shader = d.create_shader_module(wgpu::include_wgsl!("shader.wgsl").into());

        let mut vertex_data = VertexData {
            vertices: Vec::new(),
        };

        Self::build_verticies(&mut vertex_data.vertices, &model_configuration.borrow());
        let vertex_buffer = Self::configure_vertex_buffer(&d, &vertex_data);
        let vertex_count = vertex_data.vertices.len();

        let dm = data_manager.clone();
        let dm = dm.borrow();

        let glyph_filter = Query::default();
        let (instance_buffer, instance_count) =
            Self::configure_instance_buffer(&d, &glyph_filter, &dm);

        let (output_buffer, output_size) =
            Self::configure_output_buffer(&d, vertex_data.vertices.len(), instance_count);

        let (
            compute_pipeline,
            vertex_bind_group,
            instance_bind_group,
            glyph_uniform_bind_group,
            output_bind_group,
        ) = Self::configure_compute_pipeline(
            &d,
            &vertex_buffer,
            &instance_buffer,
            glyph_uniform_buffer,
            &output_buffer,
            &shader,
        );

        GlyphData {
            device,
            compute_pipeline,
            vertex_buffer,
            vertex_bind_group,
            vertex_count,
            instance_buffer,
            instance_bind_group,
            instance_count,
            output_buffer,
            output_bind_group,
            output_size,
            model_configuration,
            glyph_uniform_bind_group,
            data_manager,
            shader,
        }
    }

    pub fn update_vertices(&mut self, glyph_uniform_buffer: &Buffer, instance_filter: &Query) {
        let mut vertex_data = VertexData {
            vertices: Vec::new(),
        };
        let d = &self.device.borrow();

        Self::build_verticies(
            &mut vertex_data.vertices,
            &self.model_configuration.borrow(),
        );
        self.vertex_buffer = Self::configure_vertex_buffer(&d, &vertex_data);
        self.vertex_count = vertex_data.vertices.len();

        let dm = self.data_manager.borrow();

        let (instance_buffer, instance_count) =
            Self::configure_instance_buffer(&d, instance_filter, &dm);

        let (output_buffer, output_size) =
            Self::configure_output_buffer(&d, vertex_data.vertices.len(), instance_count);

        let (
            compute_pipeline,
            vertex_bind_group,
            instance_bind_group,
            glyph_uniform_bind_group,
            output_bind_group,
        ) = Self::configure_compute_pipeline(
            &d,
            &self.vertex_buffer,
            &instance_buffer,
            glyph_uniform_buffer,
            &output_buffer,
            &self.shader,
        );

        self.compute_pipeline = compute_pipeline;
        self.vertex_bind_group = vertex_bind_group;
        self.instance_buffer = instance_buffer;
        self.instance_count = instance_count;
        self.instance_bind_group = instance_bind_group;
        self.glyph_uniform_bind_group = glyph_uniform_bind_group;
        self.output_bind_group = output_bind_group;
        self.output_buffer = output_buffer;
        self.output_size = output_size;
    }

    pub fn build_verticies(
        verticies: &mut Vec<ShapeVertex>,
        model_configuration: &ModelConfiguration,
    ) {
        //Our x/y size
        let glyph_size = model_configuration.glyph_size;

        //Our z size is based on the height of the grid with a little bit of padding so that
        //the top does not but up against the z axis line
        let length = (model_configuration.grid_cylinder_length
            * model_configuration.z_height_ratio)
            + model_configuration.grid_cone_length;

        let shape_vertices = create_rectangular_prism(glyph_size, length);
        //now we want to move this to the model origin from it's current position at 0,0,0.
        let x_offset = model_configuration.model_origin[0] + model_configuration.glyph_offset;
        let z_offset = model_configuration.model_origin[2] + model_configuration.glyph_offset;
        let y_offset = model_configuration.model_origin[1];

        let mut i = 0;
        while i < shape_vertices.len() {
            let vertex = shape_vertices[i];
            verticies.push(ShapeVertex {
                position_vertex: [
                    vertex.position_vertex[0] + x_offset,
                    vertex.position_vertex[1] + y_offset,
                    vertex.position_vertex[2] + z_offset,
                ],
                normal: [
                    vertex.normal[0] + x_offset,
                    vertex.normal[1] + y_offset,
                    vertex.normal[2] + z_offset,
                ],
                color: vertex.color,
            });
            i += 1;
        }
    }

    fn configure_instance_buffer(
        device: &Device,
        instance_filter: &Query,
        data_manager: &DataManager,
    ) -> (Buffer, usize) {
        let glyph_data = data_manager.get_raw_glyphs();
        let x_vectors = data_manager.get_x_vectors();
        let x_vectors = x_vectors.as_ref().borrow();
        let z_vectors = data_manager.get_z_vectors();
        let z_vectors = z_vectors.as_ref().borrow();
        let x_stats = data_manager.get_stats("x").unwrap();
        let y_stats = data_manager.get_stats("y").unwrap();
        let z_stats = data_manager.get_stats("z").unwrap();
        let glyph_data = instance_filter.run(
            glyph_data, &x_vectors, &z_vectors, &x_stats, &y_stats, &z_stats,
        );

        (
            device.create_buffer_init(&BufferInitDescriptor {
                label: Some("Instance Buffer"),
                contents: bytemuck::cast_slice(glyph_data.as_slice()),
                usage: BufferUsages::STORAGE,
            }),
            glyph_data.len(),
        )
    }

    fn configure_vertex_buffer(device: &Device, vertex_data: &VertexData) -> Buffer {
        device.create_buffer_init(&BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(vertex_data.vertices.as_slice()),
            usage: BufferUsages::STORAGE,
        })
    }

    fn configure_output_buffer(
        device: &Device,
        vertex_data_length: usize,
        glyph_data_length: usize,
    ) -> (Buffer, usize) {
        let x_size = vertex_data_length;
        let y_size = glyph_data_length;
        let output_size = (x_size * y_size * std::mem::size_of::<InstanceOutput>()) as usize;
        (
            device.create_buffer(&BufferDescriptor {
                label: Some("Output Buffer"),
                size: output_size as u64,
                usage: BufferUsages::STORAGE | BufferUsages::COPY_SRC,
                mapped_at_creation: false,
            }),
            output_size,
        )
    }

    //OK we have to push the buffers(vectors and glyphs) into uniforms and then reference them
    //using indexes in the shader.  This is because we can't pass a vector into a shader.

    fn configure_compute_pipeline(
        device: &Device,
        vertex_buffer: &Buffer,
        instance_buffer: &Buffer,
        uniform_buffer: &Buffer,
        output_buffer: &Buffer,
        shader: &ShaderModule,
    ) -> (ComputePipeline, BindGroup, BindGroup, BindGroup, BindGroup) {
        let compute_pipeline = device.create_compute_pipeline(&ComputePipelineDescriptor {
            label: Some("Glyph Render Pipeline"),
            layout: None,
            module: shader,
            entry_point: "main",
            cache: None,
            compilation_options: PipelineCompilationOptions::default(),
        });

        let vertex_bind_group_layout = compute_pipeline.get_bind_group_layout(0);
        let vertex_bind_group = device.create_bind_group(&BindGroupDescriptor {
            layout: &vertex_bind_group_layout,
            entries: &[BindGroupEntry {
                binding: 0,
                resource: vertex_buffer.as_entire_binding(),
            }],
            label: Some("vertex_bind_group"),
        });

        let instance_bind_group_layout = compute_pipeline.get_bind_group_layout(1);
        let instance_bind_group = device.create_bind_group(&BindGroupDescriptor {
            layout: &instance_bind_group_layout,
            entries: &[BindGroupEntry {
                binding: 0,
                resource: instance_buffer.as_entire_binding(),
            }],
            label: Some("instance_bind_group"),
        });

        let uniform_bind_group_layout = compute_pipeline.get_bind_group_layout(2);
        let uniform_bind_group = device.create_bind_group(&BindGroupDescriptor {
            layout: &uniform_bind_group_layout,
            entries: &[BindGroupEntry {
                binding: 0,
                resource: uniform_buffer.as_entire_binding(),
            }],
            label: Some("instance_bind_group"),
        });

        let output_bind_group_layout = compute_pipeline.get_bind_group_layout(3);
        let output_bind_group = device.create_bind_group(&BindGroupDescriptor {
            layout: &output_bind_group_layout,
            entries: &[BindGroupEntry {
                binding: 0,
                resource: output_buffer.as_entire_binding(),
            }],
            label: Some("output_bind_group"),
        });
        (
            compute_pipeline,
            vertex_bind_group,
            instance_bind_group,
            uniform_bind_group,
            output_bind_group,
        )
    }

    pub fn run_pipeline<'a>(&'a self, encoder: &'a mut CommandEncoder) -> Buffer {
        let d = self.device.borrow();
        let staging_buffer = d.create_buffer(&BufferDescriptor {
            label: Some("Staging Buffer"),
            size: self.output_size as u64,
            usage: BufferUsages::MAP_READ | BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        {
            let mut compute_pass = encoder.begin_compute_pass(&ComputePassDescriptor {
                label: Some("Glyph Data Pass"),
                timestamp_writes: None,
            });
            compute_pass.set_pipeline(&self.compute_pipeline);
            compute_pass.set_bind_group(0, &self.vertex_bind_group, &[]);
            compute_pass.set_bind_group(1, &self.instance_bind_group, &[]);
            compute_pass.set_bind_group(2, &self.glyph_uniform_bind_group, &[]);
            compute_pass.set_bind_group(3, &self.output_bind_group, &[]);
            compute_pass.dispatch_workgroups(
                self.vertex_count as u32,
                self.instance_count as u32,
                1,
            );
        }
        encoder.copy_buffer_to_buffer(
            &self.output_buffer,
            0,
            &staging_buffer,
            0,
            self.output_size as u64,
        );
        staging_buffer
    }
}
