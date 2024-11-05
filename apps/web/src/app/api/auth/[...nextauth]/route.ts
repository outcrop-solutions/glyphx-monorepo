import NextAuth from 'next-auth';
import type {NextAuthOptions} from 'next-auth/index';
import {Initializer, dbConnection, userService} from 'business';
import {MongoDBAdapter} from '@next-auth/mongodb-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import emailClient from 'actions/src/email';
import {databaseTypes, emailTypes} from 'types';

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
        const {MEMBER, OWNER: TEAM_OWNER} = databaseTypes.constants.ROLE;
        const {READ_ONLY, CAN_EDIT, OWNER} = databaseTypes.constants.PROJECT_ROLE;
        // get valid memberships
        const pms = userInfo.membership?.filter(
          (m) =>
            m.type === databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT &&
            m.status === databaseTypes.constants.INVITATION_STATUS.ACCEPTED &&
            !m.deletedAt
        );

        // get valid memberships
        const wms = userInfo.membership?.filter(
          (m) =>
            m.type === databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE &&
            m.status === databaseTypes.constants.INVITATION_STATUS.ACCEPTED &&
            !m.deletedAt
        );

        const projectRoles = pms.reduce(
          (roles, membership) => {
            const projectId = membership.project as unknown as string;
            if (projectId) {
              let role = roles[projectId];
              // Assign the highest role privilege
              if (membership.projectRole === OWNER) role = 'owner';
              else if (membership.projectRole === CAN_EDIT && role !== 'owner') role = 'editable';
              else if (membership.projectRole === READ_ONLY && !role) role = 'readOnly';
              roles[projectId] = role;
            }
            return roles;
          },
          {} as Record<string, 'readOnly' | 'editable' | 'owner'>
        );

        const teamRoles = wms.reduce(
          (roles, membership) => {
            const workspaceId = membership.workspace as unknown as string;
            if (workspaceId) {
              let role = roles[workspaceId];
              // Assign the highest role privilege
              if (membership.teamRole === TEAM_OWNER) role = 'owner';
              else if (membership.teamRole === MEMBER && role !== 'owner') role = 'member';
              roles[workspaceId] = role;
            }
            return roles;
          },
          {} as Record<string, 'member' | 'owner'>
        );

        console.log({projectRoles, teamRoles});

        session.user = {
          id: userInfo.id as string,
          name: userInfo.name as string,
          email: userInfo.email as string,
          username: userInfo.email?.split('@')[0],
          projectRoles,
          teamRoles,
        };

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
