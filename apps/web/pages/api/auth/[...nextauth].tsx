import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

import { prisma } from '@glyphx/database';
import { signInHtml, signInText, EMAIL_CONFIG, sendMail } from '@glyphx/email';
import { createPaymentAccount, getPayment } from '@glyphx/business';
// import { log } from '@/lib/logsnag';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
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
