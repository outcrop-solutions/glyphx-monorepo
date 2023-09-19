// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { memberService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_MEMBER)

describe('#MemberService', () => {
  context('test the functions of the member service', () => {
    const mongoConnection = new MongoDbConnection();
    const memberModel = mongoConnection.models.MemberModel;
    let memberId: ObjectId;

    const memberModel = mongoConnection.models.UserModel;
    let memberId: ObjectId;
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const memberDocument = await memberModel.createMember(
        // @ts-ignore
        mocks.MOCK_MEMBER as unknown as databaseTypes.IMember
      );
      memberId = memberDocument._id as unknown as mongooseTypes.ObjectId;







      const savedMemberDocument = await memberModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      memberId =  savedMemberDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(memberId)


      const savedWorkspaceDocument = await workspaceModel.create([mocks.MOCK_WORKSPACE], {
        validateBeforeSave: false,
      });
      workspaceId =  savedWorkspaceDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId)


      const savedProjectDocument = await projectModel.create([mocks.MOCK_PROJECT], {
        validateBeforeSave: false,
      });
      projectId =  savedProjectDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(projectId)

    });

    after(async () => {
      if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }
       if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }
       if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
       if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
    });

    it('will retreive our member from the database', async () => {
      const member = await memberService.getMember(memberId);
      assert.isOk(member);
    });

    // updates and deletes
    it('will update our member', async () => {
      assert.isOk(memberId);
      const updatedMember = await memberService.updateMember(memberId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedMember.deletedAt);

      const savedMember = await memberService.getMember(memberId);

      assert.isOk(savedMember!.deletedAt);
    });
  });
});
