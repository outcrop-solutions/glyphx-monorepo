import {IJoinTableDefinition} from './iJoinTableDefinition';
/**
 * This interface describes the shape of IViewQueryPlanner classes
 * which will take our {@link interfaces/fileProcessing/iJoinTableDefinition!IJoinTableDefinition | IJoinTableDefinitions}
 * and create the string to create a view.
 */
export interface IViewQueryPlanner {
  /**
   * An accessor to retrieve the last view that was defined my this object.
   */
  get view(): string;
  /**
   * The meat of this object.  Will take our {@link interfaces/fileProcessing/iJoinTableDefinition!IJoinTableDefinition | IJoinTableDefinitions}
   * and create a string to allow us to create the view in our underlying
   * store.
   *
   * @param viewName - a name for our view
   * @param tableData - the join information that will be used to create our view.
   */
  defineView(viewName: string, tableData: IJoinTableDefinition[]): string;
}

/**
 * This interface defines a constructor for our {@link IViewQueryPlanner}
 * this allows us to pass constructable definitions to other classes
 * to make the creation of views pluggable.
 */
export interface IConstructableViewQueryPlanner {
  /**
   * Defines are constructor.
   */
  new (): IViewQueryPlanner;
}
