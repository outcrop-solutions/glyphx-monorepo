import {Transform, TransformCallback} from 'node:stream';
import * as fileProcessingInterfaces from '@interfaces/fileProcessing';
import * as fieldProcessingInterfaces from '@interfaces/fieldProcessing';
import {FILE_PROCESSING_ERROR_TYPES} from '@util/constants';
import {NumberFieldChecker} from '@fieldProcessing';
//eslint-disable-next-line
import {fileIngestion} from '@glyphx/types';
/**
 * After further reading and research. I was able to find
 * the Parquet transformer so I can create a similar approach.
 * This classes, primary purpose will be to read x rows of data
 * and determine the column types. once it has this information,
 * it will pass options, to our parquet transformer that will
 * initialize that stream and then push out all of our saved objects.
 */

export const GLYPHX_ID_COLUMN_NAME = '__glyphx_id__';

/**
 * An internal interface that is used to store infomation about he discovererd columns.
 */
export interface IColumnTypeTracker {
  /**
   * The cleaned name of the column -- we run the column through a name cleaner to remove udesired/illegal characters.
   */
  columnName: string;
  /**
   * The origional/dirty name of the column.
   */
  origionalColumnName: string;
  /**
   * The field type calculator which is used to determine our field types
   */
  fieldTypeCalculator: fieldProcessingInterfaces.IFieldTypeCalulator;
  /**
   * We need to keep track of the longest field so that we can se our string size.
   */
  maxFieldLength: number;
}

/**
 * This Transformer Stream will take in our data as JSON objects and figure out the
 * valid data types, valid column names and convert the input strings to their respective
 * data types.  Falcuties have been built to report out columns in error and post processing
 * file information.
 */
export class BasicFileTransformer extends Transform {
  /**
   * A private variable to keep track of whether or not we are processing the first
   * row of data.  Threre is some setup for this transformer that occurs the first time
   * data hits the _transform method.
   */
  private firstRow: boolean;

  /**
   * To ease memory pressure, this transform stream wil only look at a sample of the
   * data to calculate the field types.  This flag keeps track of whether or not we
   * have hit that threshold.
   */
  private hasMetInitialSample: boolean;

  /**
   * Keeps track of the number of rows that have been processed.
   */
  private rowNumber: number;

  /**
   * The beginning value for the rowId
   */
  private begRowNumber: number;
  /**
   * The name of the file that we are processing.  Only stored here so that it can
   * be reported back out though a callback.
   */
  private readonly fileName: string;

  /**
   * The name of the table that will be created form this file.  Only stored here so that it can be reported back out through a callback.
   */
  private readonly tableName: string;

  /**
   * The output file name for the pipeline that will be reported
   * back through the callback.
   */
  private readonly outputFileName: string;

  /**
   * The output directory.  This is stored here so it can be reported through the callback.
   */
  private readonly outputDirectory: string;

  /**
   * The size of the input file on disk.  Only stored here so that it can be
   * reported back out through a callback.
   */
  private readonly fileSize: number;

  /**
   * The file operation for this transformer.  Only stored here so that it can be
   * reported back through a callback.
   */

  private readonly fileOperation: fileIngestion.constants.FILE_OPERATION;
  /**
   * Once all data has been read, this will be called to report out the results.
   * See {@link interfaces/fileProcessing/iFileInformation!FileInformationCallback} for additional
   * details.
   */
  private readonly callback: fileProcessingInterfaces.FileInformationCallback;

  /**
   * This callback will report out any columns whose data cannot be represented by the
   * calculated data type.  See {@link interfaces/fileProcessing/iFileProcessingError!FileProcessingErrorHandler}
   * for more details.
   */
  private readonly errorCallback: fileProcessingInterfaces.FileProcessingErrorHandler;

  /**
   * The number of rows to sample to determine the column types.
   */
  private readonly sampleSize: number;

  /**
   * A temorary buffer to hold rows until we determine the column type of each column.
   */
  private readonly savedRows: any[];

  /**
   * The type trackers for each column.
   */
  private readonly columTypeTrackers: IColumnTypeTracker[];

  /**
   * The class which will be used to caluculate the field types.  See {@link interfaces/fieldProcessing/iFieldTypeCalculator!IConstructableFieldTypeCalculator}
   */
  private readonly fieldTypeCalculator: fieldProcessingInterfaces.IConstructableFieldTypeCalculator;

  /**
   * The class which will be instantiated to clean the column names.  See {@link interfaces/fileProcessing/iColumnNameCleaner!IColumnNameCleaner}
   */
  private readonly columnNameCleaner: fileProcessingInterfaces.IColumnNameCleaner;

  /**
   * The object which will be instantiated to convert strings to numbers.
   */
  private readonly numberFieldChecker: NumberFieldChecker;

  /**
   * Builds a new instance of our BasicFileTransformer class.
   *
   * @param fileName - The name of the file which we are processing.
   * @param fileSize - The size of the file in bytes
   * @param callback - A {@link interfaces/fileProcessing/iFileInformation!FileInformationCallback} taht will be called once all of the data has been processed.
   * @param errorCallback - A {@link interfaces/fileProcessing/iFileProcessingError!FileProcessingErrorHandler} that is called whenever an error occures while converting a string to it's target data type.
   * @sampleSize - The number of objects to process to detemine the type of the data.
   */
  constructor(
    fileName: string,
    fileSize: number,
    outputFileName: string,
    outputDirectory: string,
    tableName: string,
    fileOperation: fileIngestion.constants.FILE_OPERATION,
    callback: fileProcessingInterfaces.FileInformationCallback,
    errorCallback: fileProcessingInterfaces.FileProcessingErrorHandler,
    fieldTypeCalculator: fieldProcessingInterfaces.IConstructableFieldTypeCalculator,
    columnNameCleaner: fileProcessingInterfaces.IConstructableColumnNameCleaner,
    begRowNumber: number,
    sampleSize = 100
  ) {
    super({objectMode: true});
    this.firstRow = true;
    this.fileName = fileName;
    this.outputDirectory = outputDirectory;
    this.outputFileName = outputFileName;
    this.tableName = tableName;
    this.fileOperation = fileOperation;
    this.fileSize = fileSize;
    this.callback = callback;
    this.errorCallback = errorCallback;
    this.fieldTypeCalculator = fieldTypeCalculator;
    this.sampleSize = sampleSize;

    this.hasMetInitialSample = false;
    this.rowNumber = 0;
    this.begRowNumber = begRowNumber;
    this.savedRows = [];
    this.columTypeTrackers = [];
    //TODO: should these be injected/constructable?
    this.numberFieldChecker = new NumberFieldChecker();
    this.columnNameCleaner = new columnNameCleaner();

    //when this finishes we need to sendout our file information.
    this.on('finish', () => {
      callback(this.getDataForCallback());
    });
  }

  /**
   * Puts the data together for the callback
   */
  private getDataForCallback(): fileProcessingInterfaces.IFileInformation {
    const columns = this.columTypeTrackers.map(c => {
      return {
        name: c.columnName,
        origionalName: c.origionalColumnName,
        fieldType: c.fieldTypeCalculator.fieldType,
        longestString:
          c.fieldTypeCalculator.fieldType ===
          fileIngestion.constants.FIELD_TYPE.STRING
            ? c.maxFieldLength
            : undefined,
      };
    });
    columns.unshift({
      name: GLYPHX_ID_COLUMN_NAME,
      origionalName: GLYPHX_ID_COLUMN_NAME,
      fieldType: fileIngestion.constants.FIELD_TYPE.NUMBER,
      longestString: undefined,
    });
    return {
      fileName: this.fileName,
      parquetFileName: this.outputFileName,
      outputFileDirecotry: this.outputDirectory,
      tableName: this.tableName,
      numberOfRows: this.rowNumber,
      numberOfColumns: this.columTypeTrackers.length,
      columns: columns,
      fileSize: this.fileSize,
      fileOperationType: this.fileOperation,
    };
  }

  /**
   * _flush is called before the 'finish' event is fired. Here we need to make sure that we are not holding on to any saved rows.
   *
   * @param callback -- we must call callback to let the stream processess know that we are done flusing the data.
   */
  public override _flush(callback: TransformCallback) {
    if (this.savedRows.length) {
      this.columTypeTrackers.forEach(c => c.fieldTypeCalculator.finish());
      this.sendSavedRows();
    }
    callback();
  }

  /**
   * This function will setup our fieldTypeCalulators once we start processing data.
   *
   * @param chunk - our first oject.
   */
  private processFirstRow(chunk: any) {
    let fieldNumber = -1;
    for (const key in chunk) {
      fieldNumber++;
      const fieldTypeCalculator = new this.fieldTypeCalculator(
        key,
        fieldNumber,
        1
      );

      this.columTypeTrackers.push({
        columnName: this.columnNameCleaner.cleanColumnName(key),
        origionalColumnName: key,
        fieldTypeCalculator: fieldTypeCalculator,
        maxFieldLength: 0,
      });
    }
    this.firstRow = false;
  }

  /**
   * Once we have processed our sampleSize of rows, this functon will be called to create a parquetJS schema that will be the first object passed out of this transformer stream.
   */
  private buildParquertSchema(): Record<string, unknown> {
    const retval: Record<string, unknown> = {};
    //Add our glyphxId to the parquet schema
    retval.glyphxId = {
      type: 'DOUBLE',
      encoding: 'PLAIN',
      optional: false,
    };
    this.columTypeTrackers.forEach(c => {
      retval[c.columnName] = {
        type:
          c.fieldTypeCalculator.fieldType ===
          fileIngestion.constants.FIELD_TYPE.NUMBER
            ? 'DOUBLE'
            : 'UTF8',
        encoding: 'PLAIN',
        optional:
          c.fieldTypeCalculator.fieldType ===
          fileIngestion.constants.FIELD_TYPE.NUMBER,
      };
    });

    return retval;
  }

  /**
   * This will take our row and convert the field names to their cleaned name, and will convert the strings to their appropriate data type.
   *
   * @param chunk - or object to be cleaned.
   */
  private cleanRow(chunk: any): Record<string, unknown> {
    this.rowNumber++;
    const retval: Record<string, unknown> = {};
    let columnIndex = 0;
    for (const key in chunk) {
      const fieldTypeCalculator = this.columTypeTrackers.find(
        c => c.origionalColumnName === key
      ) as IColumnTypeTracker;
      const dirtyValue = chunk[key];
      let value: unknown = null;

      if (dirtyValue.length > fieldTypeCalculator.maxFieldLength)
        fieldTypeCalculator.maxFieldLength = dirtyValue.length;
      try {
        //not sure why nyc is not seeing us hit the branch on line 135
        //istanbul ignore next
        value =
          fieldTypeCalculator?.fieldTypeCalculator.fieldType ===
          fileIngestion.constants.FIELD_TYPE.NUMBER
            ? this.numberFieldChecker.convertField(dirtyValue)
            : dirtyValue;
      } catch (err) {
        value = null;
        this.errorCallback({
          fileName: this.fileName,
          errorType: FILE_PROCESSING_ERROR_TYPES.INVALID_FIELD_VALUE,
          rowIndex: this.rowNumber,
          columnIndex: columnIndex,
          columnName: key,
          columnValue: dirtyValue,
          message: `The value of collumn ${key} does not appear to be a well formed number string`,
        });
      }

      //the fieldTypeCalculator will always be defined, so we can't
      //really test the alternative.  This is just here to satisfy typescript
      //istanbul ignore next
      retval[fieldTypeCalculator?.columnName ?? key] = value;
      columnIndex++;
    }

    return retval;
  }

  /**
   * Once we know what our data types are, this function will call buildParquertSchema to beuild the schema,  and then send the schema and along with clean versions of our saved rows.
   */
  private sendSavedRows(): void {
    this.columTypeTrackers.forEach(c => c.fieldTypeCalculator.finish());

    this.savedRows.forEach((r, index) => {
      if (index === 0) {
        const schema = this.buildParquertSchema();
        this.push(schema); //Send the schema first
      }

      const cleanRow = this.cleanRow(r);
      this.push(cleanRow);
    });
    this.savedRows.splice(0); //Cleanup
  }

  /**
   * This function is used to make our calls to our filedTypeCalculators to help us determine our field data types.
   *
   * @param chunk - the data to check.
   */
  private checkFieldType(chunk: any): void {
    for (const key in chunk) {
      const value = chunk[key];
      const fieldTypeCalculator = this.columTypeTrackers.find(
        c => c.origionalColumnName === key
      );
      //istanbul ignore next
      //eslint-disable-next-line
      if (value != null)
        //null will signify the end of data and will cause the field checker to finilize its findings
        //TODO: right now, the way the pipelining works, this should always hit, since the csv parsing step will set empty fields to empty strings.  Future connectors will need to pay attention to this.
        fieldTypeCalculator?.fieldTypeCalculator.processItemsSync(value);
    }
    //Add a custom id for datalookup.
    chunk.glyphxId = this.begRowNumber + this.rowNumber;
    this.savedRows.push(chunk);
  }

  /**
   * The main processor.  Is called as part of the streaming pipeline and processes our data.
   * @param chunk -- our data as a JSON object.
   * @param encoding -- is not used.
   * @param callback -- must be caled to let the pipeline know that we have successfuly processed the data.
   */
  public override _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    //TODO: we need some exception handling here.  We cannot allow an uncaught exception to bubble up and crash the pipeline.
    //we should catch the error and then emit on 'error' event.   Not sure yet what we should do if the first row fails.
    //if any other row fails we should log it and move on.
    if (this.firstRow) {
      this.processFirstRow(chunk);
    }
    if (this.savedRows.length >= this.sampleSize && !this.hasMetInitialSample) {
      this.sendSavedRows();
      this.hasMetInitialSample = true;
    }

    if (!this.hasMetInitialSample) {
      this.checkFieldType(chunk);
      callback();
      return;
    } else {
      const cleanRow = this.cleanRow(chunk);
      this.push(cleanRow);
      callback();
      return;
    }
  }
}
