import 'mocha';
import {assert} from 'chai';
import * as processTracking from '../../generalPurposeFunctions/processTracking';

describe('#generalPurposeFunctions/processTracking', () => {
  context('getProcessId', () => {
    it('should return a process id without - in it', () => {
      const processId = processTracking.getProcessId();
      assert.isString(processId);
      assert.notInclude(processId, '-');
    });
  });
});
