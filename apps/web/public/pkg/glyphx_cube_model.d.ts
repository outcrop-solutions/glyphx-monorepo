/* tslint:disable */
/* eslint-disable */
export class ModelRunner {
  free(): void;
  constructor();
  /**
   * @param {boolean} is_state_creation
   */
  take_screenshot(is_state_creation: boolean): void;
  /**
   * @param {number} width
   * @param {number} height
   */
  resize_window(width: number, height: number): void;
  /**
   * @param {string} filter
   */
  update_model_filter(filter: string): void;
  /**
   *Will force a redraw of the model, if the model is running.
   * @param {string} config
   * @param {boolean} is_running
   */
  update_configuration(config: string, is_running: boolean): void;
  toggle_axis_lines(): void;
  /**
   * @param {number} x_pos
   * @param {number} y_pos
   * @param {boolean} multi_select
   */
  select_glyph(x_pos: number, y_pos: number, multi_select: boolean): void;
  /**
   * @param {number} amount
   */
  add_yaw(amount: number): void;
  /**
   * @param {number} amount
   */
  raise_model(amount: number): void;
  reset_camera(): void;
  /**
   *These are user facing axis not internal
   */
  focus_on_x_axis(): void;
  /**
   *These are user facing axis not internal
   */
  focus_on_y_axis(): void;
  /**
   *These are user facing axis not internal
   */
  focus_on_z_axis(): void;
  /**
   * @param {number} amount
   */
  shift_model(amount: number): void;
  /**
   * @param {number} amount
   */
  add_pitch(amount: number): void;
  /**
   * @param {number} amount
   */
  add_distance(amount: number): void;
  /**
   *Adding a vector will update internal state but it
   *will not emit any redraw events.
   * @param {string} axis
   * @param {Uint8Array} data
   */
  add_vector(axis: string, data: Uint8Array): void;
  /**
   * @param {Uint8Array} data
   * @returns {string}
   */
  add_statistics(data: Uint8Array): string;
  /**
   * @param {string} axis
   * @returns {string}
   */
  get_statistics(axis: string): string;
  /**
   *Adding a glyph will update internal state but it
   *will not emit any redraw events.
   * @param {Uint8Array} data
   * @returns {string}
   */
  add_glyph(data: Uint8Array): string;
  /**
   * @returns {number}
   */
  get_glyph_count(): number;
  /**
   * @returns {number}
   */
  get_stats_count(): number;
  /**
   * @returns {number}
   */
  get_x_vector_count(): number;
  /**
   * @returns {number}
   */
  get_y_vector_count(): number;
  /**
   * @returns {string}
   */
  get_camera_data(): string;
  /**
   * @param {string} camera_data
   * @param {number} aspect_ratio
   */
  set_camera_data(camera_data: string, aspect_ratio: number): void;
  /**
   * @param {Uint32Array} selected_glyphs
   */
  set_selected_glyphs(selected_glyphs: Uint32Array): void;
  /**
   * @param {number} width
   * @param {number} height
   * @returns {Promise<void>}
   */
  run(width: number, height: number): Promise<void>;
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
export class Vector3 {
  free(): void;
  x: number;
  y: number;
  z: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_vector3_free: (a: number, b: number) => void;
  readonly __wbg_get_vector3_x: (a: number) => number;
  readonly __wbg_set_vector3_x: (a: number, b: number) => void;
  readonly __wbg_get_vector3_y: (a: number) => number;
  readonly __wbg_set_vector3_y: (a: number, b: number) => void;
  readonly __wbg_get_vector3_z: (a: number) => number;
  readonly __wbg_set_vector3_z: (a: number, b: number) => void;
  readonly __wbg_orbitcamera_free: (a: number, b: number) => void;
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
  readonly __wbg_orbitcamerabounds_free: (a: number, b: number) => void;
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
  readonly modelrunner_new: () => number;
  readonly modelrunner_take_screenshot: (a: number, b: number, c: number) => void;
  readonly modelrunner_resize_window: (a: number, b: number, c: number, d: number) => void;
  readonly modelrunner_update_model_filter: (a: number, b: number, c: number, d: number) => void;
  readonly modelrunner_update_configuration: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly modelrunner_toggle_axis_lines: (a: number) => void;
  readonly modelrunner_select_glyph: (a: number, b: number, c: number, d: number) => void;
  readonly modelrunner_reset_camera: (a: number) => void;
  readonly modelrunner_focus_on_x_axis: (a: number) => void;
  readonly modelrunner_focus_on_y_axis: (a: number) => void;
  readonly modelrunner_focus_on_z_axis: (a: number) => void;
  readonly modelrunner_shift_model: (a: number, b: number) => void;
  readonly modelrunner_add_distance: (a: number, b: number) => void;
  readonly modelrunner_add_vector: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly modelrunner_add_statistics: (a: number, b: number, c: number, d: number) => void;
  readonly modelrunner_get_statistics: (a: number, b: number, c: number, d: number) => void;
  readonly modelrunner_add_glyph: (a: number, b: number, c: number, d: number) => void;
  readonly modelrunner_get_glyph_count: (a: number) => number;
  readonly modelrunner_get_stats_count: (a: number) => number;
  readonly modelrunner_get_x_vector_count: (a: number) => number;
  readonly modelrunner_get_y_vector_count: (a: number) => number;
  readonly modelrunner_get_camera_data: (a: number, b: number) => void;
  readonly modelrunner_set_camera_data: (a: number, b: number, c: number, d: number) => void;
  readonly modelrunner_set_selected_glyphs: (a: number, b: number, c: number) => void;
  readonly modelrunner_run: (a: number, b: number, c: number) => number;
  readonly __wbg_modelrunner_free: (a: number, b: number) => void;
  readonly modelrunner_raise_model: (a: number, b: number) => void;
  readonly modelrunner_add_yaw: (a: number, b: number) => void;
  readonly modelrunner_add_pitch: (a: number, b: number) => void;
  readonly wgpu_render_bundle_set_pipeline: (a: number, b: number) => void;
  readonly wgpu_render_bundle_set_bind_group: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_set_vertex_buffer: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_set_push_constants: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_draw: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_draw_indexed: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wgpu_render_bundle_draw_indirect: (a: number, b: number, c: number) => void;
  readonly wgpu_render_bundle_draw_indexed_indirect: (a: number, b: number, c: number) => void;
  readonly wgpu_render_bundle_set_index_buffer: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_pop_debug_group: (a: number) => void;
  readonly wgpu_render_bundle_insert_debug_marker: (a: number, b: number) => void;
  readonly wgpu_render_bundle_push_debug_group: (a: number, b: number) => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_5: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number) => void;
  readonly __wbindgen_export_7: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_8: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_9: (a: number) => void;
  readonly __wbindgen_export_10: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
