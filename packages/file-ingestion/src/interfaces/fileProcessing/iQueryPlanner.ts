import {IJoinTableDefinition} from './iJoinTableDefinition';

/**
 * Our IQueryPlanner will process {@link interfaces/fileProcessing/iJoinTableDefinition!IJoinTableDefinition} objects
 * and create a query to pass to an external technology ( i.e. hive)
 */
export interface IQueryPlanner {
  /**
   * an accessor to retreive our query.  This will allow our IQueryPlanner
   * implementations to maintain state between calls (rather than just make define query static)
   */
  get query(): string;
  /**
   * actually does the work.  It takes in table data and processes it into a string.
   *
   * @throws error.InvalidArgumentError if something is not well formed in the tableData parameter.
   * @throws error.InvalidOperationError if an illegal join is attempted -- an implimentor may choose to
   * throw this error if a circular join exists.  I don't know, options people.
   */
  defineQuery(tableData: IJoinTableDefinition[]): string;
}

/**
 * Defines how an implimentor of IQueryPlanner is constructed.  This allows us dependecy injection
 * to compose our file processing pipeline.
 */
export interface IConstructableQueryPlanner {
  /**
   * the constructor
   */
  new (): IQueryPlanner;
}
