import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid operations.
 */
export class DatabaseOperationError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param databaseName -- The name of the database that trapped the error.
   * @param operationDescription -- A description of the operation that was being performed when the error occurred.
   * @param data -- Any data supporting the description of the operation.
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(
    message: string,
    databaseName: string,
    operationDescription: string,
    data?: any,
    innerError?: unknown
  ) {
    const errorCode = ErrorCodes.getResponseCode('UnknownDatabaseError');
    super(message, errorCode, innerError);
    this.data = {databaseName, operationDescription, data};
  }
}

export default DatabaseOperationError;
