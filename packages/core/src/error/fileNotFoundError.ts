import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid arguments.
 */
export class FileNotFoundError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(message: string, innerError?: unknown) {
    const errorCode = ErrorCodes.getResponseCode('FileNotFoundError');
    super(message, errorCode, innerError);
  }
}
