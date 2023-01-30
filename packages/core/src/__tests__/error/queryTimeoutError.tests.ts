import {QueryTimeoutError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/QueryTimeout', () => {
  context('Query Timeout error tests', () => {
    it('will create valid QueryTimeoutError object', () => {
      const parameters: IErrorTestingParameters = {
        message: 'The query has timed out',
        innerError: 'I am the inner error',
        errorCode: ErrorCodes.getResponseCode('QueryTimeoutError'),
        query: 'I am a query',
        timeout: 10,
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new QueryTimeoutError('dummy', 'dummy', 10, 'dummy');

      testError(QueryTimeoutError, parameters);
    });
  });
});
