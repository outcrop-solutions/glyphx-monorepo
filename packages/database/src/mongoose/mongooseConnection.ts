import * as models from './models';
import {MongoClient} from 'mongodb';
import mongoose from 'mongoose';
import {bindSecrets, boundProperty} from 'core/src/secrets/secretClassDecorator';
import {DatabaseOperationError} from 'core/src/error';

@bindSecrets('db/mongo')
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

  /**
   * Native mongo driver is required by next-auth, mongoose connection is used for all other DB operations
   */
  get connectionPromise(): Promise<MongoClient> {
    const uri = `mongodb+srv://${this.user}:${this.password}@${this.database}.${this.endpoint}?retryWrites=true&w=majority`;
    return MongoClient.connect(encodeURI(uri), {});
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
        // this is set to false in mongoose v7. This gets rid of the deprecation warning in our logs
        mongoose.set('strictQuery', true);
        await mongoose.connect(encodeURI(this.connectionString));
      } catch (err) {
        throw new DatabaseOperationError(
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
