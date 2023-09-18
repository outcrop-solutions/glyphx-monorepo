// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {StateModel} from '../../../mongoose/models/state';
import * as mocks from '../../../mongoose/mocks';
import {UserModel} from '../../../mongoose/models/user';
// eslint-disable-next-line import/no-duplicates
import {cameraSchema} from '../../../mongoose/schemas';
// eslint-disable-next-line import/no-duplicates
import {aspectRatioSchema} from '../../../mongoose/schemas';
import {ProjectModel} from '../../../mongoose/models/project';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {IQueryResult} from '@glyphx/types';
import {databaseTypes} from '../../../../../../database';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

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

  context('allStateIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the state ids exist', async () => {
      const stateIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedStateIds = stateIds.map(stateId => {
        return {
          _id: stateId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedStateIds);
      sandbox.replace(StateModel, 'find', findStub);

      assert.isTrue(await StateModel.allStateIdsExist(stateIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const stateIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedStateIds = [
        {
          _id: stateIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedStateIds);
      sandbox.replace(StateModel, 'find', findStub);
      let errored = false;
      try {
        await StateModel.allStateIdsExist(stateIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          stateIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const stateIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(StateModel, 'find', findStub);
      let errored = false;
      try {
        await StateModel.allStateIdsExist(stateIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject(
          mocks.MOCK_STATE as unknown as Omit<
            Partial<databaseTypes.IState>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject(
          mocks.MOCK_STATE as unknown as Omit<
            Partial<databaseTypes.IState>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(createdByStub.calledOnce);
      assert.isTrue(projectStub.calledOnce);
      assert.isTrue(workspaceStub.calledOnce);
    });

    it('will fail when the createdBy does not exist.', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject(
          mocks.MOCK_STATE as unknown as Omit<
            Partial<databaseTypes.IState>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the project does not exist.', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject(
          mocks.MOCK_STATE as unknown as Omit<
            Partial<databaseTypes.IState>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the workspace does not exist.', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject(
          mocks.MOCK_STATE as unknown as Omit<
            Partial<databaseTypes.IState>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject({
          ...mocks.MOCK_STATE,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IState>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject({
          ...mocks.MOCK_STATE,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IState>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const createdByStub = sandbox.stub();
      createdByStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', createdByStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await StateModel.validateUpdateObject({
          ...mocks.MOCK_STATE,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IState>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createState', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a state document', async () => {
      sandbox.replace(
        StateModel,
        'validateCreatedBy',
        sandbox.stub().resolves(mocks.MOCK_STATE.createdBy)
      );
      sandbox.replace(
        StateModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_STATE.project)
      );
      sandbox.replace(
        StateModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_STATE.workspace)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(StateModel, 'getStateById', stub);

      const stateDocument = await StateModel.createState(mocks.MOCK_STATE);

      assert.strictEqual(stateDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the createdBy validator throws one', async () => {
      sandbox.replace(
        StateModel,
        'validateCreatedBy',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The createdBy does not exist',
              'createdBy ',
              {}
            )
          )
      );
      sandbox.replace(
        StateModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_STATE.project)
      );
      sandbox.replace(
        StateModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_STATE.workspace)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(StateModel, 'getStateById', stub);

      let errored = false;

      try {
        await StateModel.createState(mocks.MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the project validator throws one', async () => {
      sandbox.replace(
        StateModel,
        'validateCreatedBy',
        sandbox.stub().resolves(mocks.MOCK_STATE.createdBy)
      );
      sandbox.replace(
        StateModel,
        'validateProject',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The project does not exist',
              'project ',
              {}
            )
          )
      );
      sandbox.replace(
        StateModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_STATE.workspace)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(StateModel, 'getStateById', stub);

      let errored = false;

      try {
        await StateModel.createState(mocks.MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the workspace validator throws one', async () => {
      sandbox.replace(
        StateModel,
        'validateCreatedBy',
        sandbox.stub().resolves(mocks.MOCK_STATE.createdBy)
      );
      sandbox.replace(
        StateModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_STATE.project)
      );
      sandbox.replace(
        StateModel,
        'validateWorkspace',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The workspace does not exist',
              'workspace ',
              {}
            )
          )
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(StateModel, 'getStateById', stub);

      let errored = false;

      try {
        await StateModel.createState(mocks.MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        StateModel,
        'validateCreatedBy',
        sandbox.stub().resolves(mocks.MOCK_STATE.createdBy)
      );
      sandbox.replace(
        StateModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_STATE.project)
      );
      sandbox.replace(
        StateModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_STATE.workspace)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(StateModel, 'getStateById', stub);
      let hasError = false;
      try {
        await StateModel.createState(mocks.MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        StateModel,
        'validateCreatedBy',
        sandbox.stub().resolves(mocks.MOCK_STATE.createdBy)
      );
      sandbox.replace(
        StateModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_STATE.project)
      );
      sandbox.replace(
        StateModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_STATE.workspace)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(StateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(StateModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(StateModel, 'getStateById', stub);

      let hasError = false;
      try {
        await StateModel.createState(mocks.MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        StateModel,
        'validateCreatedBy',
        sandbox.stub().resolves(mocks.MOCK_STATE.createdBy)
      );
      sandbox.replace(
        StateModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_STATE.project)
      );
      sandbox.replace(
        StateModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_STATE.workspace)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        StateModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        StateModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(StateModel, 'getStateById', stub);
      let hasError = false;
      try {
        await StateModel.createState(mocks.MOCK_STATE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
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

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a state document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_STATE));
      sandbox.replace(StateModel, 'findById', findByIdStub);

      const doc = await StateModel.getStateById(
        mocks.MOCK_STATE._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.createdBy as any)?.__v);
      assert.isUndefined((doc.project as any)?.__v);
      assert.isUndefined((doc.workspace as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_STATE._id);
    });

    it('will throw a DataNotFoundError when the state does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(StateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await StateModel.getStateById(
          mocks.MOCK_STATE._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(StateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await StateModel.getStateById(
          mocks.MOCK_STATE._id as mongoose.Types.ObjectId
        );
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
        ...mocks.MOCK_STATE,
        _id: new mongoose.Types.ObjectId(),
        createdBy: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
      } as databaseTypes.IState,
      {
        ...mocks.MOCK_STATE,
        _id: new mongoose.Types.ObjectId(),
        createdBy: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
      } as databaseTypes.IState,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered states', async () => {
      sandbox.replace(
        StateModel,
        'count',
        sandbox.stub().resolves(mockStates.length)
      );

      sandbox.replace(
        StateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockStates))
      );

      const results = await StateModel.queryStates({});

      assert.strictEqual(results.numberOfItems, mockStates.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockStates.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.createdBy as any)?.__v);
        assert.isUndefined((doc.project as any)?.__v);
        assert.isUndefined((doc.workspace as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(StateModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        StateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockStates))
      );

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
      sandbox.replace(
        StateModel,
        'count',
        sandbox.stub().resolves(mockStates.length)
      );

      sandbox.replace(
        StateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockStates))
      );

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
      sandbox.replace(
        StateModel,
        'count',
        sandbox.stub().resolves(mockStates.length)
      );

      sandbox.replace(
        StateModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
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

  context('updateStateById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a state', async () => {
      const updateState = {
        ...mocks.MOCK_STATE,
        deletedAt: new Date(),
        createdBy: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
      } as unknown as databaseTypes.IState;

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

    it('Should update a state with references as ObjectIds', async () => {
      const updateState = {
        ...mocks.MOCK_STATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IState;

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
        ...mocks.MOCK_STATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IState;

      const stateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(StateModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(StateModel, 'validateUpdateObject', validateStub);

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
        ...mocks.MOCK_STATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IState;

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
        ...mocks.MOCK_STATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IState;

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
});
