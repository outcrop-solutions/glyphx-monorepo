// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import { DocumentModel} from '../../../mongoose/models/document'
import * as mocks from '../../../mongoose/mocks';
import { PresenceModel} from '../../../mongoose/models/presence'
import { AnnotationModel} from '../../../mongoose/models/annotation'
import { ThresholdModel} from '../../../mongoose/models/threshold'
import { ModelConfigModel} from '../../../mongoose/models/modelConfig'
import {IQueryResult, databaseTypes} from 'types'
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/document', () => {
  context('documentIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the documentId exists', async () => {
      const documentId = mocks.MOCK_DOCUMENT._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: documentId});
      sandbox.replace(DocumentModel, 'findById', findByIdStub);

      const result = await DocumentModel.documentIdExists(documentId);

      assert.isTrue(result);
    });

    it('should return false if the documentId does not exist', async () => {
      const documentId = mocks.MOCK_DOCUMENT._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(DocumentModel, 'findById', findByIdStub);

      const result = await DocumentModel.documentIdExists(documentId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const documentId = mocks.MOCK_DOCUMENT._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(DocumentModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await DocumentModel.documentIdExists(documentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allDocumentIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the document ids exist', async () => {
      const documentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedDocumentIds = documentIds.map(documentId => {
        return {
          _id: documentId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedDocumentIds);
      sandbox.replace(DocumentModel, 'find', findStub);

      assert.isTrue(await DocumentModel.allDocumentIdsExist(documentIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const documentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedDocumentIds = [
        {
          _id: documentIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedDocumentIds);
      sandbox.replace(DocumentModel, 'find', findStub);
      let errored = false;
      try {
        await DocumentModel.allDocumentIdsExist(documentIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          documentIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const documentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(DocumentModel, 'find', findStub);
      let errored = false;
      try {
        await DocumentModel.allDocumentIdsExist(documentIds);
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

      let errored = false;

      try {
        await DocumentModel.validateUpdateObject(mocks.MOCK_DOCUMENT as unknown as Omit<Partial<databaseTypes.IDocument>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {

      let errored = false;

      try {
        await DocumentModel.validateUpdateObject(mocks.MOCK_DOCUMENT as unknown as Omit<Partial<databaseTypes.IDocument>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });



    it('will fail when trying to update the _id', async () => {

      let errored = false;

      try {
        await DocumentModel.validateUpdateObject({...mocks.MOCK_DOCUMENT, _id: new mongoose.Types.ObjectId() } as unknown as Omit<Partial<databaseTypes.IDocument>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {

      let errored = false;

      try {
        await DocumentModel.validateUpdateObject({...mocks.MOCK_DOCUMENT, createdAt: new Date() } as unknown as Omit<Partial<databaseTypes.IDocument>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {

      let errored = false;

      try {
        await DocumentModel.validateUpdateObject({...mocks.MOCK_DOCUMENT, updatedAt: new Date() }  as unknown as Omit<Partial<databaseTypes.IDocument>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createDocument', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a document document', async () => {
      sandbox.replace(
        DocumentModel,
        'validatePresences',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.presence)
      );
            sandbox.replace(
        DocumentModel,
        'validateAnnotations',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.annotations)
      );
            sandbox.replace(
        DocumentModel,
        'validateThresholds',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.thresholds)
      );
            sandbox.replace(
        DocumentModel,
        'validateConfigs',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.configs)
      );
      
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        DocumentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(DocumentModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(DocumentModel, 'getDocumentById', stub);

      const documentDocument = await DocumentModel.createDocument(mocks.MOCK_DOCUMENT);

      assert.strictEqual(documentDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });



    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        DocumentModel,
        'validatePresences',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.presence)
      );
            sandbox.replace(
        DocumentModel,
        'validateAnnotations',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.annotations)
      );
            sandbox.replace(
        DocumentModel,
        'validateThresholds',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.thresholds)
      );
            sandbox.replace(
        DocumentModel,
        'validateConfigs',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.configs)
      );
      
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(DocumentModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        DocumentModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(DocumentModel, 'getDocumentById', stub);
      let hasError = false;
      try {
        await DocumentModel.createDocument(mocks.MOCK_DOCUMENT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        DocumentModel,
        'validatePresences',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.presence)
      );
            sandbox.replace(
        DocumentModel,
        'validateAnnotations',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.annotations)
      );
            sandbox.replace(
        DocumentModel,
        'validateThresholds',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.thresholds)
      );
            sandbox.replace(
        DocumentModel,
        'validateConfigs',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.configs)
      );
      
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(DocumentModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(DocumentModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(DocumentModel, 'getDocumentById', stub);

      let hasError = false;
      try {
        await DocumentModel.createDocument(mocks.MOCK_DOCUMENT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        DocumentModel,
        'validatePresences',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.presence)
      );
            sandbox.replace(
        DocumentModel,
        'validateAnnotations',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.annotations)
      );
            sandbox.replace(
        DocumentModel,
        'validateThresholds',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.thresholds)
      );
            sandbox.replace(
        DocumentModel,
        'validateConfigs',
        sandbox.stub().resolves(mocks.MOCK_DOCUMENT.configs)
      );
      
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        DocumentModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        DocumentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(DocumentModel, 'getDocumentById', stub);
      let hasError = false;
      try {
        await DocumentModel.createDocument(mocks.MOCK_DOCUMENT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getDocumentById', () => {
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

    it('will retreive a document document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_DOCUMENT));
      sandbox.replace(DocumentModel, 'findById', findByIdStub);

      const doc = await DocumentModel.getDocumentById(
        mocks.MOCK_DOCUMENT._id
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.presence![0] as any)?.__v);
            assert.isUndefined((doc.annotations![0] as any)?.__v);
            assert.isUndefined((doc.thresholds![0] as any)?.__v);
            assert.isUndefined((doc.configs![0] as any)?.__v);
      
      assert.strictEqual(doc._id, mocks.MOCK_DOCUMENT._id);
    });

    it('will throw a DataNotFoundError when the document does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(DocumentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await DocumentModel.getDocumentById(
          mocks.MOCK_DOCUMENT._id
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
      sandbox.replace(DocumentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await DocumentModel.getDocumentById(
          mocks.MOCK_DOCUMENT.id
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryDocuments', () => {
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

    const mockDocuments = [
      {
       ...mocks.MOCK_DOCUMENT,
        _id: new mongoose.Types.ObjectId(),
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
              } as databaseTypes.IDocument,
      {
        ...mocks.MOCK_DOCUMENT,
        _id: new mongoose.Types.ObjectId(),
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
              } as databaseTypes.IDocument,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered documents', async () => {
      sandbox.replace(
        DocumentModel,
        'count',
        sandbox.stub().resolves(mockDocuments.length)
      );

      sandbox.replace(
        DocumentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockDocuments))
      );

      const results = await DocumentModel.queryDocuments({});

      assert.strictEqual(results.numberOfItems, mockDocuments.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockDocuments.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.presence[0] as any)?.__v);
                assert.isUndefined((doc.annotations[0] as any)?.__v);
                assert.isUndefined((doc.thresholds[0] as any)?.__v);
                assert.isUndefined((doc.configs[0] as any)?.__v);
              });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(DocumentModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        DocumentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockDocuments))
      );

      let errored = false;
      try {
        await DocumentModel.queryDocuments();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        DocumentModel,
        'count',
        sandbox.stub().resolves(mockDocuments.length)
      );

      sandbox.replace(
        DocumentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockDocuments))
      );

      let errored = false;
      try {
        await DocumentModel.queryDocuments({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        DocumentModel,
        'count',
        sandbox.stub().resolves(mockDocuments.length)
      );

      sandbox.replace(
        DocumentModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await DocumentModel.queryDocuments({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateDocumentById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a document', async () => {
      const updateDocument = {
        ...mocks.MOCK_DOCUMENT,
        deletedAt: new Date(),
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
              } as unknown as databaseTypes.IDocument;

      const documentId = mocks.MOCK_DOCUMENT._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(DocumentModel, 'updateOne', updateStub);

      const getDocumentStub = sandbox.stub();
      getDocumentStub.resolves({_id: documentId});
      sandbox.replace(DocumentModel, 'getDocumentById', getDocumentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(DocumentModel, 'validateUpdateObject', validateStub);

      const result = await DocumentModel.updateDocumentById(
        documentId,
        updateDocument
      );

      assert.strictEqual(result._id, mocks.MOCK_DOCUMENT._id);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getDocumentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a document with references as ObjectIds', async () => {
      const updateDocument = {
        ...mocks.MOCK_DOCUMENT,
        deletedAt: new Date()
      } as unknown as databaseTypes.IDocument;

      const documentId = mocks.MOCK_DOCUMENT._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(DocumentModel, 'updateOne', updateStub);

      const getDocumentStub = sandbox.stub();
      getDocumentStub.resolves({_id: documentId});
      sandbox.replace(DocumentModel, 'getDocumentById', getDocumentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(DocumentModel, 'validateUpdateObject', validateStub);

      const result = await DocumentModel.updateDocumentById(
        documentId,
        updateDocument
      );

      assert.strictEqual(result._id, documentId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getDocumentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the document does not exist', async () => {
      const updateDocument = {
        ...mocks.MOCK_DOCUMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IDocument;

      const documentId = mocks.MOCK_DOCUMENT._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(DocumentModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(DocumentModel, 'validateUpdateObject', validateStub);

      const getDocumentStub = sandbox.stub();
      getDocumentStub.resolves({_id: documentId});
      sandbox.replace(DocumentModel, 'getDocumentById', getDocumentStub);

      let errorred = false;
      try {
        await DocumentModel.updateDocumentById(documentId, updateDocument);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateDocument = {
       ...mocks.MOCK_DOCUMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IDocument;

      const documentId = mocks.MOCK_DOCUMENT._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(DocumentModel, 'updateOne', updateStub);

      const getDocumentStub = sandbox.stub();
      getDocumentStub.resolves({_id: documentId});
      sandbox.replace(DocumentModel, 'getDocumentById', getDocumentStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(DocumentModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await DocumentModel.updateDocumentById(documentId, updateDocument);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateDocument = {
       ...mocks.MOCK_DOCUMENT,
        deletedAt: new Date()
      } as unknown as databaseTypes.IDocument;

      const documentId = mocks.MOCK_DOCUMENT._id;

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(DocumentModel, 'updateOne', updateStub);

      const getDocumentStub = sandbox.stub();
      getDocumentStub.resolves({_id: documentId});
      sandbox.replace(DocumentModel, 'getDocumentById', getDocumentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(DocumentModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await DocumentModel.updateDocumentById(documentId, updateDocument);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a document document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a document', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(DocumentModel, 'deleteOne', deleteStub);

      const documentId = mocks.MOCK_DOCUMENT._id;

      await DocumentModel.deleteDocumentById(documentId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the document does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(DocumentModel, 'deleteOne', deleteStub);

      const documentId = mocks.MOCK_DOCUMENT._id;

      let errorred = false;
      try {
        await DocumentModel.deleteDocumentById(documentId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(DocumentModel, 'deleteOne', deleteStub);

      const documentId = mocks.MOCK_DOCUMENT._id;

      let errorred = false;
      try {
        await DocumentModel.deleteDocumentById(documentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

});
