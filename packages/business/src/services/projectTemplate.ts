import {
  database as databaseTypes,
  web as webTypes,
  fileIngestion as fileIngestionTypes,
} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
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
        await mongoDbConnection.models.ProjectTemplateModel.getProjectTemplateById(
          id
        );
      return projectTemplate;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the project. See the inner error for additional details',
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
        await mongoDbConnection.models.ProjectTemplateModel.queryProjectTemplates(
          filter
        );
      return projectTemplates?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting projects. See the inner error for additional details',
          'project',
          'getProjects',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createTemplateFromProject(
    projectId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProjectTemplate | null> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const project =
        await mongoDbConnection.models.ProjectModel.getProjectById(id);

      const cleanProjectTemplate = this.cleanProject(project);

      const template =
        await mongoDbConnection.models.ProjectTemplateModel.create({
          ...cleanProjectTemplate,
        });

      return template;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the project template. See the inner error for additional details',
          'projectTemplate',
          'createTemplateFromProject',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async cloneProjectFromTemplate(
    projectTemplateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProjectTemplate | null> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const projectTemplate =
        await mongoDbConnection.models.ProjectTemplateModel.getProjectTemplateById(
          id
        );

      const cleanProjectTemplate = this.cleanProjectTemplate(projectTemplate);

      const template =
        await mongoDbConnection.models.ProjectTemplateModel.create({
          ...cleanProjectTemplate,
        });

      return template;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the project. See the inner error for additional details',
          'projectTemplate',
          'cloneProjectFromTemplate',
          {id: projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deactivate(
    projectTemplateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const project =
        await mongoDbConnection.models.ProjectTemplateModel.updateProjectTemplateById(
          id,
          {
            deletedAt: new Date(),
          }
        );
      return project;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the ProjectTemplate. See the inner error for additional details',
          'projectTemplate',
          'updateProjectTemplate',
          {projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateProjectTemplate(
    projectTemplateId: mongooseTypes.ObjectId | string,
    update: Omit<
      Partial<databaseTypes.IProject>,
      '_id' | 'createdAt' | 'updatedAt'
    >
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const updatedProjectTemplate =
        await mongoDbConnection.models.ProjectTemplateModel.updateProjectTemplateById(
          id,
          update
        );

      return updatedProjectTemplate;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the project template. See the inner error for additional details',
          'projectTemplate',
          'updateProjectTemplate',
          {id: projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addTags(
    projectTemplateId: mongooseTypes.ObjectId | string,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const updatedProjectTemplate =
        await mongoDbConnection.models.ProjectTemplateModel.addTags(id, tags);

      return updatedProjectTemplate;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding tags to the project template. See the inner error for additional details',
          'projectTemplate',
          'addTags',
          {id: projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeTags(
    projectTemplateId: mongooseTypes.ObjectId | string,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : new mongooseTypes.ObjectId(projectTemplateId);
      const updatedProjectTemplate =
        await mongoDbConnection.models.ProjectTemplateModel.removeTags(
          id,
          tags
        );

      return updatedProjectTemplate;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing tags from the project. See the inner error for additional details',
          'projectTemplate',
          'removeTags',
          {id: projectTemplateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  static async cleanProject(
    project: databaseTypes.IProject
  ): Promise<Partial<databaseTypes.IProjectTemplate>> {
    return {
      name: `${project.name}-template`,
      projects: [project],
      tags: project.tags,
      shape: {
        X: {
          key: project?.state?.properties['X']?.key || 'Column X',
          type:
            project?.state?.properties['X']?.dataType ||
            fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          required: true,
          description: '',
        },
        Y: {
          key: project?.state?.properties['Y']?.key || 'Column Y',
          type:
            project?.state?.properties['Y']?.dataType ||
            fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          required: true,
          description: '',
        },
        Z: {
          key: project?.state?.properties['Z']?.key || 'Column Z',
          type:
            project?.state?.properties['Z']?.dataType ||
            fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          required: true,
          description: '',
        },
        A: {
          key: project?.state?.properties['A']?.key || 'Column A',
          type:
            project?.state?.properties['A']?.dataType ||
            fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          required: false,
          description: '',
        },
        B: {
          key: project?.state?.properties['B']?.key || 'Column B',
          type:
            project?.state?.properties['B']?.dataType ||
            fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          required: false,
          description: '',
        },
        C: {
          key: project?.state?.properties['C']?.key || 'Column C',
          type:
            project?.state?.properties['C']?.dataType ||
            fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          required: false,
          description: '',
        },
      },
    };
  }

  static async cleanProjectTemplate(
    projectTemplate: databaseTypes.IProjectTemplate
  ): Promise<Partial<databaseTypes.IProject>> {
    return {
      name: 'New Project',
      template: projectTemplate,
      state: {
        properties: {
          X: {
            axis: webTypes.constants.AXIS.X,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: projectTemplate.shape['X']?.key, // corresponds to column name
            dataType: projectTemplate.shape['X']?.type, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['X']?.type ===
              fileIngestionTypes.constants.FIELD_TYPE.NUMBER
                ? {
                    min: 0,
                    max: 0,
                  }
                : {keywords: []},
          },
          Y: {
            axis: webTypes.constants.AXIS.Y,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: projectTemplate.shape['Y']?.key, // corresponds to column name
            dataType: projectTemplate.shape['Y']?.type, // corresponds to column data typecorresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['Y']?.type ===
              fileIngestionTypes.constants.FIELD_TYPE.NUMBER
                ? {
                    min: 0,
                    max: 0,
                  }
                : {keywords: []},
          },
          Z: {
            axis: webTypes.constants.AXIS.Z,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: projectTemplate.shape['Z']?.key, // corresponds to column name
            dataType: projectTemplate.shape['Z']?.type, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['Z']?.type ===
              fileIngestionTypes.constants.FIELD_TYPE.NUMBER
                ? {
                    min: 0,
                    max: 0,
                  }
                : {keywords: []},
          },
          A: {
            axis: webTypes.constants.AXIS.A,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: projectTemplate.shape['A']?.key, // corresponds to column name
            dataType: projectTemplate.shape['A']?.type, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['A']?.type ===
              fileIngestionTypes.constants.FIELD_TYPE.NUMBER
                ? {
                    min: 0,
                    max: 0,
                  }
                : {keywords: []},
          },
          B: {
            axis: webTypes.constants.AXIS.B,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: projectTemplate.shape['B']?.key, // corresponds to column name
            dataType: projectTemplate.shape['B']?.type, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['B']?.type ===
              fileIngestionTypes.constants.FIELD_TYPE.NUMBER
                ? {
                    min: 0,
                    max: 0,
                  }
                : {keywords: []},
          },
          C: {
            axis: webTypes.constants.AXIS.C,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: projectTemplate.shape['C']?.key, // corresponds to column name
            dataType: projectTemplate.shape['C']?.type, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['C']?.type ===
              fileIngestionTypes.constants.FIELD_TYPE.NUMBER
                ? {
                    min: 0,
                    max: 0,
                  }
                : {keywords: []},
          },
        },
      },
      files: [],
    };
  }
}
