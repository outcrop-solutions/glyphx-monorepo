// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanWebhook = (webhook: databaseTypes.IWebhook) => {
  const cleanWebhook = {...webhook};
  delete cleanWebhook.createdAt;
  delete cleanWebhook.updatedAt;
  delete cleanWebhook.deletedAt;
  delete cleanWebhook._id;
  return cleanWebhook;
};

/**
 * Creates Webhook
 * @returns
 */
export const _createWebhook = (
  webhook: databaseTypes.IWebhook
): webTypes.IFetchConfig => {
  return {
    url: '/api/webhook/create',
    options: {
      body: webhook,
      method: 'POST',
    },
    successMsg: 'New webhook successfully created',
  };
};

/**
 * Updates a Webhook
 * @param id
 * @param name
 * @returns
 */
export const _updateWebhook = (
  id: string,
  dirtyWebhook: databaseTypes.IWebhook
): webTypes.IFetchConfig => {
  const webhook = cleanWebhook(dirtyWebhook);
  return {
    url: `/api/webhook/${id}`,
    options: {
      body: {webhook},
      method: 'PUT',
    },
    successMsg: 'Webhook updated successfully',
  };
};

/**
 * Deletes a webhook
 * @param id
 * @returns
 */
export const _deleteWebhook = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/webhook/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Webhook successfully deleted.',
  };
};
