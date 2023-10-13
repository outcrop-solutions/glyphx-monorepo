import {Metadata} from 'next';
import {getServerSession} from 'next-auth/next';
import {redirect} from 'next/navigation';
import 'globals.css';
import {Providers} from './providers';
import {authOptions} from './api/auth/[...nextauth]/route';
import {Initializer, workspaceService} from 'business';
import {RightSidebar} from './[workspaceId]/_components/rightSidebar';
import Header from './_components/Header';
import Sidebar from './_components/Sidebar';

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
  let workspaces;

  if (session?.user.id && session.user.email) {
    await Initializer.init();
    workspaces = await workspaceService.getWorkspaces(session.user.id, session.user.email);
  }
  // if (!session?.user) {
  //   redirect('/login');
  // }

  return (
    <html lang="en">
      <body className="relative flex flex-col">
        <Providers session={session}>
          <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
            <Sidebar workspaces={workspaces} />
            <div className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
              <Header />
              {children}
            </div>
            <RightSidebar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
