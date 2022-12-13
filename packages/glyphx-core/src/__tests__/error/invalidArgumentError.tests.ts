import {InvalidArgumentError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/invalidArgument', () => {
  context('invalid argument error tests', () => {
    it('will create valid InvalidArgumentError objects', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An invalid argument was provided',
        innerError: 'I am the inner error',
        errorCode: ErrorCodes.getResponseCode('InvalidArgumentError'),
        propertyName: 'propName',
        propertyValue: 'this is my value',
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new InvalidArgumentError('dummy', 'dummy', 'dummy', 'dummy');

      testError(InvalidArgumentError, parameters);
    });
  });
});
