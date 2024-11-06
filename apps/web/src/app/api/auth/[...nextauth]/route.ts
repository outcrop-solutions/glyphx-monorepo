import NextAuth from 'next-auth';
import type {NextAuthOptions} from 'next-auth/index';
import {Initializer, dbConnection, userService} from 'business';
import {MongoDBAdapter} from '@next-auth/mongodb-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import emailClient from 'actions/src/email';
import {emailTypes} from 'types';
import Gateway from 'actions/src/auth/Gateway';

const getConnectionPromise = (async () => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  return dbConnection.connectionPromise;
})();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(getConnectionPromise),
  callbacks: {
    session: async ({session, user}) => {
      const userInfo = await userService.getUser(user.id);
      if (!userInfo) {
        throw new Error('User not found');
      } else {
        const projectRoles = Gateway.projectRoleMap(userInfo);
        const teamRoles = Gateway.workspaceRoleMap(userInfo);

        session.user = {
          id: userInfo.id as string,
          name: userInfo.name as string,
          email: userInfo.email as string,
          username: userInfo.email?.split('@')[0],
          projectRoles,
          teamRoles,
        };

        // console.log({user: session.user});
        return session;
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: !(process.env.NODE_ENV === 'production'),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      server: process.env.EMAIL_SERVER,
      sendVerificationRequest: async ({identifier, url}) => {
        const {host} = new URL(url);
        const emailData = {
          type: emailTypes.EmailTypes.EMAIL_VERFICATION,
          url: url,
          identifier,
          provider: {
            from: 'jp@glyphx.co',
          },
          theme: 'light',
        } satisfies emailTypes.iEmailVerificationData;

        await emailClient.init();
        await emailClient.sendEmail(emailData);
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || undefined,
};

const auth = NextAuth(authOptions);

export {auth as GET, auth as POST};
