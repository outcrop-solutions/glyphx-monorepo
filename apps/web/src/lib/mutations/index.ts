import { Types as mongooseTypes } from 'mongoose';
import { database as databaseTypes } from '@glyphx/types';
import api from '../api';
/**
 * customer
 * membership
 * processTracking
 * project
 * table
 * user
 * workspace
 */

interface payload {
  url: string;
  options: any;
  successMsg: string;
}

/**
 * Creates CustomerPayment
 * @param email
 * @param customerId
 */
export const createCustomerPayment = (email: string, customerId: string) => {};

/**
 * Duplicates existing project
 * @note not active
 * @param id // existing project id
 * @returns
 */
export const forkProject = () => {};

/**
 * Creates Project
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const createProject = (id: string | mongooseTypes.ObjectId, input: Partial<databaseTypes.IProject>) => {};

/**
 * Updates Project Name
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const updateProjectName = (id: string | mongooseTypes.ObjectId, name: string) => {};

/**
 * Updates Project Name
 * @note not active
 * @param id
 * @param description
 * @param members
 * @returns
 */
export const updateProject = (id: string | mongooseTypes.ObjectId, input: Partial<databaseTypes.IProject>) => {};

/**
 * Deletes a project
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const deleteProject = (id: string | mongooseTypes.ObjectId, name: string) => {};

/**
 * Removes filter from a project
 * @note not active
 * @param id
 * @param
 * @returns
 */
export const removeFilter = (id: string | mongooseTypes.ObjectId) => {};

/**
 * Apply filter to a state
 * @note not active
 * @param id
 * @param
 * @returns
 */
export const applyFilter = (id: string | mongooseTypes.ObjectId) => {};

// USER
export const _updateUserName = (name: string): payload => {
  return {
    url: '/api/user/name',
    options: {
      body: { name: name },
      method: 'PUT',
    },
    successMsg: 'Name successfully updated',
  };
};

export const _updateUserEmail = (email: string): payload => {
  return {
    url: '/api/user/email',
    options: {
      body: { email: email },
      method: 'PUT',
    },
    successMsg: 'Email successfully updated and signing you out!',
  };
};

export const _deactivateAccount = (): payload => {
  return {
    url: '/api/user',
    options: {
      method: 'DELETE',
    },
    successMsg: 'Account has been deactivated!',
  };
};

// MEMBERSHIP
export const _createSubscription = (priceId: string): payload => {
  return {
    url: `/api/payments/subscription/${priceId}`,
    options: {
      method: 'POST',
    },
    successMsg: 'Subscription successfully created',
  };
};

export const _updateRole = (memberId: string): payload => {
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

export const _createMember = ({ slug, members }: { slug: string; members: any[] }): payload => {
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

export const _removeMember = (memberId: string): payload => {
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

export const _acceptInvitation = (memberId: string): payload => {
  return {
    url: `/api/workspace/team/accept`,
    options: {
      body: { memberId: memberId },
      method: 'PUT',
    },
    successMsg: 'Accepted invitation',
  };
};

export const _declineInvitation = (memberId: string): payload => {
  return {
    url: `/api/workspace/team/decline`,
    options: {
      body: { memberId: memberId },
      method: 'PUT',
    },
    successMsg: 'Declined invitation!',
  };
};

// WORKSPACES
export const _createWorkspace = (name: string): payload => {
  return {
    url: '/api/workspace',
    options: {
      body: { name: name },
      method: 'POST',
    },
    successMsg: 'Workspace successfully created',
  };
};

export const _deleteWorkspace = (slug: string): payload => {
  return {
    url: `/api/workspace/${slug}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Workspace has been deleted',
  };
};

export const _updateWorkspaceName = ({ slug, name }): payload => {
  return {
    url: `/api/workspace/${slug}/name`,
    options: {
      body: { name },
      method: 'PUT',
    },
    successMsg: 'Workspace name successfully updated!',
  };
};

export const _updateWorkspaceSlug = ({ slug, newSlug }): payload => {
  return {
    url: `/api/workspace/${slug}/slug`,
    options: {
      body: { slug: newSlug },
      method: 'PUT',
    },
    successMsg: 'Workspace slug successfully updated!',
  };
};

export const _joinWorkspace = (workspaceCode: string): payload => {
  return {
    url: `/api/workspace/team/join`,
    options: {
      body: { workspaceCode: workspaceCode },
      method: 'POST',
    },
    successMsg: 'Accepted invitation!',
  };
};
