import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from 'core';
import {NumberFieldChecker} from './numberFieldChecker';

import {fileIngestionTypes} from 'types';
import {DateFieldChecker} from './dateFieldChecker';

/**
 * The minumum number of samples to analyze before using the sample rate.
 * This value is also used to determing the frequency at which to publish intermediate results.
 */
export const MINIMUM_NUMBER_OF_SAMPLES = 100;

/**
 * This class is our first and basic cut at processing fields and determining
 * the column types.  In these early stages there are only two types of columns
 * that we support, strings and floats (numbers).  See {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator}
 * for more details about fields and accessors not documented here.
 */
export class BasicFieldTypeCalculator implements fieldProcessingInterfaces.IFieldTypeCalulator {
  private readonly nameField: string;
  private readonly indexField: number;
  private readonly sampleRateField: number;
  private numberPassedField: number;
  private samplesAnalyzedField: number;
  private fieldTypeField: fileIngestionTypes.constants.FIELD_TYPE;
  private hasProcessedItemsField: boolean;
  private allItemsProcessedField: boolean;

  /**
   * a counter which holds the number of columns that look like strings.
   */
  private numberOfStrings: number;
  /**
   * a counter which holds the number of columns that look like numbers.
   * see {@link numberFieldChecker}
   */
  private numberOfNumbers: number;

  private numberOfDates: number;

  /**
   * our NumberFieldChecker that will determine if our string can be represeted as
   * as number.
   */
  private numberFieldChecker: NumberFieldChecker;
  private dateFieldChecker: DateFieldChecker;

  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.fieldName | IFieldTypeCalculator.fieldName}
   */
  get fieldName(): string {
    return this.nameField;
  }
  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.fieldIndex | IFieldTypeCalculator.fieldIndex}
   */
  get fieldIndex(): number {
    return this.indexField;
  }
  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.sampleRate | IFieldTypeCalculator.sampleRate}
   */
  get sampleRate(): number {
    return this.sampleRateField;
  }
  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.numberPassed | IFieldTypeCalculator.numberPassed}
   */
  get numberPassed(): number {
    if (!this.hasProcessedItemsField) {
      throw new error.InvalidOperationError('This information is not available until processItems has been called', {});
    }
    return this.numberPassedField;
  }
  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.samplesAnalyzed | IFieldTypeCalculator.samplesAnalyzed}
   */
  get samplesAnalyzed(): number {
    if (!this.hasProcessedItemsField) {
      throw new error.InvalidOperationError('This information is not available until processItems has been called', {});
    }
    return this.samplesAnalyzedField;
  }
  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.fieldType | IFieldTypeCalculator.fieldType}
   */
  get fieldType(): fileIngestionTypes.constants.FIELD_TYPE {
    if (!this.hasProcessedItemsField) {
      throw new error.InvalidOperationError('This information is not available until processItems has been called', {});
    }
    return this.fieldTypeField;
  }

  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.allItemsProcessed | IFieldTypeCalculator.allItemsProcessed}
   */
  get allItemsProcessed(): boolean {
    return this.allItemsProcessedField;
  }
  /**
   * See the interface IFieldTypeCalculator for more information --
   * {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.hasProcessedItems | IFieldTypeCalculator.hasProcessedItems}
   */
  get hasProcessedItems(): boolean {
    return this.hasProcessedItemsField;
  }

  /**
   * Builds a new BasicFieldTypeCalculator
   *
   * @param fieldName - the name of our field
   * @param fieldIndex - the index of our field as defined externally by the client.
   * @param sampleRate - a number beween 0 - 1.0 (inclusive) to determine how many of the supplied values
   * should be analyzed to determine the field type.
   */
  constructor(fieldName: string, fieldIndex: number, sampleRate: number) {
    this.nameField = fieldName;
    this.indexField = fieldIndex;
    this.sampleRateField = sampleRate;
    this.numberPassedField = 0;
    this.samplesAnalyzedField = 0;
    this.fieldTypeField = fileIngestionTypes.constants.FIELD_TYPE.UNKNOWN;
    this.hasProcessedItemsField = false;
    this.allItemsProcessedField = false;
    this.numberOfStrings = 0;
    this.numberOfNumbers = 0;
    this.numberOfDates = 0;
    this.numberFieldChecker = new NumberFieldChecker();
    this.dateFieldChecker = new DateFieldChecker();
  }

  /**
   * will evaluate the values of {@link numberOfStrings} and {@link numberOfNumbers} to
   * determne our {@link fieldType}.  In the case of an equal number of each, the field
   * type will be set to {@link util/constants/fieldType!FIELD_TYPE.STRING | fileIngestionTypes.constants.FIELD_TYPE.STRING}
   */
  private calculateFieldType(): void {
    const percentNumber = this.numberOfNumbers / this.samplesAnalyzedField;

    const percentDate = this.numberOfDates / this.samplesAnalyzedField;
    this.fieldTypeField =
      percentNumber < 0.65 && percentDate < 0.65
        ? fileIngestionTypes.constants.FIELD_TYPE.STRING
        : percentNumber > percentDate
        ? fileIngestionTypes.constants.FIELD_TYPE.NUMBER
        : fileIngestionTypes.constants.FIELD_TYPE.DATE;
    this.hasProcessedItemsField = true;
  }

  /**
   * will validate our field against {@link numberFieldChecker} to determine if the value
   * is a string or number.  This function will also call {@link calculateFieldType}
   * to produce interim results.
   */
  private validateField(value: string): void {
    this.samplesAnalyzedField++;
    const isNumber = this.numberFieldChecker.checkField(value);
    const isDate = this.dateFieldChecker.checkField(value);
    if (isNumber) this.numberOfNumbers++;
    if (isDate) this.numberOfDates++;
    if (!isNumber && !isDate) this.numberOfStrings++;

    if (!(this.samplesAnalyzedField % MINIMUM_NUMBER_OF_SAMPLES)) this.calculateFieldType();
  }

  /**
   * See the interface IFieldTypeCalculator for more information -- {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.finish | IFieldTypeCalculator.finish}
   */
  finish(): void {
    this.calculateFieldType();
    this.allItemsProcessedField = true;
  }

  /**
   * See the interface IFieldTypeCalculator for more information -- {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.processItemsSync | IFieldTypeCalculator.processItemsSync}
   */
  processItemsSync(value: string | string[]): void {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        this.numberPassedField++;
        this.validateField(v);
      });
    } else {
      this.numberPassedField++;
      this.validateField(value);
    }
  }
  /**
   * See the interface IFieldTypeCalculator for more information -- {@link interfaces/fieldProcessing/iFieldTypeCalculator!IFieldTypeCalulator.processItems | IFieldTypeCalculator.processItems}
   */
  processItems(itemsStream: NodeJS.ReadableStream): void {
    itemsStream.on('data', (chunk) => {
      const value = chunk.toString();
      this.numberPassedField++;
      if (this.numberPassedField <= MINIMUM_NUMBER_OF_SAMPLES) {
        this.validateField(value);
      } else if (this.samplesAnalyzedField / this.numberPassedField < this.sampleRateField) {
        this.validateField(value);
      }
    });

    itemsStream.once('end', () => {
      this.finish();
    });
  }
}
