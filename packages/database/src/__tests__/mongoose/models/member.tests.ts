import {assert} from 'chai';
import {MemberModel} from '../../../mongoose/models/member';
import {UserModel} from '../../../mongoose/models/user';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {ProjectModel} from '../../../mongoose/models/project';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose, {Types as mongooseTypes} from 'mongoose';
import {createSandbox} from 'sinon';
import {IMemberCreateInput} from '../../../mongoose/interfaces';
import {DBFormatter} from '../../../lib/format';

const MOCK_MEMBER: databaseTypes.IMember = {
  email: 'jamesmurdockgraham@gmail.com',
  inviter: 'jp@glyphx.co',
  createdAt: new Date(),
  type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
  updatedAt: new Date(),
  joinedAt: new Date(),
  invitedAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
  member: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
  invitedBy: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
  workspace: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IWorkspace,
};

const MOCK_NULLISH_MEMBER = {
  email: 'jamesmurdockgraham@gmail.com',
  inviter: 'jp@glyphx.co',
  createdAt: new Date(),
  type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
  updatedAt: new Date(),
  joinedAt: new Date(),
  invitedAt: new Date(),
  status: undefined,
  teamRole: undefined,
  member: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
  invitedBy: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
  workspace: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IWorkspace,
} as unknown as databaseTypes.IMember;

const MOCK_MEMBER_IDS = {
  email: 'jamesmurdockgraham@gmail.com',
  inviter: 'jp@glyphx.co',
  type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
  createdAt: new Date(),
  updatedAt: new Date(),
  joinedAt: new Date(),
  invitedAt: new Date(),
  status: undefined,
  teamRole: undefined,
  member: new mongoose.Types.ObjectId(),
  invitedBy: new mongoose.Types.ObjectId(),
  workspace: new mongoose.Types.ObjectId(),
} as unknown as databaseTypes.IMember;

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

  context('memberExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the member email exists type === PROJECT', async () => {
      const memberEmail = 'testmember@gmail.com' as string;
      const projectId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const findByEmailStub = sandbox.stub();
      findByEmailStub.resolves({email: memberEmail});
      sandbox.replace(MemberModel, 'findOne', findByEmailStub);

      const result = await MemberModel.memberExists(
        memberEmail,
        databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        projectId.toString()
      );

      assert.isTrue(result);
    });

    it('should return false if the member email does not exist type === PROJECT', async () => {
      const memberEmail = 'testmember@gmail.com' as string;
      const projectId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const findByEmailStub = sandbox.stub();
      findByEmailStub.resolves(null);
      sandbox.replace(MemberModel, 'findOne', findByEmailStub);

      const result = await MemberModel.memberExists(
        memberEmail,
        databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        projectId.toString()
      );

      assert.isFalse(result);
    });

    it('should return true if the member email exists type === WORKSPACE', async () => {
      const memberEmail = 'testmember@gmail.com' as string;
      const projectId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const findByEmailStub = sandbox.stub();
      findByEmailStub.resolves({email: memberEmail});
      sandbox.replace(MemberModel, 'findOne', findByEmailStub);

      const result = await MemberModel.memberExists(
        memberEmail,
        databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
        projectId.toString()
      );

      assert.isTrue(result);
    });

    it('should return false if the member email does not exist type === WORKSPACE', async () => {
      const memberEmail = 'testmember@gmail.com' as string;
      const projectId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const findByEmailStub = sandbox.stub();
      findByEmailStub.resolves(null);
      sandbox.replace(MemberModel, 'findOne', findByEmailStub);

      const result = await MemberModel.memberExists(
        memberEmail,
        databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
        projectId.toString()
      );

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const memberEmail = 'testmember@gmail.com' as string;
      const projectId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const findByEmailStub = sandbox.stub();
      findByEmailStub.rejects('something unexpected has happend');
      sandbox.replace(MemberModel, 'findOne', findByEmailStub);

      let errorred = false;
      try {
        await MemberModel.memberExists(
          memberEmail,
          databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
          projectId.toString()
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('createWorkspaceMember', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a member document', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));

      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));

      sandbox.replace(
        MemberModel,
        'validateWorkspaceMember',
        sandbox.stub().resolves({_id: new mongoose.Types.ObjectId()})
      );

      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: memberId}]));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);

      const result = await MemberModel.createWorkspaceMember(MOCK_MEMBER);
      assert.strictEqual(result._id, memberId);
      assert.isTrue(getMemberByIdStub.calledOnce);
    });

    it('will create a member document with nullish coallesce', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));

      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));

      sandbox.replace(
        MemberModel,
        'validateWorkspaceMember',
        sandbox.stub().resolves({_id: new mongoose.Types.ObjectId()})
      );

      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        MemberModel,
        'create',
        sandbox.stub().resolves([
          {
            _id: memberId,
            status: databaseTypes.constants.INVITATION_STATUS.PENDING,
            teamRole: databaseTypes.constants.ROLE.MEMBER,
          },
        ])
      );

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({
        _id: memberId,
        status: databaseTypes.constants.INVITATION_STATUS.PENDING,
        teamRole: databaseTypes.constants.ROLE.MEMBER,
      });

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);

      const result = await MemberModel.createWorkspaceMember(MOCK_NULLISH_MEMBER);
      assert.strictEqual(result._id, memberId);
      assert.strictEqual(result.status, databaseTypes.constants.INVITATION_STATUS.PENDING);
      assert.strictEqual(result.teamRole, databaseTypes.constants.ROLE.MEMBER);
      assert.isTrue(getMemberByIdStub.calledOnce);
    });

    it('will create a member document with member as ID', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));

      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));
      sandbox.replace(
        MemberModel,
        'validateWorkspaceMember',
        sandbox.stub().resolves({_id: new mongoose.Types.ObjectId()})
      );

      sandbox.replace(UserModel, 'getUserById', sandbox.stub().resolves({_id: new mongoose.Types.ObjectId()}));

      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: memberId}]));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);

      const result = await MemberModel.createWorkspaceMember(MOCK_MEMBER_IDS);
      assert.strictEqual(result._id, memberId);
      assert.isTrue(getMemberByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the member attached to the Member does not exist.', async () => {
      const memberId = new mongoose.Types.ObjectId();

      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(false));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: memberId}]));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createWorkspaceMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an InvalidArgumentError if the inviter attached to the Member does not exist.', async () => {
      const memberId = new mongoose.Types.ObjectId();
      // this doesn't cover member.ts line 150 for some reason @jp-burford
      const userIdStub = sandbox.stub();
      userIdStub.resolves(true);
      userIdStub.onSecondCall().resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdStub);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: memberId}]));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createWorkspaceMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an InvalidArgumentError if the email attached to the Member already exists.', async () => {
      const memberId = new mongoose.Types.ObjectId();
      // this doesn't cover member.ts line 150 for some reason @jp-burford
      const userIdStub = sandbox.stub();
      userIdStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdStub);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: memberId}]));
      sandbox.replace(
        MemberModel,
        'validateWorkspaceMember',
        sandbox.stub().rejects(new error.InvalidArgumentError('The email already exists', 'email', 'email'))
      );

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createWorkspaceMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
    it('will throw an InvalidArgumentError if the workspace attached to the Member does not exist.', async () => {
      const memberId = new mongoose.Types.ObjectId();

      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));

      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(false));
      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));
      sandbox.replace(
        MemberModel,
        'validateWorkspaceMember',
        sandbox.stub().resolves({_id: new mongoose.Types.ObjectId()})
      );
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: memberId}]));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createWorkspaceMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the member cannot be validated.', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));
      sandbox.replace(
        MemberModel,
        'validateWorkspaceMember',
        sandbox.stub().resolves({_id: new mongoose.Types.ObjectId()})
      );
      sandbox.replace(MemberModel, 'validate', sandbox.stub().rejects('Invalid'));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: memberId}]));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createWorkspaceMember(MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const memberId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'memberExists', sandbox.stub().resolves(false));
      sandbox.replace(
        MemberModel,
        'validateWorkspaceMember',
        sandbox.stub().resolves({_id: new mongoose.Types.ObjectId()})
      );
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().rejects('oops'));

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberId});

      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);
      let errorred = false;

      try {
        await MemberModel.createWorkspaceMember(MOCK_MEMBER);
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
      updateStub.resolves({
        toObject: () => ({_id: memberId, email: 'jp@glyphx.co'}), // Sample data
      });
      sandbox.replace(MemberModel, 'findOneAndUpdate', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      sandbox.stub(DBFormatter.prototype, 'toJS').returns({id: memberId.toString(), email: 'jp@glyphx.co'});

      const getWorkspaceStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', getWorkspaceStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId.toString(), updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isFalse(getUserStub.called);
      assert.isFalse(getWorkspaceStub.called);
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
      updateStub.resolves({
        toObject: () => ({_id: memberId, email: 'jp@glyphx.co'}), // Sample data
      });
      sandbox.replace(MemberModel, 'findOneAndUpdate', updateStub);

      sandbox.stub(DBFormatter.prototype, 'toJS').returns({id: memberId.toString(), email: 'jp@glyphx.co'});
      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId.toString(), updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.called);
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
      updateStub.resolves({
        toObject: () => ({_id: memberId, email: 'jp@glyphx.co'}), // Sample data
      });
      sandbox.replace(MemberModel, 'findOneAndUpdate', updateStub);

      sandbox.stub(DBFormatter.prototype, 'toJS').returns({id: memberId.toString(), email: 'jp@glyphx.co'});

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId.toString(), updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.called);
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
      updateStub.resolves({
        toObject: () => ({_id: memberId, email: 'jp@glyphx.co'}), // Sample data
      });
      sandbox.replace(MemberModel, 'findOneAndUpdate', updateStub);

      sandbox.stub(DBFormatter.prototype, 'toJS').returns({id: memberId.toString(), email: 'jp@glyphx.co'});

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', getWorkspaceStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const result = await MemberModel.updateMemberById(memberId.toString(), updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getWorkspaceStub.called);
      assert.isTrue(getMemberStub.calledOnce);
      // assert.isTrue(getMemberStub.calledOnce);
    });

    it('will fail when the member does not exist', async () => {
      const updateMember = {
        email: 'jg@glyphx.co',
      };

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves(null);
      sandbox.replace(MemberModel, 'findOneAndUpdate', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);
      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId.toString(), updateMember);
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
        sandbox.stub().rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({
        toObject: () => ({_id: memberId, email: 'jp@glyphx.co'}), // Sample data
      });
      sandbox.replace(MemberModel, 'findOneAndUpdate', updateStub);

      sandbox.stub(DBFormatter.prototype, 'toJS').returns({id: memberId.toString(), email: 'jp@glyphx.co'});

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);
      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId.toString(), updateMember);
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
      sandbox.replace(MemberModel, 'findOneAndUpdate', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);
      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId.toString(), updateMember);
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
        member: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);

      const workspaceExistsStub = sandbox.stub();
      workspaceExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceExistsStub);

      const projectExistsStub = sandbox.stub();
      projectExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectExistsStub);

      await MemberModel.validateUpdateObject(inputMember);
      assert.isTrue(userExistsStub.called);
      assert.isTrue(workspaceExistsStub.called);
    });

    it('will throw an InvalidOperationError when the user does not exist', async () => {
      const inputMember = {
        member: {
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

    it('will throw an InvalidOperationError when the inviter does not exist', async () => {
      const inputMember = {
        member: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      // this doesn't cover member.ts line 229 for some reason? @jp-burford
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      userExistsStub.onSecondCall().resolves(false);

      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await MemberModel.validateUpdateObject(inputMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledTwice);
    });

    it('will throw an InvalidOperationError when the workspace does not exist', async () => {
      const inputMember = {
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
      };
      const workspaceExistsStub = sandbox.stub();
      workspaceExistsStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceExistsStub);
      let errorred = false;
      try {
        await MemberModel.validateUpdateObject(inputMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(workspaceExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when the project does not exist', async () => {
      const inputMember = {
        project: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
      };
      const projectExistsStub = sandbox.stub();
      projectExistsStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', projectExistsStub);
      let errorred = false;
      try {
        await MemberModel.validateUpdateObject(inputMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(projectExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputMember = {
        _id: new mongoose.Types.ObjectId(),
        member: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IMember;
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

      await MemberModel.deleteMemberById(memberId.toString());

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the member does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(MemberModel, 'deleteOne', deleteStub);

      const memberId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await MemberModel.deleteMemberById(memberId.toString());
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
        await MemberModel.deleteMemberById(memberId.toString());
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
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedMemberIds = memberIds.map((memberId) => {
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
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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
        assert.strictEqual((err as any).data.value[0].toString(), memberIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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
      type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
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

      const doc = await MemberModel.getMemberById(mockMember._id!.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.member as any).__v);
      assert.isUndefined((doc.invitedBy as any).__v);
      assert.isUndefined((doc.workspace as any).__v);

      assert.strictEqual(doc.id, mockMember._id?.toString());
    });

    it('will retreive a member document with the member, invitedBy and workspace populated has project = true', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockMember));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const doc = await MemberModel.getMemberById(mockMember._id!.toString(), true);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.member as any).__v);
      assert.isUndefined((doc.invitedBy as any).__v);
      assert.isUndefined((doc.workspace as any).__v);

      assert.strictEqual(doc.id, mockMember._id?.toString());
    });

    it('will retreive a member document with the member, invitedBy and workspace populated has project = false', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockMember));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const doc = await MemberModel.getMemberById(mockMember._id!.toString(), false);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.member as any).__v);
      assert.isUndefined((doc.invitedBy as any).__v);
      assert.isUndefined((doc.workspace as any).__v);

      assert.strictEqual(doc.id, mockMember._id?.toString());
    });

    it('will throw a DataNotFoundError when the member does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await MemberModel.getMemberById(mockMember._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await MemberModel.getMemberById(mockMember._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('getMembers', () => {
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

    const mockMembers = [
      {
        _id: new mongoose.Types.ObjectId(),
        email: 'email',
        inviter: 'inviter',
        invitedAt: new Date().getTime(),
        joinedAt: new Date().getTime(),
        status: databaseTypes.constants.INVITATION_STATUS.PENDING,
        teamRole: databaseTypes.constants.ROLE.MEMBER,
        __v: 1,
        member: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test member user',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test invitedBy user',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceCode: 'testWorkspaceCode',
          inviteCode: 'testInviteCode',
          name: 'Test Workspace',
          slug: 'testSlug',
          description: 'a test workspace',
          creator: {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IUser,
          members: [],
          projects: [],
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        email: 'email2',
        inviter: 'inviter2',
        invitedAt: new Date().getTime(),
        joinedAt: new Date().getTime(),
        status: databaseTypes.constants.INVITATION_STATUS.PENDING,
        teamRole: databaseTypes.constants.ROLE.MEMBER,
        __v: 1,
        member: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test member user2',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test invitedBy user2',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceCode: 'testWorkspaceCode',
          inviteCode: 'testInviteCode',
          name: 'Test Workspace',
          slug: 'testSlug',
          description: 'a test workspace',
          creator: {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IUser,
          members: [],
          projects: [],
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
      },
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered members', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(mockMembers.length));

      sandbox.replace(MemberModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockMembers)));

      const results = await MemberModel.queryMembers({});

      assert.strictEqual(results.numberOfItems, mockMembers.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockMembers.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.member as any).__v);
        assert.isUndefined((doc.invitedBy as any).__v);
        assert.isUndefined((doc.workspace as any).__v);
        assert.isUndefined((doc.workspace as any).creator.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(MemberModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockMembers)));

      let errored = false;
      try {
        await MemberModel.queryMembers();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(mockMembers.length));

      sandbox.replace(MemberModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockMembers)));

      let errored = false;
      try {
        await MemberModel.queryMembers({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(mockMembers.length));

      sandbox.replace(
        MemberModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await MemberModel.queryMembers({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('validateProject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the project with id as objectId', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const res = await MemberModel.validateProject(projectId.toString());
      assert.strictEqual(res.toString(), projectId.toString());
      assert.isTrue(projectIdExistsStub.calledOnce);
    });

    it('will validate the project with id as IProject', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const res = await MemberModel.validateProject({
        id: projectId.toString(),
      } as unknown as databaseTypes.IProject);
      assert.strictEqual(res.toString(), projectId.toString());
      assert.isTrue(projectIdExistsStub.calledOnce);
    });

    it('will throw an invalidArgumentError when the projectId does not exist', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      let errored = false;
      try {
        await MemberModel.validateProject(projectId.toString());
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validateProjectMember', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the project member with ids as objectIds', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();
      const workspaceId = new mongoose.Types.ObjectId();
      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: memberId,
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      const res = await MemberModel.validateProjectMember(
        memberId.toString(),
        workspaceId.toString(),
        projectId.toString()
      );

      assert.isOk(res);
      assert.strictEqual(res._id.toString(), memberId.toString());
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(projectIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
      assert.isTrue(memberExistsStub.calledOnce);
    });

    it('will validate the project member with ids as objects ', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();
      const workspoaceId = new mongoose.Types.ObjectId();
      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: memberId,
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      const res = await MemberModel.validateProjectMember(
        {id: memberId} as unknown as databaseTypes.IUser,
        {id: workspoaceId} as unknown as databaseTypes.IWorkspace,
        {id: projectId} as unknown as databaseTypes.IProject
      );

      assert.isOk(res);
      assert.strictEqual(res._id.toString(), memberId.toString());
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(projectIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
      assert.isTrue(memberExistsStub.calledOnce);
    });

    it('will throw an invalisd argument error when the user does not exist ', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();
      const workspoaceId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: memberId,
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      let errored = false;
      try {
        await MemberModel.validateProjectMember(
          {_id: memberId} as unknown as databaseTypes.IUser,
          {_id: workspoaceId} as unknown as databaseTypes.IWorkspace,
          {_id: projectId} as unknown as databaseTypes.IProject
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an invalisd argument error when the project does not exist ', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();
      const workspoaceId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: memberId,
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      let errored = false;
      try {
        await MemberModel.validateProjectMember(
          {_id: memberId} as unknown as databaseTypes.IUser,
          {_id: workspoaceId} as unknown as databaseTypes.IWorkspace,
          {_id: projectId} as unknown as databaseTypes.IProject
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an invalisd argument error when the workspace does not exist ', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();
      const workspoaceId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: memberId,
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      let errored = false;
      try {
        await MemberModel.validateProjectMember(
          {_id: memberId} as unknown as databaseTypes.IUser,
          {_id: workspoaceId} as unknown as databaseTypes.IWorkspace,
          {_id: projectId} as unknown as databaseTypes.IProject
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the member exists ', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const projectId = new mongoose.Types.ObjectId();
      const workspoaceId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: memberId,
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(true);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      let errored = false;
      try {
        await MemberModel.validateProjectMember(
          {_id: memberId} as unknown as databaseTypes.IUser,
          {_id: workspoaceId} as unknown as databaseTypes.IWorkspace,
          {_id: projectId} as unknown as databaseTypes.IProject
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validateWorkspaceMember', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will validate a workspace memeber when the ids are objectIds', async () => {
      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: new mongoose.Types.ObjectId(),
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      const res = await MemberModel.validateWorkspaceMember(
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
      );
      assert.isOk(res);
      assert.isObject(res);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
      assert.isTrue(memberExistsStub.calledOnce);
    });

    it('will validate a workspace memeber when the ids are objects', async () => {
      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: new mongoose.Types.ObjectId(),
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      const res = await MemberModel.validateWorkspaceMember(
        {_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IUser,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace
      );
      assert.isOk(res);
      assert.isObject(res);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
      assert.isTrue(memberExistsStub.calledOnce);
    });

    it('will throw an invalid argument error when the user does not exist', async () => {
      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: new mongoose.Types.ObjectId(),
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      let errored = false;
      try {
        await MemberModel.validateWorkspaceMember(
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString()
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the member exists', async () => {
      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves({
        _id: new mongoose.Types.ObjectId(),
        email: 'foo@email.com',
      });
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const memberExistsStub = sandbox.stub();
      memberExistsStub.resolves(true);
      sandbox.replace(MemberModel, 'memberExists', memberExistsStub);

      let errored = false;
      try {
        await MemberModel.validateWorkspaceMember(
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString()
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createProjectMember', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a project members', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const validateWorkspaceStub = sandbox.stub();
      validateWorkspaceStub.resolves(workspaceId);
      sandbox.replace(MemberModel, 'validateWorkspace', validateWorkspaceStub);

      const invitedById = new mongoose.Types.ObjectId();
      const memberId = new mongoose.Types.ObjectId();
      const validateProjectMemberStub = sandbox.stub();
      validateProjectMemberStub.resolves(memberId);
      validateProjectMemberStub.onCall(1).resolves(invitedById);
      sandbox.replace(MemberModel, 'validateProjectMember', validateProjectMemberStub);

      const projectId = new mongoose.Types.ObjectId();
      const validateProjectStub = sandbox.stub();
      validateProjectStub.resolves(projectId);
      sandbox.replace(MemberModel, 'validateProject', validateProjectStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(MemberModel, 'validate', validateStub);

      const memberDocumentId = new mongoose.Types.ObjectId();
      const createStub = sandbox.stub();
      createStub.resolves([{_id: memberDocumentId}]);
      sandbox.replace(MemberModel, 'create', createStub);

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberDocumentId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);

      const input = {...MOCK_MEMBER} as IMemberCreateInput;
      input.invitedBy = invitedById.toString();
      input.workspace = workspaceId.toString();
      input.member = memberId.toString();
      input.project = projectId.toString();

      const res = await MemberModel.createProjectMember(input);
      assert.strictEqual(res._id?.toString(), memberDocumentId.toString());
      assert.isTrue(validateWorkspaceStub.calledOnce);
      assert.isTrue(validateProjectMemberStub.calledTwice);
      assert.isTrue(validateProjectStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
      assert.isTrue(getMemberByIdStub.calledOnce);
    });

    it('will throw a dataValidationError if the validation call fails', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const validateWorkspaceStub = sandbox.stub();
      validateWorkspaceStub.resolves(workspaceId);
      sandbox.replace(MemberModel, 'validateWorkspace', validateWorkspaceStub);

      const invitedById = new mongoose.Types.ObjectId();
      const memberId = new mongoose.Types.ObjectId();
      const validateProjectMemberStub = sandbox.stub();
      validateProjectMemberStub.resolves(memberId);
      validateProjectMemberStub.onCall(1).resolves(invitedById);
      sandbox.replace(MemberModel, 'validateProjectMember', validateProjectMemberStub);

      const projectId = new mongoose.Types.ObjectId();
      const validateProjectStub = sandbox.stub();
      validateProjectStub.resolves(projectId);
      sandbox.replace(MemberModel, 'validateProject', validateProjectStub);

      const validateStub = sandbox.stub();
      validateStub.rejects('That is not valid');
      sandbox.replace(MemberModel, 'validate', validateStub);

      const memberDocumentId = new mongoose.Types.ObjectId();
      const createStub = sandbox.stub();
      createStub.resolves([{_id: memberDocumentId}]);
      sandbox.replace(MemberModel, 'create', createStub);

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberDocumentId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);

      const input = {...MOCK_MEMBER} as IMemberCreateInput;
      input.invitedBy = invitedById.toString();
      input.workspace = workspaceId.toString();
      input.member = memberId.toString();
      input.project = projectId.toString();

      let errored = false;
      try {
        await MemberModel.createProjectMember(input);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError if the create call fails', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const validateWorkspaceStub = sandbox.stub();
      validateWorkspaceStub.resolves(workspaceId);
      sandbox.replace(MemberModel, 'validateWorkspace', validateWorkspaceStub);

      const invitedById = new mongoose.Types.ObjectId();
      const memberId = new mongoose.Types.ObjectId();
      const validateProjectMemberStub = sandbox.stub();
      validateProjectMemberStub.resolves(memberId);
      validateProjectMemberStub.onCall(1).resolves(invitedById);
      sandbox.replace(MemberModel, 'validateProjectMember', validateProjectMemberStub);

      const projectId = new mongoose.Types.ObjectId();
      const validateProjectStub = sandbox.stub();
      validateProjectStub.resolves(projectId);
      sandbox.replace(MemberModel, 'validateProject', validateProjectStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(MemberModel, 'validate', validateStub);

      const memberDocumentId = new mongoose.Types.ObjectId();
      const createStub = sandbox.stub();
      createStub.rejects('There was a database error');
      sandbox.replace(MemberModel, 'create', createStub);

      const getMemberByIdStub = sandbox.stub();
      getMemberByIdStub.resolves({_id: memberDocumentId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberByIdStub);

      const input = {...MOCK_MEMBER} as IMemberCreateInput;
      input.invitedBy = invitedById.toString();
      input.workspace = workspaceId.toString();
      input.member = memberId.toString();
      input.project = projectId.toString();

      let errored = false;
      try {
        await MemberModel.createProjectMember(input);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});
