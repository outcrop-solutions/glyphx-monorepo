use neon::prelude::*;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello offline_data_ingestion_node"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    //cx.export_function("glyph_engine", run)?;
    //These function are here to support testing.
    cx.export_function("hello", hello)?;
    // cx.export_function("convertNeonValue", convert_neon_value)?;
    // cx.export_function("convertJsonValue", convert_json_value)?;
    // cx.export_function(
    //     "convertGlyphxErrorToJsonObject",
    //     convert_glyphx_error_to_jsonObject,
    // )?;
    Ok(())
}
