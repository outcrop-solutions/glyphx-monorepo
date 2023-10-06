import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';

export class AnnotationService {
  public static async getStateAnnotations(stateId: string): Promise<databaseTypes.IAnnotation[] | null> {
    try {
      const annotations = await mongoDbConnection.models.AnnotationModel.queryAnnotations({
        stateId: stateId,
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

  public static async getProjectAnnotations(projectId: string): Promise<databaseTypes.IAnnotation[] | null> {
    try {
      const annotations = await mongoDbConnection.models.AnnotationModel.queryAnnotations({
        projectId: projectId,
      });

      return annotations?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        // err.publish('', constants.ERROR_SEVERITY.WARNING);
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

  public static async createStateAnnotation({
    authorId,
    stateId,
    value,
  }: {
    authorId: string;
    stateId: string;
    value: string;
  }): Promise<databaseTypes.IAnnotation | null> {
    try {
      const input = {
        author: authorId,
        stateId: stateId,
        value: value,
      };

      const annotation = await mongoDbConnection.models.AnnotationModel.createAnnotation(input);
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
  public static async createProjectAnnotation({
    authorId,
    projectId,
    value,
  }: {
    authorId: string;
    projectId: string;
    value: string;
  }): Promise<databaseTypes.IAnnotation | null> {
    try {
      const input = {
        author: authorId,
        projectId: projectId,
        value: value,
      };

      const annotation = await mongoDbConnection.models.AnnotationModel.createAnnotation(input);
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
          {authorId, projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
