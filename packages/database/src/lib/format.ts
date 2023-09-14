// https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-mongodb/src/index.ts
// modified for our purposes
import {constants, error} from 'core';
import {Types as mongooseTypes} from 'mongoose';

/**
 * This translates JS <=> MONGO back and forth for our DB layer
 */
export class DBFormatter {
  // This can be extended to cover many different translation steps, but this is all we need for now
  private _id(hex?: string) {
    if (hex?.length !== 24) return new mongooseTypes.ObjectId();
    return new mongooseTypes.ObjectId(hex);
  }

  public toJS<T = Record<string, unknown>>(object: Record<string, any>): T {
    try {
      const newObject: Record<string, unknown> = {};
      for (const key in object) {
        // exclud __v
        if (key === '__v') continue;
        const value = object[key];
        // convert ObjectId to string
        if (key === '_id') {
          newObject.id = value.toHexString();
          // recurse if valid object
        } else if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value) &&
          !(value instanceof Date) &&
          !(value instanceof mongooseTypes.ObjectId)
        ) {
          newObject[key] = this.toJS(value);
        } else {
          newObject[key] = value;
        }
      }
      return newObject as T;
    } catch (err) {
      const e = new error.DbFormatterError(
        'An unexpected error occurred while converting mongoDb Object to JS Object. See the inner error for additional details',
        '',
        '',
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }

  public toMongo<T = Record<string, unknown>>(object: Record<string, any>) {
    try {
      const newObject: Record<string, unknown> = object.id
        ? {
            _id: this._id(object.id),
          }
        : {};
      for (const key in object) {
        const value = object[key];
        if (key === 'id') continue;
        else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
          newObject[key] = this.toMongo(value);
        } else {
          newObject[key] = value;
        }
      }
      return newObject as T & {_id: mongooseTypes.ObjectId};
    } catch (err) {
      const e = new error.DbFormatterError(
        'An unexpected error occurred while converting mongoDb Object to JS Object. See the inner error for additional details',
        '',
        '',
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }
}
