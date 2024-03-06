use neon::prelude::*;
use glyph_engine::GlyphEngine;
use glyphx_common::
fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    foo = "bar";
    cx.export_function("hello", hello)?;
    Ok(())
}
