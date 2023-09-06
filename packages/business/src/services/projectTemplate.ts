import {databaseTypes, webTypes, fileIngestionTypes} from 'types';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from '../lib/databaseConnection';

export class ProjectTemplateService {
  public static async getProjectTemplate(
    projectTemplateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProjectTemplate | null> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : // @ts-ignore
            new mongooseTypes.ObjectId(projectTemplateId);
      const projectTemplate = await mongoDbConnection.models.ProjectTemplateModel.getProjectTemplateById(id);
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
      const projectTemplates = await mongoDbConnection.models.ProjectTemplateModel.queryProjectTemplates(filter);
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

  public static async createProjectTemplate(
    projectId: mongooseTypes.ObjectId | string,
    projectName: string,
    projectDesc: string,
    properties: Record<string, webTypes.Property>
  ): Promise<databaseTypes.IProjectTemplate | null> {
    try {
      const template = await mongoDbConnection.models.ProjectTemplateModel.create({
        name: projectName,
        description: projectDesc,
        shape: properties,
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

  public static async deactivate(
    projectTemplateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : // @ts-ignore
            new mongooseTypes.ObjectId(projectTemplateId);
      const project = await mongoDbConnection.models.ProjectTemplateModel.updateProjectTemplateById(id, {
        deletedAt: new Date(),
      });
      return project;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    update: Omit<Partial<databaseTypes.IProject>, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<databaseTypes.IProjectTemplate> {
    try {
      const id =
        projectTemplateId instanceof mongooseTypes.ObjectId
          ? projectTemplateId
          : // @ts-ignore
            new mongooseTypes.ObjectId(projectTemplateId);
      const updatedProjectTemplate = await mongoDbConnection.models.ProjectTemplateModel.updateProjectTemplateById(
        id,
        update
      );

      return updatedProjectTemplate;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
          : // @ts-ignore
            new mongooseTypes.ObjectId(projectTemplateId);
      const updatedProjectTemplate = await mongoDbConnection.models.ProjectTemplateModel.addTags(id, tags);

      return updatedProjectTemplate;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
          : // @ts-ignore
            new mongooseTypes.ObjectId(projectTemplateId);
      const updatedProjectTemplate = await mongoDbConnection.models.ProjectTemplateModel.removeTags(id, tags);

      return updatedProjectTemplate;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
  static async cleanProject(project: databaseTypes.IProject): Promise<Partial<databaseTypes.IProjectTemplate>> {
    return {
      name: `${project.name}-template`,
      projects: [project],
      tags: project.tags,
      shape: {
        X: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: project?.state?.properties['X']?.key || 'Column X',
          dataType: project?.state?.properties['X']?.dataType || fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          description: '',
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter:
            project?.state?.properties['X']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
              ? {
                  min: 0,
                  max: 0,
                }
              : {keywords: []},
        },
        Y: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: project?.state?.properties['Y']?.key || 'Column Y',
          dataType: project?.state?.properties['Y']?.dataType || fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          description: '',
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter:
            project?.state?.properties['X']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
              ? {
                  min: 0,
                  max: 0,
                }
              : {keywords: []},
        },
        Z: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: project?.state?.properties['Z']?.key || 'Column Z',
          dataType: project?.state?.properties['Z']?.dataType || fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          description: '',
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter:
            project?.state?.properties['X']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
              ? {
                  min: 0,
                  max: 0,
                }
              : {keywords: []},
        },
        A: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: project?.state?.properties['A']?.key || 'Column A',
          dataType: project?.state?.properties['A']?.dataType || fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          description: '',
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter:
            project?.state?.properties['X']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
              ? {
                  min: 0,
                  max: 0,
                }
              : {keywords: []},
        },
        B: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: project?.state?.properties['B']?.key || 'Column B',
          dataType: project?.state?.properties['B']?.dataType || fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          description: '',
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter:
            project?.state?.properties['X']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
              ? {
                  min: 0,
                  max: 0,
                }
              : {keywords: []},
        },
        C: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: project?.state?.properties['C']?.key || 'Column C',
          dataType: project?.state?.properties['C']?.dataType || fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          description: '',
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter:
            project?.state?.properties['X']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
              ? {
                  min: 0,
                  max: 0,
                }
              : {keywords: []},
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
            dataType: projectTemplate.shape['X']?.dataType, // corresponds to column data dataType
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['X']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
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
            dataType: projectTemplate.shape['Y']?.dataType, // corresponds to column data typecorresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['Y']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
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
            dataType: projectTemplate.shape['Z']?.dataType, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['Z']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
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
            dataType: projectTemplate.shape['A']?.dataType, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['A']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
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
            dataType: projectTemplate.shape['B']?.dataType, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['B']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
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
            dataType: projectTemplate.shape['C']?.dataType, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter:
              projectTemplate.shape['C']?.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
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
