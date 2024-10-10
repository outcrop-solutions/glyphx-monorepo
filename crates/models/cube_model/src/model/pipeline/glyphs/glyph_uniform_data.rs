use bytemuck;
use serde::{Deserialize, Serialize};
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device};

#[derive(Debug, Copy, Clone, Eq, PartialEq, Deserialize, Serialize)]
pub enum InterpolationType {
    Linear = 0,
    Log = 1,
}

impl From<String> for InterpolationType {
    fn from(s: String) -> Self {
        match s.to_lowercase().as_str() {
            "lin" => InterpolationType::Linear,
            "log" => InterpolationType::Log,
            _ => InterpolationType::Linear,
        }
    }
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Deserialize, Serialize)]
pub enum Order {
    Ascending = 0,
    Descending = 1,
}

impl From<String> for Order {
    fn from(s: String) -> Self {
        match s.to_lowercase().as_str() {
            "asc"   => Order::Ascending,
            "desc" => Order::Descending,
            _ => Order::Ascending,
        }
    }
}

#[derive(Debug, Copy, Clone)]
pub struct GlyphUniformFlags {
    pub x_interp_type: InterpolationType,
    pub x_order: Order,
    pub y_interp_type: InterpolationType,
    pub y_order: Order,
    pub z_interp_type: InterpolationType,
    pub z_order: Order,
    pub color_flip: bool,
    //TODO: I added this because I thougth I would use it to track whether or not 
    //glyphs were selected.  For some reason, I was not getting this data to feed 
    //into the glpyh shader.  So, since I am already enumerating the glyph data,
    //to push them to the pipeline, I can set a flag there.  I will leave this 
    //here so that we can explore using it in the future.
    pub glyph_selected: bool,
}

impl Default for GlyphUniformFlags {
    fn default() -> Self {
        Self {
            x_interp_type: InterpolationType::Linear,
            x_order: Order::Ascending,
            y_interp_type: InterpolationType::Linear,
            y_order: Order::Ascending,
            z_interp_type: InterpolationType::Linear,
            z_order: Order::Ascending,
            color_flip: false,
            glyph_selected: false,
        }
    }
}

impl GlyphUniformFlags {
    pub fn encode(&self) -> u32 {
        let mut flags = 0;

        // Encode flags for each axis
        flags |= (self.x_interp_type as u32) << 31;
        flags |= (self.x_order as u32) << 30;
        flags |= (self.y_interp_type as u32) << 23;
        flags |= (self.y_order as u32) << 22;
        flags |= (self.z_interp_type as u32) << 15;
        flags |= (self.z_order as u32) << 14;
        flags |= (if self.color_flip == true {1} else {0}) << 7;
        flags |= (if self.glyph_selected == true {1} else {0}) << 6;

        flags
    }

    pub fn decode(flags: u32) -> Result<Self, &'static str> {
        let get_interp_type = |bits: u32| match bits {
            0 => Ok(InterpolationType::Linear),
            1 => Ok(InterpolationType::Log),
            _ => Err("Invalid interpolation type"),
        };

        let get_order = |bits: u32| match bits {
            0 => Ok(Order::Ascending),
            1 => Ok(Order::Descending),
            _ => Err("Invalid order"),
        };

        let get_bool = |bits: u32| match bits {
            0 => false,
            1 => true,
            _ => false,
        };

        Ok(Self {
            x_interp_type: get_interp_type((flags >> 31) & 0x1)?,
            x_order: get_order((flags >> 30) & 0x1)?,
            y_interp_type: get_interp_type((flags >> 23) & 0x1)?,
            y_order: get_order((flags >> 22) & 0x1)?,
            z_interp_type: get_interp_type((flags >> 15) & 0x1)?,
            z_order: get_order((flags >> 14) & 0x1)?,
            color_flip: get_bool((flags >> 7) & 0x1),
            glyph_selected: get_bool((flags >> 6) & 0x1),
        })
    }
}

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct GlyphUniformData {
    //x values
    pub min_x: f32,
    pub max_x: f32,
    pub min_interp_x: f32,
    pub max_interp_x: f32,
    //y values
    pub min_y: f32,
    pub max_y: f32,
    pub min_interp_y: f32,
    pub max_interp_y: f32,
    //z values
    pub min_z: f32,
    pub max_z: f32,
    pub min_interp_z: f32,
    pub max_interp_z: f32,
    //other values
    pub x_z_offset: f32,
    pub y_offset: f32,
    pub flags: u32,
    pub _padding: u32,
}

impl GlyphUniformData {
    pub fn configure_glyph_uniform(
        &self,
        glyph_uniform_buffer: &Buffer,
        device: &Device,
    ) -> (BindGroupLayout, BindGroup) {
        let glyph_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::VERTEX,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                }],
                label: Some("glyph_bind_group_layout"),
            });

        let glyph_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &glyph_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: glyph_uniform_buffer.as_entire_binding(),
            }],
            label: Some("glyph_bind_group"),
        });

        (glyph_bind_group_layout, glyph_bind_group)
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    mod glyph_uniform_flags {
        use super::*;

        #[test]
        fn encode_decode() {
            let flags = GlyphUniformFlags {
                x_interp_type: InterpolationType::Log,
                x_order: Order::Descending,
                y_interp_type: InterpolationType::Log,
                y_order: Order::Descending,
                z_interp_type: InterpolationType::Log,
                z_order: Order::Descending,
                color_flip: true,
                glyph_selected: true,
            };

            let encoded = flags.encode();
            let str_encoded = format!("{:032b}", encoded);
            let expected_str = "11000000110000001100000011000000";
            assert_eq!(str_encoded, expected_str);
            let decoded = GlyphUniformFlags::decode(encoded).unwrap();
            assert_eq!(decoded.x_interp_type, InterpolationType::Log);
            assert_eq!(decoded.x_order, Order::Descending);
            assert_eq!(decoded.y_interp_type, InterpolationType::Log);
            assert_eq!(decoded.y_order, Order::Descending);
            assert_eq!(decoded.z_interp_type, InterpolationType::Log);
            assert_eq!(decoded.z_order, Order::Descending);
            assert_eq!(decoded.color_flip, true);
            assert_eq!(decoded.glyph_selected, true);
        }

        #[test]
        fn encode_decode2() {
            let flags = GlyphUniformFlags {
                x_interp_type: InterpolationType::Linear,
                x_order: Order::Descending,
                y_interp_type: InterpolationType::Log,
                y_order: Order::Ascending,
                z_interp_type: InterpolationType::Linear,
                z_order: Order::Descending,
                color_flip: false,
                glyph_selected: false,
            };

            let encoded = flags.encode();
            let str_encoded = format!("{:032b}", encoded);
            let expected_str = "01000000100000000100000000000000";
            assert_eq!(str_encoded, expected_str);
            let decoded = GlyphUniformFlags::decode(encoded).unwrap();
            assert_eq!(decoded.x_interp_type, InterpolationType::Linear);
            assert_eq!(decoded.x_order, Order::Descending);
            assert_eq!(decoded.y_interp_type, InterpolationType::Log);
            assert_eq!(decoded.y_order, Order::Ascending);
            assert_eq!(decoded.z_interp_type, InterpolationType::Linear);
            assert_eq!(decoded.z_order, Order::Descending);
            assert_eq!(decoded.color_flip, false);
            assert_eq!(decoded.glyph_selected, false);
        }

        #[test]
        fn encode_decode3() {
            let flags = GlyphUniformFlags {
                x_interp_type: InterpolationType::Log,
                x_order: Order::Ascending,
                y_interp_type: InterpolationType::Linear,
                y_order: Order::Descending,
                z_interp_type: InterpolationType::Log,
                z_order: Order::Ascending,
                color_flip: false,
                glyph_selected: false,
            };

            let encoded = flags.encode();
            let str_encoded = format!("{:032b}", encoded);
            let expected_str = "10000000010000001000000000000000";
            assert_eq!(str_encoded, expected_str);
            let decoded = GlyphUniformFlags::decode(encoded).unwrap();
            assert_eq!(decoded.x_interp_type, InterpolationType::Log);
            assert_eq!(decoded.x_order, Order::Ascending);
            assert_eq!(decoded.y_interp_type, InterpolationType::Linear);
            assert_eq!(decoded.y_order, Order::Descending);
            assert_eq!(decoded.z_interp_type, InterpolationType::Log);
            assert_eq!(decoded.z_order, Order::Ascending);
            assert_eq!(decoded.color_flip, false);
            assert_eq!(decoded.glyph_selected, false);
        }
    }

    mod interpolation_type {
        use super::*;

        #[test]
        fn from_string_is_linear() {
            let s = "Lin".to_string();
            let interp_type = InterpolationType::from(s);
            assert_eq!(interp_type, InterpolationType::Linear);
        }

        #[test]
        fn from_string_is_log() {
            let s = "Log".to_string();
            let interp_type = InterpolationType::from(s);
            assert_eq!(interp_type, InterpolationType::Log);
        }

        #[test]
        fn from_string_is_other() {
            let s = "other".to_string();
            let interp_type = InterpolationType::from(s);
            assert_eq!(interp_type, InterpolationType::Linear);
        }
    }

    mod order {
        use super::*;

        #[test]
        fn from_string_is_ascending() {
            let s = "Asc".to_string();
            let order = Order::from(s);
            assert_eq!(order, Order::Ascending);
        }

        #[test]
        fn from_string_is_descending() {
            let s = "Desc".to_string();
            let order = Order::from(s);
            assert_eq!(order, Order::Descending);
        }

        #[test]
        fn from_string_is_other() {
            let s = "other".to_string();
            let order = Order::from(s);
            assert_eq!(order, Order::Ascending);
        }
    }
}
