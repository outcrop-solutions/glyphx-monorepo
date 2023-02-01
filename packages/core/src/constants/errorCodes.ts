/**
 * Exposes the error codes for use with {@link error/glyphxError!GlyphxError}
 * decendants.  These codes provide a predicatble way to
 * identify the types of errors that are being genreated.
 * In some applications these codes can be mapped to http
 * status codes, i.e. codes in the 400 range can be mapped
 * to a 400 status code.
 */
export class ErrorCodes {
  /**
   * the list of error status codes.  These are
   * mapped onto specific error types.  These are
   * accessed through the {@link ErrorCodes} class.
   */
  private static STATUS_CODES = {
    InvalidArgumentError: 450,
    InvalidOperationError: 451,
    DataNotFoundError: 452,

    ConfigurationError: 460,
    DataConflictError: 461,
    DataValidationError: 462,

    DataServiceError: 440,

    UnknownDatabaseError: 559,
    AwsSecretError: 560,

    QueryTimeoutError: 565,
    QueryExecutionError: 566,

    UnknownError: 999,
  };
  /**
   * takes an error code and returns the appropriate lable.
   *
   * @returns 'UnknownError' if the code is not mapped in {@link STATUS_CODES}
   */
  static getResponseString(input: number): string {
    let retval = 'UnknownError';
    for (const [key, value] of Object.entries(ErrorCodes.STATUS_CODES)) {
      if (value === input) {
        retval = key;
        break;
      }
    }
    return retval;
  }
  /**
   * takes a label and returns the approprate erro code.
   *
   * @returns 999 if the lable is not defined in {@link STATUS_CODES}
   */
  static getResponseCode(input: string): number {
    let retval = 999;
    const lcaseInput = input.toLowerCase();
    for (const [key, value] of Object.entries(ErrorCodes.STATUS_CODES)) {
      if (key.toLowerCase() === lcaseInput) {
        retval = value;
        break;
      }
    }
    return retval;
  }
}

export default ErrorCodes;
