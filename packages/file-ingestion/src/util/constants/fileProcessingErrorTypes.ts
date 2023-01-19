/**
 * Defines the type of errors that can occur during file
 * processing.
 */
export enum FILE_PROCESSING_ERROR_TYPES {
  INVALID_FIELD_VALUE = 'InvalidFieldValue',
  TABLE_ALREADY_EXISTS = 'TableAlreadyExists',
  TABLE_DOES_NOT_EXIST = 'TableDoesNotExist',
  FILE_ALREADY_EXISTS = 'FileAlreadyExists',
  INVALID_TABLE_SET = 'InvalidTableSet',
  UNEXPECTED_ERROR = 'UnexpectedError',
}
