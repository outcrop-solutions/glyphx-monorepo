import * as models from './models';
import mongoose from 'mongoose';
import {error, secretBinders} from '@glyphx/core';

@secretBinders.bindSecrets('dev/mongodb')
export class MongoDbConnection {
  @secretBinders.boundProperty()
  endpoint: string;
  @secretBinders.boundProperty()
  database: string;
  @secretBinders.boundProperty()
  user: string;
  @secretBinders.boundProperty()
  password: string;

  connectionStringField: string;
  get models() {
    return models;
  }
  get connectionString(): string {
    return this.connectionStringField;
  }

  constructor() {
    this.endpoint = '';
    this.database = '';
    this.user = '';
    this.password = '';

    this.connectionStringField = '';
  }

  async init(): Promise<void> {
    this.connectionStringField = `mongodb+srv://${this.user}:${this.password}@${this.database}.${this.endpoint}?retryWrites=true&w=majority`;
    try {
      await mongoose.connect(encodeURI(this.connectionString));
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An error occurred while connecting to the MongoDB database instance.  See the inner exception for more details',
        'MongoDb',
        'Init',
        err
      );
    }
  }
}
