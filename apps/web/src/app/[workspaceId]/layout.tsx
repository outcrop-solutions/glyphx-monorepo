import WorkspaceHeader from 'app/[workspaceId]/_components/WorkspaceHeader';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {Initializer, workspaceService} from 'business';
import {Metadata} from 'next';
import {getServerSession} from 'next-auth/next';
import {redirect} from 'next/navigation';
import {RightSidebar} from './_components/RightSidebar';
import LeftSidebar from 'app/[workspaceId]/_components/LeftSidebar';

export const metadata: Metadata = {
  title: 'Workspace | Glyphx',
  description: 'Welcome to Glyphx Workspace',
};

declare global {
  interface Window {
    core: any | undefined;
  }
}

export default async function WorkspaceLayout({children, params}: {children: React.ReactNode; params: any}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  await Initializer.init();
  const workspaces = await workspaceService.getWorkspaces(session.user.id, session.user.email as string);

  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <LeftSidebar workspaces={workspaces} />
      <div className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
        <WorkspaceHeader />
        {children}
      </div>
      <RightSidebar />
    </div>
  );
}
