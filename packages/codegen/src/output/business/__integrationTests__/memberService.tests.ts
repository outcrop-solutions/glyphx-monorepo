// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_MEMBER} from '../mocks';
import {memberService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_MEMBER);

describe('#MemberService', () => {
  context('test the functions of the member service', () => {
    const mongoConnection = new MongoDbConnection();
    const memberModel = mongoConnection.models.MemberModel;
    let memberId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const memberDocument = await memberModel.createMember(
        MOCK_MEMBER as unknown as databaseTypes.IMember
      );

      memberId = memberDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }
    });

    it('will retreive our member from the database', async () => {
      const member = await memberService.getMember(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, MOCK_MEMBER.name);
    });

    it('will update our member', async () => {
      assert.isOk(memberId);
      const updatedMember = await memberService.updateMember(memberId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedMember.name, INPUT_PROJECT_NAME);

      const savedMember = await memberService.getMember(memberId);

      assert.strictEqual(savedMember?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our member', async () => {
      assert.isOk(memberId);
      const updatedMember = await memberService.deleteMember(memberId);
      assert.strictEqual(updatedMember[propKeys[0]], propKeys[0]);

      const savedMember = await memberService.getMember(memberId);

      assert.isOk(savedMember?.deletedAt);
    });
  });
});
