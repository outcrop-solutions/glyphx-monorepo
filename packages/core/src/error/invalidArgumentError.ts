import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid arguments.
 */
export class InvalidArgumentError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param propertyName -- the variable name(s) that caused this error to be thrown.
   * @param propertyValue -- the values of the variable(s) documented in propertyName
   * that caused this error to be thrown.
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(message: string, propertyName: string | string[], propertyValue: unknown, innerError?: unknown) {
    const errorCode = ErrorCodes.getResponseCode('InvalidArgumentError');
    super(message, errorCode, innerError);
    this.data = {propertyName, propertyValue};
  }
}

export default InvalidArgumentError;
