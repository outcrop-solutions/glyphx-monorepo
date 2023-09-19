// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { verificationTokenService} from '../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/verificationToken', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createVerificationToken', () => {
    it('will create a VerificationToken', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();

      // createVerificationToken
      const createVerificationTokenFromModelStub = sandbox.stub();
      createVerificationTokenFromModelStub.resolves({
         ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IVerificationToken);

      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'createVerificationToken',
        createVerificationTokenFromModelStub
      );

      const doc = await verificationTokenService.createVerificationToken(
       {
         ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IVerificationToken
      );

      assert.isTrue(createVerificationTokenFromModelStub.calledOnce);
    });
    // verificationToken model fails
    it('will publish and rethrow an InvalidArgumentError when verificationToken model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createVerificationToken
      const createVerificationTokenFromModelStub = sandbox.stub();
      createVerificationTokenFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'createVerificationToken',
        createVerificationTokenFromModelStub
      );


      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await verificationTokenService.createVerificationToken(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when verificationToken model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createVerificationToken
      const createVerificationTokenFromModelStub = sandbox.stub();
      createVerificationTokenFromModelStub.rejects(err);

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await verificationTokenService.createVerificationToken(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when verificationToken model throws it', async () => {
      const createVerificationTokenFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createVerificationTokenFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'createVerificationToken',
        createVerificationTokenFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await verificationTokenService.createVerificationToken(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when verificationToken model throws a DataOperationError', async () => {
      const createVerificationTokenFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createVerificationTokenFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'createVerificationToken',
        createVerificationTokenFromModelStub
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
        await verificationTokenService.createVerificationToken(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when verificationToken model throws a UnexpectedError', async () => {
      const createVerificationTokenFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createVerificationTokenFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'createVerificationToken',
        createVerificationTokenFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await verificationTokenService.createVerificationToken(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getVerificationToken', () => {
    it('should get a verificationToken by id', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();

      const getVerificationTokenFromModelStub = sandbox.stub();
      getVerificationTokenFromModelStub.resolves({
        _id: verificationTokenId,
      } as unknown as databaseTypes.IVerificationToken);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenFromModelStub
      );

      const verificationToken = await verificationTokenService.getVerificationToken(verificationTokenId);
      assert.isOk(verificationToken);
      assert.strictEqual(verificationToken?._id?.toString(), verificationTokenId.toString());

      assert.isTrue(getVerificationTokenFromModelStub.calledOnce);
    });
    it('should get a verificationToken by id when id is a string', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();

      const getVerificationTokenFromModelStub = sandbox.stub();
      getVerificationTokenFromModelStub.resolves({
        _id: verificationTokenId,
      } as unknown as databaseTypes.IVerificationToken);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenFromModelStub
      );

      const verificationToken = await verificationTokenService.getVerificationToken(verificationTokenId.toString());
      assert.isOk(verificationToken);
      assert.strictEqual(verificationToken?._id?.toString(), verificationTokenId.toString());

      assert.isTrue(getVerificationTokenFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the verificationToken cannot be found', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'verificationTokenId',
        verificationTokenId
      );
      const getVerificationTokenFromModelStub = sandbox.stub();
      getVerificationTokenFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenFromModelStub
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

      const verificationToken = await verificationTokenService.getVerificationToken(verificationTokenId);
      assert.notOk(verificationToken);

      assert.isTrue(getVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getVerificationTokenById'
      );
      const getVerificationTokenFromModelStub = sandbox.stub();
      getVerificationTokenFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenFromModelStub
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
        await verificationTokenService.getVerificationToken(verificationTokenId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getVerificationTokens', () => {
    it('should get verificationTokens by filter', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const verificationTokenId2 = new mongooseTypes.ObjectId();
      const verificationTokenFilter = {_id: verificationTokenId};

      const queryVerificationTokensFromModelStub = sandbox.stub();
      queryVerificationTokensFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: verificationTokenId,
        } as unknown as databaseTypes.IVerificationToken,
        {
         ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: verificationTokenId2,
        } as unknown as databaseTypes.IVerificationToken
        ],
      } as unknown as databaseTypes.IVerificationToken[]);

      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'queryVerificationTokens',
        queryVerificationTokensFromModelStub
      );

      const verificationTokens = await verificationTokenService.getVerificationTokens(verificationTokenFilter);
      assert.isOk(verificationTokens![0]);
      assert.strictEqual(verificationTokens![0]._id?.toString(), verificationTokenId.toString());
      assert.isTrue(queryVerificationTokensFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the verificationTokens cannot be found', async () => {
      const verificationTokenName = 'verificationTokenName1';
      const verificationTokenFilter = {name: verificationTokenName};
      const errMessage = 'Cannot find the verificationToken';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        verificationTokenFilter
      );
      const getVerificationTokenFromModelStub = sandbox.stub();
      getVerificationTokenFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'queryVerificationTokens',
        getVerificationTokenFromModelStub
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

      const verificationToken = await verificationTokenService.getVerificationTokens(verificationTokenFilter);
      assert.notOk(verificationToken);

      assert.isTrue(getVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const verificationTokenName = 'verificationTokenName1';
      const verificationTokenFilter = {name: verificationTokenName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getVerificationTokenByEmail'
      );
      const getVerificationTokenFromModelStub = sandbox.stub();
      getVerificationTokenFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'queryVerificationTokens',
        getVerificationTokenFromModelStub
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
        await verificationTokenService.getVerificationTokens(verificationTokenFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateVerificationToken', () => {
    it('will update a verificationToken', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const updateVerificationTokenFromModelStub = sandbox.stub();
      updateVerificationTokenFromModelStub.resolves({
         ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IVerificationToken);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'updateVerificationTokenById',
        updateVerificationTokenFromModelStub
      );

      const verificationToken = await verificationTokenService.updateVerificationToken(verificationTokenId, {
        deletedAt: new Date(),
      });
      assert.isOk(verificationToken);
      assert.strictEqual(verificationToken._id, verificationTokenId);
      assert.isOk(verificationToken.deletedAt);
      assert.isTrue(updateVerificationTokenFromModelStub.calledOnce);
    });
    it('will update a verificationToken when the id is a string', async () => {
     const verificationTokenId = new mongooseTypes.ObjectId();
      const updateVerificationTokenFromModelStub = sandbox.stub();
      updateVerificationTokenFromModelStub.resolves({
         ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IVerificationToken);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'updateVerificationTokenById',
        updateVerificationTokenFromModelStub
      );

      const verificationToken = await verificationTokenService.updateVerificationToken(verificationTokenId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(verificationToken);
      assert.strictEqual(verificationToken._id, verificationTokenId);
      assert.isOk(verificationToken.deletedAt);
      assert.isTrue(updateVerificationTokenFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when verificationToken model throws it ', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateVerificationTokenFromModelStub = sandbox.stub();
      updateVerificationTokenFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'updateVerificationTokenById',
        updateVerificationTokenFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await verificationTokenService.updateVerificationToken(verificationTokenId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when verificationToken model throws it ', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateVerificationTokenFromModelStub = sandbox.stub();
      updateVerificationTokenFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'updateVerificationTokenById',
        updateVerificationTokenFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await verificationTokenService.updateVerificationToken(verificationTokenId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when verificationToken model throws a DataOperationError ', async () => {
      const verificationTokenId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateVerificationTokenById'
      );
      const updateVerificationTokenFromModelStub = sandbox.stub();
      updateVerificationTokenFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.VerificationTokenModel,
        'updateVerificationTokenById',
        updateVerificationTokenFromModelStub
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
        await verificationTokenService.updateVerificationToken(verificationTokenId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateVerificationTokenFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
