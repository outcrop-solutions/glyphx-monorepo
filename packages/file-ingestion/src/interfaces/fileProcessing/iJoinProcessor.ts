import {IJoinTableDefinition} from './iJoinTableDefinition';
import {IFieldDefinition} from './iFieldDefinition';

/**
 * Defines join processors for defining join strategies
 * for tables being imported.
 */
export interface IJoinProcessor {
  /**
   * exposes our calculated join information
   */
  get joinData(): IJoinTableDefinition[];
  /**
   * takes a table and field information and calualates the join
   * @param tableName - the name of the table
   * @param backingFileName - the name of the underlying file that holds the data.
   * @param columns - information about the columns in the file
   */
  processColumns(
    tableName: string,
    backingFileName: string,
    columns: IFieldDefinition[]
  ): void;
}

/**
 *  We are using dependency injection to include the various
 *  processing components in our table processing pipeline.
 *  this interface will allow us to define the constructor
 *  parameters for our pipeline and pass the class implementing
 *  {@link IJoinProcessor} to the pipeline.  The pipeline will
 *  be responsible for instantiating the class as an object
 */
export interface IConstructableJoinProcessor {
  /**
   * defines the constructor for our {@link IJoinProcessor} class
   */
  new (): IJoinProcessor;
}

export default IJoinProcessor;
