import slugify from 'slugify';
import {
  EmailClient,
  workspaceCreateHtml,
  workspaceCreateText,
  inviteHtml,
  inviteText,
} from '@glyphx/email';
import {
  IWorkspacePath,
  database,
  database as databaseTypes,
  IQueryResult,
} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';

export class WorkspaceService {
  public static async countWorkspaces(slug: string): Promise<number> {
    try {
      const count = await mongoDbConnection.models.WorkspaceModel.count({slug});
      return count;
    } catch (err) {
      const e = new error.DataServiceError(
        'An unexpected error occurred while counting the workspace. See the inner error for additional details',
        'workspace',
        'countWorkspaces',
        {slug},
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }

  public static async createWorkspace(
    creatorId: mongooseTypes.ObjectId | string,
    email: string,
    name: string,
    slug: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const count = await WorkspaceService.countWorkspaces(slug);
      if (count > 0) {
        slug = `${slug}-${count}`;
      }
      // TODO: add member record to workspace
      // @jp: do we have a clean way to create related records in one operation - in this case a member record for the workspace
      const input = {
        workspaceCode: v4().replaceAll('-', ''),
        inviteCode: v4().replaceAll('-', ''),
        creatorId,
        name,
        slug,
      } as unknown as Omit<databaseTypes.IWorkspace, '_id'>;
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.createWorkspace(input);

      await EmailClient.sendMail({
        html: workspaceCreateHtml({code: workspace.inviteCode, name}),
        subject: `[Glyphx] Workspace created: ${name}`,
        text: workspaceCreateText({code: workspace.inviteCode, name}),
        to: email,
      });

      return workspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the workspace. See the inner error for additional details',
          'workspace',
          'createWorkspace',
          {creatorId, name, slug},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteWorkspace(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    slug: string
  ): Promise<string | null> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const workspace = await WorkspaceService.getOwnWorkspace(
        userId,
        email,
        slug
      );

      if (workspace) {
        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(id, {
          deletedAt: new Date(),
        });
        return slug;
      } else {
        return null;
      }
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the member. See the inner error for additional details',
          'member',
          'updateMember',
          {userId, email, slug},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  /**
   *
   * This is used as a utility function in order to get the default workspace for a user
   * @param userId
   * @param email
   * @param slug
   * @returns Promise<databaseTypes.IWorkspace | null>
   */

  static async getOwnWorkspace(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    slug: string
  ): Promise<databaseTypes.IWorkspace | null> {
    // TODO: add filter to get workspaces where user is a member
    // @jp: we need a clean way to implement filter on related records here
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: null,
          slug,
        });

      const filteredWorkspaces = workspaces.results.filter(
        space =>
          space.members.filter(
            mem =>
              mem.email === email &&
              mem.teamRole === databaseTypes.constants.ROLE.OWNER &&
              mem.deletedAt === null
          ).length > 0
      );
      if (filteredWorkspaces.length > 0) {
        return filteredWorkspaces[0];
      } else return null;
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the Workspace. See the inner error for additional details',
          'workspace',
          'getWorkspace',
          {email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getInvitation(
    inviteCode: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          inviteCode,
          deletedAt: null,
        });
      return workspace.results[0];
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying workspaces. See the inner error for additional details',
          'member',
          'queryWorkspaces',
          {inviteCode},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getSiteWorkspace(
    slug: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          slug,
          deletedAt: null,
        });
      return workspace.results[0];
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspace',
          {slug},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  /**
   *
   * This is used as a utility function in order to get a specific workspace for a user
   * @param userId
   * @param email // user's email
   * @param slug //workspace slug
   * @returns Promise<databaseTypes.IWorkspace | null>
   */

  static async getWorkspace(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    slug: string
  ): Promise<databaseTypes.IWorkspace | null> {
    // TODO: add filter to get workspaces where user is a member
    // @jp: we need a clean way to implement filter on related records here
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: null,
          slug,
        });

      const filteredWorkspaces = workspaces.results.filter(space =>
        space.members.filter(
          mem =>
            mem._id === id || (mem.email === email && mem.deletedAt === null)
        )
      );
      if (filteredWorkspaces.length > 0) {
        return filteredWorkspaces[0];
      } else {
        const errMsg = 'No workspaces contain the user as a member';
        const e = new error.DataNotFoundError(errMsg, 'getWorkspaces', {email});
        throw e;
      }
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspace',
          {email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  /**
   *
   * This is used as a utility function in order to get the list of workspaces of which the user has accepted membership
   * @param userId
   * @param email //user's email
   * @returns Promise<databaseTypes.IWorkspace | null>
   */
  static async getWorkspaces(
    userId: mongooseTypes.ObjectId | string,
    email: string
  ): Promise<databaseTypes.IWorkspace[] | null> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: null,
        });

      if (Array.isArray(workspaces.results) && workspaces.numberOfItems > 0) {
        const filteredWorkspaces = workspaces.results.filter(space =>
          space.members.filter(
            mem =>
              mem._id === id ||
              (mem.email === email &&
                mem.deletedAt === null &&
                mem.status ===
                  databaseTypes.constants.INVITATION_STATUS.ACCEPTED)
          )
        );
        return filteredWorkspaces;
      } else {
        return null;
      }
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspaces',
          {userId, email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  /**
   * This is a utility function used to statically generate url paths for SSR with next.js
   * @returns Promise<IWorkspacePath[] | null>
   */
  static async getWorkspacePaths(): Promise<IWorkspacePath[] | null> {
    try {
      const workspaces =
        (await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: null,
        })) as IQueryResult<databaseTypes.IWorkspace>;

      return [
        ...workspaces.results.map(workspace => ({
          params: {site: workspace.slug},
        })),
      ];
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspaces',
          {},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  /**
   *
   * This is used to invite users (new members) to a workspace
   * @param userId
   * @param email
   * @param members
   * @param slug
   * @returns Promise<databaseTypes.IWorkspace | null>
   */
  static async inviteUsers(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    members: databaseTypes.IMember[],
    slug: string
  ): Promise<Partial<databaseTypes.IMember>[] | null> {
    try {
      const workspace = await WorkspaceService.getOwnWorkspace(
        userId,
        email,
        slug
      );
      const inviter = email;

      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const invitedBy = await mongoDbConnection.models.UserModel.getUserById(
        id
      );

      if (workspace) {
        const membersList = members.map(
          ({
            email,
            teamRole,
          }: {
            email: string;
            teamRole: databaseTypes.constants.ROLE;
          }) => ({
            email,
            inviter,
            teamRole,
            invitedBy,
            workspace: workspace,
            status: databaseTypes.constants.INVITATION_STATUS.PENDING,
            invitedAt: new Date(),
          })
        );

        const createdMembers = mongoDbConnection.models.MemberModel.create({
          membersList,
        }) as unknown as databaseTypes.IMember[];

        const memberIds = createdMembers.map(mem => {
          const id =
            mem._id instanceof mongooseTypes.ObjectId
              ? mem._id
              : new mongooseTypes.ObjectId(mem._id);
          return id;
        });

        await Promise.all([
          mongoDbConnection.models.WorkspaceModel.addMembers(
            workspace._id as mongooseTypes.ObjectId,
            memberIds
          ),
          EmailClient.sendMail({
            html: inviteHtml({
              code: workspace.inviteCode,
              name: workspace.name,
            }),
            subject: `[Glyphx] You have been invited to join ${workspace.name} workspace`,
            text: inviteText({
              code: workspace.inviteCode,
              name: workspace.name,
            }),
            to: members.map(member => member.email),
          }),
        ]);
        return membersList;
      } else {
        throw new Error('Unable to find workspace');
      }
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspaces',
          {userId, email, members, slug},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  static async isWorkspaceCreator(
    id: mongooseTypes.ObjectId | string,
    creatorId: mongooseTypes.ObjectId | string
  ): Promise<boolean> {
    return id === creatorId;
  }

  static async isWorkspaceOwner(
    email: string,
    workspace: databaseTypes.IWorkspace
  ): Promise<boolean> {
    let isTeamOwner = false;
    const member = workspace.members.find(
      member =>
        member.email === email &&
        member.teamRole === database.constants.ROLE.OWNER
    );

    if (member) {
      isTeamOwner = true;
    }

    return isTeamOwner;
  }

  static async joinWorkspace(
    workspaceCode: string,
    email: string
  ): Promise<Date | null> {
    try {
      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: null,
          workspaceCode,
        });

      if (Array.isArray(workspaces.results) && workspaces.numberOfItems > 0) {
        const memberEmailExists =
          await mongoDbConnection.models.MemberModel.memberEmailExists(email);

        const input = {
          workspace: workspaces.results[0],
          inviter: workspaces.results[0].creator.email,
          invitedAt: new Date(),
          joinedAt: new Date(),
          email,
          status: database.constants.INVITATION_STATUS.ACCEPTED,
        } as Omit<databaseTypes.IMember, '_id'>;

        let member;
        if (memberEmailExists) {
          // create member
          member = await mongoDbConnection.models.MemberModel.createMember(
            input
          );
        } else {
          // update member
          member =
            await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
              {email},
              input
            );
        }

        return new Date();
      } else {
        throw new Error('Unable to find workspace');
      }
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspaces',
          {workspaceCode, email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  static async updateWorkspaceName(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    name: string,
    slug: string
  ) {
    try {
      const workspace = await WorkspaceService.getOwnWorkspace(
        userId,
        email,
        slug
      );

      if (workspace) {
        const id =
          workspace._id instanceof mongooseTypes.ObjectId
            ? workspace._id
            : new mongooseTypes.ObjectId(workspace._id);

        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(id, {
          name,
        });
        return name;
      } else {
        throw new Error('Unable to find workspace');
      }
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspaces',
          {userId, email, name, slug},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  static async updateWorkspaceSlug(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    newSlug: string,
    pathSlug: string
  ) {
    try {
      let slug = slugify(newSlug.toLowerCase());
      const count = await WorkspaceService.countWorkspaces(slug);

      if (count > 0) {
        slug = `${slug}-${count}`;
      }

      const workspace = await WorkspaceService.getOwnWorkspace(
        userId,
        email,
        pathSlug
      );

      if (workspace) {
        const id =
          workspace._id instanceof mongooseTypes.ObjectId
            ? workspace._id
            : new mongooseTypes.ObjectId(workspace._id);

        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(id, {
          slug,
        });
        return slug;
      } else {
        throw new Error('Unable to find workspace');
      }
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspaces',
          {userId, email, newSlug, pathSlug},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
