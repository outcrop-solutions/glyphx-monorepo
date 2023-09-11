// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanMember = (member: databaseTypes.IMember) => {
  const cleanMember = {...member};
  delete cleanMember.createdAt;
  delete cleanMember.updatedAt;
  delete cleanMember.deletedAt;
  delete cleanMember._id;
  return cleanMember;
};

/**
 * Creates Member
 * @returns
 */
export const _createMember = (
  member: databaseTypes.IMember
): webTypes.IFetchConfig => {
  return {
    url: '/api/member/create',
    options: {
      body: member,
      method: 'POST',
    },
    successMsg: 'New member successfully created',
  };
};

/**
 * Updates a Member
 * @param id
 * @param name
 * @returns
 */
export const _updateMember = (
  id: string,
  dirtyMember: databaseTypes.IMember
): webTypes.IFetchConfig => {
  const member = cleanMember(dirtyMember);
  return {
    url: `/api/member/${id}`,
    options: {
      body: {member},
      method: 'PUT',
    },
    successMsg: 'Member updated successfully',
  };
};

/**
 * Deletes a member
 * @param id
 * @returns
 */
export const _deleteMember = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/member/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Member successfully deleted.',
  };
};
