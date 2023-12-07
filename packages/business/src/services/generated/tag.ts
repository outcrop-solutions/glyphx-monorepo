// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';
import {ITagCreateInput} from 'database/src/mongoose/interfaces';

export class TagService {
  public static async getTag(tagId: string): Promise<databaseTypes.ITag | null> {
    try {
      const tag = await mongoDbConnection.models.TagModel.getTagById(tagId);
      return tag;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the tag. See the inner error for additional details',
          'tag',
          'getTag',
          {id: tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getTags(filter?: Record<string, unknown>): Promise<databaseTypes.ITag[] | null> {
    try {
      const tags = await mongoDbConnection.models.TagModel.queryTags(filter);
      return tags?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting tags. See the inner error for additional details',
          'tags',
          'getTags',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createTag(data: Partial<databaseTypes.ITag>): Promise<databaseTypes.ITag> {
    try {
      // create tag
      const tag = await mongoDbConnection.models.TagModel.createTag(data as ITagCreateInput);

      return tag;
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
          'An unexpected error occurred while creating the tag. See the inner error for additional details',
          'tag',
          'createTag',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateTag(
    tagId: string,
    data: Partial<Omit<databaseTypes.ITag, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.ITag> {
    try {
      const tag = await mongoDbConnection.models.TagModel.updateTagById(tagId, {
        ...data,
      });
      return tag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateTag',
          {tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteTag(tagId: string): Promise<databaseTypes.ITag> {
    try {
      const tag = await mongoDbConnection.models.TagModel.updateTagById(tagId, {
        deletedAt: new Date(),
      });
      return tag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateTag',
          {tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWorkspaces(
    tagId: string,
    workspaces: (databaseTypes.IWorkspace | string)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const updatedTag = await mongoDbConnection.models.TagModel.addWorkspaces(tagId, workspaces);

      return updatedTag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding workspaces to the tag. See the inner error for additional details',
          'tag',
          'addWorkspaces',
          {id: tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeWorkspaces(
    tagId: string,
    workspaces: (databaseTypes.IWorkspace | string)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const updatedTag = await mongoDbConnection.models.TagModel.removeWorkspaces(tagId, workspaces);

      return updatedTag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  workspaces from the tag. See the inner error for additional details',
          'tag',
          'removeWorkspaces',
          {id: tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addTemplates(
    tagId: string,
    projectTemplates: (databaseTypes.IProjectTemplate | string)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const updatedTag = await mongoDbConnection.models.TagModel.addTemplates(tagId, projectTemplates);

      return updatedTag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding projectTemplates to the tag. See the inner error for additional details',
          'tag',
          'addTemplates',
          {id: tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeTemplates(
    tagId: string,
    projectTemplates: (databaseTypes.IProjectTemplate | string)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const updatedTag = await mongoDbConnection.models.TagModel.removeTemplates(tagId, projectTemplates);

      return updatedTag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  projectTemplates from the tag. See the inner error for additional details',
          'tag',
          'removeTemplates',
          {id: tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProjects(
    tagId: string,
    projects: (databaseTypes.IProject | string)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const updatedTag = await mongoDbConnection.models.TagModel.addProjects(tagId, projects);

      return updatedTag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding projects to the tag. See the inner error for additional details',
          'tag',
          'addProjects',
          {id: tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeProjects(
    tagId: string,
    projects: (databaseTypes.IProject | string)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const updatedTag = await mongoDbConnection.models.TagModel.removeProjects(tagId, projects);

      return updatedTag;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  projects from the tag. See the inner error for additional details',
          'tag',
          'removeProjects',
          {id: tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
