// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from '@glyphx/core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class TagService {
  public static async getTag(
    tagId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ITag | null> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const tag = await mongoDbConnection.models.TagModel.getTagById(id);
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

  public static async getTags(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.ITag[] | null> {
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

  public static async createTag(
    data: Partial<databaseTypes.ITag>
  ): Promise<databaseTypes.ITag> {
    try {
      // create tag
      const tag = await mongoDbConnection.models.TagModel.createTag(data);

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
    tagId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<databaseTypes.ITag, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const tag = await mongoDbConnection.models.TagModel.updateTagById(id, {
        ...data,
      });
      return tag;
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
          'updateTag',
          {tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteTag(
    tagId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const tag = await mongoDbConnection.models.TagModel.updateTagById(id, {
        deletedAt: new Date(),
      });
      return tag;
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
    tagId: mongooseTypes.ObjectId | string,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const updatedTag = await mongoDbConnection.models.TagModel.addWorkspaces(
        id,
        workspaces
      );

      return updatedTag;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    tagId: mongooseTypes.ObjectId | string,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const updatedTag =
        await mongoDbConnection.models.WorkspacesModel.removeWorkspaces(
          id,
          workspaces
        );

      return updatedTag;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    tagId: mongooseTypes.ObjectId | string,
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const updatedTag = await mongoDbConnection.models.TagModel.addTemplates(
        id,
        projectTemplates
      );

      return updatedTag;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    tagId: mongooseTypes.ObjectId | string,
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const updatedTag =
        await mongoDbConnection.models.TemplatesModel.removeTemplates(
          id,
          projectTemplates
        );

      return updatedTag;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    tagId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const updatedTag = await mongoDbConnection.models.TagModel.addProjects(
        id,
        projects
      );

      return updatedTag;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    tagId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const updatedTag =
        await mongoDbConnection.models.ProjectsModel.removeProjects(
          id,
          projects
        );

      return updatedTag;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
