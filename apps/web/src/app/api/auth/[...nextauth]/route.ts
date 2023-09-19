import NextAuth from 'next-auth';
import type {Awaitable, NextAuthOptions, SessionStrategy, User} from 'next-auth/index';
import {MongoDBAdapter} from '@next-auth/mongodb-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import {signInHtml, signInText, EmailClient} from 'email';
import MongoClient from 'lib/server/mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(MongoClient),
  callbacks: {
    async session({session, user}) {
      let newSession = {...session};
      // if (process.env.GLYPHX_ENV === 'dev' && !session) {
      //   const res = await fetch('http://localhost:3000/api/authorize', {
      //     method: 'POST',
      //     body: JSON.stringify({email: user.email}),
      //     headers: {'Content-Type': 'application/json'},
      //   });
      //   const newUser = await res.json();
      //   newSession = {
      //     ...newSession,
      //     user: {
      //       ...newUser,
      //     },
      //   };
      // }
      return newSession;
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

const auth = NextAuth(authOptions);

export {auth as GET, auth as POST};
