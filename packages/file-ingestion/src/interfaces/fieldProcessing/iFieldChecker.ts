/**
 * An interface to define field checkers.  Field checkers take in a string and
 * determine whether or not that string can be expressed as the type.  For example
 * is this string $123,456.09 a number?  Classes implementing this interface will
 * also impliment the convertfield function which will return the converted representation
 * of the string.
 *
 *@typeParam T - the type we are checking or converting to.
 *
 */
export interface IFieldChecker<T> {
  /**
   * check field will take a string and return a boolean indicating whether or not
   * the string can be expressed as the type T.
   *
   * @returns true - if the type can be expressed as T
   */
  checkField(input: string): boolean;

  /**
   * attempts to convert the string passed as input as a type T.
   *
   * @throws glyphx-core.error.InvalidArgumentError if input cannot be expressed as T
   */
  convertField(input: string): T;
}
