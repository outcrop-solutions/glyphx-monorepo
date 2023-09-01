import 'mocha';
import {assert} from 'chai';
import {AnnotationModel} from '../../../mongoose/models/annotation';
import {IAnnotationCreateInput} from '../../../mongoose/interfaces/iAnnotationCreateInput';
import {UserModel} from '../../../mongoose/models/user';
import {StateModel} from '../../../mongoose/models/state';
import {ProjectModel} from '../../../mongoose/models/project';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

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

const MOCK_ANNOTATION = {
  _id: new mongoose.Types.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: new Date(),
  author: {
    _id: new mongoose.Types.ObjectId(),
    __v: 1,
  } as unknown as databaseTypes.IUser,
  value: 'I am annotated',
  __v: 1,
} as databaseTypes.IAnnotation;

describe('#mongoose/models/annotation', () => {
  const sandbox = createSandbox();

  afterEach(() => {
    sandbox.restore();
  });
  context('AnnotationIdExists', () => {
    it('will return true when the annotation id exists in the database', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(true);
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      const result = await AnnotationModel.annotationIdExists(
        new mongoose.Types.ObjectId()
      );
      assert.isTrue(result);
    });

    it('will return false when the annotation id does not exist in the database', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(false);
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      const result = await AnnotationModel.annotationIdExists(
        new mongoose.Types.ObjectId()
      );
      assert.isFalse(result);
    });

    it('will databse operation error when the underlyong database call fails', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('the database has failed');
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);
      let errored = false;
      try {
        await AnnotationModel.annotationIdExists(new mongoose.Types.ObjectId());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('allAnnotationIdsExist', () => {
    it('will return true id all annotation ids exist in the database', async () => {
      const ids = [
        {_id: new mongoose.Types.ObjectId()},
        {_id: new mongoose.Types.ObjectId()},
      ];
      const findStub = sandbox.stub();
      findStub.resolves(ids);
      sandbox.replace(AnnotationModel, 'find', findStub);
      const result = await AnnotationModel.allAnnotationIdsExist(
        ids.map(id => id._id)
      );
      assert.isTrue(result);
    });

    it('will throw a DataNotFoundError when all of the ids do not exist in the database', async () => {
      const ids = [
        {_id: new mongoose.Types.ObjectId()},
        {_id: new mongoose.Types.ObjectId()},
      ];
      const findStub = sandbox.stub();
      findStub.resolves([ids[0]]);
      sandbox.replace(AnnotationModel, 'find', findStub);
      let errored = false;
      try {
        await AnnotationModel.allAnnotationIdsExist(ids.map(id => id._id));
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlyong database operation fails', async () => {
      const ids = [
        {_id: new mongoose.Types.ObjectId()},
        {_id: new mongoose.Types.ObjectId()},
      ];
      const findStub = sandbox.stub();
      findStub.rejects('the database has failed');
      sandbox.replace(AnnotationModel, 'find', findStub);
      let errored = false;
      try {
        await AnnotationModel.allAnnotationIdsExist(ids.map(id => id._id));
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
  context('getAnnotationById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will return the annotation when the annotation exists in the database', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(MOCK_ANNOTATION));
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      const result = await AnnotationModel.getAnnotationById(
        new mongoose.Types.ObjectId()
      );
      assert.isObject(result);

      assert.isUndefined((result as any).__v);
      assert.isUndefined((result as any).author.__v);
    });

    it('will throw a DataNotFoundError when the id does not exist in the database', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(undefined));
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await AnnotationModel.getAnnotationById(new mongoose.Types.ObjectId());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database call fails', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('A Database error has occurred', true)
      );
      sandbox.replace(AnnotationModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await AnnotationModel.getAnnotationById(new mongoose.Types.ObjectId());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
  context('queryAnnotations', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will return the annotations that match the query', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ANNOTATION]));
      sandbox.replace(AnnotationModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(AnnotationModel, 'count', countStub);

      const result = await AnnotationModel.queryAnnotations({}, 0, 10);
      assert.isOk(result);
      assert.strictEqual(result.numberOfItems, 1);
      assert.strictEqual(result.results.length, 1);
      assert.strictEqual(result.page, 0);
      assert.strictEqual(result.itemsPerPage, 10);

      const annotation = result.results[0];
      assert.isUndefined((annotation as any).__v);
      assert.isUndefined((annotation as any).author.__v);
    });

    it('will return the annotations that match the query with default page and pageSize', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ANNOTATION]));
      sandbox.replace(AnnotationModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(AnnotationModel, 'count', countStub);

      const result = await AnnotationModel.queryAnnotations({});
      assert.isOk(result);
      assert.strictEqual(result.numberOfItems, 1);
      assert.strictEqual(result.results.length, 1);
      assert.strictEqual(result.page, 0);
      assert.strictEqual(result.itemsPerPage, 10);

      const annotation = result.results[0];
      assert.isUndefined((annotation as any).__v);
      assert.isUndefined((annotation as any).author.__v);
    });

    it('will throw a DataNotFoundError if the filter yeilds 0 documents', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ANNOTATION]));
      sandbox.replace(AnnotationModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(0);
      sandbox.replace(AnnotationModel, 'count', countStub);
      let errored = false;
      try {
        await AnnotationModel.queryAnnotations({}, 0, 10);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError if the page number is out of bounds', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ANNOTATION]));
      sandbox.replace(AnnotationModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(AnnotationModel, 'count', countStub);
      let errored = false;
      try {
        await AnnotationModel.queryAnnotations({}, 2, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError if the underlyong database call fails', async () => {
      const findStub = sandbox.stub();
      findStub.rejects('a database error has occured');
      sandbox.replace(AnnotationModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(AnnotationModel, 'count', countStub);
      let errored = false;
      try {
        await AnnotationModel.queryAnnotations({}, 0, 10);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
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
    it('will create an annotation using objects for the author id', async () => {
      const input = {...MOCK_ANNOTATION} as IAnnotationCreateInput;
      input.author = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;
      input.projectId = new mongoose.Types.ObjectId();
      input.stateId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const stateIdExistsStub = sandbox.stub();
      stateIdExistsStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(AnnotationModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([MOCK_ANNOTATION]);
      sandbox.replace(AnnotationModel, 'create', createStub);

      const getAnnotationByIdStub = sandbox.stub();
      getAnnotationByIdStub.resolves(MOCK_ANNOTATION);
      sandbox.replace(
        AnnotationModel,
        'getAnnotationById',
        getAnnotationByIdStub
      );

      const result = await AnnotationModel.createAnnotation(input);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(projectIdExistsStub.calledOnce);
      assert.isTrue(stateIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
      assert.isTrue(getAnnotationByIdStub.calledOnce);
    });

    it('will create an annotation using objectId for the author id and other ids as strings', async () => {
      const input = {...MOCK_ANNOTATION} as IAnnotationCreateInput;
      input.author = new mongoose.Types.ObjectId();
      input.projectId = new mongoose.Types.ObjectId().toString();
      input.stateId = new mongoose.Types.ObjectId().toString();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const stateIdExistsStub = sandbox.stub();
      stateIdExistsStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(AnnotationModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([MOCK_ANNOTATION]);
      sandbox.replace(AnnotationModel, 'create', createStub);

      const getAnnotationByIdStub = sandbox.stub();
      getAnnotationByIdStub.resolves(MOCK_ANNOTATION);
      sandbox.replace(
        AnnotationModel,
        'getAnnotationById',
        getAnnotationByIdStub
      );

      const result = await AnnotationModel.createAnnotation(input);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(projectIdExistsStub.calledOnce);
      assert.isTrue(stateIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
      assert.isTrue(getAnnotationByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the author does not exist.', async () => {
      const input = {...MOCK_ANNOTATION} as IAnnotationCreateInput;
      input.author = new mongoose.Types.ObjectId();
      input.projectId = new mongoose.Types.ObjectId();
      input.stateId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const stateIdExistsStub = sandbox.stub();
      stateIdExistsStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(AnnotationModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([MOCK_ANNOTATION]);
      sandbox.replace(AnnotationModel, 'create', createStub);

      const getAnnotationByIdStub = sandbox.stub();
      getAnnotationByIdStub.resolves(MOCK_ANNOTATION);
      sandbox.replace(
        AnnotationModel,
        'getAnnotationById',
        getAnnotationByIdStub
      );

      let errored = false;
      try {
        await AnnotationModel.createAnnotation(input);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the project does not exist.', async () => {
      const input = {...MOCK_ANNOTATION} as IAnnotationCreateInput;
      input.author = new mongoose.Types.ObjectId();
      input.projectId = new mongoose.Types.ObjectId();
      input.stateId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const stateIdExistsStub = sandbox.stub();
      stateIdExistsStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(AnnotationModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([MOCK_ANNOTATION]);
      sandbox.replace(AnnotationModel, 'create', createStub);

      const getAnnotationByIdStub = sandbox.stub();
      getAnnotationByIdStub.resolves(MOCK_ANNOTATION);
      sandbox.replace(
        AnnotationModel,
        'getAnnotationById',
        getAnnotationByIdStub
      );

      let errored = false;
      try {
        await AnnotationModel.createAnnotation(input);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the state does not exist.', async () => {
      const input = {...MOCK_ANNOTATION} as IAnnotationCreateInput;
      input.author = new mongoose.Types.ObjectId();
      input.projectId = new mongoose.Types.ObjectId();
      input.stateId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const stateIdExistsStub = sandbox.stub();
      stateIdExistsStub.resolves(false);
      sandbox.replace(StateModel, 'stateIdExists', stateIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(AnnotationModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([MOCK_ANNOTATION]);
      sandbox.replace(AnnotationModel, 'create', createStub);

      const getAnnotationByIdStub = sandbox.stub();
      getAnnotationByIdStub.resolves(MOCK_ANNOTATION);
      sandbox.replace(
        AnnotationModel,
        'getAnnotationById',
        getAnnotationByIdStub
      );

      let errored = false;
      try {
        await AnnotationModel.createAnnotation(input);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an DataValidationError when the input is not valid.', async () => {
      const input = {...MOCK_ANNOTATION} as IAnnotationCreateInput;
      input.author = new mongoose.Types.ObjectId();
      input.projectId = new mongoose.Types.ObjectId();
      input.stateId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const stateIdExistsStub = sandbox.stub();
      stateIdExistsStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.rejects('This is not valid');
      sandbox.replace(AnnotationModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([MOCK_ANNOTATION]);
      sandbox.replace(AnnotationModel, 'create', createStub);

      const getAnnotationByIdStub = sandbox.stub();
      getAnnotationByIdStub.resolves(MOCK_ANNOTATION);
      sandbox.replace(
        AnnotationModel,
        'getAnnotationById',
        getAnnotationByIdStub
      );

      let errored = false;
      try {
        await AnnotationModel.createAnnotation(input);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an DatabaseOperationError when the underlyong create fails.', async () => {
      const input = {...MOCK_ANNOTATION} as IAnnotationCreateInput;
      input.author = new mongoose.Types.ObjectId();
      input.projectId = new mongoose.Types.ObjectId();
      input.stateId = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      const projectIdExistsStub = sandbox.stub();
      projectIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectIdExistsStub);

      const stateIdExistsStub = sandbox.stub();
      stateIdExistsStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(AnnotationModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.rejects('something bad has happened');
      sandbox.replace(AnnotationModel, 'create', createStub);

      const getAnnotationByIdStub = sandbox.stub();
      getAnnotationByIdStub.resolves(MOCK_ANNOTATION);
      sandbox.replace(
        AnnotationModel,
        'getAnnotationById',
        getAnnotationByIdStub
      );

      let errored = false;
      try {
        await AnnotationModel.createAnnotation(input);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});
