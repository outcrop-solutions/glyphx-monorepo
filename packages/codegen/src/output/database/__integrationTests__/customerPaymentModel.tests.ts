// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#CustomerPaymentModel', () => {
  context('test the crud functions of the customerPayment model', () => {
    const mongoConnection = new MongoDbConnection();
    const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
    let customerPaymentId: ObjectId;
    let memberId: ObjectId;
    let customerPaymentId2: ObjectId;
    let workspaceId: ObjectId;
    let customerPaymentTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let customerPaymentTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const customerPaymentTemplateModel =
        mongoConnection.models.CustomerPaymentTemplateModel;

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;
      workspaceDocument = savedWorkspaceDocument;
      assert.isOk(workspaceId);

      await memberModel.create([INPUT_MEMBER], {
        validateBeforeSave: false,
      });
      const savedMemberDocument = await memberModel
        .findOne({email: INPUT_MEMBER.email})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;
      memberDocument = savedMemberDocument;
      assert.isOk(memberId);

      await customerPaymentTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedCustomerPaymentTemplateDocument =
        await customerPaymentTemplateModel
          .findOne({name: INPUT_PROJECT_TYPE.name})
          .lean();
      customerPaymentTemplateId =
        savedCustomerPaymentTemplateDocument?._id as mongooseTypes.ObjectId;

      customerPaymentTemplateDocument = savedCustomerPaymentTemplateDocument;

      assert.isOk(customerPaymentTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const customerPaymentTemplateModel =
        mongoConnection.models.CustomerPaymentTemplateModel;
      await customerPaymentTemplateModel.findByIdAndDelete(
        customerPaymentTemplateId
      );

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (customerPaymentId) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId);
      }

      if (customerPaymentId2) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId2);
      }
    });

    it('add a new customerPayment ', async () => {
      const customerPaymentInput = JSON.parse(JSON.stringify(INPUT_DATA));
      customerPaymentInput.workspace = workspaceDocument;
      customerPaymentInput.template = customerPaymentTemplateDocument;

      const customerPaymentDocument =
        await customerPaymentModel.createCustomerPayment(customerPaymentInput);

      assert.isOk(customerPaymentDocument);
      assert.strictEqual(
        customerPaymentDocument.name,
        customerPaymentInput.name
      );
      assert.strictEqual(
        customerPaymentDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      customerPaymentId = customerPaymentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a customerPayment', async () => {
      assert.isOk(customerPaymentId);
      const customerPayment = await customerPaymentModel.getCustomerPaymentById(
        customerPaymentId
      );

      assert.isOk(customerPayment);
      assert.strictEqual(
        customerPayment._id?.toString(),
        customerPaymentId.toString()
      );
    });

    it('modify a customerPayment', async () => {
      assert.isOk(customerPaymentId);
      const input = {description: 'a modified description'};
      const updatedDocument =
        await customerPaymentModel.updateCustomerPaymentById(
          customerPaymentId,
          input
        );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple customerPayments without a filter', async () => {
      assert.isOk(customerPaymentId);
      const customerPaymentInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      customerPaymentInput.workspace = workspaceDocument;
      customerPaymentInput.type = customerPaymentTemplateDocument;

      const customerPaymentDocument =
        await customerPaymentModel.createCustomerPayment(customerPaymentInput);

      assert.isOk(customerPaymentDocument);

      customerPaymentId2 =
        customerPaymentDocument._id as mongooseTypes.ObjectId;

      const customerPayments =
        await customerPaymentModel.queryCustomerPayments();
      assert.isArray(customerPayments.results);
      assert.isAtLeast(customerPayments.numberOfItems, 2);
      const expectedDocumentCount =
        customerPayments.numberOfItems <= customerPayments.itemsPerPage
          ? customerPayments.numberOfItems
          : customerPayments.itemsPerPage;
      assert.strictEqual(
        customerPayments.results.length,
        expectedDocumentCount
      );
    });

    it('Get multiple customerPayments with a filter', async () => {
      assert.isOk(customerPaymentId2);
      const results = await customerPaymentModel.queryCustomerPayments({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(customerPaymentId2);
      const results = await customerPaymentModel.queryCustomerPayments(
        {},
        0,
        1
      );
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await customerPaymentModel.queryCustomerPayments(
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

    it('remove a customerPayment', async () => {
      assert.isOk(customerPaymentId);
      await customerPaymentModel.deleteCustomerPaymentById(customerPaymentId);
      let errored = false;
      try {
        await customerPaymentModel.getCustomerPaymentById(customerPaymentId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      customerPaymentId = null as unknown as ObjectId;
    });
  });
});
