import NextAuth, {type DefaultSession} from 'next-auth';

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
  accounts: IAccount[];
  sessions: ISession[];
  membership: IMember[];
  invitedMembers: IMember[];
  createdWorkspaces: IWorkspace[];
  projects: IProject[];
  customerPayment?: ICustomerPayment;
  webhooks: IWebhook[];
  apiKey?: string;
  // custom via next-auth session callback
  subscription?: FREE | STANDARD | PREMIUM;
  color?: string; // for cursor
  projectIds?: string[]; // for authorization
};

// an artifact of liveblocks
export type Group = {
  id: string;
  name: string;
};
