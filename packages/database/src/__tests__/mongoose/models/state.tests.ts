import {assert} from 'chai';
import {StateModel} from '../../..//mongoose/models/state';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const mockState: databaseTypes.IState = {
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 0,
  static: false,
  fileSystemHash: 'hash this',
  projects: [],
  fileSystem: [],
};

describe('#mongoose/models/state', () => {
  context('stateIdExists', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the stateId exists', async () => {
      const stateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: stateId});
      sandbox.replace(StateModel, 'findById', findByIdStub);

      const result = await StateModel.stateIdExists(stateId);

      assert.isTrue(result);
    });

    it('should return false if the stateId does not exist', async () => {
      const stateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(StateModel, 'findById', findByIdStub);

      const result = await StateModel.stateIdExists(stateId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const stateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(StateModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await StateModel.stateIdExists(stateId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('creatState', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will create a state document', async () => {
      const stateId = new mongoose.Types.ObjectId();
      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().resolves([{_id: stateId}])
      );

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);

      const result = await StateModel.createState(mockState);
      assert.strictEqual(result._id, stateId);
      assert.isTrue(getStateByIdStub.calledOnce);
    });

    it('will throw an DataValidationError if the state cannont be validated.', async () => {
      const stateId = new mongoose.Types.ObjectId();
      sandbox.replace(
        StateModel,
        'stateIdExists',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        StateModel,
        'validate',
        sandbox.stub().rejects('Invalid')
      );
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().resolves([{_id: stateId}])
      );

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);
      let errorred = false;

      try {
        await StateModel.createState(mockState);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const stateId = new mongoose.Types.ObjectId();
      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'create', sandbox.stub().rejects('oops'));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);
      let errorred = false;

      try {
        await StateModel.createState(mockState);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context.only('updateStateById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a State', async () => {
      const updateState = {
        version: 2,
      };

      const stateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(StateModel, 'updateOne', updateStub);

      const getStateStub = sandbox.stub();
      getStateStub.resolves({_id: stateId});
      sandbox.replace(StateModel, 'getStateById', getStateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(StateModel, 'validateUpdateObject', validateStub);

      const result = await StateModel.updateStateById(stateId, updateState);

      assert.strictEqual(result._id, stateId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getStateStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the state does not exist', async () => {
      const updateState = {
        version: 2,
      };

      const stateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(StateModel, 'updateOne', updateStub);

      const getStateStub = sandbox.stub();
      getStateStub.resolves({_id: stateId});
      sandbox.replace(StateModel, 'getStateById', getStateStub);

      let errorred = false;
      try {
        await StateModel.updateStateById(stateId, updateState);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateState = {
        version: 2,
      };

      const stateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(StateModel, 'updateOne', updateStub);

      const getStateStub = sandbox.stub();
      getStateStub.resolves({_id: stateId});
      sandbox.replace(StateModel, 'getStateById', getStateStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(StateModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await StateModel.updateStateById(stateId, updateState);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateState = {
        version: 2,
      };

      const stateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(StateModel, 'updateOne', updateStub);

      const getStateStub = sandbox.stub();
      getStateStub.resolves({_id: stateId});
      sandbox.replace(StateModel, 'getStateById', getStateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(StateModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await StateModel.updateStateById(stateId, updateState);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });
});
