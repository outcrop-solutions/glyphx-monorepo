use glyph_engine::{types::vectorizer_parameters::VectorizerParameters, GlyphEngine};
use glyphx_common::{
    types::{
        athena_connection_errors::ConstructorError as AthenaConstructorError,
        s3_connection_errors::ConstructorError as S3ConstructorError,
    },
    AthenaConnection, S3Connection,
};
use glyphx_core::{traits::ErrorTypeParser, GlyphxErrorData, Singleton};
use neon::prelude::*;
use once_cell::sync::OnceCell;
use serde_json::{json, Value as JsonValue};
use tokio::runtime::Runtime;

fn convert_json_value_to_json_array<'a>(
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
            let v = convert_json_value_to_json_array(value.clone(), cx);
            array.set(cx, len, v).unwrap();
        } else {
            let v = convert_json_value_to_json_object(value.clone(), cx);
            array.set(cx, len, v).unwrap();
        }
    }
    array
}
fn convert_json_value_to_json_object<'a>(
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
            let v = convert_json_value_to_json_array(value.clone(), cx);
            object.set(cx, key.as_str(), v).unwrap();
        } else {
            let v = convert_json_value_to_json_object(value.clone(), cx);
            object.set(cx, key.as_str(), v).unwrap();
        }
    }
    object
}

fn convert_glyphx_error_to_js_error<'a>(
    error: impl ErrorTypeParser,
    cx: &mut impl Context<'a>,
) -> Handle<'a, JsObject> {
    let js_error = cx.empty_object();
    let data = error.get_glyphx_error_data();
    let message = cx.string(&data.message);
    js_error.set(cx, "message", message).unwrap();
    if data.data.is_some() {
        let d = data.data.as_ref().unwrap().clone();
        let d = convert_json_value_to_json_object(d, cx);
        js_error.set(cx, "data", d).unwrap();
    }
    if data.inner_error.is_some() {
        let inner_error = data.inner_error.as_ref().unwrap().clone();
        let inner_error = convert_json_value_to_json_object(inner_error, cx);
        js_error.set(cx, "innerError", inner_error).unwrap();
    }
    let retval = cx.empty_object();
    retval
        .set(cx, error.parse_error_type().as_str(), js_error)
        .unwrap();
    retval
}

#[allow(non_snake_case)]
fn convert_jsArray_to_JsonValue<'a>(cx: &mut impl Context<'a>, obj: Handle<JsArray>) -> JsonValue {
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
            let obj_value = convert_jsObject_to_JsonValue(cx, obj_value);
            retval.push(obj_value);
        } else if value.is_a::<JsArray, _>(cx) {
            let arr_value = value.downcast::<JsArray, _>(cx).unwrap();
            let arr_value = convert_jsArray_to_JsonValue(cx, arr_value);
            retval.push(arr_value);
        }
    }
    json! {retval}
}
#[allow(non_snake_case)]
fn convert_jsObject_to_JsonValue<'a>(
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
            let arr_value = convert_jsArray_to_JsonValue(cx, arr_value);
            retval[property_name] = arr_value;
        } else if value.is_a::<JsObject, _>(cx) {
            let obj_value = value.downcast::<JsObject, _>(cx).unwrap();
            let obj_value = convert_jsObject_to_JsonValue(cx, obj_value);
            retval[property_name] = obj_value;
        } else if value.is_a::<JsNull, _>(cx) {
            retval[property_name] = json! {null};
        }
    }

    retval
}
fn run(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let args = cx.argument::<JsObject>(0)?;
    let val = convert_jsObject_to_JsonValue(&mut cx, args);
    let parameters = VectorizerParameters::from_json_value(&val);
    if parameters.is_err() {
        let error = parameters.as_ref().err().unwrap().clone();
        let error = convert_glyphx_error_to_js_error(error, &mut cx);
        cx.throw(error)?
    }

    let parameters = parameters.unwrap();
    //We need a runtime to spawn our async function
    //I am making it static on the off chance that this same process gets
    //called multiple times. Using OnceCell will ensure that we only create one
    //tokio runtime.
    static RUNTIME: OnceCell<Runtime> = OnceCell::new();
    let rt = RUNTIME.get_or_try_init(|| {
        tokio::runtime::Builder::new_multi_thread()
            .worker_threads(8)
            .enable_all()
            .build()
            .or_else(|err| cx.throw_error(err.to_string()))
    })?;

    //Get a way to communicate with the JS runtime so we can schedule events, i.e. the completion
    //of the async function
    let channel = cx.channel();

    //Create our promise.  deferred is how we will resolve the promise.  promise is the actual promise
    //this gits returned to the js runtime and we keep deferred around so we can resolve once we
    //are done with our async function
    let (deffered, promise) = cx.promise();

    //Now the fun part ... we spawn our async function
    rt.spawn(async move {
        //TODO: are we unnecessarily building this more than once?

        if let Err(error) = S3Connection::build_singleton().await {
            deffered.settle_with(&channel, move |mut cx| {
                let error = convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }

        if let Err(error) = AthenaConnection::build_singleton().await {
            deffered.settle_with(&channel, move |mut cx| {
                let error = convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }

        let glyph_engine = GlyphEngine::new(&parameters).await;
        if let Err(error) = glyph_engine {
            deffered.settle_with(&channel, move |mut cx| {
                let error = convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }
        let mut glyph_engine = glyph_engine.unwrap();
        let process_results = glyph_engine.process().await;
        if process_results.is_err() {
            let error = process_results.as_ref().err().unwrap().clone();
            deffered.settle_with(&channel, move |mut cx| {
                let error = convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }
        let process_results = process_results.unwrap();
        let process_results = serde_json::to_value(process_results).unwrap();
        deffered.settle_with(&channel, move |mut cx| {
            let process_results = convert_json_value_to_json_object(process_results, &mut cx);
            Ok(process_results)
        });
    });

    Ok(promise)
}

fn convert_neon_value(mut cx: FunctionContext) -> JsResult<JsString> {
    let args = cx.argument::<JsObject>(0)?;
    let val = convert_jsObject_to_JsonValue(&mut cx, args);
    Ok(cx.string(val.to_string()))
}

fn convert_json_value(mut cx: FunctionContext) -> JsResult<JsObject> {
    let input = cx.argument::<JsString>(0)?;
    let input = input.value(&mut cx);
    let input: JsonValue = serde_json::from_str(&input).unwrap();
    let val = convert_json_value_to_json_object(input, &mut cx);
    Ok(val)
}

#[allow(non_snake_case)]
fn convert_glyphx_error_to_jsonObject(mut cx: FunctionContext) -> JsResult<JsObject> {
    let inner_error = S3ConstructorError::BucketDoesNotExist(GlyphxErrorData::new(
        String::from("Bucket does not exist"),
        Some(json!( {"bucket_name": "foo"})),
        Some(json!("James, what have you done now")),
    ));
    let outer_error = AthenaConstructorError::UnexpectedError(GlyphxErrorData::new(
        String::from("Invalid region"),
        Some(json! ({"region" : "us-west-2"})),
        Some(serde_json::to_value(inner_error).unwrap()),
    ));
    let error = convert_glyphx_error_to_js_error(outer_error, &mut cx);
    Ok(error)
}

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("glyph_engine", run)?;
    //These function are here to support testing.
    cx.export_function("hello", hello)?;
    cx.export_function("convertNeonValue", convert_neon_value)?;
    cx.export_function("convertJsonValue", convert_json_value)?;
    cx.export_function(
        "convertGlyphxErrorToJsonObject",
        convert_glyphx_error_to_jsonObject,
    )?;
    Ok(())
}
