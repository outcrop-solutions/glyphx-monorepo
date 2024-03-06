import type {DefaultSession} from 'next-auth';
import {databaseTypes} from 'types';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    jwt: boolean;
    user: User & DefaultSession['user']; // To keep the default types
  }
}

export type User = {
  id: string;
  userCode: string;
  name: string;
  username: string;
  gh_username?: string;
  email: string;
  emailVerified?: Date;
  isVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  accounts: databaseTypes.IAccount[];
  sessions: databaseTypes.ISession[];
  membership: databaseTypes.IMember[];
  invitedMembers: databaseTypes.IMember[];
  createdWorkspaces: databaseTypes.IWorkspace[];
  projects: databaseTypes.IProject[];
  customerPayment?: databaseTypes.ICustomerPayment;
  webhooks: databaseTypes.IWebhook[];
  apiKey?: string;
  // custom via next-auth session callback
  subscription?: databaseTypes.constants.SUBSCRIPTION_TYPE;
  color?: string; // for cursor
  projectIds?: string[]; // for authorization
};

// an artifact of liveblocks
export type Group = {
  id: string;
  name: string;
};
