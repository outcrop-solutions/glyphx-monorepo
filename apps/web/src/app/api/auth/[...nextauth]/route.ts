import NextAuth from 'next-auth';
import type {NextAuthOptions} from 'next-auth/index';
import {MongoDBAdapter} from '@next-auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import {signInHtml, signInText, EmailClient} from 'email';
import {customerPaymentService} from 'business';
import clientPromise from 'lib/server/mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({session, user}) => {
      if (session?.user) {
        const customerPayment = await customerPaymentService.getPayment(user.email);
        //@ts-ignore
        session.user.userId = user.id;
        if (customerPayment) {
          //@ts-ignore
          session.user.subscription = customerPayment.subscriptionType;
        }
      }
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
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      credentials: {
        email: {label: 'email', type: 'text', placeholder: 'youremail@gmail.com'},
      },
      async authorize(credentials, req) {
        const res = await fetch('http://localhost:3000/api/authorize', {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: {'Content-Type': 'application/json'},
        });
        const user = await res.json();
        // If no error and we have user data, return it
        if (res.ok && user) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
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
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      clientId: process.env.GOOGLE_CLIENT_ID!,
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || undefined,
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
