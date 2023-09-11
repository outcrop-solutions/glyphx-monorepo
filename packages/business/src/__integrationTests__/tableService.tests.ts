import 'mocha';
import {assert} from 'chai';
import {TableService} from '../services/table';
import AthenaConnection from '../lib/athenaConnection';

describe('#tableService', () => {
  context('test the services of the tableService', () => {
    let tableName = '';
    before(async () => {
      await AthenaConnection.init();
      const tables = await AthenaConnection.connection.runQuery('SHOW TABLES', 10, true);
      tableName = tables[0].tab_name as string;
      assert.isNotEmpty(tableName);
    });

    it('will get the max id of a table', async () => {
      const maxId = await TableService.getMaxRowId(tableName);
      assert.isAbove(maxId, 0);
    });
  });
});
