import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';
import {dbConnection, Initializer, projectService, stateService, workspaceService} from 'business';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes} from 'types';
import {buildStateUrl, formatGridData, generateFilter, generateFilterQuery, generateSegment, getToken} from 'utils';

describe('#tests/utils', () => {
  const sandbox = createSandbox();

  context('#getToken', () => {
    it('should get the correct blob token based on the env variable', async () => {
      try {
        // Note: if running "[dev|demo|prod]:test", the token will be defined (due to dotenv pulling in correct env variables). If running "test", they will both be undefined as the env variables will not be in the test context
        const token = getToken();
        if (process.env.VERCEL_ENV === 'development') {
          assert.strictEqual(token, process.env.DEV_BLOB_READ_WRITE_TOKEN);
        }
        if (process.env.VERCEL_ENV === 'preview') {
          assert.strictEqual(token, process.env.DEMO_BLOB_READ_WRITE_TOKEN);
        }
        if (process.env.VERCEL_ENV === 'production') {
          // eslint-disable-next-line turbo/no-undeclared-env-vars
          assert.strictEqual(token, process.env.PROD_BLOB_READ_WRITE_TOKEN);
        }
      } catch (error) {
        assert.fail();
      }
    });
  });
  context('#buildStateUrl', () => {
    it('should build a correctly formatted state url with the right urlKey and stateId', async () => {
      try {
        // Note: if running "[dev|demo|prod]:test", the blob url will be defined (due to dotenv pulling in correct env variables). If running "test", they will be undefined as the env variables will not be in the test context
        const stateId = 'testId';
        const stateUrl = buildStateUrl(stateId);

        if (process.env.VERCEL_ENV === 'development') {
          assert.isTrue(stateUrl.includes(`${process.env.DEV_BLOB_URL}`) && stateUrl.includes(stateId));
        }
        if (process.env.VERCEL_ENV === 'preview') {
          assert.isTrue(stateUrl.includes(`${process.env.DEMO_BLOB_URL}`) && stateUrl.includes(stateId));
        }
        if (process.env.VERCEL_ENV === 'production') {
          assert.isTrue(stateUrl.includes(`${process.env.PROD_BLOB_URL}`) && stateUrl.includes(stateId));
        }
        // is it a valid URL
        assert.isOk(new URL(stateUrl));
      } catch (error) {
        assert.fail();
      }
    });
  });
  // WIP
  // context('#formatGridData', () => {
  //   it('should correctly format the grid data so that it can be rendered', async () => {
  //     try {
  //       const data = {};
  //       const columns = [];
  //       const retval = formatGridData(data, columns);
  //       assert.isOk(retval);
  //     } catch (error) {
  //       assert.fail();
  //     }
  //   });
  // });
  // context('#generateFilterQuery', () => {
  //   context('#generateSegment', () => {
  //     it('should correctly generate a query segment for a number field', async () => {
  //       try {
  //         const name = 'col1';
  //         const prop = {};
  //         //         const prop = {
  //         //           axis: web;
  //         // accepts: ACCEPTS;
  //         // key: string; // corresponds to column name
  //         // dataType: FIELD_TYPE; // corresponds to column data type
  //         // interpolation: INTERPOLATION_TYPE;
  //         // direction: DIRECTION_TYPE;
  //         // filter: Filter;
  //         // accumulatorType?: ACCUMULATOR_TYPE;
  //         // dateGrouping?: DATE_GROUPING;
  //         // description?: string;
  //         //         };
  //         // @ts-ignore
  //         const retval = generateSegment(name, prop);
  //         assert.isOk(retval);
  //       } catch (error) {
  //         assert.fail();
  //       }
  //     });
  //     it('should correctly generate a query segment for a string field', async () => {
  //       try {
  //         const name = 'col1';
  //         const prop = {};
  //         // @ts-ignore
  //         const retval = generateSegment(name, prop);
  //         assert.isOk(retval);
  //       } catch (error) {
  //         assert.fail();
  //       }
  //     });
  //   });
  //   context('#generateFilter', () => {
  //     it('should correctly generate a filter segment', async () => {
  //       try {
  //         const prop = {};
  //         // @ts-ignore
  //         const retval = generateFilter(prop);
  //         assert.isOk(retval);
  //       } catch (error) {
  //         assert.fail();
  //       }
  //     });
  //   });
  //   context('#generateFilterQuery', () => {
  //     it('should correctly generate the entire filter section of the query', async () => {
  //       try {
  //         const prop = {};
  //         // @ts-ignore
  //         const retval = generateFilterQuery(project);
  //         assert.isOk(retval);
  //       } catch (error) {
  //         assert.fail();
  //       }
  //     });
  //   });
  // });
});
