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

describe('#AnnotationModel', () => {
  context('test the crud functions of the annotation model', () => {
    const mongoConnection = new MongoDbConnection();
    const annotationModel = mongoConnection.models.AnnotationModel;
    let annotationDocId: ObjectId;
    let annotationDocId2: ObjectId;
    let authorId: ObjectId;
    let authorDocument: any;
    let stateId: ObjectId;
    let stateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const authorModel = mongoConnection.models.UserModel;
      const savedAuthorDocument = await authorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      authorId = savedAuthorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(authorId);
      const stateModel = mongoConnection.models.StateModel;
      const savedStateDocument = await stateModel.create([mocks.MOCK_STATE], {
        validateBeforeSave: false,
      });
      stateId = savedStateDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(stateId);
    });

    after(async () => {
      if (annotationDocId) {
        await annotationModel.findByIdAndDelete(annotationDocId);
      }

      if (annotationDocId2) {
        await annotationModel.findByIdAndDelete(annotationDocId2);
      }
      const authorModel = mongoConnection.models.UserModel;
      await authorModel.findByIdAndDelete(authorId);
      const stateModel = mongoConnection.models.StateModel;
      await stateModel.findByIdAndDelete(stateId);
    });

    it('add a new annotation ', async () => {
      const annotationInput = JSON.parse(JSON.stringify(mocks.MOCK_ANNOTATION));

      annotationInput.author = authorDocument;
      annotationInput.state = stateDocument;

      const annotationDocument = await annotationModel.createAnnotation(annotationInput);

      assert.isOk(annotationDocument);
      assert.strictEqual(Object.keys(annotationDocument)[1], Object.keys(annotationInput)[1]);

      annotationDocId = annotationDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a annotation', async () => {
      assert.isOk(annotationDocId);
      const annotation = await annotationModel.getAnnotationById(annotationDocId);

      assert.isOk(annotation);
      assert.strictEqual(annotation._id?.toString(), annotationDocId.toString());
    });

    it('modify a annotation', async () => {
      assert.isOk(annotationDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await annotationModel.updateAnnotationById(annotationDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple annotations without a filter', async () => {
      assert.isOk(annotationDocId);
      const annotationInput = JSON.parse(JSON.stringify(mocks.MOCK_ANNOTATION));

      const annotationDocument = await annotationModel.createAnnotation(annotationInput);

      assert.isOk(annotationDocument);

      annotationDocId2 = annotationDocument._id as mongooseTypes.ObjectId;

      const annotations = await annotationModel.queryAnnotations();
      assert.isArray(annotations.results);
      assert.isAtLeast(annotations.numberOfItems, 2);
      const expectedDocumentCount =
        annotations.numberOfItems <= annotations.itemsPerPage ? annotations.numberOfItems : annotations.itemsPerPage;
      assert.strictEqual(annotations.results.length, expectedDocumentCount);
    });

    it('Get multiple annotations with a filter', async () => {
      assert.isOk(annotationDocId2);
      const results = await annotationModel.queryAnnotations({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(annotationDocId2);
      const results = await annotationModel.queryAnnotations({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await annotationModel.queryAnnotations({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a annotation', async () => {
      assert.isOk(annotationDocId);
      await annotationModel.deleteAnnotationById(annotationDocId.toString());
      let errored = false;
      try {
        await annotationModel.getAnnotationById(annotationDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      annotationDocId = null as unknown as ObjectId;
    });
  });
});
