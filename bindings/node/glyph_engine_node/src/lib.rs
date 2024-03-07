use glyph_engine::{types::vectorizer_parameters::VectorizerParameters, GlyphEngine};
use glyphx_common::{AthenaConnection, S3Connection};
use glyphx_core::{traits::ErrorTypeParser, Singleton};
use neon::prelude::*;
use once_cell::sync::OnceCell;
use serde_json::Value as JsonValue;
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
        js_error.set(cx, "inner_error", inner_error).unwrap();
    }
    let retval = cx.empty_object();
    retval
        .set(cx, error.parse_error_type().as_str(), js_error)
        .unwrap();
    retval
}
fn run(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let args = cx.argument::<JsObject>(0)?;
    let args = args.to_string(&mut cx)?;
    let args = args.value(&mut cx);

    let parameters = VectorizerParameters::from_json_string(&args);
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
    let rt = RUNTIME
        .get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))?;

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

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("run", run)?;
    Ok(())
}
