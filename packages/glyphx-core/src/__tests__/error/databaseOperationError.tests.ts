import {DatabaseOperationError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/DatabaseOperation', () => {
  context('Database operation error tests', () => {
    it('will create valid DatabaseOperationError object', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An Unexpected Error has Occurred',
        innerError: 'I am the inner error',
        databaseName: 'testDatabase',
        operationDescription: 'test operation description',
        data: {test: 'data'},
        errorCode: ErrorCodes.getResponseCode('UnknownDatabaseError'),
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new DatabaseOperationError('dummy', 'dummy', 'dummy', 'dummy', 'dummy');

      testError(DatabaseOperationError, parameters);
    });
  });
});
