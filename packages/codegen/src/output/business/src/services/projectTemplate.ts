// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class ProjectTemplateService {
  public static async getProjectTemplate(
    projectTemplateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProjectTemplate | null> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const projectTemplate =
        await mongoDbConnection.models.ProjectTemplateModel.getProjectTemplateById(id);
      return projectTemplate;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the projectTemplate. See the inner error for additional details',
          'projectTemplate',
          'getProjectTemplate',
          {id: projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getProjectTemplates(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IProjectTemplate[] | null> {
    try {
      const projectTemplates =
        await mongoDbConnection.models.ProjectTemplateModel.queryProjectTemplates(filter);
      return projectTemplates?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting projectTemplates. See the inner error for additional details',
          'projectTemplates',
          'getProjectTemplates',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createProjectTemplate(
    data: Partial<databaseTypes.IProjectTemplate>,
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      // create projectTemplate
      const projectTemplate = await mongoDbConnection.models.ProjectTemplateModel.createProjectTemplate(
        data
      );

      return projectTemplate;
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
          'An unexpected error occurred while creating the projectTemplate. See the inner error for additional details',
          'projectTemplate',
          'createProjectTemplate',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateProjectTemplate(
    projectTemplateId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.IProjectTemplate,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const projectTemplate =
        await mongoDbConnection.models.ProjectTemplateModel.updateProjectTemplateById(id, {
          ...data
        });
      return projectTemplate;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateProjectTemplate',
          { projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteProjectTemplate(
    projectTemplateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const projectTemplate =
        await mongoDbConnection.models.ProjectTemplateModel.updateProjectTemplateById(id, {
          deletedAt: new Date(),
        });
      return projectTemplate;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateProjectTemplate',
          { projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}