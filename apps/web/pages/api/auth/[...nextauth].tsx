// TODO: Move to next-auth from cognito to easily support OAuth clients
import AWS from 'aws-sdk';
import NextAuth from 'next-auth';

// OAUTH CLIENTS
// import GitHubProvider from 'next-auth/providers/github';
// import GoogleProvider from 'next-auth/providers/google';

// SEND VERIFICATION EMAIL
import EmailProvider from 'next-auth/providers/email';
import { sendVerificationRequest } from 'email/sendVerificationRequest';

// UNCOMMENT TO ENABLE PRISMA/MONGO ORM
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { prisma } from '@glyphx/database';

// COMMENT TO DISABLE DYNAMO ORM
import { DynamoDBAdapter } from '@next-auth/dynamodb-adapter';

import type { NextAuthOptions } from 'next-auth';

// The default table name is next-auth, but you can customise that by passing { tableName: 'your-table-name' } as the second parameter in the adapter.

AWS.config.update({
  accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY,
  region: process.env.NEXT_AUTH_AWS_REGION,
});

// if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET)
//   throw new Error("Failed to initialize Github authentication");

export const authOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: '/login', // Error code passed in query string as ?error=
  },
  // UNCOMMENT TO ENABLE PRISMA/MONGO ORM
  // adapter: PrismaAdapter(prisma),
  // COMMENT TO DISABLE DYNAMO ORM
  adapter: DynamoDBAdapter(new AWS.DynamoDB.DocumentClient()),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        // @ts-ignore
        username: user.username,
        // @ts-ignore
        orgId: user.orgId,
      },
    }),
    profile(profile) {
      return { ...profile };
    },
  },
} as NextAuthOptions;

export default NextAuth(authOptions);
