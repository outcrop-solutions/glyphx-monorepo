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
  projectRoles: Record<string, 'owner' | 'editable' | 'readOnly'>;
  id: string;
  name?: string;
  email?: string;
  username?: string;
  emailVerified?: Date;
  image?: string;
  // custom via next-auth session callback
  subscription?: FREE | STANDARD | PREMIUM;
  color?: string; // for cursor
  // permissions
};

// an artifact of liveblocks
export type Group = {
  id: string;
  name: string;
};
