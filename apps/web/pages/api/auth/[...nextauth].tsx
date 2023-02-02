import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

import { prisma } from '@glyphx/database';
import { html, text } from '@glyphx/business/src/email/signin';
import { EMAIL_CONFIG, sendMail } from '@glyphx/business/src/lib/server/mail';
import { createPaymentAccount, getPayment } from '@glyphx/business/src/services/customer';
// import { log } from '@/lib/server/logsnag';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        const customerPayment = await getPayment(user.email);
        // @ts-ignore
        session.user.userId = user.id;

        if (customerPayment) {
          // @ts-ignore
          session.user.subscription = customerPayment.subscriptionType;
        }
      }

      return session;
    },
  },
  debug: !(process.env.NODE_ENV === 'production'),
  events: {
    signIn: async ({ user, isNewUser }) => {
      const customerPayment = await getPayment(user.email);
      // @ts-ignore
      if (isNewUser || customerPayment === null || user.createdAt === null) {
        await Promise.all([
          createPaymentAccount(user.email, user.id),
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
      server: EMAIL_CONFIG,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url);
        // @ts-ignore
        await sendMail({
          html: html({ email, url }),
          subject: `[Glyphx] Sign in to ${host}`,
          text: text({ email, url }),
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
