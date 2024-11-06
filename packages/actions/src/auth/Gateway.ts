import {userService} from 'business';
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import {Session} from 'next-auth';

/**
 * Checks user sessions at the door within server actions to enforce authorization policies
 */
class Gateway {
  static projectRoles = databaseTypes.constants.PROJECT_ROLE;
  static workspaceRoles = databaseTypes.constants.ROLE;
  /**
   * Checks session validity
   * @param session
   */
  static async checkSession(session: Session | null): Promise<{user?: databaseTypes.IUser; error?: string}> {
    //   check session exists
    if (!session) {
      // only for logging purposes
      const e = new error.ActionError('No session available', 'session', session);
      e.publish('project', constants.ERROR_SEVERITY.ERROR);
      return {error: e.message};
    }
    // check user exists
    const user = await userService.getUser(session.user.id);
    if (!user) {
      // only for logging purposes
      const e = new error.ActionError('User not found', 'user', user);
      e.publish('project', constants.ERROR_SEVERITY.ERROR);
      return {error: e.message};
    }
    // return user
    return {user};
  }

  /**
   * Checks whether a user is authorized to execute a project action
   * @param session
   * @param projectId
   */
  static async checkProjectAuth(
    session: Session | null,
    projectId: string,
    excludeReadOnly?: boolean
  ): Promise<boolean> {
    const {user, error} = await this.checkSession(session);
    if (error) {
      return false;
    }
    const projectRoles = this.projectRoleMap(user as databaseTypes.IUser);

    if (excludeReadOnly) {
      const role = projectRoles[projectId];
      if (role === 'readOnly') {
        return false;
      } else {
        return !!projectRoles[projectId];
      }
    }

    return !!projectRoles[projectId];
  }
  /**
   * Build project role map
   * @param user
   * @returns
   */
  static projectRoleMap(user: databaseTypes.IUser): Record<string, 'readOnly' | 'editable' | 'owner'> {
    // get valid memberships
    const pms = user?.membership?.filter(
      (m: databaseTypes.IMember) =>
        m.type === databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT &&
        m.status === databaseTypes.constants.INVITATION_STATUS.ACCEPTED &&
        !m.deletedAt
    );

    // build project role map
    return pms?.reduce(
      (roles, membership) => {
        const projectId = membership.project as unknown as string;
        if (projectId) {
          let role = roles[projectId];
          // Assign the highest role privilege
          if (membership.projectRole === this.projectRoles.OWNER) role = 'owner';
          else if (membership.projectRole === this.projectRoles.CAN_EDIT && role !== 'owner') role = 'editable';
          else if (membership.projectRole === this.projectRoles.READ_ONLY && !role) role = 'readOnly';
          roles[projectId] = role;
        }
        return roles;
      },
      {} as Record<string, 'readOnly' | 'editable' | 'owner'>
    );
  }

  /**
   * Checks whether a user is authorized to execute a workspace action
   * @param session
   * @param workspaceId
   */
  static async checkWorkspaceAuth(
    session: Session | null,
    workspaceId: string,
    excludeMembers?: boolean
  ): Promise<boolean> {
    const {user, error} = await this.checkSession(session);
    if (error) {
      return false;
    }
    const teamRoles = this.workspaceRoleMap(user as databaseTypes.IUser);

    if (excludeMembers) {
      const role = teamRoles[workspaceId];
      if (role === 'member') {
        return false;
      } else {
        return !!teamRoles[workspaceId];
      }
    }
    return !!teamRoles[workspaceId];
  }

  /**
   * Build workspace role map
   * @param memberships
   */
  static workspaceRoleMap(user: databaseTypes.IUser): Record<string, 'member' | 'owner'> {
    // get valid memberships
    const memberships = user?.membership?.filter(
      (m) =>
        m.type === databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE &&
        m.status === databaseTypes.constants.INVITATION_STATUS.ACCEPTED &&
        !m.deletedAt
    );
    // reduce them to an object we can strip roles off of
    return memberships?.reduce(
      (roles, membership) => {
        const workspaceId = membership.workspace as unknown as string;
        if (workspaceId) {
          let role = roles[workspaceId];
          // Assign the highest role privilege
          if (membership.teamRole === this.workspaceRoles.OWNER) role = 'owner';
          else if (membership.teamRole === this.workspaceRoles.MEMBER && role !== 'owner') role = 'member';
          roles[workspaceId] = role;
        }
        return roles;
      },
      {} as Record<string, 'member' | 'owner'>
    );
  }
}

export default Gateway;
