import NextAuth from 'next-auth';
import type {NextAuthOptions} from 'next-auth/index';
import {MongoDBAdapter} from '@next-auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import {signInHtml, signInText, EmailClient} from 'email';
import {customerPaymentService} from 'business';
import MongoClient from 'lib/server/mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(MongoClient),
  callbacks: {
    session: async ({session, user}) => {
      // if (session?.user) {
      //   const customerPayment = await customerPaymentService.getPayment(user.email);
      //   session.user.userId = user.id;
      //   if (customerPayment) {
      //     session.user.subscription = customerPayment.subscriptionType;
      //   }
      // }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: !(process.env.NODE_ENV === 'production'),
  events: {
    signIn: async ({user, isNewUser}) => {
      // const customerPayment = await getPayment(user.email);
      // if (isNewUser || customerPayment === null || user.createdAt === null) {
      //   await Promise.all([createPaymentAccount(user.email, user.id)]);
      // }
    },
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      server: process.env.EMAIL_SERVER,
      sendVerificationRequest: async ({identifier: email, url}) => {
        const {host} = new URL(url);
        await EmailClient.sendMail({
          html: signInHtml({email, url}),
          subject: `[Glyphx] Sign in to ${host}`,
          text: signInText({email, url}),
          to: email,
        });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || undefined,
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
