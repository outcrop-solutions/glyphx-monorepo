import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { signInHtml, signInText, EmailClient } from '@glyphx/email';
import { Initializer, customerPaymentService, userService } from '@glyphx/business';
import clientPromise from 'lib/server/mongodb';
// import mongoose from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
// import { log } from 'lib/logsnag';
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Do whatever you want here, before the request is passed down to `NextAuth`
  if (!Initializer.inited) {
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
          await Promise.all([
            customerPaymentService.createPaymentAccount(user.email, user.id),
            // log(
            //   'user-registration',
            //   'New User Signup',
            //   `A new user recently signed up. (${user.email})`
            // ),
          ]);
        }
      },
    },
    providers: [
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
    ],
    secret: process.env.NEXTAUTH_SECRET || null,
    session: {
      // @ts-ignore
      jwt: true,
    },
  });
}
