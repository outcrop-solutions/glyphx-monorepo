use glyphx_core::traits::ErrorTypeParser;
use neon::prelude::*;
use serde_json::{json, Value as JsonValue};
pub struct NeonConverter;

impl NeonConverter {
    pub fn convert_json_value_to_json_array<'a>(
        value: JsonValue,
        cx: &mut impl Context<'a>,
    ) -> Handle<'a, JsArray> {
        let array = cx.empty_array();
        let value = value.as_array().unwrap();
        for value in value.iter() {
            let len = array.len(cx);
            if value.is_string() {
                let v = cx.string(value.as_str().unwrap());
                array.set(cx, len, v).unwrap();
            } else if value.is_number() {
                let v = cx.number(value.as_f64().unwrap());
                array.set(cx, len, v).unwrap();
            } else if value.is_boolean() {
                let v = cx.boolean(value.as_bool().unwrap());
                array.set(cx, len, v).unwrap();
            } else if value.is_null() {
                let v = cx.null();
                array.set(cx, len, v).unwrap();
            } else if value.is_array() {
                let v = Self::convert_json_value_to_json_array(value.clone(), cx);
                array.set(cx, len, v).unwrap();
            } else {
                let v = Self::convert_json_value_to_json_object(value.clone(), cx);
                array.set(cx, len, v).unwrap();
            }
        }
        array
    }
    pub fn convert_json_value_to_json_object<'a>(
        value: JsonValue,
        cx: &mut impl Context<'a>,
    ) -> Handle<'a, JsObject> {
        let object = cx.empty_object();
        let value = value.as_object().unwrap();
        for (key, value) in value.iter() {
            if value.is_string() {
                let v = cx.string(value.as_str().unwrap());
                object.set(cx, key.as_str(), v).unwrap();
            } else if value.is_number() {
                let v = cx.number(value.as_f64().unwrap());
                object.set(cx, key.as_str(), v).unwrap();
            } else if value.is_boolean() {
                let v = cx.boolean(value.as_bool().unwrap());
                object.set(cx, key.as_str(), v).unwrap();
            } else if value.is_null() {
                let v = cx.null();
                object.set(cx, key.as_str(), v).unwrap();
            } else if value.is_array() {
                let v = Self::convert_json_value_to_json_array(value.clone(), cx);
                object.set(cx, key.as_str(), v).unwrap();
            } else {
                let v = Self::convert_json_value_to_json_object(value.clone(), cx);
                object.set(cx, key.as_str(), v).unwrap();
            }
        }
        object
    }

    pub fn convert_glyphx_error_to_js_error<'a>(
        error: impl ErrorTypeParser,
        cx: &mut impl Context<'a>,
    ) -> Handle<'a, JsObject> {
        let js_error = cx.empty_object();
        let data = error.get_glyphx_error_data();
        let message = cx.string(&data.message);
        js_error.set(cx, "message", message).unwrap();
        if data.data.is_some() {
            let d = data.data.as_ref().unwrap().clone();
            let d = Self::convert_json_value_to_json_object(d, cx);
            js_error.set(cx, "data", d).unwrap();
        }
        if data.inner_error.is_some() {
            let inner_error = data.inner_error.as_ref().unwrap().clone();
            let inner_error = Self::convert_json_value_to_json_object(inner_error, cx);
            js_error.set(cx, "innerError", inner_error).unwrap();
        }
        let retval = cx.empty_object();
        retval
            .set(cx, error.parse_error_type().as_str(), js_error)
            .unwrap();
        retval
    }

    #[allow(non_snake_case)]
    pub fn convert_jsArray_to_JsonValue<'a>(
        cx: &mut impl Context<'a>,
        obj: Handle<JsArray>,
    ) -> JsonValue {
        let mut retval: Vec<JsonValue> = Vec::new();
        let len = obj.len(cx);
        for i in 0..len {
            let value = obj.get_value(cx, i).unwrap();
            if value.is_a::<JsString, _>(cx) {
                let str_value = value.downcast::<JsString, _>(cx).unwrap();
                let str_value = str_value.value(cx);
                retval.push(json! {str_value});
            } else if value.is_a::<JsNumber, _>(cx) {
                let num_value = value.downcast::<JsNumber, _>(cx).unwrap();
                let num_value = num_value.value(cx);
                retval.push(json! {num_value});
            } else if value.is_a::<JsBoolean, _>(cx) {
                let bool_value = value.downcast::<JsBoolean, _>(cx).unwrap();
                let bool_value = bool_value.value(cx);
                retval.push(json! {bool_value});
            } else if value.is_a::<JsObject, _>(cx) {
                let obj_value = value.downcast::<JsObject, _>(cx).unwrap();
                let obj_value = Self::convert_jsObject_to_JsonValue(cx, obj_value);
                retval.push(obj_value);
            } else if value.is_a::<JsArray, _>(cx) {
                let arr_value = value.downcast::<JsArray, _>(cx).unwrap();
                let arr_value = Self::convert_jsArray_to_JsonValue(cx, arr_value);
                retval.push(arr_value);
            }
        }
        json! {retval}
    }
    #[allow(non_snake_case)]
    pub fn convert_jsObject_to_JsonValue<'a>(
        cx: &mut impl Context<'a>,
        obj: Handle<JsObject>,
    ) -> JsonValue {
        let mut retval = json!({});
        let property_names = obj.get_own_property_names(cx).unwrap();
        let len = property_names.len(cx);
        for i in 0..len {
            let property_name: Handle<JsString> = property_names.get(cx, i).unwrap();
            let property_name = property_name.value(cx);
            let value = obj.get_value(cx, property_name.as_str()).unwrap();
            if value.is_a::<JsString, _>(cx) {
                let str_value = value.downcast::<JsString, _>(cx).unwrap();
                let str_value = str_value.value(cx);
                retval[property_name] = json! {str_value};
            } else if value.is_a::<JsNumber, _>(cx) {
                let num_value = value.downcast::<JsNumber, _>(cx).unwrap();
                let num_value = num_value.value(cx);
                retval[property_name] = json! {num_value};
            } else if value.is_a::<JsBoolean, _>(cx) {
                let bool_value = value.downcast::<JsBoolean, _>(cx).unwrap();
                let bool_value = bool_value.value(cx);
                retval[property_name] = json! {bool_value};
            } else if value.is_a::<JsArray, _>(cx) {
                let arr_value = value.downcast::<JsArray, _>(cx).unwrap();
                let arr_value = Self::convert_jsArray_to_JsonValue(cx, arr_value);
                retval[property_name] = arr_value;
            } else if value.is_a::<JsObject, _>(cx) {
                let obj_value = value.downcast::<JsObject, _>(cx).unwrap();
                let obj_value = Self::convert_jsObject_to_JsonValue(cx, obj_value);
                retval[property_name] = obj_value;
            } else if value.is_a::<JsNull, _>(cx) {
                retval[property_name] = json! {null};
            }
        }

        retval
    }
}
