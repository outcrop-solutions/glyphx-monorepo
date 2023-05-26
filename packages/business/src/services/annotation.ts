import {database as databaseTypes} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';

export class AnnotationService {
  public static async getStateAnnotations(
    stateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IAnnotation[] | null> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);

      const annotations =
        await mongoDbConnection.models.AnnotationModel.queryAnnotations({
          stateId: id,
        });

      return annotations?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying the annotations. See the inner error for additional details',
          'annotation',
          'getAnnotations',
          {stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getProjectAnnotations(
    projectId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IAnnotation[] | null> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);

      const annotations =
        await mongoDbConnection.models.AnnotationModel.queryAnnotations({
          projectId: id,
        });

      return annotations?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying the annotations. See the inner error for additional details',
          'annotation',
          'getAnnotations',
          {projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createAnnotation({
    authorId,
    stateId,
    value,
  }: {
    authorId: mongooseTypes.ObjectId | string;
    stateId: mongooseTypes.ObjectId | string;
    value: string;
  }): Promise<databaseTypes.IAnnotation | null> {
    try {
      const authorCastId =
        authorId instanceof mongooseTypes.ObjectId
          ? authorId
          : new mongooseTypes.ObjectId(authorId);
      const stateCastId =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);

      const input = {
        author: authorCastId,
        stateId: stateCastId,
        value: value,
      };

      const annotation =
        await mongoDbConnection.models.AnnotationModel.createAnnotation(input);
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
          'An unexpected error occurred while creating thea activity Annotation. See the inner error for additional details',
          'annotation',
          'createAnnotation',
          {authorId, stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
