/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function modelrunner_new(): number;
export function modelrunner_clear_data(a: number, b: number): void;
export function modelrunner_reset_state(a: number, b: number): void;
export function modelrunner_take_screenshot(a: number, b: number, c: number): void;
export function modelrunner_resize_window(a: number, b: number, c: number, d: number): void;
export function modelrunner_set_camera_type(a: number, b: number, c: number, d: number): void;
export function modelrunner_update_model_filter(a: number, b: number, c: number, d: number): void;
export function modelrunner_update_configuration(a: number, b: number, c: number, d: number, e: number): void;
export function modelrunner_toggle_axis_lines(a: number): void;
export function modelrunner_select_glyph(a: number, b: number, c: number, d: number): void;
export function modelrunner_add_yaw(a: number, b: number): void;
export function modelrunner_raise_model(a: number, b: number): void;
export function modelrunner_reset_camera(a: number): void;
export function modelrunner_focus_on_x_axis(a: number): void;
export function modelrunner_focus_on_y_axis(a: number): void;
export function modelrunner_focus_on_z_axis(a: number): void;
export function modelrunner_shift_model(a: number, b: number): void;
export function modelrunner_add_pitch(a: number, b: number): void;
export function modelrunner_add_distance(a: number, b: number): void;
export function modelrunner_add_vector(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function modelrunner_add_statistics(a: number, b: number, c: number, d: number): void;
export function modelrunner_get_statistics(a: number, b: number, c: number, d: number): void;
export function modelrunner_add_glyph(a: number, b: number, c: number, d: number): void;
export function modelrunner_get_glyph_count(a: number): number;
export function modelrunner_get_stats_count(a: number): number;
export function modelrunner_get_x_vector_count(a: number): number;
export function modelrunner_get_y_vector_count(a: number): number;
export function modelrunner_get_camera_data(a: number, b: number): void;
export function modelrunner_set_camera_data(a: number, b: number, c: number, d: number): void;
export function modelrunner_set_selected_glyphs(a: number, b: number, c: number): void;
export function modelrunner_run(a: number, b: number, c: number): number;
export function __wbg_modelrunner_free(a: number, b: number): void;
export function __wbg_vector3_free(a: number, b: number): void;
export function __wbg_get_vector3_x(a: number): number;
export function __wbg_set_vector3_x(a: number, b: number): void;
export function __wbg_get_vector3_y(a: number): number;
export function __wbg_set_vector3_y(a: number, b: number): void;
export function __wbg_get_vector3_z(a: number): number;
export function __wbg_set_vector3_z(a: number, b: number): void;
export function __wbg_orbitcamera_free(a: number, b: number): void;
export function __wbg_get_orbitcamera_distance(a: number): number;
export function __wbg_set_orbitcamera_distance(a: number, b: number): void;
export function __wbg_get_orbitcamera_pitch(a: number): number;
export function __wbg_set_orbitcamera_pitch(a: number, b: number): void;
export function __wbg_get_orbitcamera_yaw(a: number): number;
export function __wbg_set_orbitcamera_yaw(a: number, b: number): void;
export function __wbg_get_orbitcamera_eye(a: number): number;
export function __wbg_set_orbitcamera_eye(a: number, b: number): void;
export function __wbg_get_orbitcamera_target(a: number): number;
export function __wbg_set_orbitcamera_target(a: number, b: number): void;
export function __wbg_get_orbitcamera_up(a: number): number;
export function __wbg_set_orbitcamera_up(a: number, b: number): void;
export function __wbg_get_orbitcamera_bounds(a: number): number;
export function __wbg_set_orbitcamera_bounds(a: number, b: number): void;
export function __wbg_get_orbitcamera_aspect(a: number): number;
export function __wbg_set_orbitcamera_aspect(a: number, b: number): void;
export function __wbg_get_orbitcamera_fovy(a: number): number;
export function __wbg_set_orbitcamera_fovy(a: number, b: number): void;
export function __wbg_get_orbitcamera_znear(a: number): number;
export function __wbg_set_orbitcamera_znear(a: number, b: number): void;
export function __wbg_get_orbitcamera_zfar(a: number): number;
export function __wbg_set_orbitcamera_zfar(a: number, b: number): void;
export function __wbg_orbitcamerabounds_free(a: number, b: number): void;
export function __wbg_get_orbitcamerabounds_min_distance(a: number, b: number): void;
export function __wbg_set_orbitcamerabounds_min_distance(a: number, b: number, c: number): void;
export function __wbg_get_orbitcamerabounds_max_distance(a: number, b: number): void;
export function __wbg_set_orbitcamerabounds_max_distance(a: number, b: number, c: number): void;
export function __wbg_get_orbitcamerabounds_min_pitch(a: number): number;
export function __wbg_set_orbitcamerabounds_min_pitch(a: number, b: number): void;
export function __wbg_get_orbitcamerabounds_max_pitch(a: number): number;
export function __wbg_set_orbitcamerabounds_max_pitch(a: number, b: number): void;
export function __wbg_get_orbitcamerabounds_min_yaw(a: number, b: number): void;
export function __wbg_set_orbitcamerabounds_min_yaw(a: number, b: number, c: number): void;
export function __wbg_get_orbitcamerabounds_max_yaw(a: number, b: number): void;
export function __wbg_set_orbitcamerabounds_max_yaw(a: number, b: number, c: number): void;
export function wgpu_render_bundle_set_pipeline(a: number, b: number): void;
export function wgpu_render_bundle_set_bind_group(a: number, b: number, c: number, d: number, e: number): void;
export function wgpu_render_bundle_set_vertex_buffer(a: number, b: number, c: number, d: number, e: number): void;
export function wgpu_render_bundle_set_push_constants(a: number, b: number, c: number, d: number, e: number): void;
export function wgpu_render_bundle_draw(a: number, b: number, c: number, d: number, e: number): void;
export function wgpu_render_bundle_draw_indexed(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function wgpu_render_bundle_draw_indirect(a: number, b: number, c: number): void;
export function wgpu_render_bundle_draw_indexed_indirect(a: number, b: number, c: number): void;
export function wgpu_render_bundle_set_index_buffer(a: number, b: number, c: number, d: number, e: number): void;
export function wgpu_render_bundle_pop_debug_group(a: number): void;
export function wgpu_render_bundle_insert_debug_marker(a: number, b: number): void;
export function wgpu_render_bundle_push_debug_group(a: number, b: number): void;
export function __wbindgen_export_0(a: number, b: number): number;
export function __wbindgen_export_1(a: number, b: number, c: number, d: number): number;
export const __wbindgen_export_2: WebAssembly.Table;
export function __wbindgen_export_3(a: number, b: number, c: number): void;
export function __wbindgen_export_4(a: number, b: number, c: number): void;
export function __wbindgen_export_5(a: number, b: number, c: number, d: number): void;
export function __wbindgen_export_6(a: number, b: number): void;
export function __wbindgen_export_7(a: number, b: number, c: number): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_export_8(a: number, b: number, c: number): void;
export function __wbindgen_export_9(a: number): void;
export function __wbindgen_export_10(a: number, b: number, c: number, d: number): void;
