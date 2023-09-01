import {fileIngestionTypes} from 'types';
/**
 * The IFieldTypeCalulator interface accepts an array of items and
 * determines a common {@link util/constants/fieldType!FIELD_TYPE} for the items in the set.
 * Classes implementing this interface must also be contructable via
 * the {@link IConstructableFieldTypeCalculator}. Future
 * implimentations of this interface may use data structures
 * other than arrays i.e. a stream
 */
export interface IFieldTypeCalulator {
  /**
   * Returns the name of the field that was processed.  This
   * is passed to an IFieldTypeCalculator though its constructor.
   * see {@link IConstructableFieldTypeCalculator}, this accessor
   * is meant to provide a little bit of sanity to the system
   * to make it easier to keep track of columns that have and have not been processed.
   */
  get fieldName(): string;
  /**
   * Returns an external index of the field that was processed.  This
   * is passed to an IFieldTypeCalculator though its constructor.
   * see {@link IConstructableFieldTypeCalculator}, this accessor
   * is meant to provide a little bit of sanity to the system
   * to make it easier to keep track of columns that have and have not been processed.
   */
  get fieldIndex(): number;
  /**
   * Returns the sample rate used to process fields.  This
   * is passed to an IFieldTypeCalculator though its constructor.
   * see {@link IConstructableFieldTypeCalculator}, this accessor
   * is meant to provide a little bit of sanity to the system
   * to make it easier to keep track of columns that have and have not been processed.
   */
  get sampleRate(): number;
  /**
   * returns the number of items passed to the {@link processItems} function for analysis.
   *
   * @throws InvalidOperationError if a set has has not been processed through {@link processItems}
   */
  get numberPassed(): number;
  /**
   * returns the number of records analyzed by {@link processItems}.  Effectivly MATH.floor( numberPassed * sampeRate);
   *
   * @throws InvalidOperationError if a set has has not been processed through {@link processItems}
   */
  get samplesAnalyzed(): number;
  /**
   * returns the {@link util/constants/fieldType!FIELD_TYPE} of the set last processed by {@link processItems}
   *
   * @throws InvalidOperationError if a set has has not been processed through {@link processItems}
   */
  get fieldType(): fileIngestionTypes.constants.FIELD_TYPE;
  /**
   * indicates whether or not data has been processed to determiine a {@link util/constants/fieldType!FIELD_TYPE}
   */
  get hasProcessedItems(): boolean;

  /**
   * indicates whether or not we have reached the end of the stream and
   * processed all of the data.
   */
  get allItemsProcessed(): boolean;

  /**
   * this function will take a NodeJS.readableSream and consume the 'data' and 'end' events to process the data.
   */
  processItems(itemsStream: NodeJS.ReadableStream): void;
  /**
   * this function will allow us to send values as an array or a string to be analyzed.
   */
  processItemsSync(value: string | string[]): void;

  /**
   * This function is called to complete processing.  It can be called internally in stream mode, or externally in sync mode.
   */
  finish(): void;
}

/**
 *  We are using dependency injection to include the various
 *  processing components in our table processing pipeline.
 *  this interface will allow us to define the constructor
 *  parameters for our pipeline and pass the class implementing
 *  {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator} to the pipeline.  The pipeline will
 *  be responsible for instantiating the class as an object
 */
export interface IConstructableFieldTypeCalculator {
  /**
   * Our constructor which will construct to {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator}
   *
   * @param fieldName -- the name of the field attached to this instance of {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator}
   * @param fieldIndex -- the external index number of the field attached to this instance of {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator}
   * @param sampleRate-- a number between 0.01 and 1 that is used by {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.processItems} to choose items on which to caluclate our {@link utils/constants/fieldType!FIELD_TYPE}.  Early implementations should set this to 1 or near 1.
   */
  new (
    fieldName: string,
    fieldIndex: number,
    sampleRate: number
  ): IFieldTypeCalulator;
}
