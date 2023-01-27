import {assert} from 'chai';
import {StateModel} from '../../..//mongoose/models/state';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {ProjectModel} from '../../../mongoose/models/project';

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
        ProjectModel,
        'allProjectIdsExist',
        sandbox.stub().resolves(true)
      );
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
        ProjectModel,
        'allProjectIdsExist',
        sandbox.stub().resolves(true)
      );
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
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        sandbox.stub().resolves(true)
      );
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

  context('updateStateById', () => {
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

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const inputState = {
        version: 2,
      };

      let errored = false;

      try {
        await StateModel.validateUpdateObject(inputState);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const inputState = {
        _id: new mongoose.Types.ObjectId(),
        version: 2,
      };
      let errored = false;

      try {
        await StateModel.validateUpdateObject(inputState);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update createdAt', async () => {
      const inputState = {
        createdAt: new Date(),
        version: 2,
      };
      let errored = false;

      try {
        await StateModel.validateUpdateObject(inputState);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update updatedAt', async () => {
      const inputState = {
        updatedAt: new Date(),
        version: 2,
      };
      let errored = false;

      try {
        await StateModel.validateUpdateObject(inputState);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update projects', async () => {
      const inputState = {
        version: 2,
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IProject,
        ],
      };
      let errored = false;

      try {
        await StateModel.validateUpdateObject(inputState);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('Delete a state document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a state', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(StateModel, 'deleteOne', deleteStub);

      const stateId = new mongoose.Types.ObjectId();

      await StateModel.deleteStateById(stateId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the state does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(StateModel, 'deleteOne', deleteStub);

      const stateId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await StateModel.deleteStateById(stateId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(StateModel, 'deleteOne', deleteStub);

      const stateId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await StateModel.deleteStateById(stateId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

  context('validate projects', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the projects can be validated', async () => {
      const inputProjects = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      const results = await StateModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach(r => {
        const foundId = inputProjects.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the projectIds can be validated ', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      const results = await StateModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach(r => {
        const foundId = inputProjects.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the project ids cannot be found',
          'projectIds',
          inputProjects
        )
      );
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      let errored = false;
      try {
        await StateModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(errorText);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      let errored = false;
      try {
        await StateModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getStateById', () => {
    class mockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError: boolean = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate(input: string) {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockState: databaseTypes.IState = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      static: true,
      fileSystemHash: 'I am the hash',
      fileSystem: [],
      __v: 1,
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user',
          __v: 1,
        } as unknown as databaseTypes.IProject,
      ],
    } as databaseTypes.IState;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a state document with the projects populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new mockMongooseQuery(mockState));
      sandbox.replace(StateModel, 'findById', findByIdStub);

      const doc = await StateModel.getStateById(
        mockState._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      doc.projects.forEach(p => assert.isUndefined((p as any).__v));

      assert.strictEqual(doc._id, mockState._id);
    });

    it('will throw a DataNotFoundError when the state does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new mockMongooseQuery(null));
      sandbox.replace(StateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await StateModel.getStateById(mockState._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new mockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(StateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await StateModel.getStateById(mockState._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
