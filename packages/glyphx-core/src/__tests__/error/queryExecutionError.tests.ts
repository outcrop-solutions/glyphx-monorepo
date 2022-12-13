import {QueryExecutionError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/QueryExecution', () => {
  context('Query Execution error tests', () => {
    it('will create valid QueryTimeoutError object', () => {
      const parameters: IErrorTestingParameters = {
        message: 'The query has failed',
        innerError: 'I am the inner error',
        errorCode: ErrorCodes.getResponseCode('QueryExecutionError'),
        query: 'I am a query',
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new QueryExecutionError('dummy', 'dummy', 'dummy');

      testError(QueryExecutionError, parameters);
    });
  });
});
