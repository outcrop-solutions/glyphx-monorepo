// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IAnnotationCreateInput} from 'database/src/mongoose/interfaces';

export class AnnotationService {
  public static async getAnnotation(annotationId: string): Promise<databaseTypes.IAnnotation | null> {
    try {
      const annotation = await mongoDbConnection.models.AnnotationModel.getAnnotationById(annotationId);
      return annotation;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the annotation. See the inner error for additional details',
          'annotation',
          'getAnnotation',
          {id: annotationId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getAnnotations(filter?: Record<string, unknown>): Promise<databaseTypes.IAnnotation[] | null> {
    try {
      const annotations = await mongoDbConnection.models.AnnotationModel.queryAnnotations(filter);
      return annotations?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting annotations. See the inner error for additional details',
          'annotations',
          'getAnnotations',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createAnnotation(data: Partial<databaseTypes.IAnnotation>): Promise<databaseTypes.IAnnotation> {
    try {
      // create annotation
      const annotation = await mongoDbConnection.models.AnnotationModel.createAnnotation(
        data as IAnnotationCreateInput
      );

      return annotation;
    } catch (err: any) {
      if (
        err instanceof error.InvalidOperationError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the annotation. See the inner error for additional details',
          'annotation',
          'createAnnotation',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateAnnotation(
    annotationId: string,
    data: Partial<Omit<databaseTypes.IAnnotation, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IAnnotation> {
    try {
      const annotation = await mongoDbConnection.models.AnnotationModel.updateAnnotationById(annotationId, {
        ...data,
      });
      return annotation;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateAnnotation',
          {annotationId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteAnnotation(annotationId: string): Promise<databaseTypes.IAnnotation> {
    try {
      const annotation = await mongoDbConnection.models.AnnotationModel.updateAnnotationById(annotationId, {
        deletedAt: new Date(),
      });
      return annotation;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateAnnotation',
          {annotationId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addAuthor(
    annotationId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IAnnotation> {
    try {
      const updatedAnnotation = await mongoDbConnection.models.AnnotationModel.addAuthor(annotationId, user);

      return updatedAnnotation;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the annotation. See the inner error for additional details',
          'annotation',
          'addAuthor',
          {id: annotationId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeAuthor(
    annotationId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IAnnotation> {
    try {
      const updatedAnnotation = await mongoDbConnection.models.AnnotationModel.removeAuthor(annotationId, user);

      return updatedAnnotation;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the annotation. See the inner error for additional details',
          'annotation',
          'removeAuthor',
          {id: annotationId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addState(
    annotationId: string,
    state: databaseTypes.IState | string
  ): Promise<databaseTypes.IAnnotation> {
    try {
      const updatedAnnotation = await mongoDbConnection.models.AnnotationModel.addState(annotationId, state);

      return updatedAnnotation;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding state to the annotation. See the inner error for additional details',
          'annotation',
          'addState',
          {id: annotationId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeState(
    annotationId: string,
    state: databaseTypes.IState | string
  ): Promise<databaseTypes.IAnnotation> {
    try {
      const updatedAnnotation = await mongoDbConnection.models.AnnotationModel.removeState(annotationId, state);

      return updatedAnnotation;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  state from the annotation. See the inner error for additional details',
          'annotation',
          'removeState',
          {id: annotationId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
