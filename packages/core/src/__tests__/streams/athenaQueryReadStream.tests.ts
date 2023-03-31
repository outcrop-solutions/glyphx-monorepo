import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import * as error from '../../error';
import {AthenaQueryReadStream} from '../../streams/athenaQueryReadStream';
import {AthenaManager} from '../../aws/athenaManager';
import {Writable} from 'stream';
import {pipeline} from 'stream/promises';
import {ResultSetConverter} from '../../aws/util/resultsetConverter';

class FakePager {
  numberOfPages: number;
  pageSize: any;
  data: any[];
  pageNo: number;
  throwErrorOnPage: number;
  constructor(
    numberOfPages: number,
    data: Record<string, unknown>[],
    throwErrorOnPage = -1
  ) {
    this.numberOfPages = numberOfPages;
    this.data = data;
    this.pageNo = 0;
    this.throwErrorOnPage = throwErrorOnPage;
  }

  async next() {
    let nextToken = 'nextToken';
    if (this.pageNo === this.throwErrorOnPage) {
      throw 'an error has occurred';
    }
    if (this.pageNo === this.numberOfPages - 1) {
      nextToken = undefined as unknown as string;
    }
    this.pageNo++;
    return {
      value: {
        NextToken: nextToken,
        ResultSet: this.data,
      },
    };
  }
}

const FAKE_DATA = [
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
  {foo: 'foo', bar: 'bar'},
];

describe('treams/AthenaQueryReadStream', () => {
  context('constructor', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will construct a new AthenaQueryReadStream', async () => {
      const getPagedQueryResultsStub = sandbox.stub();
      const pageSize = 10;
      const queryId = 'testQueryId';
      getPagedQueryResultsStub.resolves(new FakePager(1, FAKE_DATA));

      const athenaManagerInitStub = sandbox.stub();
      athenaManagerInitStub.resolves();
      sandbox.replace(AthenaManager.prototype, 'init', athenaManagerInitStub);

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const stream = new AthenaQueryReadStream(
        athenaManager,
        queryId,
        pageSize
      ) as any;
      assert.strictEqual(stream.athenaManager, athenaManager);
      assert.strictEqual(stream.queryId, queryId);
      assert.strictEqual(stream.pageSize, pageSize);
      assert.isOk(stream.dataIterator);
    });

    it('will construct a new AthenaQueryReadStream with default page size', async () => {
      const getPagedQueryResultsStub = sandbox.stub();
      const pageSize = 1000;
      const queryId = 'testQueryId';
      getPagedQueryResultsStub.resolves(new FakePager(1, FAKE_DATA));

      const athenaManagerInitStub = sandbox.stub();
      athenaManagerInitStub.resolves();
      sandbox.replace(AthenaManager.prototype, 'init', athenaManagerInitStub);

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const stream = new AthenaQueryReadStream(athenaManager, queryId) as any;
      assert.strictEqual(stream.athenaManager, athenaManager);
      assert.strictEqual(stream.queryId, queryId);
      assert.strictEqual(stream.pageSize, pageSize);
      assert.isOk(stream.dataIterator);
    });
  });

  context('_read', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('does paginate results from an Athena query', async () => {
      const getPagedQueryResultsStub = sandbox.stub();
      const numberOfPages = 10;
      const queryId = 'testQueryId';
      getPagedQueryResultsStub.resolves(
        new FakePager(numberOfPages, FAKE_DATA)
      );

      sandbox.replace(
        AthenaManager.prototype,
        'getPagedQueryResults',
        getPagedQueryResultsStub
      );

      const fromResultSetStub = sandbox.stub();
      fromResultSetStub.returns(FAKE_DATA);
      sandbox.replace(ResultSetConverter, 'fromResultset', fromResultSetStub);

      const athenaManagerInitStub = sandbox.stub();
      athenaManagerInitStub.resolves();
      sandbox.replace(AthenaManager.prototype, 'init', athenaManagerInitStub);

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      const writeStub = sandbox.stub();
      writeStub.callsFake((chunk, encoding, callback) => {
        callback();
      });
      await pipeline(
        new AthenaQueryReadStream(athenaManager, queryId, 10),
        new Writable({
          objectMode: true,
          write: writeStub,
        })
      );

      assert.strictEqual(writeStub.callCount, 100);
      assert.strictEqual(getPagedQueryResultsStub.callCount, 1);
      assert.strictEqual(fromResultSetStub.callCount, 10);
    });

    it('does paginate results from an Athena query with default page size', async () => {
      const getPagedQueryResultsStub = sandbox.stub();
      const numberOfPages = 1;
      const queryId = 'testQueryId';
      getPagedQueryResultsStub.resolves(
        new FakePager(numberOfPages, FAKE_DATA)
      );

      sandbox.replace(
        AthenaManager.prototype,
        'getPagedQueryResults',
        getPagedQueryResultsStub
      );

      const fromResultSetStub = sandbox.stub();
      fromResultSetStub.returns(FAKE_DATA);
      sandbox.replace(ResultSetConverter, 'fromResultset', fromResultSetStub);

      const athenaManagerInitStub = sandbox.stub();
      athenaManagerInitStub.resolves();
      sandbox.replace(AthenaManager.prototype, 'init', athenaManagerInitStub);

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      const writeStub = sandbox.stub();
      writeStub.callsFake((chunk, encoding, callback) => {
        callback();
      });
      await pipeline(
        new AthenaQueryReadStream(athenaManager, queryId),
        new Writable({
          objectMode: true,
          write: writeStub,
        })
      );

      assert.strictEqual(writeStub.callCount, 10);
      assert.strictEqual(getPagedQueryResultsStub.callCount, 1);
      assert.strictEqual(fromResultSetStub.callCount, 1);
    });

    it('does report an error when the underlying connection errors', async () => {
      const getPagedQueryResultsStub = sandbox.stub();
      const numberOfPages = 10;
      const queryId = 'testQueryId';
      getPagedQueryResultsStub.resolves(
        new FakePager(numberOfPages, FAKE_DATA, 2)
      );

      sandbox.replace(
        AthenaManager.prototype,
        'getPagedQueryResults',
        getPagedQueryResultsStub
      );

      const fromResultSetStub = sandbox.stub();
      fromResultSetStub.returns(FAKE_DATA);
      sandbox.replace(ResultSetConverter, 'fromResultset', fromResultSetStub);

      const athenaManagerInitStub = sandbox.stub();
      athenaManagerInitStub.resolves();
      sandbox.replace(AthenaManager.prototype, 'init', athenaManagerInitStub);

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      const writeStub = sandbox.stub();
      writeStub.callsFake((chunk, encoding, callback) => {
        callback();
      });
      const dataReader = new AthenaQueryReadStream(athenaManager, queryId, 10);
      let caughtError = false;
      dataReader.on('error', err => {
        assert.instanceOf(err, error.DatabaseOperationError);
        caughtError = true;
      });
      let errored = false;
      try {
        await pipeline(
          dataReader,
          new Writable({
            objectMode: true,
            write: writeStub,
          })
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(caughtError);
      assert.strictEqual(writeStub.callCount, 20);
      assert.strictEqual(getPagedQueryResultsStub.callCount, 1);
      assert.strictEqual(fromResultSetStub.callCount, 2);
    });
  });
  //  context('constructor', () => {});
});
