// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { annotationService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/annotation', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createAnnotation', () => {
    it('will create a Annotation', async () => {
      const annotationId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const authorId = new mongooseTypes.ObjectId();
      const stateId = new mongooseTypes.ObjectId();

      // createAnnotation
      const createAnnotationFromModelStub = sandbox.stub();
      createAnnotationFromModelStub.resolves({
         ...mocks.MOCK_ANNOTATION,
        _id: new mongooseTypes.ObjectId(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IAnnotation);

      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'createAnnotation',
        createAnnotationFromModelStub
      );

      const doc = await annotationService.createAnnotation(
       {
         ...mocks.MOCK_ANNOTATION,
        _id: new mongooseTypes.ObjectId(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IAnnotation
      );

      assert.isTrue(createAnnotationFromModelStub.calledOnce);
    });
    // annotation model fails
    it('will publish and rethrow an InvalidArgumentError when annotation model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createAnnotation
      const createAnnotationFromModelStub = sandbox.stub();
      createAnnotationFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'createAnnotation',
        createAnnotationFromModelStub
      );


      function fakePublish() {
        
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
        await annotationService.createAnnotation(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when annotation model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createAnnotation
      const createAnnotationFromModelStub = sandbox.stub();
      createAnnotationFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'createAnnotation',
        createAnnotationFromModelStub
      );
      
      function fakePublish() {
        
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
        await annotationService.createAnnotation(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when annotation model throws it', async () => {
      const createAnnotationFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createAnnotationFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'createAnnotation',
        createAnnotationFromModelStub
      );

      function fakePublish() {
        
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
        await annotationService.createAnnotation(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when annotation model throws a DataOperationError', async () => {
      const createAnnotationFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createAnnotationFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'createAnnotation',
        createAnnotationFromModelStub
      );

      function fakePublish() {
        
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
        await annotationService.createAnnotation(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when annotation model throws a UnexpectedError', async () => {
      const createAnnotationFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createAnnotationFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'createAnnotation',
        createAnnotationFromModelStub
      );

      function fakePublish() {
        
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
        await annotationService.createAnnotation(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getAnnotation', () => {
    it('should get a annotation by id', async () => {
      const annotationId = new mongooseTypes.ObjectId().toString();

      const getAnnotationFromModelStub = sandbox.stub();
      getAnnotationFromModelStub.resolves({
        _id: annotationId,
      } as unknown as databaseTypes.IAnnotation);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'getAnnotationById',
        getAnnotationFromModelStub
      );

      const annotation = await annotationService.getAnnotation(annotationId);
      assert.isOk(annotation);
      assert.strictEqual(annotation?._id?.toString(), annotationId.toString());

      assert.isTrue(getAnnotationFromModelStub.calledOnce);
    });
    it('should get a annotation by id when id is a string', async () => {
      const annotationId = new mongooseTypes.ObjectId();

      const getAnnotationFromModelStub = sandbox.stub();
      getAnnotationFromModelStub.resolves({
        _id: annotationId,
      } as unknown as databaseTypes.IAnnotation);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'getAnnotationById',
        getAnnotationFromModelStub
      );

      const annotation = await annotationService.getAnnotation(annotationId.toString());
      assert.isOk(annotation);
      assert.strictEqual(annotation?._id?.toString(), annotationId.toString());

      assert.isTrue(getAnnotationFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the annotation cannot be found', async () => {
      const annotationId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'annotationId',
        annotationId
      );
      const getAnnotationFromModelStub = sandbox.stub();
      getAnnotationFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'getAnnotationById',
        getAnnotationFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const annotation = await annotationService.getAnnotation(annotationId);
      assert.notOk(annotation);

      assert.isTrue(getAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const annotationId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getAnnotationById'
      );
      const getAnnotationFromModelStub = sandbox.stub();
      getAnnotationFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'getAnnotationById',
        getAnnotationFromModelStub
      );
      function fakePublish() {
        
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
        await annotationService.getAnnotation(annotationId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getAnnotations', () => {
    it('should get annotations by filter', async () => {
      const annotationId = new mongooseTypes.ObjectId();
      const annotationId2 = new mongooseTypes.ObjectId();
      const annotationFilter = {_id: annotationId};

      const queryAnnotationsFromModelStub = sandbox.stub();
      queryAnnotationsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_ANNOTATION,
        _id: annotationId,
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
        } as unknown as databaseTypes.IAnnotation,
        {
         ...mocks.MOCK_ANNOTATION,
        _id: annotationId2,
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
        } as unknown as databaseTypes.IAnnotation
        ],
      } as unknown as databaseTypes.IAnnotation[]);

      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'queryAnnotations',
        queryAnnotationsFromModelStub
      );

      const annotations = await annotationService.getAnnotations(annotationFilter);
      assert.isOk(annotations![0]);
      assert.strictEqual(annotations![0]._id?.toString(), annotationId.toString());
      assert.isTrue(queryAnnotationsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the annotations cannot be found', async () => {
      const annotationName = 'annotationName1';
      const annotationFilter = {name: annotationName};
      const errMessage = 'Cannot find the annotation';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        annotationFilter
      );
      const getAnnotationFromModelStub = sandbox.stub();
      getAnnotationFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'queryAnnotations',
        getAnnotationFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const annotation = await annotationService.getAnnotations(annotationFilter);
      assert.notOk(annotation);

      assert.isTrue(getAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const annotationName = 'annotationName1';
      const annotationFilter = {name: annotationName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getAnnotationByEmail'
      );
      const getAnnotationFromModelStub = sandbox.stub();
      getAnnotationFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'queryAnnotations',
        getAnnotationFromModelStub
      );
      function fakePublish() {
        
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
        await annotationService.getAnnotations(annotationFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateAnnotation', () => {
    it('will update a annotation', async () => {
      const annotationId = new mongooseTypes.ObjectId().toString();
      const updateAnnotationFromModelStub = sandbox.stub();
      updateAnnotationFromModelStub.resolves({
         ...mocks.MOCK_ANNOTATION,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IAnnotation);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'updateAnnotationById',
        updateAnnotationFromModelStub
      );

      const annotation = await annotationService.updateAnnotation(annotationId, {
        deletedAt: new Date(),
      });
      assert.isOk(annotation);
      assert.strictEqual(annotation.id, 'id');
      assert.isOk(annotation.deletedAt);
      assert.isTrue(updateAnnotationFromModelStub.calledOnce);
    });
    it('will update a annotation when the id is a string', async () => {
     const annotationId = new mongooseTypes.ObjectId();
      const updateAnnotationFromModelStub = sandbox.stub();
      updateAnnotationFromModelStub.resolves({
         ...mocks.MOCK_ANNOTATION,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IAnnotation);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'updateAnnotationById',
        updateAnnotationFromModelStub
      );

      const annotation = await annotationService.updateAnnotation(annotationId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(annotation);
      assert.strictEqual(annotation.id, 'id');
      assert.isOk(annotation.deletedAt);
      assert.isTrue(updateAnnotationFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when annotation model throws it', async () => {
      const annotationId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateAnnotationFromModelStub = sandbox.stub();
      updateAnnotationFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'updateAnnotationById',
        updateAnnotationFromModelStub
      );

      function fakePublish() {
        
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
        await annotationService.updateAnnotation(annotationId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when annotation model throws it ', async () => {
      const annotationId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateAnnotationFromModelStub = sandbox.stub();
      updateAnnotationFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'updateAnnotationById',
        updateAnnotationFromModelStub
      );

      function fakePublish() {
        
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
        await annotationService.updateAnnotation(annotationId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when annotation model throws a DataOperationError ', async () => {
      const annotationId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateAnnotationById'
      );
      const updateAnnotationFromModelStub = sandbox.stub();
      updateAnnotationFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AnnotationModel,
        'updateAnnotationById',
        updateAnnotationFromModelStub
      );

      function fakePublish() {
        
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
        await annotationService.updateAnnotation(annotationId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateAnnotationFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
