import {webTypes, databaseTypes} from 'types';

// WORKSPACE MEMBERSHIP MUTATIONS

/**
 * Toggles member role from member to owner
 * @note uses membershipService.updateRole() in business package
 * @param memberId corresponds to member._id in mongoDB
 */
export const _updateRole = (
  memberId: string,
  role: databaseTypes.constants.ROLE | databaseTypes.constants.PROJECT_ROLE
): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/team/role`,
    options: {
      body: {
        memberId: memberId,
        role: role,
      },
      method: 'PUT',
    },
    successMsg: 'Updated team member role!',
  };
};

/**
 * Invites new members to a workspace
 * @note uses workspaceService.inviteUsers() in business package
 * @param slug corresponds to workspace.slug in mongoDB
 * @param members corresponds to workspace.members in mongoDB
 */
export const _createMember = ({
  slug,
  members,
  projectId,
}: {
  slug: string;
  members: Omit<Partial<databaseTypes.IMember>, 'id'>[];
  projectId?: string;
}): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/${slug}/invite`,
    options: {
      body: {
        members: members,
        projectId: projectId,
      },
      method: 'POST',
    },
    successMsg: 'Invited team members!',
  };
};

/**
 * Toggles member role from member to owner
 * @note uses membershipService.remove() in business package
 * @param memberId corresponds to member._id in mongoDB
 */
export const _removeMember = (memberId: string): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/team/member`,
    options: {
      body: {
        memberId: memberId,
      },
      method: 'DELETE',
    },
    successMsg: 'Removed team member from workspace.',
  };
};

/**
 * Updates member status to ACCEPTED
 * @note uses membershipService.updateStatus() in business package
 * @param memberId corresponds to member._id in mongoDB
 */
export const _acceptInvitation = (memberId: string): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/team/accept`,
    options: {
      body: {memberId: memberId},
      method: 'PUT',
    },
    successMsg: 'Accepted invitation',
  };
};

/**
 * Updates member status to DECLINED
 * @note uses membershipService.updateStatus() in business package
 * @param memberId corresponds to member._id in mongoDB
 */
export const _declineInvitation = (memberId: string): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/team/decline`,
    options: {
      body: {memberId: memberId},
      method: 'PUT',
    },
    successMsg: 'Invitation declined',
  };
};
