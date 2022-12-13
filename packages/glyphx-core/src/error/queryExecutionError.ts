import {GlyphxError} from './glyphxError';
import {ErrorCodes} from '../constants';

/**
 * An {@link error/glyphxError!GlyphxError} for handling invalid arguments.
 */
export class QueryExecutionError extends GlyphxError {
  /**
   * @param message - the message to be displayed.
   * @param query -- the query that was executed.
   * @param innerError -- an optional inner error which gives more detail regarding why this
   * error was thrown.
   */
  constructor(message: string, query: string, innerError?: unknown) {
    const errorCode = ErrorCodes.getResponseCode('QueryExecutionError');
    super(message, errorCode, innerError);

    this.data = {query};
  }
}
