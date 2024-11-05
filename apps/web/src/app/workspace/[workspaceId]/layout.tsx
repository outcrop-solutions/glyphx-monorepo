import WorkspaceHeader from 'app/workspace/[workspaceId]/_components/WorkspaceHeader';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {Initializer, workspaceService} from 'business';
import {Metadata} from 'next';
import {getServerSession} from 'next-auth/next';
import {notFound, redirect} from 'next/navigation';
import {RightSidebar} from './_components/rightSidebar';
import LeftSidebar from 'app/workspace/[workspaceId]/_components/LeftSidebar';
import WorkspaceProvider from './workspace-provider';

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
  const workspaceId = params?.workspaceId;
  await Initializer.init();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const role = session?.user.teamRoles[workspaceId];
  if (!role) {
    notFound();
  }
  const permissions = {
    isOwner: role === 'owner',
    isMember: role === 'member',
  };

  let workspace;
  if (workspaceId) {
    workspace = await workspaceService.getSiteWorkspace(workspaceId);
  }
  const workspaces = await workspaceService.getWorkspaces(session.user.id, session.user.email as string);

  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <WorkspaceProvider workspace={workspace} permissions={permissions}>
        <LeftSidebar workspaces={workspaces} />
        <div className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
          <WorkspaceHeader />
          {children}
        </div>
        <RightSidebar />
      </WorkspaceProvider>
    </div>
  );
}
