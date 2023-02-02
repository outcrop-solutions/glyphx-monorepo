import {AwsSecretError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/AwsSecret', () => {
  context('Aws Secret error tests', () => {
    it('will create valid AwsSecretError object', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An Unexpected Error has Occurred',
        innerError: 'I am the inner error',
        secretName: 'testDatabase',
        errorType: 'I am the error type',
        errorCode: ErrorCodes.getResponseCode('AwsSecretError'),
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new AwsSecretError('dummy', 'dummy', 'dummy', 'dummy');

      testError(AwsSecretError, parameters);
    });
  });
});
