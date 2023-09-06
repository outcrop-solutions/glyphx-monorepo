import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes} from 'types';
import {datashipService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

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

describe('#DataService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the data service', () => {
    let dataId: ObjectId;
    // let dataDocument;

    before(async () => {
      await mongoConnection.init();
      const dataModel = mongoConnection.models.DataModel;

      await dataModel.createData(INPUT_DATA as databaseTypes.IData);

      const savedDataDocument = await dataModel.findOne({name: INPUT_DATA.name}).lean();
      dataId = savedDataDocument?._id as mongooseTypes.ObjectId;

      //   dataDocument = savedDataDocument;

      assert.isOk(dataId);
    });

    after(async () => {
      const dataModel = mongoConnection.models.DataModel;
      await dataModel.findByIdAndDelete(dataId);

      if (dataId) {
        await dataModel.findByIdAndDelete(dataId);
      }
    });

    it('will retreive our data by glyph Ids from athena', async () => {
      const data = await datashipService.getDataByGlyphxIds(dataId);
      assert.isOk(data);

      assert.strictEqual(data?.name, INPUT_DATA.name);
    });
    it('will retreive our data by tablename from athena', async () => {
      const data = await datashipService.getDataByTableName(dataId);
      assert.isOk(data);

      assert.strictEqual(data?.name, INPUT_DATA.name);
    });
  });
});
