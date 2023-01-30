import 'mocha';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import mongoose from 'mongoose';
import {assert} from 'chai';

describe('#mongooseConenction', () => {
  context('basic mongoose connection test', () => {
    it('will create a new mongoose connection', async () => {
      const connection = new MongoDbConnection();
      await connection.init();

      assert.strictEqual(mongoose.connection.readyState, 1);
    });
  });
});
