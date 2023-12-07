// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { documentService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/document', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createDocument', () => {
    it('will create a Document', async () => {
      const documentId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const presenceId = new mongooseTypes.ObjectId();
      const annotationsId = new mongooseTypes.ObjectId();
      const thresholdsId = new mongooseTypes.ObjectId();
      const configsId = new mongooseTypes.ObjectId();

      // createDocument
      const createDocumentFromModelStub = sandbox.stub();
      createDocumentFromModelStub.resolves({
         ...mocks.MOCK_DOCUMENT,
        _id: new mongooseTypes.ObjectId(),
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
              } as unknown as databaseTypes.IDocument);

      sandbox.replace(
        dbConnection.models.DocumentModel,
        'createDocument',
        createDocumentFromModelStub
      );

      const doc = await documentService.createDocument(
       {
         ...mocks.MOCK_DOCUMENT,
        _id: new mongooseTypes.ObjectId(),
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
              } as unknown as databaseTypes.IDocument
      );

      assert.isTrue(createDocumentFromModelStub.calledOnce);
    });
    // document model fails
    it('will publish and rethrow an InvalidArgumentError when document model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createDocument
      const createDocumentFromModelStub = sandbox.stub();
      createDocumentFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.DocumentModel,
        'createDocument',
        createDocumentFromModelStub
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
        await documentService.createDocument(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when document model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createDocument
      const createDocumentFromModelStub = sandbox.stub();
      createDocumentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.DocumentModel,
        'createDocument',
        createDocumentFromModelStub
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
        await documentService.createDocument(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when document model throws it', async () => {
      const createDocumentFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createDocumentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.DocumentModel,
        'createDocument',
        createDocumentFromModelStub
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
        await documentService.createDocument(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when document model throws a DataOperationError', async () => {
      const createDocumentFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createDocumentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.DocumentModel,
        'createDocument',
        createDocumentFromModelStub
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
        await documentService.createDocument(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when document model throws a UnexpectedError', async () => {
      const createDocumentFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createDocumentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.DocumentModel,
        'createDocument',
        createDocumentFromModelStub
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
        await documentService.createDocument(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getDocument', () => {
    it('should get a document by id', async () => {
      const documentId = new mongooseTypes.ObjectId().toString();

      const getDocumentFromModelStub = sandbox.stub();
      getDocumentFromModelStub.resolves({
        _id: documentId,
      } as unknown as databaseTypes.IDocument);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'getDocumentById',
        getDocumentFromModelStub
      );

      const document = await documentService.getDocument(documentId);
      assert.isOk(document);
      assert.strictEqual(document?._id?.toString(), documentId.toString());

      assert.isTrue(getDocumentFromModelStub.calledOnce);
    });
    it('should get a document by id when id is a string', async () => {
      const documentId = new mongooseTypes.ObjectId();

      const getDocumentFromModelStub = sandbox.stub();
      getDocumentFromModelStub.resolves({
        _id: documentId,
      } as unknown as databaseTypes.IDocument);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'getDocumentById',
        getDocumentFromModelStub
      );

      const document = await documentService.getDocument(documentId.toString());
      assert.isOk(document);
      assert.strictEqual(document?._id?.toString(), documentId.toString());

      assert.isTrue(getDocumentFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the document cannot be found', async () => {
      const documentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'documentId',
        documentId
      );
      const getDocumentFromModelStub = sandbox.stub();
      getDocumentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'getDocumentById',
        getDocumentFromModelStub
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

      const document = await documentService.getDocument(documentId);
      assert.notOk(document);

      assert.isTrue(getDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const documentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getDocumentById'
      );
      const getDocumentFromModelStub = sandbox.stub();
      getDocumentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'getDocumentById',
        getDocumentFromModelStub
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
        await documentService.getDocument(documentId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getDocuments', () => {
    it('should get documents by filter', async () => {
      const documentId = new mongooseTypes.ObjectId();
      const documentId2 = new mongooseTypes.ObjectId();
      const documentFilter = {_id: documentId};

      const queryDocumentsFromModelStub = sandbox.stub();
      queryDocumentsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_DOCUMENT,
        _id: documentId,
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
                } as unknown as databaseTypes.IDocument,
        {
         ...mocks.MOCK_DOCUMENT,
        _id: documentId2,
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
                } as unknown as databaseTypes.IDocument
        ],
      } as unknown as databaseTypes.IDocument[]);

      sandbox.replace(
        dbConnection.models.DocumentModel,
        'queryDocuments',
        queryDocumentsFromModelStub
      );

      const documents = await documentService.getDocuments(documentFilter);
      assert.isOk(documents![0]);
      assert.strictEqual(documents![0]._id?.toString(), documentId.toString());
      assert.isTrue(queryDocumentsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the documents cannot be found', async () => {
      const documentName = 'documentName1';
      const documentFilter = {name: documentName};
      const errMessage = 'Cannot find the document';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        documentFilter
      );
      const getDocumentFromModelStub = sandbox.stub();
      getDocumentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'queryDocuments',
        getDocumentFromModelStub
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

      const document = await documentService.getDocuments(documentFilter);
      assert.notOk(document);

      assert.isTrue(getDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const documentName = 'documentName1';
      const documentFilter = {name: documentName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getDocumentByEmail'
      );
      const getDocumentFromModelStub = sandbox.stub();
      getDocumentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'queryDocuments',
        getDocumentFromModelStub
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
        await documentService.getDocuments(documentFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateDocument', () => {
    it('will update a document', async () => {
      const documentId = new mongooseTypes.ObjectId().toString();
      const updateDocumentFromModelStub = sandbox.stub();
      updateDocumentFromModelStub.resolves({
         ...mocks.MOCK_DOCUMENT,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
              } as unknown as databaseTypes.IDocument);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'updateDocumentById',
        updateDocumentFromModelStub
      );

      const document = await documentService.updateDocument(documentId, {
        deletedAt: new Date(),
      });
      assert.isOk(document);
      assert.strictEqual(document.id, 'id');
      assert.isOk(document.deletedAt);
      assert.isTrue(updateDocumentFromModelStub.calledOnce);
    });
    it('will update a document when the id is a string', async () => {
     const documentId = new mongooseTypes.ObjectId();
      const updateDocumentFromModelStub = sandbox.stub();
      updateDocumentFromModelStub.resolves({
         ...mocks.MOCK_DOCUMENT,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        presence: [],
                annotations: [],
                thresholds: [],
                configs: [],
              } as unknown as databaseTypes.IDocument);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'updateDocumentById',
        updateDocumentFromModelStub
      );

      const document = await documentService.updateDocument(documentId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(document);
      assert.strictEqual(document.id, 'id');
      assert.isOk(document.deletedAt);
      assert.isTrue(updateDocumentFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when document model throws it', async () => {
      const documentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateDocumentFromModelStub = sandbox.stub();
      updateDocumentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'updateDocumentById',
        updateDocumentFromModelStub
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
        await documentService.updateDocument(documentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when document model throws it ', async () => {
      const documentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateDocumentFromModelStub = sandbox.stub();
      updateDocumentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'updateDocumentById',
        updateDocumentFromModelStub
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
        await documentService.updateDocument(documentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when document model throws a DataOperationError ', async () => {
      const documentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateDocumentById'
      );
      const updateDocumentFromModelStub = sandbox.stub();
      updateDocumentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.DocumentModel,
        'updateDocumentById',
        updateDocumentFromModelStub
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
        await documentService.updateDocument(documentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateDocumentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
