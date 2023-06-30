import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { signInHtml, signInText, EmailClient } from '@glyphx/email';
import { Initializer, customerPaymentService, userService } from '@glyphx/business';
import clientPromise from 'business/actions/mongodb';
// import mongoose from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
// import { log } from 'lib/logsnag';
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Do whatever you want here, before the request is passed down to `NextAuth`
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  return await NextAuth(req, res, {
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
      session: async ({ session, user }) => {
        if (session?.user) {
          const customerPayment = await customerPaymentService.getPayment(user.email);

          session.user.userId = user.id;

          if (customerPayment) {
            session.user.subscription = customerPayment.subscriptionType;
          }
        }
        return session;
      },
    },
    debug: !(process.env.NODE_ENV === 'production'),
    events: {
      signIn: async ({ user, isNewUser }) => {
        const customerPayment = await customerPaymentService.getPayment(user.email);
        if (isNewUser) {
          await userService.updateUserCode(user.id);
        }
        // @ts-ignore
        if (isNewUser || customerPayment === null || user.createdAt === null) {
          await Promise.all([customerPaymentService.createPaymentAccount(user.email, user.id)]);
        }
      },
    },
    providers: [
      CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: 'Credentials',
        credentials: {
          email: { label: 'email', type: 'text', placeholder: 'youremail@gmail.com' },
        },
        async authorize(credentials, req) {
          const res = await fetch('http://localhost:3000/api/authorize', {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' },
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
        sendVerificationRequest: async ({ identifier: email, url }) => {
          const { host } = new URL(url);
          await EmailClient.sendMail({
            html: signInHtml({ email, url }),
            subject: `[Glyphx] Sign in to ${host}`,
            text: signInText({ email, url }),
            to: email,
          });
        },
      }),
      GoogleProvider({
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        clientId: process.env.GOOGLE_CLIENT_ID,
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET || null,
  });
}
