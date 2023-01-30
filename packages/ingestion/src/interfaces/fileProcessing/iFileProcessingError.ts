import {FILE_PROCESSING_ERROR_TYPES} from '@util/constants';

/**
 * This interface defines the shape of error messages that
 * are passed from the file transformers.
 */
export interface IFileProcessingError {
  /**
   * The name of the file being processed.
   */
  fileName: string;
  /**
   * The name of the table to which this error is attributed.
   */
  tableName?: string;
  /**
   * The row number (0 based) on which the error occurred.
   */
  rowIndex?: number;
  /**
   * The column index of the column that genreated the error.
   */
  columnIndex?: number;
  /**
   * The name of the column (the clean name) that generated the error.
   */
  columnName?: string;
  /**
   * The value of the column which generated the error.
   */
  columnValue?: unknown;
  /**
   * The type of the error,
   */
  errorType: FILE_PROCESSING_ERROR_TYPES;
  /**
   * A Message describing the error.
   */
  message: string;
}

/**
 * This type defined the callback that will be passed to the
 * file Transformer and will be called with the error information defined in {@link IFileProcessingError}.
 */
export type FileProcessingErrorHandler = (error: IFileProcessingError) => void;
