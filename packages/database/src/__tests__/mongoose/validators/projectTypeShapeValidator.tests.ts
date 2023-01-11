import mocha from 'mocha';
import {assert} from 'chai';
import {projectTypeShapeValidator} from '../../../mongoose/validators';

describe('#mongoose/validators/projectTypeShape', () => {
  context('projectTypeShapeValidator', () => {
    it('Should return true for a valid type', () => {
      const shape = {
        one: {
          type: 'foo',
          required: true,
        },
        two: {
          type: 'bar',
          required: false,
        },
      };

      assert.isTrue(projectTypeShapeValidator(shape));
    });

    it('should fail when type is missing from one of the fields', () => {
      const shape = {
        one: {
          type: 'foo',
          required: true,
        },
        two: {
          required: false,
        },
      };

      assert.isFalse(projectTypeShapeValidator(shape));
    });

    it('should fail when type is not a string on one of the fields', () => {
      const shape = {
        one: {
          type: 'foo',
          required: true,
        },
        two: {
          type: 1,
          required: false,
        },
      };

      assert.isFalse(projectTypeShapeValidator(shape));
    });

    it('Should fail when required is missing on one of the fields', () => {
      const shape = {
        one: {
          type: 'foo',
        },
        two: {
          type: 'bar',
          required: false,
        },
      };

      assert.isFalse(projectTypeShapeValidator(shape));
    });

    it('Should fail when required is not a boolean on one of the fields', () => {
      const shape = {
        one: {
          type: 'foo',
          required: true,
        },
        two: {
          type: 'bar',
          required: 'false',
        },
      };

      assert.isFalse(projectTypeShapeValidator(shape));
    });

    it('Should fail when an extra field is included in the shape', () => {
      const shape = {
        one: {
          type: 'foo',
          required: true,
          bar: 'baz',
        },
        two: {
          type: 'bar',
          required: false,
        },
      };

      assert.isFalse(projectTypeShapeValidator(shape));
    });
  });
});
