import * as models from './models';
import mongoose from 'mongoose';
import {bindSecrets, boundProperty, error} from '@glyphx/core';

@bindSecrets('dev/mongodb')
export class MongoDbConnection {
  @boundProperty()
  endpoint: string;
  @boundProperty()
  database: string;
  @boundProperty()
  user: string;
  @boundProperty()
  password: string;

  private isInitedField: boolean;

  public get isInited(): boolean {
    return this.isInitedField;
  }

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
    this.isInitedField = false;
    this.connectionStringField = '';
  }

  async init(): Promise<void> {
    //istanbul ignore else
    if (!this.isInitedField) {
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
      this.isInitedField = true;
    }
  }
}
