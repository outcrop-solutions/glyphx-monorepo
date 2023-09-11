// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {ActivityLogModel} from '../../../mongoose/models/activityLog';
import * as mocks from '../../../mongoose/mocks';
import {UserModel} from '../../../mongoose/models/user';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {ProjectModel} from '../../../mongoose/models/project';
import {UserAgentModel} from '../../../mongoose/models/userAgent';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/activityLog', () => {
  context('activityLogIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the activityLogId exists', async () => {
      const activityLogId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: activityLogId});
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      const result = await ActivityLogModel.activityLogIdExists(activityLogId);

      assert.isTrue(result);
    });

    it('should return false if the activityLogId does not exist', async () => {
      const activityLogId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      const result = await ActivityLogModel.activityLogIdExists(activityLogId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const activityLogId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ActivityLogModel.activityLogIdExists(activityLogId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allActivityLogIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the activityLog ids exist', async () => {
      const activityLogIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedActivityLogIds = activityLogIds.map(activityLogId => {
        return {
          _id: activityLogId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedActivityLogIds);
      sandbox.replace(ActivityLogModel, 'find', findStub);

      assert.isTrue(
        await ActivityLogModel.allActivityLogIdsExist(activityLogIds)
      );
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const activityLogIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedActivityLogIds = [
        {
          _id: activityLogIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedActivityLogIds);
      sandbox.replace(ActivityLogModel, 'find', findStub);
      let errored = false;
      try {
        await ActivityLogModel.allActivityLogIdsExist(activityLogIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          activityLogIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const activityLogIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ActivityLogModel, 'find', findStub);
      let errored = false;
      try {
        await ActivityLogModel.allActivityLogIdsExist(activityLogIds);
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
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject(
          mocks.MOCK_ACTIVITYLOG as unknown as Omit<
            Partial<databaseTypes.IActivityLog>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject(
          mocks.MOCK_ACTIVITYLOG as unknown as Omit<
            Partial<databaseTypes.IActivityLog>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(actorStub.calledOnce);
      assert.isTrue(workspaceStub.calledOnce);
      assert.isTrue(projectStub.calledOnce);
      assert.isTrue(userAgentStub.calledOnce);
    });

    it('will fail when the actor does not exist.', async () => {
      const actorStub = sandbox.stub();
      actorStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject(
          mocks.MOCK_ACTIVITYLOG as unknown as Omit<
            Partial<databaseTypes.IActivityLog>,
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
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject(
          mocks.MOCK_ACTIVITYLOG as unknown as Omit<
            Partial<databaseTypes.IActivityLog>,
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
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject(
          mocks.MOCK_ACTIVITYLOG as unknown as Omit<
            Partial<databaseTypes.IActivityLog>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the userAgent does not exist.', async () => {
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(false);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject(
          mocks.MOCK_ACTIVITYLOG as unknown as Omit<
            Partial<databaseTypes.IActivityLog>,
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
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject({
          ...mocks.MOCK_ACTIVITYLOG,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IActivityLog>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject({
          ...mocks.MOCK_ACTIVITYLOG,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IActivityLog>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const actorStub = sandbox.stub();
      actorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', actorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);
      const userAgentStub = sandbox.stub();
      userAgentStub.resolves(true);
      sandbox.replace(UserAgentModel, 'userAgentIdExists', userAgentStub);

      let errored = false;

      try {
        await ActivityLogModel.validateUpdateObject({
          ...mocks.MOCK_ACTIVITYLOG,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IActivityLog>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createActivityLog', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a activityLog document', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.actor)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.workspace)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.project)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateUserAgent',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.userAgent)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);

      const activityLogDocument = await ActivityLogModel.createActivityLog(
        mocks.MOCK_ACTIVITYLOG
      );

      assert.strictEqual(activityLogDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the actor validator throws one', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The actor does not exist',
              'actor ',
              {}
            )
          )
      );
      sandbox.replace(
        ActivityLogModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.workspace)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.project)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateUserAgent',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.userAgent)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);

      let errored = false;

      try {
        await ActivityLogModel.createActivityLog(mocks.MOCK_ACTIVITYLOG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the workspace validator throws one', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.actor)
      );
      sandbox.replace(
        ActivityLogModel,
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
      sandbox.replace(
        ActivityLogModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.project)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateUserAgent',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.userAgent)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);

      let errored = false;

      try {
        await ActivityLogModel.createActivityLog(mocks.MOCK_ACTIVITYLOG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the project validator throws one', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.actor)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.workspace)
      );
      sandbox.replace(
        ActivityLogModel,
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
        ActivityLogModel,
        'validateUserAgent',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.userAgent)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);

      let errored = false;

      try {
        await ActivityLogModel.createActivityLog(mocks.MOCK_ACTIVITYLOG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the userAgent validator throws one', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.actor)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.workspace)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.project)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateUserAgent',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The userAgent does not exist',
              'userAgent ',
              {}
            )
          )
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);

      let errored = false;

      try {
        await ActivityLogModel.createActivityLog(mocks.MOCK_ACTIVITYLOG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.actor)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.workspace)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.project)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateUserAgent',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.userAgent)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);
      let hasError = false;
      try {
        await ActivityLogModel.createActivityLog(mocks.MOCK_ACTIVITYLOG);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.actor)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.workspace)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.project)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateUserAgent',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.userAgent)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().resolves([{}])
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);

      let hasError = false;
      try {
        await ActivityLogModel.createActivityLog(mocks.MOCK_ACTIVITYLOG);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        ActivityLogModel,
        'validateActor',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.actor)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.workspace)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateProject',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.project)
      );
      sandbox.replace(
        ActivityLogModel,
        'validateUserAgent',
        sandbox.stub().resolves(mocks.MOCK_ACTIVITYLOG.userAgent)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ActivityLogModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        ActivityLogModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ActivityLogModel, 'getActivityLogById', stub);
      let hasError = false;
      try {
        await ActivityLogModel.createActivityLog(mocks.MOCK_ACTIVITYLOG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getActivityLogById', () => {
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

    it('will retreive a activityLog document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_ACTIVITYLOG));
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      const doc = await ActivityLogModel.getActivityLogById(
        mocks.MOCK_ACTIVITYLOG._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.actor as any)?.__v);
      assert.isUndefined((doc.workspace as any)?.__v);
      assert.isUndefined((doc.project as any)?.__v);
      assert.isUndefined((doc.userAgent as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_ACTIVITYLOG._id);
    });

    it('will throw a DataNotFoundError when the activityLog does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ActivityLogModel.getActivityLogById(
          mocks.MOCK_ACTIVITYLOG._id as mongoose.Types.ObjectId
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
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ActivityLogModel.getActivityLogById(
          mocks.MOCK_ACTIVITYLOG._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryActivityLogs', () => {
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

    const mockActivityLogs = [
      {
        ...mocks.MOCK_ACTIVITYLOG,
        _id: new mongoose.Types.ObjectId(),
        actor: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        userAgent: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUserAgent,
      } as databaseTypes.IActivityLog,
      {
        ...mocks.MOCK_ACTIVITYLOG,
        _id: new mongoose.Types.ObjectId(),
        actor: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        userAgent: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUserAgent,
      } as databaseTypes.IActivityLog,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered activityLogs', async () => {
      sandbox.replace(
        ActivityLogModel,
        'count',
        sandbox.stub().resolves(mockActivityLogs.length)
      );

      sandbox.replace(
        ActivityLogModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockActivityLogs))
      );

      const results = await ActivityLogModel.queryActivityLogs({});

      assert.strictEqual(results.numberOfItems, mockActivityLogs.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockActivityLogs.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.actor as any)?.__v);
        assert.isUndefined((doc.workspace as any)?.__v);
        assert.isUndefined((doc.project as any)?.__v);
        assert.isUndefined((doc.userAgent as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ActivityLogModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ActivityLogModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockActivityLogs))
      );

      let errored = false;
      try {
        await ActivityLogModel.queryActivityLogs();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        ActivityLogModel,
        'count',
        sandbox.stub().resolves(mockActivityLogs.length)
      );

      sandbox.replace(
        ActivityLogModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockActivityLogs))
      );

      let errored = false;
      try {
        await ActivityLogModel.queryActivityLogs({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        ActivityLogModel,
        'count',
        sandbox.stub().resolves(mockActivityLogs.length)
      );

      sandbox.replace(
        ActivityLogModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ActivityLogModel.queryActivityLogs({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateActivityLogById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a activityLog', async () => {
      const updateActivityLog = {
        ...mocks.MOCK_ACTIVITYLOG,
        deletedAt: new Date(),
        actor: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        userAgent: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUserAgent,
      } as unknown as databaseTypes.IActivityLog;

      const activityLogId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ActivityLogModel, 'updateOne', updateStub);

      const getActivityLogStub = sandbox.stub();
      getActivityLogStub.resolves({_id: activityLogId});
      sandbox.replace(
        ActivityLogModel,
        'getActivityLogById',
        getActivityLogStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ActivityLogModel, 'validateUpdateObject', validateStub);

      const result = await ActivityLogModel.updateActivityLogById(
        activityLogId,
        updateActivityLog
      );

      assert.strictEqual(result._id, activityLogId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getActivityLogStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a activityLog with references as ObjectIds', async () => {
      const updateActivityLog = {
        ...mocks.MOCK_ACTIVITYLOG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IActivityLog;

      const activityLogId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ActivityLogModel, 'updateOne', updateStub);

      const getActivityLogStub = sandbox.stub();
      getActivityLogStub.resolves({_id: activityLogId});
      sandbox.replace(
        ActivityLogModel,
        'getActivityLogById',
        getActivityLogStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ActivityLogModel, 'validateUpdateObject', validateStub);

      const result = await ActivityLogModel.updateActivityLogById(
        activityLogId,
        updateActivityLog
      );

      assert.strictEqual(result._id, activityLogId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getActivityLogStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the activityLog does not exist', async () => {
      const updateActivityLog = {
        ...mocks.MOCK_ACTIVITYLOG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IActivityLog;

      const activityLogId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ActivityLogModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(ActivityLogModel, 'validateUpdateObject', validateStub);

      const getActivityLogStub = sandbox.stub();
      getActivityLogStub.resolves({_id: activityLogId});
      sandbox.replace(
        ActivityLogModel,
        'getActivityLogById',
        getActivityLogStub
      );

      let errorred = false;
      try {
        await ActivityLogModel.updateActivityLogById(
          activityLogId,
          updateActivityLog
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateActivityLog = {
        ...mocks.MOCK_ACTIVITYLOG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IActivityLog;

      const activityLogId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ActivityLogModel, 'updateOne', updateStub);

      const getActivityLogStub = sandbox.stub();
      getActivityLogStub.resolves({_id: activityLogId});
      sandbox.replace(
        ActivityLogModel,
        'getActivityLogById',
        getActivityLogStub
      );

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(ActivityLogModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await ActivityLogModel.updateActivityLogById(
          activityLogId,
          updateActivityLog
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateActivityLog = {
        ...mocks.MOCK_ACTIVITYLOG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IActivityLog;

      const activityLogId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ActivityLogModel, 'updateOne', updateStub);

      const getActivityLogStub = sandbox.stub();
      getActivityLogStub.resolves({_id: activityLogId});
      sandbox.replace(
        ActivityLogModel,
        'getActivityLogById',
        getActivityLogStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ActivityLogModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await ActivityLogModel.updateActivityLogById(
          activityLogId,
          updateActivityLog
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a activityLog document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a activityLog', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ActivityLogModel, 'deleteOne', deleteStub);

      const activityLogId = new mongoose.Types.ObjectId();

      await ActivityLogModel.deleteActivityLogById(activityLogId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the activityLog does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ActivityLogModel, 'deleteOne', deleteStub);

      const activityLogId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ActivityLogModel.deleteActivityLogById(activityLogId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ActivityLogModel, 'deleteOne', deleteStub);

      const activityLogId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ActivityLogModel.deleteActivityLogById(activityLogId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
