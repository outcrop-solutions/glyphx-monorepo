import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import * as error from '../../error';
import {AthenaQueryReadStream} from '../../streams/athenaQueryReadStream';
import {AthenaManager} from '../../aws/athenaManager';
import {Writable} from 'stream';
import {pipeline} from 'stream/promises';

describe.only('treams/AthenaQueryReadStream', () => {
  context('testing', () => {
    it('does paginate exist on an athenaclient', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      const queryString =
        'SELECT * FROM "jpstestdatabase"."testclientid_6401068ed4ba42c406a0494c_view"';
      await athenaManager.init();

      const queryId = await athenaManager.startQuery(queryString);

      while (true) {
        const queryStatus = await athenaManager.getQueryStatus(queryId);
        if (queryStatus.QueryExecution?.Status?.State === 'SUCCEEDED') {
          break;
        }
      }
      await pipeline(
        new AthenaQueryReadStream(athenaManager, queryId),
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            console.log(chunk);
            callback();
          },
        })
      );
    });
  });
  //  context('constructor', () => {});
});
