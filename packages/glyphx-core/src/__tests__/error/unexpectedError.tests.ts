import {UnexpectedError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/Unexpected', () => {
  context('Unexpected error tests', () => {
    it('will create valid UnexpectedError objects', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An Unexpected Error has Occurred',
        innerError: 'I am the inner error',
        errorCode: ErrorCodes.getResponseCode('UnknownError'),
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new UnexpectedError('dummy', 'dummy');

      testError(UnexpectedError, parameters, true);
    });
  });
});
