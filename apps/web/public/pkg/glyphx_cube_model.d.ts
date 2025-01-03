/* tslint:disable */
/* eslint-disable */
/**
*/
export class ModelRunner {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} amount
*/
  add_yaw(amount: number): void;
/**
* @param {number} amount
*/
  add_pitch(amount: number): void;
/**
* @param {number} amount
*/
  add_distance(amount: number): void;
/**
* @returns {Promise<void>}
*/
  run(): Promise<void>;
}
/**
* An [OrbitCamera] only permits rotation of the eye on a spherical shell around a target.
*/
export class OrbitCamera {
  free(): void;
/**
* The aspect ratio of the camera.
*/
  aspect: number;
/**
* The bounds within which the camera can be moved.
*/
  bounds: OrbitCameraBounds;
/**
* The distance of the eye from the target.
*/
  distance: number;
/**
* The field of view of the camera.
*/
  fovy: number;
/**
* The pitch angle in radians.
*/
  pitch: number;
/**
* The target of the orbit camera.
*/
  target: Vector3;
/**
* The cameras' up vector.
*/
  up: Vector3;
/**
* The yaw angle in radians.
*/
  yaw: number;
/**
* The far clipping plane of the camera.
*/
  zfar: number;
/**
* The near clipping plane of the camera.
*/
  znear: number;
}
/**
* The boundaries for how an [OrbitCamera] can be rotated.
*/
export class OrbitCameraBounds {
  free(): void;
/**
* If set it is not possible to move the camera further from the target
* than the specified amount.
*/
  max_distance?: number;
/**
* The `min_pitch` can only be between `]0, PI / 2]` due to mathematical reasons.
*/
  max_pitch: number;
/**
* If set the yaw angle will be constrained. The constrain should be in the
* interval `[0, PI]`.
*/
  max_yaw?: number;
/**
* The minimum distance between the eye and the target.
* This should not be negative. In order to ensure this the minimum distance
* should never be smaller than [f32::EPSILON].
*/
  min_distance?: number;
/**
* The `min_pitch` can only be between `]-PI / 2, 0]` due to mathematical reasons.
*/
  min_pitch: number;
/**
* If set the yaw angle will be constrained. The constrain should be in the
* interval `[-PI, 0]`.
*/
  min_yaw?: number;
}
/**
*/
export class Vector3 {
  free(): void;
/**
*/
  x: number;
/**
*/
  y: number;
/**
*/
  z: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly modelrunner_add_yaw: (a: number, b: number) => void;
  readonly modelrunner_add_pitch: (a: number, b: number) => void;
  readonly modelrunner_add_distance: (a: number, b: number) => void;
  readonly modelrunner_run: (a: number) => number;
  readonly modelrunner_new: () => number;
  readonly __wbg_modelrunner_free: (a: number) => void;
  readonly __wbg_vector3_free: (a: number) => void;
  readonly __wbg_get_vector3_x: (a: number) => number;
  readonly __wbg_set_vector3_x: (a: number, b: number) => void;
  readonly __wbg_get_vector3_y: (a: number) => number;
  readonly __wbg_set_vector3_y: (a: number, b: number) => void;
  readonly __wbg_get_vector3_z: (a: number) => number;
  readonly __wbg_set_vector3_z: (a: number, b: number) => void;
  readonly __wbg_orbitcamera_free: (a: number) => void;
  readonly __wbg_get_orbitcamera_distance: (a: number) => number;
  readonly __wbg_set_orbitcamera_distance: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_pitch: (a: number) => number;
  readonly __wbg_set_orbitcamera_pitch: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_yaw: (a: number) => number;
  readonly __wbg_set_orbitcamera_yaw: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_target: (a: number) => number;
  readonly __wbg_set_orbitcamera_target: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_up: (a: number) => number;
  readonly __wbg_set_orbitcamera_up: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_bounds: (a: number) => number;
  readonly __wbg_set_orbitcamera_bounds: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_aspect: (a: number) => number;
  readonly __wbg_set_orbitcamera_aspect: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_fovy: (a: number) => number;
  readonly __wbg_set_orbitcamera_fovy: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_znear: (a: number) => number;
  readonly __wbg_set_orbitcamera_znear: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamera_zfar: (a: number) => number;
  readonly __wbg_set_orbitcamera_zfar: (a: number, b: number) => void;
  readonly __wbg_orbitcamerabounds_free: (a: number) => void;
  readonly __wbg_get_orbitcamerabounds_min_distance: (a: number, b: number) => void;
  readonly __wbg_set_orbitcamerabounds_min_distance: (a: number, b: number, c: number) => void;
  readonly __wbg_get_orbitcamerabounds_max_distance: (a: number, b: number) => void;
  readonly __wbg_set_orbitcamerabounds_max_distance: (a: number, b: number, c: number) => void;
  readonly __wbg_get_orbitcamerabounds_min_pitch: (a: number) => number;
  readonly __wbg_set_orbitcamerabounds_min_pitch: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamerabounds_max_pitch: (a: number) => number;
  readonly __wbg_set_orbitcamerabounds_max_pitch: (a: number, b: number) => void;
  readonly __wbg_get_orbitcamerabounds_min_yaw: (a: number, b: number) => void;
  readonly __wbg_set_orbitcamerabounds_min_yaw: (a: number, b: number, c: number) => void;
  readonly __wbg_get_orbitcamerabounds_max_yaw: (a: number, b: number) => void;
  readonly __wbg_set_orbitcamerabounds_max_yaw: (a: number, b: number, c: number) => void;
  readonly wgpu_compute_pass_set_pipeline: (a: number, b: number) => void;
  readonly wgpu_compute_pass_set_bind_group: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_compute_pass_set_push_constant: (a: number, b: number, c: number, d: number) => void;
  readonly wgpu_compute_pass_insert_debug_marker: (a: number, b: number, c: number) => void;
  readonly wgpu_compute_pass_push_debug_group: (a: number, b: number, c: number) => void;
  readonly wgpu_compute_pass_pop_debug_group: (a: number) => void;
  readonly wgpu_compute_pass_write_timestamp: (a: number, b: number, c: number) => void;
  readonly wgpu_compute_pass_begin_pipeline_statistics_query: (a: number, b: number, c: number) => void;
  readonly wgpu_compute_pass_end_pipeline_statistics_query: (a: number) => void;
  readonly wgpu_compute_pass_dispatch_workgroups: (a: number, b: number, c: number, d: number) => void;
  readonly wgpu_compute_pass_dispatch_workgroups_indirect: (a: number, b: number, c: number) => void;
  readonly wgpu_render_bundle_set_pipeline: (a: number, b: number) => void;
  readonly wgpu_render_bundle_set_bind_group: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_set_vertex_buffer: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_set_push_constants: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_draw: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_draw_indexed: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wgpu_render_bundle_draw_indirect: (a: number, b: number, c: number) => void;
  readonly wgpu_render_bundle_draw_indexed_indirect: (a: number, b: number, c: number) => void;
  readonly wgpu_render_pass_set_pipeline: (a: number, b: number) => void;
  readonly wgpu_render_pass_set_bind_group: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_pass_set_vertex_buffer: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_pass_set_push_constants: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_pass_draw: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_pass_draw_indexed: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wgpu_render_pass_draw_indirect: (a: number, b: number, c: number) => void;
  readonly wgpu_render_pass_draw_indexed_indirect: (a: number, b: number, c: number) => void;
  readonly wgpu_render_pass_multi_draw_indirect: (a: number, b: number, c: number, d: number) => void;
  readonly wgpu_render_pass_multi_draw_indexed_indirect: (a: number, b: number, c: number, d: number) => void;
  readonly wgpu_render_pass_multi_draw_indirect_count: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wgpu_render_pass_multi_draw_indexed_indirect_count: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wgpu_render_pass_set_blend_constant: (a: number, b: number) => void;
  readonly wgpu_render_pass_set_scissor_rect: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_pass_set_viewport: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wgpu_render_pass_set_stencil_reference: (a: number, b: number) => void;
  readonly wgpu_render_pass_insert_debug_marker: (a: number, b: number, c: number) => void;
  readonly wgpu_render_pass_push_debug_group: (a: number, b: number, c: number) => void;
  readonly wgpu_render_pass_pop_debug_group: (a: number) => void;
  readonly wgpu_render_pass_write_timestamp: (a: number, b: number, c: number) => void;
  readonly wgpu_render_pass_begin_pipeline_statistics_query: (a: number, b: number, c: number) => void;
  readonly wgpu_render_pass_end_pipeline_statistics_query: (a: number) => void;
  readonly wgpu_render_pass_execute_bundles: (a: number, b: number, c: number) => void;
  readonly wgpu_render_bundle_set_index_buffer: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_pop_debug_group: (a: number) => void;
  readonly wgpu_render_bundle_insert_debug_marker: (a: number, b: number) => void;
  readonly wgpu_render_bundle_push_debug_group: (a: number, b: number) => void;
  readonly wgpu_render_pass_set_index_buffer: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h654c6b7304bd8e72: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h20980ec2c4de5810: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he51f81cd0d3447b0: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb8bea407b97b0762: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h74fa8e288a3a945e: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
