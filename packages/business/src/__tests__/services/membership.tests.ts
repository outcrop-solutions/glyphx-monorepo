import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {membershipService} from '../../services';

describe('#services/customer', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();

  afterEach(() => {
    sandbox.restore();
  });

  context('getMember', () => {
    it('should get a member by id', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const memberEmail = 'testemail@gmail.com';

      const getMembershipFromModelStub = sandbox.stub();
      getMembershipFromModelStub.resolves({
        _id: memberId,
        email: memberEmail,
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'getMemberById',
        getMembershipFromModelStub
      );

      const member = await membershipService.getMember(memberId);
      assert.isOk(member);
      assert.strictEqual(member?._id?.toString(), memberId.toString());

      assert.isTrue(getMembershipFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the member cannot be found', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the member';
      const err = new error.DataNotFoundError(errMessage, 'email', memberId);
      const getMembershipFromModelStub = sandbox.stub();
      getMembershipFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'getMemberById',
        getMembershipFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const member = await membershipService.getMember(memberId);
      assert.notOk(member);

      assert.isTrue(getMembershipFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getMembersById'
      );
      const getMembershipFromModelStub = sandbox.stub();
      getMembershipFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'getMemberById',
        getMembershipFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await membershipService.getMember(memberId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getMembershipFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getMembers', () => {
    it('should get members by filter', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const memberEmail = 'testemail@gmail.com';
      const memberFilter = {email: memberEmail};

      const queryMembersFromModelStub = sandbox.stub();
      queryMembersFromModelStub.resolves({
        results: [
          {
            _id: memberId,
            email: memberEmail,
          },
        ],
      } as unknown as databaseTypes.IMember[]);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'queryMembers',
        queryMembersFromModelStub
      );

      const members = await membershipService.getMembers(memberFilter);
      assert.isOk(members![0]);
      assert.strictEqual(members![0].email?.toString(), memberEmail.toString());

      assert.isTrue(queryMembersFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the member cannot be found', async () => {
      const memberEmail = 'testemail@gmail.com';
      const memberFilter = {email: memberEmail};
      const errMessage = 'Cannot find the member';
      const err = new error.DataNotFoundError(
        errMessage,
        'email',
        memberFilter
      );
      const getMembershipFromModelStub = sandbox.stub();
      getMembershipFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'queryMembers',
        getMembershipFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const member = await membershipService.getMembers(memberFilter);
      assert.notOk(member);

      assert.isTrue(getMembershipFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const memberEmail = 'testemail@gmail.com';
      const memberFilter = {email: memberEmail};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getMembershipByEmail'
      );
      const getMembershipFromModelStub = sandbox.stub();
      getMembershipFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'queryMembers',
        getMembershipFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await membershipService.getMembers(memberFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getMembershipFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getPendingInvitations', () => {
    it('should get a member by email', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const memberEmail = 'testemail@gmail.com';

      const getMembersServiceStub = sandbox.stub();
      getMembersServiceStub.resolves([
        {
          _id: memberId,
          email: memberEmail,
        },
      ] as unknown as databaseTypes.IMember[]);

      sandbox.replace(membershipService, 'getMembers', getMembersServiceStub);

      const members = await membershipService.getPendingInvitations(
        memberEmail
      );
      assert.isOk(members![0]);
      assert.strictEqual(members![0].email?.toString(), memberEmail.toString());

      assert.isTrue(getMembersServiceStub.calledOnce);
    });
    it('will log the failure and return null if the member cannot be found', async () => {
      const email = 'testemail@gmail.com';
      const errMessage = 'Cannot find the member';
      const err = new error.DataNotFoundError(errMessage, 'email', email);

      const getMembersServiceStub = sandbox.stub();
      getMembersServiceStub.rejects(err);
      sandbox.replace(membershipService, 'getMembers', getMembersServiceStub);
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const member = await membershipService.getPendingInvitations(email);

      assert.notOk(member);
      assert.isTrue(getMembersServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and re-throw a DatabaseService Error when the underlying service call throws one ', async () => {
      const email = 'testemail@gmail.com';
      const errMessage = 'Something Bad has happened';
      const err = new error.DataServiceError(
        errMessage,
        'member',
        'getMembers',
        {email}
      );
      const getMembershipFromServiceStub = sandbox.stub();
      getMembershipFromServiceStub.rejects(err);
      sandbox.replace(
        membershipService,
        'getMembers',
        getMembershipFromServiceStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataServiceError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await membershipService.getPendingInvitations(email);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getMembershipFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  //   context('remove', () => {
  //     it('will update a member subscription', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.resolves();

  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       await membershipService.updateSubscription(customerId, subscription);
  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidArgumentError when member model throws it ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'You have an invalid argument';
  //       const err = new error.InvalidArgumentError(
  //         errMessage,
  //         'emailVerified',
  //         true
  //       );
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidArgumentError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidArgumentError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidOperationError when member model throws it ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'You tried to perform an invalid operation';
  //       const err = new error.InvalidOperationError(errMessage, {});
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidOperationError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and throw an DataServiceError when member model throws a DataOperationError ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'A DataOperationError has occurred';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongodDb',
  //         'updateMembershipById'
  //       );
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
  //   context('toggleRole', () => {
  //     it('will update a member subscription', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.resolves();

  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       await membershipService.updateSubscription(customerId, subscription);
  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidArgumentError when member model throws it ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'You have an invalid argument';
  //       const err = new error.InvalidArgumentError(
  //         errMessage,
  //         'emailVerified',
  //         true
  //       );
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidArgumentError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidArgumentError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidOperationError when member model throws it ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'You tried to perform an invalid operation';
  //       const err = new error.InvalidOperationError(errMessage, {});
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidOperationError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and throw an DataServiceError when member model throws a DataOperationError ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'A DataOperationError has occurred';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongodDb',
  //         'updateMembershipById'
  //       );
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
  //   context('updateStatus', () => {
  //     it('will update a member subscription', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.resolves();

  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       await membershipService.updateSubscription(customerId, subscription);
  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidArgumentError when member model throws it ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'You have an invalid argument';
  //       const err = new error.InvalidArgumentError(
  //         errMessage,
  //         'emailVerified',
  //         true
  //       );
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidArgumentError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidArgumentError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidOperationError when member model throws it ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'You tried to perform an invalid operation';
  //       const err = new error.InvalidOperationError(errMessage, {});
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidOperationError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and throw an DataServiceError when member model throws a DataOperationError ', async () => {
  //       const customerId = 'testCustomerId'; //comes from stripe
  //       const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
  //       const errMessage = 'A DataOperationError has occurred';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongodDb',
  //         'updateMembershipById'
  //       );
  //       const updateMembershipFromModelStub = sandbox.stub();
  //       updateMembershipFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.MemberModel,
  //         'updateMembershipWithFilter',
  //         updateMembershipFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await membershipService.updateSubscription(customerId, subscription);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateMembershipFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
});
