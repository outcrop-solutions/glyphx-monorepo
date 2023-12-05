// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#DocumentModel', () => {
  context('test the crud functions of the document model', () => {
    const mongoConnection = new MongoDbConnection();
    const documentModel = mongoConnection.models.DocumentModel;
    let documentDocId: ObjectId;
    let documentDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (documentDocId) {
        await documentModel.findByIdAndDelete(documentDocId);
      }

      if (documentDocId2) {
        await documentModel.findByIdAndDelete(documentDocId2);
      }
    });

    it('add a new document ', async () => {
      const documentInput = JSON.parse(JSON.stringify(mocks.MOCK_DOCUMENT));

      const documentDocument = await documentModel.createDocument(documentInput);

      assert.isOk(documentDocument);
      assert.strictEqual(Object.keys(documentDocument)[1], Object.keys(documentInput)[1]);

      documentDocId = documentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a document', async () => {
      assert.isOk(documentDocId);
      const document = await documentModel.getDocumentById(documentDocId);

      assert.isOk(document);
      assert.strictEqual(document._id?.toString(), documentDocId.toString());
    });

    it('modify a document', async () => {
      assert.isOk(documentDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await documentModel.updateDocumentById(documentDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple documents without a filter', async () => {
      assert.isOk(documentDocId);
      const documentInput = JSON.parse(JSON.stringify(mocks.MOCK_DOCUMENT));

      const documentDocument = await documentModel.createDocument(documentInput);

      assert.isOk(documentDocument);

      documentDocId2 = documentDocument._id as mongooseTypes.ObjectId;

      const documents = await documentModel.queryDocuments();
      assert.isArray(documents.results);
      assert.isAtLeast(documents.numberOfItems, 2);
      const expectedDocumentCount =
        documents.numberOfItems <= documents.itemsPerPage ? documents.numberOfItems : documents.itemsPerPage;
      assert.strictEqual(documents.results.length, expectedDocumentCount);
    });

    it('Get multiple documents with a filter', async () => {
      assert.isOk(documentDocId2);
      const results = await documentModel.queryDocuments({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(documentDocId2);
      const results = await documentModel.queryDocuments({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await documentModel.queryDocuments({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a document', async () => {
      assert.isOk(documentDocId);
      await documentModel.deleteDocumentById(documentDocId.toString());
      let errored = false;
      try {
        await documentModel.getDocumentById(documentDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      documentDocId = null as unknown as ObjectId;
    });
  });
});
