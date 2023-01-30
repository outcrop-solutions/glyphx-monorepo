import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid operations.
 */
export class DataValidationError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param key -- the name of the data that is in error.
   * @param value -- the value of the data in error.
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(message: string, key: string, value: any, innerError?: unknown) {
    const errorCode = ErrorCodes.getResponseCode('DataValidationError');
    super(message, errorCode, innerError);
    this.data = {key, value};
  }
}

export default DataValidationError;
