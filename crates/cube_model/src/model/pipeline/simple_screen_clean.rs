use wgpu::{Device, Queue, Surface, TextureViewDescriptor};

pub fn run_pipeline(surface: &Surface, device: &Device, queue: &Queue) -> Result<(), wgpu::SurfaceError> {
     let output = surface.get_current_texture()?;
     let view = output.texture.create_view(&TextureViewDescriptor::default());

      let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
        label: Some("Render Encoder"),
    });

      //For this pipeline, we do not need to capture the output of begin render pass.  In the
      //future if we caputure the output of begin render pass, we will need to drop it 
      //before we can call encoder.finish().
      encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0,
                    }),
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });
        queue.submit(std::iter::once(encoder.finish()));
        output.present();
        Ok(())
    }


