import NextAuth from 'next-auth';
import type {NextAuthOptions} from 'next-auth/index';
import {MongoDBAdapter} from '@next-auth/mongodb-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import {signInHtml, signInText, EmailClient} from 'email';
import {customerPaymentService} from 'business';
import MongoClient from 'lib/server/mongodb';

// TODO: if we can add a script that adds our dev IP to google oauth then we can use this
import os from 'node:os';

const getServerIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
    const iface = interfaces[devName];
    if (iface) {
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return 'localhost';
};

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(MongoClient),
  callbacks: {
    session: async ({session, user}) => {
      if (session?.user) {
        session.user._id = user.id;
      }
      return session;
    },
    // redirect: async ({url, baseUrl}) => {
    //   // return url;
    //   console.log({url, baseUrl});
    //   const serverIP = getServerIPAddress();
    //   console.log({serverIP});
    //   // Replace localhost:3000 with the server IP
    //   if (baseUrl.includes('localhost:3000')) {
    //     baseUrl = baseUrl.replace('localhost:3000', serverIP);
    //   }
    //   // Allows relative callback URLs
    //   if (url.startsWith('/')) return `${baseUrl}${url}`;
    //   // Allows callback URLs on the same origin
    //   else if (new URL(url).origin === baseUrl) return url;
    //   return baseUrl;
    // },
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
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      //
      credentials: {
        email: {label: 'email', type: 'text', placeholder: ''},
      },
      async authorize(credentials, req) {
        console.log({credentials, req});
        // const res = await fetch('http://localhost:3000/api/authorize', {
        //   method: 'POST',
        //   body: JSON.stringify(credentials),
        //   headers: {'Content-Type': 'application/json'},
        // });
        // const user = await res.json();
        // // If no error and we have user data, return it
        // if (res.ok && user) {
        //   return user;
        // }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || undefined,
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
