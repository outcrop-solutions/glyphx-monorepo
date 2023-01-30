import {BasicHiveQueryPlanner} from './basicHiveQueryPlanner';

import {
  IViewQueryPlanner,
  IJoinTableDefinition,
} from '@interfaces/fileProcessing';

/**
 * This class will create a string which can be used to create a view
 * based on a set of {@link interfaces/fileProcessing/iJoinTableDefinition!IJoinTableDefinition | IJoinTableDefinitions}
 *
 */
export class BasicHiveViewQueryPlanner
  extends BasicHiveQueryPlanner
  implements IViewQueryPlanner
{
  private viewField: string;

  /**
   * see {@link interfaces/fileProcessing/iViewQueryPlanner!IViewQueryPlanner.view | IViewQueryPlanner.view } for more information.
   */
  get view(): string {
    return this.viewField;
  }

  /**
   * Builds a new BasicHiveQueryPlanner object
   */
  constructor() {
    super();
    this.viewField = '';
  }

  /**
   * The meat of our class.  See {@link interfaces/fileProcessing/iViewQueryPlanner!IViewQueryPlanner.defineView | IViewQueryPlanner.defineView} for more information
   */
  defineView(viewName: string, tableData: IJoinTableDefinition[]): string {
    const selectQuery = this.defineQuery(tableData);
    const retval = `CREATE VIEW ${viewName} AS
	  ${selectQuery}`;
    this.viewField = retval;
    return retval;
  }
}
