// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanVerificationToken = (
  verificationToken: databaseTypes.IVerificationToken
) => {
  const cleanVerificationToken = {...verificationToken};
  delete cleanVerificationToken.createdAt;
  delete cleanVerificationToken.updatedAt;
  delete cleanVerificationToken.deletedAt;
  delete cleanVerificationToken._id;
  return cleanVerificationToken;
};

/**
 * Creates VerificationToken
 * @returns
 */
export const _createVerificationToken = (
  verificationToken: databaseTypes.IVerificationToken
): webTypes.IFetchConfig => {
  return {
    url: '/api/verificationToken/create',
    options: {
      body: verificationToken,
      method: 'POST',
    },
    successMsg: 'New verificationToken successfully created',
  };
};

/**
 * Updates a VerificationToken
 * @param id
 * @param name
 * @returns
 */
export const _updateVerificationToken = (
  id: string,
  dirtyVerificationToken: databaseTypes.IVerificationToken
): webTypes.IFetchConfig => {
  const verificationToken = cleanVerificationToken(dirtyVerificationToken);
  return {
    url: `/api/verificationToken/${id}`,
    options: {
      body: {verificationToken},
      method: 'PUT',
    },
    successMsg: 'VerificationToken updated successfully',
  };
};

/**
 * Deletes a verificationToken
 * @param id
 * @returns
 */
export const _deleteVerificationToken = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/verificationToken/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'VerificationToken successfully deleted.',
  };
};
