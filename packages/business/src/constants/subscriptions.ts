import {database} from '@glyphx/types';

export default {
  [database.constants.SUBSCRIPTION_TYPE.FREE]: {
    customDomains: 1,
    members: 1,
    workspaces: 1,
  },
  [database.constants.SUBSCRIPTION_TYPE.STANDARD]: {
    customDomains: 3,
    members: 5,
    workspaces: 5,
  },
  [database.constants.SUBSCRIPTION_TYPE.PREMIUM]: {
    customDomains: 5,
    members: 10,
    workspaces: 10,
  },
};
