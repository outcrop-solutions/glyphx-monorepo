import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid operations.
 */
export class DataServiceError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param service -- the name of the service.
   * @param operation -- the operation being performed.
   * @param data -- any relevant data to accompany the error or {}
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(
    message: string,
    service: string,
    operation: any,
    data: any,
    innerError?: unknown
  ) {
    const errorCode = ErrorCodes.getResponseCode('DataServiceError');
    super(message, errorCode, innerError);
    this.data = {service, operation, data};
  }
}

export default DataServiceError;
