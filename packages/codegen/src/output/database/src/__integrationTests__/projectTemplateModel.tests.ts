// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#ProjectTemplateModel', () => {
  context('test the crud functions of the projectTemplate model', () => {
    const mongoConnection = new MongoDbConnection();
    const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;
    let projectTemplateDocId: ObjectId;
    let projectTemplateDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (projectTemplateDocId) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateDocId);
      }

      if (projectTemplateDocId2) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateDocId2);
      }
    });

    it('add a new projectTemplate ', async () => {
      const projectTemplateInput = JSON.parse(
        JSON.stringify(mocks.MOCK_PROJECTTEMPLATE)
      );

      const projectTemplateDocument =
        await projectTemplateModel.createProjectTemplate(projectTemplateInput);

      assert.isOk(projectTemplateDocument);
      assert.strictEqual(
        Object.keys(projectTemplateDocument)[1],
        Object.keys(projectTemplateInput)[1]
      );

      projectTemplateDocId =
        projectTemplateDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a projectTemplate', async () => {
      assert.isOk(projectTemplateDocId);
      const projectTemplate =
        await projectTemplateModel.getProjectTemplateById(projectTemplateDocId);

      assert.isOk(projectTemplate);
      assert.strictEqual(
        projectTemplate._id?.toString(),
        projectTemplateDocId.toString()
      );
    });

    it('modify a projectTemplate', async () => {
      assert.isOk(projectTemplateDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument =
        await projectTemplateModel.updateProjectTemplateById(
          projectTemplateDocId,
          input
        );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple projectTemplates without a filter', async () => {
      assert.isOk(projectTemplateDocId);
      const projectTemplateInput = JSON.parse(
        JSON.stringify(mocks.MOCK_PROJECTTEMPLATE)
      );

      const projectTemplateDocument =
        await projectTemplateModel.createProjectTemplate(projectTemplateInput);

      assert.isOk(projectTemplateDocument);

      projectTemplateDocId2 =
        projectTemplateDocument._id as mongooseTypes.ObjectId;

      const projectTemplates =
        await projectTemplateModel.queryProjectTemplates();
      assert.isArray(projectTemplates.results);
      assert.isAtLeast(projectTemplates.numberOfItems, 2);
      const expectedDocumentCount =
        projectTemplates.numberOfItems <= projectTemplates.itemsPerPage
          ? projectTemplates.numberOfItems
          : projectTemplates.itemsPerPage;
      assert.strictEqual(
        projectTemplates.results.length,
        expectedDocumentCount
      );
    });

    it('Get multiple projectTemplates with a filter', async () => {
      assert.isOk(projectTemplateDocId2);
      const results = await projectTemplateModel.queryProjectTemplates({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(projectTemplateDocId2);
      const results = await projectTemplateModel.queryProjectTemplates(
        {},
        0,
        1
      );
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await projectTemplateModel.queryProjectTemplates(
        {},
        1,
        1
      );
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a projectTemplate', async () => {
      assert.isOk(projectTemplateDocId);
      await projectTemplateModel.deleteProjectTemplateById(
        projectTemplateDocId
      );
      let errored = false;
      try {
        await projectTemplateModel.getProjectTemplateById(projectTemplateDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectTemplateDocId = null as unknown as ObjectId;
    });
  });
});
