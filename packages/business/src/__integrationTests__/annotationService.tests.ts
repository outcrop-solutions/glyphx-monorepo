import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';
import {annotationService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
const MOCK_PAYLOAD_HASH = '2d6518de3ae5b3dc477e44759a64a22c';
const MOCK_FILESYSTEM_HASH = 'cde4d74582624873915e646f34ec588c';

const INPUT_USER: databaseTypes.IUser = {
  userCode: 'dfkadfkljafdkalsjskldf',
  name: 'testUser',
  username: 'test@user.com',
  email: 'test@user.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};

const INPUT_PROJECT = {
  _id:
    // @ts-ignore
    new mongooseTypes.ObjectId(),
  name: 'testProject' + UNIQUE_KEY,

  template:
    // @ts-ignore
    new mongooseTypes.ObjectId(),
  state: {
    properties: {
      X: {
        axis: webTypes.constants.AXIS.X,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column X', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      Y: {
        axis: webTypes.constants.AXIS.Y,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column Y', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      Z: {
        axis: webTypes.constants.AXIS.Z,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column Z', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      A: {
        axis: webTypes.constants.AXIS.A,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column 1', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      B: {
        axis: webTypes.constants.AXIS.B,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column 2', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      C: {
        axis: webTypes.constants.AXIS.C,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column 3', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
    },
  },
  files: [],
};

const INPUT_STATE: databaseTypes.IState = {
  _id:
    // @ts-ignore
    new mongooseTypes.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: INPUT_USER,
  properties: {
    X: {
      axis: webTypes.constants.AXIS.X,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column X', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    Y: {
      axis: webTypes.constants.AXIS.Y,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column Y', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    Z: {
      axis: webTypes.constants.AXIS.Z,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column Z', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    A: {
      axis: webTypes.constants.AXIS.A,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 1', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    B: {
      axis: webTypes.constants.AXIS.B,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 2', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    C: {
      axis: webTypes.constants.AXIS.C,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 3', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
  },
  fileSystem: [],
  fileSystemHash: MOCK_FILESYSTEM_HASH,
  payloadHash: MOCK_PAYLOAD_HASH,
  name: 'mockState1',
  aspectRatio: {
    height: 400,
    width: 400,
  },
  static: true,
  version: 0,
  camera: {
    pos: {
      x: 0,
      y: 0,
      z: 0,
    },
    dir: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
};

const INPUT_ANNOTATION: databaseTypes.IAnnotation = {
  createdAt: new Date(),
  updatedAt: new Date(),
  workspaces: [],
  templates: [],
  projects: [],
  value: 'annotationValue',
  stateId: INPUT_STATE._id,
};

const INPUT_PROJECT_ANNOTATION: databaseTypes.IAnnotation = {
  createdAt: new Date(),
  updatedAt: new Date(),
  workspaces: [],
  templates: [],
  projects: [],
  value: 'annotationValue',
  projectId: INPUT_PROJECT._id,
};

describe('#AnnotationService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the annotation service', () => {
    let userId: ObjectId;
    let annotationId: ObjectId;
    let stateId: ObjectId;
    let projectId: ObjectId;
    let projectAnnotationId: ObjectId;
    let annotationDocument;
    let stateDocument;
    let userDocument;
    let projectDocument;
    let projectAnnotationDocument;

    before(async () => {
      await mongoConnection.init();
      const stateModel = mongoConnection.models.StateModel;
      const userModel = mongoConnection.models.UserModel;
      const projectModel = mongoConnection.models.ProjectModel;
      const annotationModel = mongoConnection.models.AnnotationModel;

      // create user
      await userModel.create(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel.findOne({userCode: INPUT_USER.userCode}).lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;
      assert.isOk(userId);

      // create state
      await stateModel.create(INPUT_STATE as databaseTypes.IState);

      const savedStateDocument = await stateModel.findOne({fileSystemHash: INPUT_STATE.fileSystemHash}).lean();
      stateId = savedStateDocument?._id as mongooseTypes.ObjectId;

      stateDocument = savedStateDocument;
      assert.isOk(stateId);

      // create state annotation
      await annotationModel.create(INPUT_ANNOTATION as databaseTypes.IAnnotation);

      const savedAnnotationDocument = await annotationModel.findOne({value: INPUT_ANNOTATION.value}).lean();
      annotationId = savedAnnotationDocument?._id as mongooseTypes.ObjectId;

      annotationDocument = savedAnnotationDocument;

      assert.isOk(annotationId);

      // create project
      await projectModel.create(INPUT_PROJECT as databaseTypes.IProject);

      const savedProjectDocument = await projectModel.findOne({fileSystemHash: INPUT_STATE.fileSystemHash}).lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);

      // create project annotation
      await annotationModel.create(INPUT_PROJECT_ANNOTATION as databaseTypes.IAnnotation);

      const savedProjectAnnotationDocument = await annotationModel.findOne({value: INPUT_ANNOTATION.value}).lean();
      projectAnnotationId = savedProjectAnnotationDocument?._id as mongooseTypes.ObjectId;

      projectAnnotationDocument = savedProjectAnnotationDocument;

      assert.isOk(projectAnnotationId);
    });

    after(async () => {
      const annotationModel = mongoConnection.models.AnnotationModel;
      const stateModel = mongoConnection.models.StateModel;
      const projectModel = mongoConnection.models.ProjectModel;
      const userModel = mongoConnection.models.ProjectModel;

      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }
      if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
      if (projectAnnotationId) {
        await annotationModel.findByIdAndDelete(projectAnnotationId);
      }
      if (annotationId) {
        await annotationModel.findByIdAndDelete(annotationId);
      }
    });

    it('will retreive state annotations from the database', async () => {
      const annotations = await annotationService.getStateAnnotations(stateId);
      assert.isOk(annotations);
    });
    it('will retreive project annotations from the database', async () => {
      const annotation = await annotationService.getProjectAnnotations(projectId);
      assert.isOk(annotation);
    });
    it('will create an annotation on the state', async () => {
      const annotation = await annotationService.createStateAnnotation({
        authorId: userDocument._id,
        stateId: stateDocument._id,
        value: UNIQUE_KEY,
      });
      assert.isOk(annotation);

      assert.strictEqual(annotation?.value, UNIQUE_KEY);
    });
    it('will create an annotation on the project', async () => {
      const annotation = await annotationService.createProjectAnnotation({
        authorId: userDocument._id,
        projectId: projectDocument._id,
        value: UNIQUE_KEY,
      });
      assert.isOk(annotation);

      assert.strictEqual(annotation?.value, UNIQUE_KEY);
    });
  });
});
