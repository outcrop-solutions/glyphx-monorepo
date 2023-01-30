import {DataValidationError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/DataValidation', () => {
  context('Data Validation error tests', () => {
    it('will create valid DataValidationError objects', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An Unexpected Error has Occurred',
        innerError: 'I am the inner error',
        key: 'data',
        value: 'badData',
        errorCode: ErrorCodes.getResponseCode('DataValidationError'),
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new DataValidationError('dummy', 'dummy', 'dummy', 'dummy');

      testError(DataValidationError, parameters, true);
    });
  });
});
