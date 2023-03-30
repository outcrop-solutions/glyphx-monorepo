import { web as webTypes, database as databaseTypes } from '@glyphx/types';
// MEMBERSHIP MUTATIONS

/**
 * Toggles member role from member to owner
 * @note uses membershipService.toggleRole() in business package
 * @param memberId corresponds to member._id in mongoDB
 */
export const _updateRole = (memberId: string): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/team/role`,
    options: {
      body: {
        memberId: memberId,
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
}: {
  slug: string;
  members: Omit<Partial<databaseTypes.IMember>, 'id'>[];
}): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/${slug}/invite`,
    options: {
      body: {
        members: members,
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
    successMsg: 'Removed team member from workspace!',
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
      body: { memberId: memberId },
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
      body: { memberId: memberId },
      method: 'PUT',
    },
    successMsg: 'Declined invitation!',
  };
};
