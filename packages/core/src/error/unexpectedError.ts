import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling unexpected errors.
 */
export class UnexpectedError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * that caused this error to be thrown.
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(message: string, innerError?: unknown) {
    const errorCode = ErrorCodes.getResponseCode('UnknownError');
    super(message, errorCode, innerError);
  }
}

export default UnexpectedError;
