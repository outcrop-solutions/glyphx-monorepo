import {DataNotFoundError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/DataNotFound', () => {
  context('Data NOt Found error tests', () => {
    it('will create valid DataNotFoundError objects', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An Unexpected Error has Occurred',
        innerError: 'I am the inner error',
        key: 'data',
        value: 'badData',
        errorCode: ErrorCodes.getResponseCode('DataNotFoundError'),
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new DataNotFoundError('dummy', 'dummy', 'dummy', 'dummy');

      testError(DataNotFoundError, parameters, true);
    });
  });
});
