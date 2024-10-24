use super::{
    model_event::{CameraTypeChanged, ModelEvent, ModelMoveDirection},
    Application,
};
use crate::model::{
    data::Order,
    filtering::Query,
    managers::{CameraManager, DataManager},
    model_configuration::ModelConfiguration,
};
use serde_json::{from_str, Value};
use std::{cell::RefCell, rc::Rc};
use winit::event_loop::{EventLoop, EventLoopProxy};

cfg_if::cfg_if! {
    if #[cfg(target_arch="wasm32")] {
        use wasm_bindgen::prelude::*;

        #[wasm_bindgen]
        extern "C" {
            #[wasm_bindgen(js_namespace = console)]
            pub fn log(s: &str);
        }
    }
}

#[allow(dead_code)]
pub const WEB_ELEMENT_NAME: &str = "glyphx-cube-model";
pub static mut EVENT_LOOP_PROXY: Option<EventLoopProxy<ModelEvent>> = None;

pub fn send_event(event: ModelEvent) {
    unsafe {
        if EVENT_LOOP_PROXY.is_some() {
            //If send event fails our event loop is closed and the window is most liekly already
            //destroyed so not real reason to get worked up here.
            let _ = EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
        }
    }
}

#[allow(unused_variables)]
pub fn emit_event(event: &ModelEvent) {
    cfg_if::cfg_if! {
        if #[cfg(target_arch="wasm32")] {
            use super::model_event::JsSafeModelEvent;
            let event_name = event.event_type();
            let event = JsSafeModelEvent::from(event);
            let window = web_sys::window().unwrap();
            let js_value = serde_wasm_bindgen::to_value(&event).unwrap();
            let mut event_init = web_sys::CustomEventInit::new();
            event_init.set_detail(&js_value);
            let event = web_sys::CustomEvent::new_with_event_init_dict(
                event_name,
                &mut event_init,

            ).unwrap();
            window
                .dispatch_event(&event)
                .expect("Unable to dispatch custom event");
        }
    }
}
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct ModelRunner {
    configuration: Rc<RefCell<ModelConfiguration>>,
    data_manager: Rc<RefCell<DataManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl ModelRunner {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new() -> Self {
        Self::init_logger();

        ModelRunner {
            configuration: Rc::new(RefCell::new(ModelConfiguration::default())),
            data_manager: Rc::new(RefCell::new(DataManager::new())),
            camera_manager: Rc::new(RefCell::new(CameraManager::new())),
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn clear_data(&self) -> Result<(), String> {
        let event = ModelEvent::ClearData;
        send_event(event);
        Ok(())
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn reset_state(&self) -> Result<(), String> {
        let event = ModelEvent::ResetState;
        send_event(event);
        Ok(())
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn take_screenshot(&self, is_state_creation: bool) -> Result<(), String> {
        let event = ModelEvent::TakeScreenshot(is_state_creation);
        send_event(event);
        Ok(())
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn resize_window(&self, width: u32, height: u32) -> Result<(), String> {
        let event = ModelEvent::ResizeWindow { width, height };
        send_event(event);
        Ok(())
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn set_camera_type(&self, camera_type: &str) -> Result<(), String> {
        let camera_type = match camera_type {
            "Orbital" => CameraTypeChanged::Orbital,
            "Perspective" => CameraTypeChanged::Perspective,
            _ => return Err(format!("Invalid camera type: {}", camera_type).to_string()),
        };
        let event = ModelEvent::CameraTypeChanged(camera_type);
        send_event(event);
        Ok(())
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn update_model_filter(&self, filter: &str) -> Result<(), String> {
        let json_value = from_str::<Value>(filter);
        if json_value.is_err() {
            let err = json_value.err().unwrap();
            return Err(format!(
                "An error ocurred while parsing the json: {}",
                err.to_string()
            ));
        }
        let mut json_value = json_value.unwrap();
        //:NOTE You may have seen this in other places in this model, but in WGPU world,
        //The Y and Z axis are flipped.  I tried to not flip them, but things got really confused
        // really fast.  So, in the model, the Y and Z axis are flipped.  This keeps all of the
        // stuff in web land in sync with the way that the application definws the axis.
        // because of this, we will need to flip our filters so that they are correct in the
        // model.
        let true_z: Option<Value> = json_value.get("y").cloned();
        let true_y: Option<Value> = json_value.get("z").cloned();
        if true_z.is_some() {
            json_value["z"] = true_z.unwrap();
        }
        if true_y.is_some() {
            json_value["y"] = true_y.unwrap();
        }
        let filter_query = Query::from_json_value(&json_value);
        if filter_query.is_err() {
            let error = filter_query.err().unwrap().to_string();
            return Err(error);
        }
        let filter_query = filter_query.unwrap();
        unsafe {
            let event = ModelEvent::UpdateModelFilter(filter_query);
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                send_event(event);
            }
        }
        Ok(())
    }

    ///Will force a redraw of the model, if the model is running.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn update_configuration(&self, config: &str, is_running: bool) -> Result<(), String> {
        let value: Value = from_str(config).unwrap();
        let mut configuration = self.configuration.borrow_mut();
        let result = configuration.partial_update(&value);
        if result.is_err() {
            return Err(serde_json::to_string(&result.unwrap_err()).unwrap());
        }
        if is_running {
            let event = ModelEvent::ConfigurationUpdated;
            emit_event(&event);
            send_event(event);
        }
        Ok(())
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn toggle_axis_lines(&self) {
        let event = ModelEvent::ToggleAxisLines;
        emit_event(&event);
        send_event(event);
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn select_glyph(&self, x_pos: u32, y_pos: u32, multi_select: bool) {
        // let event = ModelEvent::SelectGlyph {
        //     x_pos: x_pos as f32,
        //     y_pos: y_pos as f32,
        //     multi_select,
        // };
        // emit_event(&event);
        // send_event(event);
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_yaw(&self, amount: f32) {
        let event = ModelEvent::ModelMove(ModelMoveDirection::Yaw(amount));
        emit_event(&event);
        send_event(event);
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn raise_model(&self, amount: f32) {
        let event = if amount > 0.0 {
            ModelEvent::ModelMove(ModelMoveDirection::Up(amount))
        } else {
            ModelEvent::ModelMove(ModelMoveDirection::Down(amount * -1.0))
        };
        emit_event(&event);
        send_event(event);
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn reset_camera(&self) {
        let event = ModelEvent::ModelMove(ModelMoveDirection::Reset);
        emit_event(&event);
        send_event(event);
    }

    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_x_axis(&self) {
        let event = ModelEvent::ModelMove(ModelMoveDirection::X);
        emit_event(&event);
        send_event(event);
    }

    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_y_axis(&self) {
        let event = ModelEvent::ModelMove(ModelMoveDirection::Y);
        emit_event(&event);
        send_event(event);
    }
    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_z_axis(&self) {
        let event = ModelEvent::ModelMove(ModelMoveDirection::Z);
        emit_event(&event);
        send_event(event);
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn shift_model(&self, amount: f32) {
        let event = if amount > 0.0 {
            ModelEvent::ModelMove(ModelMoveDirection::Right(amount))
        } else {
            ModelEvent::ModelMove(ModelMoveDirection::Left(amount * -1.0))
        };
        emit_event(&event);
        send_event(event);
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_pitch(&self, amount: f32) {
        let event = ModelEvent::ModelMove(ModelMoveDirection::Pitch(amount));
        emit_event(&event);
        send_event(event);
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_distance(&self, amount: f32) {
        let event = ModelEvent::ModelMove(ModelMoveDirection::Distance(amount));
        emit_event(&event);
        send_event(event);
    }

    ///Adding a vector will update internal state but it
    ///will not emit any redraw events.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_vector(&self, axis: &str, data: Vec<u8>) -> Result<(), String> {
        let mut dm = self.data_manager.borrow_mut();
        let result = if axis == "x" {
            dm.add_x_vector(data)
        } else {
            dm.add_z_vector(data)
        };
        match result {
            Ok(_) => Ok(()),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }
    //Adding statistics will update internal state but it
    //will not emit any redraw events.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_statistics(&self, data: Vec<u8>) -> Result<String, String> {
        let mut dm = self.data_manager.borrow_mut();
        let result = dm.add_stats(data);
        match result {
            Ok(stats) => Ok(format!("{:?}", stats)),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }
    //Get statistics will return the raw statistics(vector values) for the given axis.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_statistics(&self, axis: &str) -> Result<String, String> {
        if ["x", "y", "x"].contains(&axis) {
            return Err("Invalid axis.  Must be x, y, or z".to_string());
        }
        //NOTE: You should have seen this before.  Y and Z are flipped in the model, so we need to
        //flip them back to return the correct values to the client.
        let axis = match axis {
            "x" => "x",
            "y" => "z",
            "z" => "y",
            _ => "x",
        };
        let dm = self.data_manager.borrow();

        let result = dm.get_stats(axis);
        match result {
            Ok(stats) => Ok(serde_json::to_string(&stats).unwrap()),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }

    ///Adding a glyph will update internal state but it
    ///will not emit any redraw events.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_glyph(&self, data: Vec<u8>) -> Result<String, String> {
        let mut dm = self.data_manager.borrow_mut();
        let result = dm.add_glyph(data);
        match result {
            Ok(result) => Ok(serde_json::to_string(&result).unwrap()),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_glyph_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_glyph_len()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_stats_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_stats_len()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_x_vector_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_vector_len("x")
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_y_vector_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_vector_len("z")
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_camera_data(&self) -> String {
        let cm = self.camera_manager.as_ref().borrow();
        cm.get_camera_data()
    }

    //apspect ratio is canvas width / canvas height
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn set_camera_data(&self, camera_data: String, aspect_ratio: f32) {
        let cm = &mut self.camera_manager.as_ref().borrow_mut();
        cm.set_camera_data(camera_data, aspect_ratio);
        let event = ModelEvent::Redraw;
        send_event(event);
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn set_selected_glyphs(&self, selected_glyphs: Vec<u32>) {
        let event = ModelEvent::SelectGlyphs(selected_glyphs);
        send_event(event);
    }

    fn init_logger() {
        cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
              std::panic::set_hook(Box::new(console_error_panic_hook::hook));
              console_log::init_with_level(log::Level::Info);

          } else {
              env_logger::init();
          }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub async fn run(&self, width: u32, height: u32) {
        log::info!("Running model");
        let el = EventLoop::<ModelEvent>::with_user_event().build();
        log::info!("el : {:?}", el);
        let el = el.unwrap();

        let mut application = Application::new(
            self.configuration.clone(),
            self.data_manager.clone(),
            self.camera_manager.clone(),
            height,
            width,
        );
        unsafe {
            EVENT_LOOP_PROXY = Some(el.create_proxy());
        }

        let _ = el.run_app(&mut application);
    }
}
