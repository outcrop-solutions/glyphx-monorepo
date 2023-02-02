import {InvalidOperationError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/invalidOperation', () => {
  context('invalid operation error tests', () => {
    it('will create valid InvalidOperationError objects', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An invalid argument was provided',
        innerError: 'I am the inner error',
        errorCode: ErrorCodes.getResponseCode('InvalidOperationError'),
        additionalInfo: {foo: 'foo', bar: 'bar'},
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new InvalidOperationError('dummy', {}, 'dummy');

      testError(InvalidOperationError, parameters);
    });
  });
});
