import {Metadata} from 'next';
import {getServerSession} from 'next-auth/next';
import 'globals.css';
import {Providers} from './providers';
import {authOptions} from './api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Home | Glyphx',
  description: 'Welcome to Glyphx',
};

declare global {
  interface Window {
    core: any | undefined;
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="relative flex flex-col">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
