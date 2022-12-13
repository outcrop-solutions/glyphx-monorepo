/**
 * The severities that can be passed to {@link error/glyphxError!GlyphxError.publish | GlyphxError.publish()} to determine
 * how the error is logged
 */
export enum ERROR_SEVERITY {
  INFORMATION = 'Information',
  WARNING = 'Warning',
  ERROR = 'Error',
  FATAL = 'Fatal',
}

export default ERROR_SEVERITY;
