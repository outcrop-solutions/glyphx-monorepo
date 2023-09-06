import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid operations.
 */
export class InvalidOperationError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param data -- additional data related to the error.
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(message: string, additionalInfo: Record<string, unknown> | undefined, innerError?: unknown) {
    const errorCode = ErrorCodes.getResponseCode('InvalidOperationError');
    super(message, errorCode, innerError);
    this.data = {additionalInfo};
  }
}

export default InvalidOperationError;
