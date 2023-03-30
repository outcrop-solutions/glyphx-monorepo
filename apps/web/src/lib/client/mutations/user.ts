import { web as webTypes } from '@glyphx/types';

// USER MUTATIONS

/**
 * Updates User's name to param
 * @note uses userService.updateName() in business package
 * @param name corresponds to user.name in mongoDB
 */
export const _updateUserName = (name: string): webTypes.IFetchConfig => {
  return {
    url: '/api/user/name',
    options: {
      body: { name: name },
      method: 'PUT',
    },
    successMsg: 'Name successfully updated',
  };
};

/**
 * Updates User's email to param
 * @note uses userService.updateEmail() in business package
 * @param name corresponds to user.email in mongoDB
 */
export const _updateUserEmail = (email: string): webTypes.IFetchConfig => {
  return {
    url: '/api/user/email',
    options: {
      body: { email: email },
      method: 'PUT',
    },
    successMsg: 'Email successfully updated and signing you out!',
  };
};

/**
 * Deactivated a user account
 * @note uses userService.deactivate() in business package
 * updates the user's .deletedAt field
 */
export const _deactivateAccount = (): webTypes.IFetchConfig => {
  return {
    url: '/api/user',
    options: {
      method: 'DELETE',
    },
    successMsg: 'Account has been deactivated!',
  };
};
