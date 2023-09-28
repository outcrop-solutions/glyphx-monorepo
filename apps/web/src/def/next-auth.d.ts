import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    jwt: boolean;
    user: {
      /** The user's postal address. */
      _id?: string;
      id: string;
      image?: string;
      email?: string;
      name?: string;
      subscription?: FREE | STANDARD | PREMIUM;
    };
  }
}
