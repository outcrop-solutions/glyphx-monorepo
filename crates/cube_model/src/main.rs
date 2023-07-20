use glyphx_cube_model::ModelRunner;
fn main() {
    let mut runner = ModelRunner::new();
    pollster::block_on(runner.run());
}
