import * as fileProcessingInterfaces from '@interfaces/fileProcessing';

/**
 * This class will take an array of {@link interfaces/fileProcessing/iJoinTableDefinition!IJoinTableDefinition}
 * and create a SELECT query which will join thed table together and select the approriate fields.
 * This query can them be used downstream to create a view of our data.
 */
export class BasicHiveQueryPlanner
  implements fileProcessingInterfaces.IQueryPlanner
{
  private queryField: string;
  /**
   * Returns the query that was defined by the last call to {@link defineQuery} See {@link interfaces/fileProcessing/iQueryPlanner!IQueryPlanner.query | IQueryPlanner.query } for additional information.
   */
  get query(): string {
    return this.queryField;
  }

  /**
   * Builds a new BasicHiveQueryPlanner object.
   */
  constructor() {
    this.queryField = '';
  }

  /**
   * This function does most of the work for this class.  It will take in
   * the tableData and convert it to a string which represents the SELECT
   * query. See {@link interfaces/fileProcessing/iQueryPlanner!IQueryPlanner.query | IQueryPlanner.defineQuery } for additional details.
   */
  defineQuery(
    tableData: fileProcessingInterfaces.IJoinTableDefinition[]
  ): string {
    const selections: string[] = [];
    const joins: string[] = [];

    tableData.forEach((t, i) => {
      const myAlias = t.tableAlias;
      const joinAlias = t.joinTable?.tableAlias;
      const prefix = i === 0 ? 'FROM' : 'LEFT OUTER JOIN';
      const onPhrase = t.joinTable ? 'ON ' : '';

      let joinPhrase = `${prefix} ${t.tableName} ${myAlias} ${onPhrase} `;
      const subJoins: string[] = [];
      t.columns.forEach(c => {
        if (c.isSelectedColumn) {
          selections.push(`${myAlias}.${c.columnName}`);
        }

        if (c.isJoinColumn) {
          subJoins.push(
            `${joinAlias}.${c.columnName}=${myAlias}.${c.columnName}`
          );
        }
      });

      if (subJoins.length) {
        joinPhrase += subJoins.join(' AND ');
      }

      joins.push(joinPhrase);
    });

    const query = `SELECT ${selections.join(',')}\n${joins.join('\n')}`;

    this.queryField = query;

    return query;
  }
}
