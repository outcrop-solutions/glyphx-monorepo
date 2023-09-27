import {assert} from 'chai';
import {StateModel} from '../../..//mongoose/models/state';
import {databaseTypes, fileIngestionTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {ProjectModel} from '../../../mongoose/models/project';
import {UserModel} from '../../../mongoose/models';
import {WorkspaceModel} from '../../../mongoose/models/workspace';

const MOCK_STATE: databaseTypes.IState = {
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 0,
  static: false,
  fileSystemHash: 'hash this',
  name: 'state',
  payloadHash: 'hash this',
  workspace: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
  camera: {
    pos: {
      x: 0,
      y: 0,
      z: 0,
    },
    dir: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  aspectRatio: {
    height: 100,
    width: 100,
  },
  project: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IProject,
  createdBy: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IUser,
  fileSystem: [],
  properties: {},
};
const MOCK_NULLISH_STATE = {
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 0,
  static: false,
  fileSystemHash: 'hash this',
  name: 'state',
  payloadHash: 'hash this',
  workspace: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
  camera: {
    pos: {
      x: 0,
      y: 0,
      z: 0,
    },
    dir: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  aspectRatio: {
    height: 100,
    width: 100,
  },
  project: {
    _id: new mongoose.Types.ObjectId(),
  } as databaseTypes.IProject,
  createdBy: {
    _id: new mongoose.Types.ObjectId(),
  } as databaseTypes.IUser,
  fileSystem: undefined,
  properties: undefined,
} as unknown as databaseTypes.IState;

const MOCK_STATE_IDS = {
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 0,
  static: false,
  fileSystemHash: 'hash this',
  project: new mongoose.Types.ObjectId(),
  createdBy: new mongoose.Types.ObjectId(),
  workspace: new mongoose.Types.ObjectId(),
  fileSystem: [],
  name: 'state',
  payloadHash: 'hash this',
  camera: {
    pos: {
      x: 0,
      y: 0,
      z: 0,
    },
    dir: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  aspectRatio: {
    height: 100,
    width: 100,
  },
  properties: {},
} as unknown as databaseTypes.IState;

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

  context('createState', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will create a state document', async () => {
      const stateId = new mongoose.Types.ObjectId();

      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(true));

      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));

      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{_id: stateId}]));

      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);

      const result = await StateModel.createState(MOCK_STATE);
      assert.strictEqual(result._id, stateId);
      assert.isTrue(getStateByIdStub.calledOnce);
    });

    it('will create a state document with nullish coallesce', async () => {
      const stateId = new mongoose.Types.ObjectId();

      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(true));

      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));

      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{_id: stateId, properties: {}}]));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId, properties: {}});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);

      const result = await StateModel.createState(MOCK_NULLISH_STATE);
      assert.strictEqual(result._id, stateId);
      assert.isTrue(getStateByIdStub.calledOnce);
    });

    it('will create a state document with project, createdBy and workspace as ID', async () => {
      const stateId = new mongoose.Types.ObjectId();

      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(true));

      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));

      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{_id: stateId}]));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);

      const result = await StateModel.createState(MOCK_STATE_IDS);
      assert.strictEqual(result._id, stateId);
      assert.isTrue(getStateByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the project cannot be validated.', async () => {
      const stateId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(false));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{_id: stateId}]));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);

      let errorred = false;
      try {
        await StateModel.createState(MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an InvalidArgumentError if the workspace cannot be validated.', async () => {
      const stateId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(false));

      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{_id: stateId}]));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);

      let errorred = false;
      try {
        await StateModel.createState(MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an InvalidArgumentError if the creator cannot be validated.', async () => {
      const stateId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(true));
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(false));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{_id: stateId}]));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);

      let errorred = false;
      try {
        await StateModel.createState(MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the state cannot be validated.', async () => {
      const stateId = new mongoose.Types.ObjectId();

      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));

      sandbox.replace(StateModel, 'validate', sandbox.stub().rejects('Invalid'));
      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{_id: stateId}]));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);
      let errorred = false;

      try {
        await StateModel.createState(MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const stateId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'projectIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'create', sandbox.stub().rejects('oops'));

      const getStateByIdStub = sandbox.stub();
      getStateByIdStub.resolves({_id: stateId});

      sandbox.replace(StateModel, 'getStateById', getStateByIdStub);
      let errorred = false;

      try {
        await StateModel.createState(MOCK_STATE);
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
        fileSystem: [{file: 'system'} as unknown as fileIngestionTypes.IFileStats],
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

      const result = await StateModel.updateStateById(stateId.toString(), updateState);

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
        await StateModel.updateStateById(stateId.toString(), updateState);
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
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
      sandbox.replace(StateModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await StateModel.updateStateById(stateId.toString(), updateState);
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
        await StateModel.updateStateById(stateId.toString(), updateState);
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

      await StateModel.deleteStateById(stateId.toString());

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the state does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(StateModel, 'deleteOne', deleteStub);

      const stateId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await StateModel.deleteStateById(stateId.toString());
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
        await StateModel.deleteStateById(stateId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

  context('getStateById', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate() {
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
      name: 'state',
      payloadHash: 'hash this',
      workspace: {
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IWorkspace,
      camera: {
        pos: {
          x: 0,
          y: 0,
          z: 0,
        },
        dir: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
      aspectRatio: {
        height: 100,
        width: 100,
      },
      fileSystem: [],
      __v: 1,
      project: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test project',
        __v: 1,
      } as unknown as databaseTypes.IProject,
      createdBy: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
      properties: {},
    } as databaseTypes.IState;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a state document with the project and createdBy populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockState));
      sandbox.replace(StateModel, 'findById', findByIdStub);

      const doc = await StateModel.getStateById(mockState._id!.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.project as any).__v);
      assert.strictEqual(doc.id, mockState._id?.toString());
    });

    it('will throw a DataNotFoundError when the state does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(StateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await StateModel.getStateById(mockState._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(StateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await StateModel.getStateById(mockState._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryStates', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }

      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockStates = [
      {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        static: true,
        fileSystemHash: 'I am the hash',
        fileSystem: [],
        __v: 1,
        project: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user',
          __v: 1,
        } as unknown as databaseTypes.IProject,
        createdBy: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        name: 'state',
        payloadHash: 'hash this',
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        camera: {
          pos: {
            x: 0,
            y: 0,
            z: 0,
          },
          dir: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
        aspectRatio: {
          height: 100,
          width: 100,
        },
        properties: {},
      } as databaseTypes.IState,
      {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        static: true,
        fileSystemHash: 'I am the hash2',
        fileSystem: [],
        __v: 1,
        project: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user2',
          __v: 1,
        } as unknown as databaseTypes.IProject,
        createdBy: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        name: 'state',
        payloadHash: 'hash this',
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        camera: {
          pos: {
            x: 0,
            y: 0,
            z: 0,
          },
          dir: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
        aspectRatio: {
          height: 100,
          width: 100,
        },
        properties: {},
      } as databaseTypes.IState,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered states', async () => {
      sandbox.replace(StateModel, 'count', sandbox.stub().resolves(mockStates.length));

      sandbox.replace(StateModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockStates)));

      const results = await StateModel.queryStates({});

      assert.strictEqual(results.numberOfItems, mockStates.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockStates.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.project as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(StateModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(StateModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockStates)));

      let errored = false;
      try {
        await StateModel.queryStates();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(StateModel, 'count', sandbox.stub().resolves(mockStates.length));

      sandbox.replace(StateModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockStates)));

      let errored = false;
      try {
        await StateModel.queryStates({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(StateModel, 'count', sandbox.stub().resolves(mockStates.length));

      sandbox.replace(
        StateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await StateModel.queryStates({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('allStateIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return true if all state ids exist', async () => {
      const mockStateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.resolves(mockStateIds.map((id) => ({_id: id})));
      sandbox.replace(StateModel, 'find', findStub);

      const result = await StateModel.allStateIdsExist(mockStateIds);
      assert.isTrue(result);
      assert.isTrue(findStub.calledOnce);
    });

    it('will throw a DataNotFoundError if all state ids do not exist', async () => {
      const mockStateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.resolves([{_id: mockStateIds[0]}]);
      sandbox.replace(StateModel, 'find', findStub);

      let errored = false;
      try {
        await StateModel.allStateIdsExist(mockStateIds);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError if the underlying database call fails', async () => {
      const mockStateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects(new Error('something bad happened'));
      sandbox.replace(StateModel, 'find', findStub);

      let errored = false;
      try {
        await StateModel.allStateIdsExist(mockStateIds);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('updateStateWithFilter', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will update the state document with a filter with ids as objectIds', async () => {
      const input = {
        workspace: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IState;

      const validateUpdateStub = sandbox.stub();
      validateUpdateStub.resolves(true);
      sandbox.replace(StateModel, 'validateUpdateObject', validateUpdateStub);

      const updateOneStub = sandbox.stub();
      updateOneStub.resolves({modifiedCount: 1});
      sandbox.replace(StateModel, 'updateOne', updateOneStub);

      await StateModel.updateStateWithFilter({_id: new mongoose.Types.ObjectId()}, input);

      assert.isTrue(validateUpdateStub.calledOnce);
      assert.isTrue(updateOneStub.calledOnce);
    });

    it('will update the state document with a filter with ids as objects', async () => {
      const input = {
        workspace: {_id: new mongoose.Types.ObjectId()},
        project: {_id: new mongoose.Types.ObjectId()},
        createdBy: {_id: new mongoose.Types.ObjectId()},
      } as unknown as databaseTypes.IState;

      const validateUpdateStub = sandbox.stub();
      validateUpdateStub.resolves(true);
      sandbox.replace(StateModel, 'validateUpdateObject', validateUpdateStub);

      const updateOneStub = sandbox.stub();
      updateOneStub.resolves({modifiedCount: 1});
      sandbox.replace(StateModel, 'updateOne', updateOneStub);

      await StateModel.updateStateWithFilter({_id: new mongoose.Types.ObjectId()}, input);

      assert.isTrue(validateUpdateStub.calledOnce);
      assert.isTrue(updateOneStub.calledOnce);
    });

    it('will throw an InvalidOperationError if the validate update object fails', async () => {
      const input = {
        workspace: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IState;

      const validateUpdateStub = sandbox.stub();
      validateUpdateStub.rejects(new error.InvalidOperationError('That is an invalid operation', {}));
      sandbox.replace(StateModel, 'validateUpdateObject', validateUpdateStub);

      const updateOneStub = sandbox.stub();
      updateOneStub.resolves({modifiedCount: 1});
      sandbox.replace(StateModel, 'updateOne', updateOneStub);

      let errored = false;
      try {
        await StateModel.updateStateWithFilter({_id: new mongoose.Types.ObjectId()}, input);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError if the filter does not update any objects', async () => {
      const input = {
        workspace: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IState;

      const validateUpdateStub = sandbox.stub();
      validateUpdateStub.resolves(true);
      sandbox.replace(StateModel, 'validateUpdateObject', validateUpdateStub);

      const updateOneStub = sandbox.stub();
      updateOneStub.resolves({modifiedCount: 0});
      sandbox.replace(StateModel, 'updateOne', updateOneStub);

      let errored = false;
      try {
        await StateModel.updateStateWithFilter({_id: new mongoose.Types.ObjectId()}, input);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError if the underlying database operation fails', async () => {
      const input = {
        workspace: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IState;

      const validateUpdateStub = sandbox.stub();
      validateUpdateStub.resolves(true);
      sandbox.replace(StateModel, 'validateUpdateObject', validateUpdateStub);

      const updateOneStub = sandbox.stub();
      updateOneStub.rejects('something bad happened');
      sandbox.replace(StateModel, 'updateOne', updateOneStub);

      let errored = false;
      try {
        await StateModel.updateStateWithFilter({_id: new mongoose.Types.ObjectId()}, input);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});
