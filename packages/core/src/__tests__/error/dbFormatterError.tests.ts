import 'mocha';
import {DbFormatterError} from '../../error';
import {testError, IErrorTestingParameters} from './errorHelper';
import {ErrorCodes} from '../../constants';

describe('#error/DbFormatter', () => {
  context('Db formatting error tests', () => {
    it('will create valid DbFormatterError objects', () => {
      const parameters: IErrorTestingParameters = {
        message: 'An Unexpected Error has Occurred',
        innerError: 'I am the inner error',
        key: 'data',
        value: 'jsObject',
        errorCode: ErrorCodes.getResponseCode('DbFormatterError'),
      };
      //code coverage does not see that we are calling the constructor since we are reflecting it.
      //just to make it happy, we will construct one by hand
      //before running our tests.

      new DbFormatterError('dummy', 'dummy', 'dummy', 'dummy');

      testError(DbFormatterError, parameters, true);
    });
  });
});
