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
    // @ts-ignore
    return new mongooseTypes.ObjectId(hex);
  }

  public toJS<T = Record<string, unknown>>(object: Record<string, any> | any[]): T {
    try {
      if (Array.isArray(object)) {
        return object.map((item) => this.toJS(item)) as unknown as T;
      }

      const newObject: Record<string, unknown> = {};

      for (const key in object) {
        // Exclude __v and _id
        if (key === '__v' || key === '_id') continue;

        const value = object[key];

        // Handle arrays
        if (Array.isArray(value)) {
          newObject[key] = value.map((item) => {
            if (item instanceof mongooseTypes.ObjectId) {
              return item.toString();
            }
            return this.toJS(item);
          });
        }
        // Recurse if valid object
        else if (
          typeof value === 'object' &&
          value !== null &&
          !(value instanceof Date) &&
          !(value instanceof mongooseTypes.ObjectId)
        ) {
          newObject[key] = this.toJS(value);
        }
        // Handle ObjectId
        else if (value instanceof mongooseTypes.ObjectId) {
          newObject[key] = value.toString();
        }
        // Default handling
        else {
          newObject[key] = value;
        }
      }

      // If _id exists, convert it to string as "id"
      if (object._id) {
        newObject.id = object._id.toString();
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

  // toJS<T = Record<string, unknown>>(object: Record<string, any>): T {
  //   try {
  //     const newObject: Record<string, unknown> = {};
  //     for (const key in object) {
  //       // exclude __v
  //       if (key === '__v') continue;
  //       const value = object[key];
  //       // handle arrays
  //       if (Array.isArray(value)) {
  //         newObject[key] = value.map((item) => {
  //           if (item instanceof mongooseTypes.ObjectId) {
  //             return item.toString();
  //           }
  //           return this.toJS(item);
  //         });
  //       } else if (
  //         typeof value === 'object' &&
  //         value !== null &&
  //         !(value instanceof Date) &&
  //         !(value instanceof mongooseTypes.ObjectId)
  //       ) {
  //         // recurse if valid object
  //         newObject[key] = this.toJS(value);
  //       } else {
  //         newObject[key] = value;
  //       }
  //       // convert ObjectId to string
  //       if (key === '_id') {
  //         newObject.id = value.toString();
  //       } else if (value instanceof mongooseTypes.ObjectId) {
  //         newObject[key] = value.toString();
  //       }
  //     }
  //     return newObject as T;
  //   } catch (err) {
  //     const e = new error.DbFormatterError(
  //       'An unexpected error occurred while converting mongoDb Object to JS Object. See the inner error for additional details',
  //       '',
  //       '',
  //       err
  //     );
  //     e.publish('', constants.ERROR_SEVERITY.ERROR);
  //     throw e;
  //   }
  // }

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
        } else if (Array.isArray(value)) {
          newObject[key] = value.map((item) => {
            return this.toMongo(item);
          });
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
