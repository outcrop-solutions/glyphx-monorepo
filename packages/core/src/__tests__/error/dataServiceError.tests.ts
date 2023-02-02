/*eslint-disable node/no-unpublished-import*/
import 'mocha';
import {DataServiceError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/DatabaseService', () => {
  context('Data service error tests', () => {
    it('will create valid DatabaseOperationError object', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An Unexpected Error has Occurred',
        innerError: 'I am the inner error',
        service: 'testService',
        operation: 'test operation description',
        data: {test: 'data'},
        errorCode: ErrorCodes.getResponseCode('DataServiceError'),
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new DataServiceError('dummy', 'dummy', 'dummy', 'dummy', 'dummy');

      testError(DataServiceError, parameters);
    });
  });
});
