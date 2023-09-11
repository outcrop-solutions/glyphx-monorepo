// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {ICustomerPaymentDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_CUSTOMERPAYMENT = {
  paymentId: 'paymentId',
  email: 'email',
  subscriptionType: databaseTypes.SUBSCRIPTION_TYPE.FREE,
  customer: {},
} as unknown as ICustomerPaymentDocument;
