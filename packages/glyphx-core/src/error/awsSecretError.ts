import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid operations.
 */
export class AwsSecretError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param secretName -- The name of the secret that trapped the error.
   * @param errorCode -- An error code which describes the error
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(
    message: string,
    secretName: string,
    errorType: string,
    innerError?: unknown
  ) {
    const errorCode = ErrorCodes.getResponseCode('AwsSecretError');
    super(message, errorCode, innerError);
    this.data = {secretName, errorType};
  }
}

export default AwsSecretError;
