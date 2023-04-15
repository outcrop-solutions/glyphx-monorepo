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
      let newSlug = slug;
      const count = await WorkspaceService.countWorkspaces(slug);
      if (count > 0) {
        newSlug = `${slug}-${count}`;
      }

      const castCreatorId =
        typeof creatorId === 'string'
          ? new mongooseTypes.ObjectId(creatorId)
          : creatorId;

      const input = {
        workspaceCode: v4().replaceAll('-', ''),
        inviteCode: v4().replaceAll('-', ''),
        creator: castCreatorId,
        name,
        slug: newSlug,
      } as unknown as Omit<databaseTypes.IWorkspace, '_id'>;

      const workspace =
        await mongoDbConnection.models.WorkspaceModel.createWorkspace(input);

      const member = await mongoDbConnection.models.MemberModel.createMember({
        inviter: email,
        email: email,
        joinedAt: new Date(),
        status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        member: {_id: castCreatorId} as unknown as databaseTypes.IUser,
        invitedBy: {_id: castCreatorId} as unknown as databaseTypes.IUser,
        workspace: {_id: workspace._id} as unknown as databaseTypes.IWorkspace,
      } as unknown as databaseTypes.IMember);

      const newWorkspace =
        await mongoDbConnection.models.WorkspaceModel.addMembers(
          workspace?._id as unknown as mongooseTypes.ObjectId,
          [member]
        );

      await mongoDbConnection.models.UserModel.addMembership(castCreatorId, [
        member,
      ]);
      await mongoDbConnection.models.UserModel.addWorkspaces(castCreatorId, [
        newWorkspace,
      ]);

      // TODO: add workspace to user model

      await EmailClient.sendMail({
        html: workspaceCreateHtml({code: workspace.inviteCode, name}),
        subject: `[Glyphx] Workspace created: ${name}`,
        text: workspaceCreateText({code: workspace.inviteCode, name}),
        to: email,
      });

      return newWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.UnexpectedError ||
        err instanceof error.DataValidationError
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
      // TODO: remove workspace from "createdWorkspaces" on user
      // TODO: update deletedAt on all members associated with workspace
      // TODO: update deletedAt on all projects in workspace
      // TODO: update deletedAt on all states associated with projects

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
        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceByFilter(
          {slug: },
          {
            deletedAt: new Date(),
          }
        );
        return slug;
      } else {
        throw new error.DataNotFoundError(
          'Unable to find workspace',
          'workspace',
          {userId, email}
        );
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
          'An unexpected error occurred while updating the workspace. See the inner error for additional details',
          'workspace',
          'updateWorkspace',
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
      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: undefined,
          slug,
        });

      const filteredWorkspaces = workspaces.results.filter(
        space =>
          space.members.filter(
            mem =>
              mem.email === email &&
              mem.teamRole === databaseTypes.constants.ROLE.OWNER &&
              mem.deletedAt === undefined
          ).length > 0
      );
      if (filteredWorkspaces.length > 0) {
        return filteredWorkspaces[0];
      } else {
        throw new error.DataNotFoundError(
          'Unable to find workspace',
          'workspace',
          {userId, email, slug}
        );
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
          deletedAt: undefined,
        });
      return workspace.results[0];
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      ) {
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
          deletedAt: undefined,
        });
      return workspace.results[0];
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
      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: undefined,
          slug,
        });
      const filteredWorkspaces = workspaces.results.filter(
        space =>
          space.members.filter(
            mem => mem.email === email && mem.deletedAt === undefined
          ).length > 0
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
      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
          deletedAt: undefined,
        });
      const filteredWorkspaces = workspaces.results.filter(
        space =>
          space.members.filter(
            mem =>
              mem.email === email &&
              mem.deletedAt === undefined &&
              mem.status === databaseTypes.constants.INVITATION_STATUS.ACCEPTED
          ).length > 0
      );
      if (filteredWorkspaces.length > 0) {
        return filteredWorkspaces;
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
          deletedAt: undefined,
        })) as IQueryResult<databaseTypes.IWorkspace>;

      return [
        ...workspaces.results.map(workspace => ({
          params: {site: workspace.slug},
        })),
      ];
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
    members: {
      email: string;
      teamRole: databaseTypes.constants.ROLE;
    }[],
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
            invitedAt: new Date(),
            status: databaseTypes.constants.INVITATION_STATUS.PENDING,
            teamRole,
            invitedBy: invitedBy._id,
            workspace: workspace._id,
          })
        );

        const createdMembers =
          await mongoDbConnection.models.MemberModel.create(membersList);

        const memberIds = createdMembers.map(mem => {
          return mem._id;
        });
        await Promise.all([
          mongoDbConnection.models.WorkspaceModel.addMembers(
            workspace._id as mongooseTypes.ObjectId,
            memberIds as unknown as mongooseTypes.ObjectId[]
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
        return createdMembers;
      } else {
        const errMsg = 'No workspace found';
        const e = new error.DataNotFoundError(errMsg, 'getOwnWorkspace', {
          userId,
          email,
          slug,
        });
        throw e;
      }
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
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
          deletedAt: undefined,
          workspaceCode,
        });

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
        member = await mongoDbConnection.models.MemberModel.createMember(input);
      } else {
        // update member
        member =
          await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
            {email},
            input
          );
      }

      await mongoDbConnection.models.WorkspaceModel.addMembers(
        workspaces.results![0]._id as unknown as mongooseTypes.ObjectId,
        [member]
      );

      return new Date();
    } catch (err: any) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
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
  ): Promise<string | null> {
    try {
      const workspace = await WorkspaceService.getOwnWorkspace(
        userId,
        email,
        slug
      );

      if (workspace) {
        const newWorkspace =
          await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(
            workspace._id as unknown as mongooseTypes.ObjectId,
            {
              name,
            }
          );
        return newWorkspace.name;
      } else {
        throw new error.DataNotFoundError(
          'Unable to find workspace',
          'workspace',
          {userId, email, slug}
        );
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
          'updateWorkspaces',
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
      const workspace = await WorkspaceService.getOwnWorkspace(
        userId,
        email,
        pathSlug
      );

      if (workspace) {
        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(
          workspace._id as unknown as mongooseTypes.ObjectId,
          {
            slug: newSlug.toLowerCase(),
          }
        );
        return newSlug.toLowerCase();
      } else {
        throw new error.DataNotFoundError(
          'Unable to find workspace',
          'workspace',
          {userId, email, slug: newSlug.toLowerCase()}
        );
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
