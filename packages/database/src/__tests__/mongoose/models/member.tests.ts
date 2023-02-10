import {assert} from 'chai';
import {MemberModel} from '../../../mongoose/models/member';
import {UserModel} from '../../../mongoose/models/user';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_MEMBER: databaseTypes.IMember = {
  email: 'jamesmurdockgraham@gmail.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: new Date(),
  joinedAt: new Date(),
  invitedAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamTole: databaseTypes.constants.ROLE.MEMBER,
  member: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
  invitedBy: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
  workspace: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IWorkspace,
};

describe('#mongoose/models/member', () => {
  context('memberIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the memberId exists', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const result = await MemberModel.memberIdExists(memberId);

      assert.isTrue(result);
    });

    it('should return false if the memberId does not exist', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const result = await MemberModel.memberIdExists(memberId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await MemberModel.memberIdExists(memberId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('createMember', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an member document', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        MemberModel,
        'create',
        sandbox.stub().resolves([{_id: memberId}])
      );

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);

      const result = await MemberModel.createMember(MOCK_MEMBER);
      assert.strictEqual(result._id, memberId);
      assert.isTrue(getMemberByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the user attached to the member does not exist.', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserModel,
        'userIdExists',
        sandbox.stub().resolves(false)
      );
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        MemberModel,
        'create',
        sandbox.stub().resolves([{_id: memberId}])
      );

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the member cannot be validated.', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(
        MemberModel,
        'validate',
        sandbox.stub().rejects('Invalid')
      );
      sandbox.replace(
        MemberModel,
        'create',
        sandbox.stub().resolves([{_id: memberId}])
      );

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().rejects('oops'));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('updateMemberById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing member', async () => {
      const updateMember = {
        email: 'jp@glyphx.co',
      };

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId, updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isFalse(getUserStub.called);
      assert.isTrue(getMemberStub.calledOnce);
    });

    it('should update an existing member changing the member user', async () => {
      const updateMember = {
        email: 'james@glyphx.co',
        member: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId, updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.isTrue(getMemberStub.calledOnce);
    });

    it('should update an existing member changing invitedBy', async () => {
      const updateMember = {
        email: 'james@glyphx.co',
        invitedBy: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId, updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.isTrue(getMemberStub.calledOnce);
    });

    it('should update an existing member changing workspace', async () => {
      const updateMember = {
        email: 'james@glyphx.co',
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
      };

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId, updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.isTrue(getMemberStub.calledOnce);
    });

    it('will fail when the member does not exist', async () => {
      const updateMember = {
        email: 'jg@glyphx.co',
      };

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);
      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId, updateMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with an InvalidOperationError when the validateUpdateObject method fails', async () => {
      const updateMember = {
        email: 'jamesmurdockgraham@gmail.com',
      };

      const memberId = new mongoose.Types.ObjectId();

      sandbox.replace(
        MemberModel,
        'validateUpdateObject',
        sandbox
          .stub()
          .rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);
      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId, updateMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with a DatabaseOperationError when the underlying database connection errors', async () => {
      const updateMember = {
        email: 'jp@glyphx.co',
      };

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something really bad has happened');
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);
      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId, updateMember);
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

    it('will return true when the object is valid', async () => {
      const inputMember = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);

      await MemberModel.validateUpdateObject(inputMember);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when the user does not exist', async () => {
      const inputMember = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await MemberModel.validateUpdateObject(inputMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputMember = {
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount;
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await MemberModel.validateUpdateObject(inputMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });
  });

  context('delete a member document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a member', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(MemberModel, 'deleteOne', deleteStub);

      const memberId = new mongoose.Types.ObjectId();

      await MemberModel.deleteMemberById(memberId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the member does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(MemberModel, 'deleteOne', deleteStub);

      const memberId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await MemberModel.deleteMemberById(memberId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(MemberModel, 'deleteOne', deleteStub);

      const memberId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await MemberModel.deleteMemberById(memberId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

  context('allMemberIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the member ids exist', async () => {
      const memberIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedMemberIds = memberIds.map(memberId => {
        return {
          _id: memberId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedMemberIds);
      sandbox.replace(MemberModel, 'find', findStub);

      assert.isTrue(await MemberModel.allMemberIdsExist(memberIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const memberIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedMemberIds = [
        {
          _id: memberIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedMemberIds);
      sandbox.replace(MemberModel, 'find', findStub);
      let errored = false;
      try {
        await MemberModel.allMemberIdsExist(memberIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          memberIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const memberIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(MemberModel, 'find', findStub);
      let errored = false;
      try {
        await MemberModel.allMemberIdsExist(memberIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('getMemberById', () => {
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

    const mockMember: databaseTypes.IMember = {
      _id: new mongoose.Types.ObjectId(),
      email: 'james@glyphx.co',
      inviter: 'jg@glyphx.co',
      invitedAt: new Date(),
      joinedAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      status: databaseTypes.constants.INVITATION_STATUS.PENDING,
      teamRole: databaseTypes.constants.ROLE.MEMBER,
      __v: 1,
      member: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test member',
        __v: 1,
      } as unknown as databaseTypes.IUser,
      invitedBy: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test inviter',
        __v: 1,
      } as unknown as databaseTypes.IUser,
      workspace: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test workspace',
        __v: 1,
      } as unknown as databaseTypes.IWorkspace,
    } as databaseTypes.IMember;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a member document with the member, invitedBy and workspace populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockMember));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const doc = await MemberModel.getMemberById(
        mockMember._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.member as any).__v);
      assert.isUndefined((doc.invitedBy as any).__v);
      assert.isUndefined((doc.workspace as any).__v);

      assert.strictEqual(doc._id, mockMember._id);
    });

    it('will throw a DataNotFoundError when the member does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await MemberModel.getMemberById(
          mockMember._id as mongoose.Types.ObjectId
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
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await MemberModel.getMemberById(
          mockMember._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
