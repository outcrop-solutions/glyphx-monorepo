import {Metadata} from 'next';
import {getServerSession} from 'next-auth/next';
import {redirect} from 'next/navigation';
import 'globals.css';
import {Providers} from './providers';
import {authOptions} from './api/auth/[...nextauth]/route';
import Sidebar from './[workspaceId]/_components/Sidebar';

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
  console.log({session, rootLayout: true});

  // if (!session?.user) {
  //   redirect('/login');
  // }

  return (
    <html lang="en">
      <body className="relative flex flex-col">
        <Providers session={session}>
          <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
            <Sidebar />
            <div className="flex flex-col h-full w-full overflow-y-auto bg-transparent">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
