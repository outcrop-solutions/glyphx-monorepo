import 'mocha';
import {assert} from 'chai';
import {AthenaManager} from '../../aws';

describe.only('#integrationTests/AthenaManager', () => {
  context('getTableDescription', () => {
    it('Will get a table description', async () => {
      const athenaManager = new AthenaManager('glyphx-etl-db');
      await athenaManager.init();

      const listOfTables = (await athenaManager.runQuery(
        'SHOW TABLES',
        20,
        true
      )) as Record<string, string>[];

      const tableName = listOfTables.find(
        t => t.tab_name.startsWith('-') === false
      );

      assert.isOk(tableName);
      const tableDescription = await athenaManager.getTableDescription(
        tableName?.tab_name ?? ''
      );

      tableDescription.forEach((d: any) => {
        assert.isOk(d.columnName);
        assert.isAtLeast(d.columnType, 0);
        assert.isAtMost(d.columnType, 2);
      });
    });
  });
});
