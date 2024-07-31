import {Metadata} from 'next';
import {getServerSession} from 'next-auth/next';
import 'globals.css';
import {Providers} from './providers';
import {authOptions} from './api/auth/[...nextauth]/route';
import {serverGrowthbook as growthbook} from './_components/serverGrowthbook';

export const metadata: Metadata = {
  title: 'Home | Glyphx',
  description: 'Welcome to Glyphx',
};

declare global {
  interface Window {
    core: any | undefined;
  }
}

export default async function RootLayout({children, params}: {children: React.ReactNode; params: any}) {
  const session = await getServerSession(authOptions);
  try {
    await growthbook.loadFeatures();
  } catch (error) {}

  return (
    <html lang="en">
      <body className="relative flex flex-col">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
