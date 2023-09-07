import {fileIngestionTypes} from 'types';
/**
 * An interface for defining fields in a CSV that will be consumed
 * by the join processord
 */
export interface IFieldDefinition {
  /**
   * the clean name of the field
   */
  name: string;
  /**
   * the original name of the field before it
   * was cleaned.
   */
  origionalName: string;
  /**
   * the type of the field
   */
  fieldType: fileIngestionTypes.constants.FIELD_TYPE;
  /**
   * For strings we need to track the longest value
   */
  longestString?: number;
}

export default IFieldDefinition;
