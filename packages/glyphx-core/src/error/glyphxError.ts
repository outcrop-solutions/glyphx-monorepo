import {Logger} from '../logging';
import {ERROR_SEVERITY, ErrorCodes} from '../constants';

/**
 * The base Error object for backend Glyphx applications.  This Class
 * has built in functionality for serializing errors to log messages
 * and can publish errors to the log using the Publis method.
 */
export class GlyphxError extends Error {
  /**
   * An Error can have an inner error which will get serialize, along with any of it's inner
   * errors.
   */
  innerError: unknown;
  /**
   * An error class derived from this call can set optional data which will be
   * included in the log messages.
   */
  data: unknown;
  /**
   * An error code from {@link constants/errorCodes!ErrorCodes} that adds a standard code to the error.
   * this is set by the inherited child classes.
   */
  errorCode: number;
  /**
   * An error description from {@link constants/errorCodes!ErrorCodes} that matches the errorCode.
   */
  errorDescription: string;

  /**
   * @param message -- the message to be included in the error.
   * @param errorCode -- the error code mapped to {@link constants/errorCodes!ErrorCodes} that further refines the error.
   * @param innerError -- additional error informaiton to include in the error object.  Can be any type.
   * @param name -- allows the implementer to override the name of the error.  This appears in the logs
   * and defaults to the name of the Class.
   */
  constructor(
    message: string,
    errorCode: number,
    innerError?: unknown,
    name?: string
  ) {
    super(message);
    if (!name) this.name = this.constructor.name;
    else this.name = name;
    this.innerError = innerError;
    Error.captureStackTrace(this, this.constructor);
    const errorDescription = ErrorCodes.getResponseString(errorCode);
    const localCode = ErrorCodes.getResponseCode(errorDescription);
    this.errorCode = localCode;
    this.errorDescription = errorDescription;
  }
  /**
   * serializes objects (usually inner errors) to a log friendly format that can be
   * serialized to a string by JSON.serialize
   *
   * @param obj -- the object to serialize.
   *
   */
  //eslint-disable-next-line
  private serialize(obj: any): any {
    //eslint-disable-next-line
    let serialized: any = null;

    //this will just get our fileds for both JSON based objects
    //and class based objects.  We will need a separate enumeration
    //for our acessors;
    for (const prop in obj) {
      if (serialized === null) serialized = {};
      const value = obj[prop];
      if (typeof value === 'object') {
        serialized[prop] = this.serialize(value);
      } else {
        serialized[prop] = value;
      }
    }

    //we have to enumerate our functions, through the prototype
    //to look for our get accessors
    const proto = Object.getPrototypeOf(obj);
    Object.getOwnPropertyNames(proto).forEach(classFunctionName => {
      {
        //so it is weird, but in my testing the proto will
        //have a key for the get accessor, but its value will
        //be undefined, but it can be accessed through the indexer
        //on the object itself
        if (proto[classFunctionName] === undefined) {
          //istanbul ignore next
          if (serialized === null) serialized = {};
          const value = obj[classFunctionName];

          if (typeof value === 'object') {
            serialized[classFunctionName] = this.serialize(value);
          } else {
            serialized[classFunctionName] = value;
          }
        }
      }
    });
    if (serialized === null) {
      serialized = {
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
        innerError: obj.innerError,
      };
    }
    return serialized;
  }
  /**
   * will recurse through the innerError stack, serialize each innerError and return all
   * of them in a nested log friendly format.
   *
   * @param err -- the inner error to process.
   */
  //eslint-disable-next-line
  private getInnerError(err: any): any {
    //eslint-disable-next-line
    const res: any = {};

    if (err instanceof GlyphxError) {
      res.message = err.message;
      res.data = err.data;
      res.stack = err.stack;
      res.innerError = this.getInnerError(err.innerError);
    } else if (err) {
      res.serialized =
        typeof err === 'object' ? this.serialize(err) : err.toString();
    }
    return res;
  }

  /**
   * will convert this instance and create a log friendly object that can be
   * converted to a string using JSON.serialize.
   */
  public getMessage(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      data: this.data,
      stack: this.stack,
      innerError: this.getInnerError(this.innerError),
    };
  }
  /**
   * will serialze this instance as a log friendly string.  Basically calls getMessage()
   * then runs the result through JSON.serialize.
   */
  public getString(): string {
    return JSON.stringify(this.getMessage());
  }

  /**
   *  will publish this instance to the logging subsystem.
   *
   *  @param correlationId -- an optional string that can be used by clients
   *  to group messages together.
   *  @param severity -- an {@link constants/errorSeverity!ERROR_SEVERITY} that maps to a logging level.  The defult value is ERROR_SEVERITY.ERROR
   *
   *  @returns -- this object so that it can be chained.
   */
  publish(correlationId?: string, severity?: ERROR_SEVERITY): GlyphxError {
    const logSeverity = severity ?? ERROR_SEVERITY.ERROR;
    const logCorId = correlationId ?? '';
    if (logSeverity === ERROR_SEVERITY.INFORMATION)
      Logger.info(logCorId, this.getMessage());
    else if (logSeverity === ERROR_SEVERITY.WARNING)
      Logger.warn(logCorId, this.getMessage());
    else if (logSeverity === ERROR_SEVERITY.ERROR)
      Logger.error(logCorId, this.getMessage());
    else Logger.error(logCorId, this.getMessage());

    return this;
  }
}

export default GlyphxError;
