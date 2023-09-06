import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes, webTypes, fileIngestionTypes} from 'types';
import {stateService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const MOCK_PAYLOAD_HASH = '2d6518de3ae5b3dc477e44759a64a22c';
const MOCK_FILESYSTEM_HASH = 'cde4d74582624873915e646f34ec588c';

const MOCK_USER: databaseTypes.IUser = {
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

const INPUT_STATE: databaseTypes.IState = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  _id:
    // @ts-ignore
    new mongooseTypes.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: MOCK_USER,
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
  workspace: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    _id:
      // @ts-ignore
      new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
  project: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    _id:
      // @ts-ignore
      new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IProject,
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

describe('#StateService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the state service', () => {
    let stateId: ObjectId;
    // let stateDocument;

    before(async () => {
      await mongoConnection.init();
      const stateModel = mongoConnection.models.StateModel;

      await stateModel.createState(INPUT_STATE as databaseTypes.IState);

      const savedStateDocument = await stateModel
        .findOne({name: INPUT_STATE.name})
        .lean();
      stateId = savedStateDocument?._id as mongooseTypes.ObjectId;

      //   stateDocument = savedStateDocument;

      assert.isOk(stateId);
    });

    after(async () => {
      const stateModel = mongoConnection.models.StateModel;
      await stateModel.findByIdAndDelete(stateId);

      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }
    });

    it('will retreive our state from the database', async () => {
      const state = await stateService.getState(stateId);
      assert.isOk(state);

      assert.strictEqual(state?.name, INPUT_STATE.name);
    });
    it('will create a state in the database', async () => {
      const state = await stateService.createState(stateId);
      assert.isOk(state);

      assert.strictEqual(state?.name, INPUT_STATE.name);
    });
    it('will delete a state from the database', async () => {
      const state = await stateService.deleteState(stateId);
      assert.isOk(state);

      assert.strictEqual(state?.name, INPUT_STATE.name);
    });
    it('will update a state', async () => {
      const state = await stateService.updateState(stateId);
      assert.isOk(state);

      assert.strictEqual(state?.name, INPUT_STATE.name);
    });
  });
});
