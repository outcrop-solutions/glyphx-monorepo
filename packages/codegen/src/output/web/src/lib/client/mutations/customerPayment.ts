// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanCustomerPayment = (
  customerPayment: databaseTypes.ICustomerPayment
) => {
  const cleanCustomerPayment = {...customerPayment};
  delete cleanCustomerPayment.createdAt;
  delete cleanCustomerPayment.updatedAt;
  delete cleanCustomerPayment.deletedAt;
  delete cleanCustomerPayment._id;
  return cleanCustomerPayment;
};

/**
 * Creates CustomerPayment
 * @returns
 */
export const _createCustomerPayment = (
  customerPayment: databaseTypes.ICustomerPayment
): webTypes.IFetchConfig => {
  return {
    url: '/api/customerPayment/create',
    options: {
      body: customerPayment,
      method: 'POST',
    },
    successMsg: 'New customerPayment successfully created',
  };
};

/**
 * Updates a CustomerPayment
 * @param id
 * @param name
 * @returns
 */
export const _updateCustomerPayment = (
  id: string,
  dirtyCustomerPayment: databaseTypes.ICustomerPayment
): webTypes.IFetchConfig => {
  const customerPayment = cleanCustomerPayment(dirtyCustomerPayment);
  return {
    url: `/api/customerPayment/${id}`,
    options: {
      body: {customerPayment},
      method: 'PUT',
    },
    successMsg: 'CustomerPayment updated successfully',
  };
};

/**
 * Deletes a customerPayment
 * @param id
 * @returns
 */
export const _deleteCustomerPayment = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/customerPayment/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'CustomerPayment successfully deleted.',
  };
};
