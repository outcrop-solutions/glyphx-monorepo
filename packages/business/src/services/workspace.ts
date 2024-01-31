import emailClient from 'email';
import {databaseTypes, emailTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';

import {v4} from 'uuid';
import {DBFormatter} from 'database/src/lib/format';

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
    creatorId: string,
    email: string,
    name: string,
    slug: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const input = {
        workspaceCode: v4().replaceAll('-', ''),
        inviteCode: v4().replaceAll('-', ''),
        creator: creatorId,
        name,
        slug: slug,
      } as unknown as Omit<databaseTypes.IWorkspace, '_id'>;

      const workspace = await mongoDbConnection.models.WorkspaceModel.createWorkspace(input);
      const member = await mongoDbConnection.models.MemberModel.createWorkspaceMember({
        inviter: email,
        email: email,
        joinedAt: new Date(),
        type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
        status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        member: creatorId,
        invitedBy: creatorId,
        workspace: workspace.id!,
      });

      const newWorkspace = await mongoDbConnection.models.WorkspaceModel.addMembers(workspace.id!, [member]);

      await mongoDbConnection.models.UserModel.addMembership(creatorId, [member]);
      await mongoDbConnection.models.UserModel.addWorkspaces(creatorId, [newWorkspace]);

      const emailData = {
        type: emailTypes.EmailTypes.WORKSPACE_CREATED,
        workspaceName: newWorkspace.name,
        workspaceId: newWorkspace.id as string,
        email: email,
        workspaceCode: newWorkspace.inviteCode,
      } satisfies emailTypes.EmailData;
      await emailClient.sendEmail(emailData);

      return newWorkspace;
    } catch (err: any) {
      if (err instanceof error.UnexpectedError || err instanceof error.DataValidationError) {
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
    userId: string,
    email: string,
    id: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspace = await WorkspaceService.getSiteWorkspace(id);

      if (workspace) {
        // delete workspace
        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceByFilter(
          {slug: workspace.slug},
          {
            deletedAt: new Date(),
          }
        );

        // remove workspace and membership from user
        await mongoDbConnection.models.UserModel.removeWorkspaces(userId, [workspace.id!]);
        const userMember = workspace.members.filter((mem: any) => mem.member.toString() === userId);

        if (userMember?.length > 0) {
          await mongoDbConnection.models.UserModel.removeMembership(userId, [...userMember]);
        }

        if (workspace?.members?.length > 0) {
          // delete all associated members
          await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
            {workspace: workspace.id},
            {deletedAt: new Date()}
          );
        }

        if (workspace?.projects?.length > 0) {
          // delete all projects associated with workspace
          await mongoDbConnection.models.ProjectModel.updateProjectWithFilter(
            {workspace: workspace.id},
            {deletedAt: new Date()}
          );
        }

        return workspace;
      } else {
        throw new error.DataNotFoundError('Unable to find workspace', 'workspace', {userId, email});
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
          {userId, email, id},
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

  static async getOwnWorkspace(userId: string, email: string, slug: string): Promise<databaseTypes.IWorkspace | null> {
    // @jp: we need a clean way to implement filter on related records here
    try {
      const workspaces = await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
        deletedAt: undefined,
        slug,
      });

      const filteredWorkspaces = workspaces.results.filter(
        (space) =>
          space.members.filter(
            (mem) =>
              mem.email === email && mem.teamRole === databaseTypes.constants.ROLE.OWNER && mem.deletedAt === undefined
          ).length > 0
      );
      if (filteredWorkspaces.length > 0) {
        return filteredWorkspaces[0];
      } else {
        throw new error.DataNotFoundError('Unable to find workspace', 'workspace', {userId, email, slug});
      }
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) {
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

  public static async getInvitation(inviteCode: string): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspace = await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
        inviteCode,
        deletedAt: undefined,
      });
      return workspace.results[0];
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) {
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

  public static async getSiteWorkspace(id: string): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspace = await mongoDbConnection.models.WorkspaceModel.getWorkspaceById(id);

      return workspace;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying Workspaces. See the inner error for additional details',
          'workspace',
          'queryWorkspaces',
          {id},
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

  static async getWorkspace(email: string, id: string): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspaces = await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
        deletedAt: undefined,
        _id: id,
      });
      const filteredWorkspaces = workspaces.results.filter(
        (space) => space.members.filter((mem) => mem.email === email && mem.deletedAt === undefined).length > 0
      );
      if (filteredWorkspaces.length > 0) {
        return filteredWorkspaces[0];
      } else {
        const errMsg = 'No workspaces contain the user as a member';
        const e = new error.DataNotFoundError(errMsg, 'getWorkspaces', {email});
        throw e;
      }
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) {
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
  static async getWorkspaces(userId: string, email: string): Promise<databaseTypes.IWorkspace[] | null> {
    try {
      const workspaces = await mongoDbConnection.models.WorkspaceModel.aggregate(
        [
          {
            $match: {
              $or: [
                {
                  deletedAt: {
                    $exists: false,
                  },
                },
                {
                  deletedAt: null,
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'members',
              localField: 'members',
              foreignField: '_id',
              as: 'members',
            },
          },
          {
            $match: {
              $and: [
                {
                  'members.email': email,
                },
                {
                  $or: [
                    {
                      'members.deletedAt': {
                        $exists: false,
                      },
                    },
                    {
                      'members.deletedAt': null,
                    },
                  ],
                },
                {
                  'members.status': 'ACCEPTED',
                },
              ],
            },
          },
        ],
        {
          allowDiskUse: false,
        }
      );
      if (workspaces.length > 0) {
        const format = new DBFormatter();
        return format.toJS(workspaces);
      } else {
        const errMsg = 'No workspaces contain the user as a member';
        const e = new error.DataNotFoundError(errMsg, 'getWorkspaces', {email});
        throw e;
      }
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) {
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
   *
   * This is used to invite users (new members) to a workspace
   * @param userId
   * @param email
   * @param members
   * @param slug
   * @returns Promise<databaseTypes.IWorkspace | null>
   */
  static async inviteUsers(
    userId: string,
    email: string,
    members: {
      email: string;
      teamRole: databaseTypes.constants.ROLE;
    }[],
    workspaceId: string
  ): Promise<{
    members: Partial<databaseTypes.IMember>[] | null;
    workspace: databaseTypes.IWorkspace | null;
  } | null> {
    try {
      const workspace = await WorkspaceService.getWorkspace(email, workspaceId);
      const inviter = email;

      const invitedBy = await mongoDbConnection.models.UserModel.getUserById(userId);

      if (workspace) {
        const membersList = members.map(
          ({email, teamRole}: {email: string; teamRole: databaseTypes.constants.ROLE}) => ({
            email,
            inviter,
            type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
            invitedAt: new Date(),
            status: databaseTypes.constants.INVITATION_STATUS.PENDING,
            teamRole,
            invitedBy: invitedBy.id,
            workspace: workspace.id,
          })
        );

        const createdMembers = await mongoDbConnection.models.MemberModel.create(membersList);
        const memberIds = createdMembers.map((mem) => {
          return mem._id.toString(); // FIXME: This should be added to the db layer as createMany()
        });

        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_INVITATION,
          workspaceName: workspace.name,
          emails: members.map((member) => member.email),
          workspaceId: workspace.id!,
          inviteCode: workspace.inviteCode!,
        } satisfies emailTypes.EmailData;

        await Promise.all([
          mongoDbConnection.models.WorkspaceModel.addMembers(workspace.id!, [...memberIds]),
          emailClient.sendEmail(emailData),
        ]);

        return {members: createdMembers, workspace: workspace};
      } else {
        const errMsg = 'No workspace found';
        const e = new error.DataNotFoundError(errMsg, 'getOwnWorkspace', {
          userId,
          email,
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
          {userId, email, members},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  static async isWorkspaceOwner(email: string, workspace: databaseTypes.IWorkspace): Promise<boolean> {
    let isTeamOwner = false;
    const member = workspace.members.find(
      (member) => member.email === email && member.teamRole === databaseTypes.constants.ROLE.OWNER
    );

    if (member) {
      isTeamOwner = true;
    }

    return isTeamOwner;
  }

  static async joinWorkspace(
    inviteCode: string,
    email: string,
    memberId: string,
    invitedBy: string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const workspaces = await mongoDbConnection.models.WorkspaceModel.queryWorkspaces({
        deletedAt: undefined,
        inviteCode: inviteCode,
      });

      let memberExists;
      let member;
      if (workspaces && workspaces.results) {
        // does the member email / workspace combo exist?
        memberExists = await mongoDbConnection.models.MemberModel.memberExists(
          email,
          databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
          workspaces.results[0].id!
        );

        const input = {
          workspace: workspaces.results[0],
          inviter: workspaces.results[0].creator.email,
          type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
          member: memberId,
          invitedAt: new Date(),
          joinedAt: new Date(),
          email,
          status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
        };

        if (!memberExists) {
          // create member
          const createInput = {...input, invitedBy: invitedBy};
          member = await mongoDbConnection.models.MemberModel.createWorkspaceMember(createInput);
        } else {
          // update member
          member = await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
            {email},
            input as unknown as Omit<Partial<databaseTypes.IMember>, '_id'>
          );
        }

        const workspace = await mongoDbConnection.models.WorkspaceModel.addMembers(workspaces.results[0].id!, [member]);

        return workspace;
      } else {
        return null;
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
          {inviteCode, email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  static async updateWorkspaceName(
    userId: string,
    email: string,
    name: string,
    workspaceId: string
  ): Promise<string | null> {
    try {
      const newWorkspace = await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(workspaceId, {
        name,
      });
      return newWorkspace.name;
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
          {userId, email, name, workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  static async updateWorkspaceSlug(workspaceId: string, newSlug: string) {
    try {
      const workspace = await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(workspaceId, {
        slug: newSlug.toLowerCase(),
      });
      return workspace;
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
          {newSlug},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addTags(
    workspaceId: string,
    tags: (databaseTypes.ITag | string)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const updatedWorkspace = await mongoDbConnection.models.WorkspaceModel.addTags(workspaceId, tags);
      return updatedWorkspace;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding tags to the workspace. See the inner error for additional details',
          'workspace',
          'addTags',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
