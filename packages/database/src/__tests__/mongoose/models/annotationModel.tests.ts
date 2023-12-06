// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import { AnnotationModel} from '../../../mongoose/models/annotation'
import * as mocks from '../../../mongoose/mocks';
import { UserModel} from '../../../mongoose/models/user'
import { StateModel} from '../../../mongoose/models/state'
import {IQueryResult, databaseTypes} from 'types'
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/annotation', () => {
  context('annotationIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the annotationId exists', async () => {
      const annotationId = mocks.MOCK_ANNOTATION._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: annotationId});
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      const result = await AnnotationModel.annotationIdExists(annotationId);

      assert.isTrue(result);
    });

    it('should return false if the annotationId does not exist', async () => {
      const annotationId = mocks.MOCK_ANNOTATION._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      const result = await AnnotationModel.annotationIdExists(annotationId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const annotationId = mocks.MOCK_ANNOTATION._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await AnnotationModel.annotationIdExists(annotationId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allAnnotationIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the annotation ids exist', async () => {
      const annotationIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedAnnotationIds = annotationIds.map(annotationId => {
        return {
          _id: annotationId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedAnnotationIds);
      sandbox.replace(AnnotationModel, 'find', findStub);

      assert.isTrue(await AnnotationModel.allAnnotationIdsExist(annotationIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const annotationIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedAnnotationIds = [
        {
          _id: annotationIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedAnnotationIds);
      sandbox.replace(AnnotationModel, 'find', findStub);
      let errored = false;
      try {
        await AnnotationModel.allAnnotationIdsExist(annotationIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          annotationIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const annotationIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(AnnotationModel, 'find', findStub);
      let errored = false;
      try {
        await AnnotationModel.allAnnotationIdsExist(annotationIds);
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
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        authorStub
      );
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(
        StateModel,
        'stateIdExists',
        stateStub
      );

      let errored = false;

      try {
        await AnnotationModel.validateUpdateObject(mocks.MOCK_ANNOTATION as unknown as Omit<Partial<databaseTypes.IAnnotation>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        authorStub
      );
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(
        StateModel,
        'stateIdExists',
        stateStub
      );

      let errored = false;

      try {
        await AnnotationModel.validateUpdateObject(mocks.MOCK_ANNOTATION as unknown as Omit<Partial<databaseTypes.IAnnotation>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(authorStub.calledOnce);
      assert.isTrue(stateStub.calledOnce);
    });

    it('will fail when the author does not exist.', async () => {
      
      const authorStub = sandbox.stub();
      authorStub.resolves(false);
      sandbox.replace(
        UserModel,
        'userIdExists',
        authorStub
      );
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(
        StateModel,
        'stateIdExists',
        stateStub
      );

      let errored = false;

      try {
        await AnnotationModel.validateUpdateObject(mocks.MOCK_ANNOTATION as unknown as Omit<Partial<databaseTypes.IAnnotation>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the state does not exist.', async () => {
      
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        authorStub
      );
      const stateStub = sandbox.stub();
      stateStub.resolves(false);
      sandbox.replace(
        StateModel,
        'stateIdExists',
        stateStub
      );

      let errored = false;

      try {
        await AnnotationModel.validateUpdateObject(mocks.MOCK_ANNOTATION as unknown as Omit<Partial<databaseTypes.IAnnotation>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });


    it('will fail when trying to update the _id', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        authorStub
      );
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(
        StateModel,
        'stateIdExists',
        stateStub
      );

      let errored = false;

      try {
        await AnnotationModel.validateUpdateObject({...mocks.MOCK_ANNOTATION, _id: new mongoose.Types.ObjectId() } as unknown as Omit<Partial<databaseTypes.IAnnotation>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        authorStub
      );
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(
        StateModel,
        'stateIdExists',
        stateStub
      );

      let errored = false;

      try {
        await AnnotationModel.validateUpdateObject({...mocks.MOCK_ANNOTATION, createdAt: new Date() } as unknown as Omit<Partial<databaseTypes.IAnnotation>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        authorStub
      );
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(
        StateModel,
        'stateIdExists',
        stateStub
      );

      let errored = false;

      try {
        await AnnotationModel.validateUpdateObject({...mocks.MOCK_ANNOTATION, updatedAt: new Date() }  as unknown as Omit<Partial<databaseTypes.IAnnotation>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createAnnotation', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a annotation document', async () => {
      sandbox.replace(
        AnnotationModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.author)
      );
      sandbox.replace(
        AnnotationModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        AnnotationModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(AnnotationModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(AnnotationModel, 'getAnnotationById', stub);

      const annotationDocument = await AnnotationModel.createAnnotation(mocks.MOCK_ANNOTATION);

      assert.strictEqual(annotationDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });



    it('will rethrow a DataValidationError when the author validator throws one', async () => {
       sandbox.replace(
        AnnotationModel,
        'validateAuthor',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The author does not exist',
              'author ',
              {}
            )
          )
      );
               sandbox.replace(
        AnnotationModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.state)
        );
        
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        AnnotationModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(AnnotationModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(AnnotationModel, 'getAnnotationById', stub);

      let errored = false;

      try {
        await AnnotationModel.createAnnotation(mocks.MOCK_ANNOTATION);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });


    it('will rethrow a DataValidationError when the state validator throws one', async () => {
         sandbox.replace(
        AnnotationModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.author)
        );
               sandbox.replace(
        AnnotationModel,
        'validateState',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The state does not exist',
              'state ',
              {}
            )
          )
      );
      
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        AnnotationModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(AnnotationModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(AnnotationModel, 'getAnnotationById', stub);

      let errored = false;

      try {
        await AnnotationModel.createAnnotation(mocks.MOCK_ANNOTATION);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });


    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        AnnotationModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.author)
      );
      sandbox.replace(
        AnnotationModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(AnnotationModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        AnnotationModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', stub);
      let hasError = false;
      try {
        await AnnotationModel.createAnnotation(mocks.MOCK_ANNOTATION);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        AnnotationModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.author)
      );
      sandbox.replace(
        AnnotationModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(AnnotationModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(AnnotationModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', stub);

      let hasError = false;
      try {
        await AnnotationModel.createAnnotation(mocks.MOCK_ANNOTATION);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        AnnotationModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.author)
      );
      sandbox.replace(
        AnnotationModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_ANNOTATION.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        AnnotationModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        AnnotationModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', stub);
      let hasError = false;
      try {
        await AnnotationModel.createAnnotation(mocks.MOCK_ANNOTATION);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getAnnotationById', () => {
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

    it('will retreive a annotation document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_ANNOTATION));
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      const doc = await AnnotationModel.getAnnotationById(
        mocks.MOCK_ANNOTATION._id
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.author as any)?.__v);
      assert.isUndefined((doc.state as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_ANNOTATION._id);
    });

    it('will throw a DataNotFoundError when the annotation does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await AnnotationModel.getAnnotationById(
          mocks.MOCK_ANNOTATION._id
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
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await AnnotationModel.getAnnotationById(
          mocks.MOCK_ANNOTATION.id
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryAnnotations', () => {
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

    const mockAnnotations = [
      {
       ...mocks.MOCK_ANNOTATION,
        _id: new mongoose.Types.ObjectId(),
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as databaseTypes.IAnnotation,
      {
        ...mocks.MOCK_ANNOTATION,
        _id: new mongoose.Types.ObjectId(),
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as databaseTypes.IAnnotation,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered annotations', async () => {
      sandbox.replace(
        AnnotationModel,
        'count',
        sandbox.stub().resolves(mockAnnotations.length)
      );

      sandbox.replace(
        AnnotationModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockAnnotations))
      );

      const results = await AnnotationModel.queryAnnotations({});

      assert.strictEqual(results.numberOfItems, mockAnnotations.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockAnnotations.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.author as any)?.__v);
        assert.isUndefined((doc.state as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(AnnotationModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        AnnotationModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockAnnotations))
      );

      let errored = false;
      try {
        await AnnotationModel.queryAnnotations();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        AnnotationModel,
        'count',
        sandbox.stub().resolves(mockAnnotations.length)
      );

      sandbox.replace(
        AnnotationModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockAnnotations))
      );

      let errored = false;
      try {
        await AnnotationModel.queryAnnotations({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        AnnotationModel,
        'count',
        sandbox.stub().resolves(mockAnnotations.length)
      );

      sandbox.replace(
        AnnotationModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await AnnotationModel.queryAnnotations({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateAnnotationById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a annotation', async () => {
      const updateAnnotation = {
        ...mocks.MOCK_ANNOTATION,
        deletedAt: new Date(),
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IAnnotation;

      const annotationId = mocks.MOCK_ANNOTATION._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AnnotationModel, 'updateOne', updateStub);

      const getAnnotationStub = sandbox.stub();
      getAnnotationStub.resolves({_id: annotationId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', getAnnotationStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(AnnotationModel, 'validateUpdateObject', validateStub);

      const result = await AnnotationModel.updateAnnotationById(
        annotationId,
        updateAnnotation
      );

      assert.strictEqual(result._id, mocks.MOCK_ANNOTATION._id);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getAnnotationStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a annotation with references as ObjectIds', async () => {
      const updateAnnotation = {
        ...mocks.MOCK_ANNOTATION,
        deletedAt: new Date()
      } as unknown as databaseTypes.IAnnotation;

      const annotationId = mocks.MOCK_ANNOTATION._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AnnotationModel, 'updateOne', updateStub);

      const getAnnotationStub = sandbox.stub();
      getAnnotationStub.resolves({_id: annotationId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', getAnnotationStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(AnnotationModel, 'validateUpdateObject', validateStub);

      const result = await AnnotationModel.updateAnnotationById(
        annotationId,
        updateAnnotation
      );

      assert.strictEqual(result._id, annotationId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getAnnotationStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the annotation does not exist', async () => {
      const updateAnnotation = {
        ...mocks.MOCK_ANNOTATION,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IAnnotation;

      const annotationId = mocks.MOCK_ANNOTATION._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(AnnotationModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(AnnotationModel, 'validateUpdateObject', validateStub);

      const getAnnotationStub = sandbox.stub();
      getAnnotationStub.resolves({_id: annotationId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', getAnnotationStub);

      let errorred = false;
      try {
        await AnnotationModel.updateAnnotationById(annotationId, updateAnnotation);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateAnnotation = {
       ...mocks.MOCK_ANNOTATION,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IAnnotation;

      const annotationId = mocks.MOCK_ANNOTATION._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AnnotationModel, 'updateOne', updateStub);

      const getAnnotationStub = sandbox.stub();
      getAnnotationStub.resolves({_id: annotationId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', getAnnotationStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(AnnotationModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await AnnotationModel.updateAnnotationById(annotationId, updateAnnotation);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateAnnotation = {
       ...mocks.MOCK_ANNOTATION,
        deletedAt: new Date()
      } as unknown as databaseTypes.IAnnotation;

      const annotationId = mocks.MOCK_ANNOTATION._id;

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(AnnotationModel, 'updateOne', updateStub);

      const getAnnotationStub = sandbox.stub();
      getAnnotationStub.resolves({_id: annotationId});
      sandbox.replace(AnnotationModel, 'getAnnotationById', getAnnotationStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(AnnotationModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await AnnotationModel.updateAnnotationById(annotationId, updateAnnotation);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a annotation document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a annotation', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(AnnotationModel, 'deleteOne', deleteStub);

      const annotationId = mocks.MOCK_ANNOTATION._id;

      await AnnotationModel.deleteAnnotationById(annotationId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the annotation does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(AnnotationModel, 'deleteOne', deleteStub);

      const annotationId = mocks.MOCK_ANNOTATION._id;

      let errorred = false;
      try {
        await AnnotationModel.deleteAnnotationById(annotationId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(AnnotationModel, 'deleteOne', deleteStub);

      const annotationId = mocks.MOCK_ANNOTATION._id;

      let errorred = false;
      try {
        await AnnotationModel.deleteAnnotationById(annotationId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

});
