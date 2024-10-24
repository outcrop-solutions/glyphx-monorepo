use bindings_node_common::NeonConverter;
use glyph_engine::{types::vectorizer_parameters::VectorizerParameters, GlyphEngine};
use glyphx_common::{
    types::{
        athena_connection_errors::ConstructorError as AthenaConstructorError,
        s3_connection_errors::ConstructorError as S3ConstructorError,
    },
    AthenaConnection, S3Connection,
};
use glyphx_core::{ GlyphxErrorData, Singleton};
use neon::prelude::*;
use once_cell::sync::OnceCell;
use serde_json::{json, Value as JsonValue};
use tokio::runtime::Runtime;

fn run(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let args = cx.argument::<JsObject>(0)?;
    let val = NeonConverter::convert_jsObject_to_JsonValue(&mut cx, args);
    let parameters = VectorizerParameters::from_json_value(&val);
    if parameters.is_err() {
        let error = parameters.as_ref().err().unwrap().clone();
        let error = NeonConverter::convert_glyphx_error_to_js_error(error, &mut cx);
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
                let error = NeonConverter::convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }

        if let Err(error) = AthenaConnection::build_singleton().await {
            deffered.settle_with(&channel, move |mut cx| {
                let error = NeonConverter::convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }

        let glyph_engine = GlyphEngine::new(&parameters).await;
        if let Err(error) = glyph_engine {
            deffered.settle_with(&channel, move |mut cx| {
                let error = NeonConverter::convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }
        let mut glyph_engine = glyph_engine.unwrap();
        let process_results = glyph_engine.process().await;
        if process_results.is_err() {
            let error = process_results.as_ref().err().unwrap().clone();
            deffered.settle_with(&channel, move |mut cx| {
                let error = NeonConverter::convert_glyphx_error_to_js_error(error, &mut cx);
                cx.throw::<JsObject, Handle<JsObject>>(error)
            });
            return;
        }
        let process_results = process_results.unwrap();
        let process_results = serde_json::to_value(process_results).unwrap();
        deffered.settle_with(&channel, move |mut cx| {
            let process_results = NeonConverter::convert_json_value_to_json_object(process_results, &mut cx);
            Ok(process_results)
        });
    });

    Ok(promise)
}

fn convert_neon_value(mut cx: FunctionContext) -> JsResult<JsString> {
    let args = cx.argument::<JsObject>(0)?;
    let val = NeonConverter::convert_jsObject_to_JsonValue(&mut cx, args);
    Ok(cx.string(val.to_string()))
}

fn convert_json_value(mut cx: FunctionContext) -> JsResult<JsObject> {
    let input = cx.argument::<JsString>(0)?;
    let input = input.value(&mut cx);
    let input: JsonValue = serde_json::from_str(&input).unwrap();
    let val = NeonConverter::convert_json_value_to_json_object(input, &mut cx);
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
    let error =  NeonConverter::convert_glyphx_error_to_js_error(outer_error, &mut cx);
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
