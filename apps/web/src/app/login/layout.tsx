import {getServerSession} from 'next-auth';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {Route} from 'next';
import {Initializer, workspaceService} from 'business';

export const metadata: Metadata = {
  title: 'Login | Glyphx',
  description: 'Welcome to Glyphx',
};

export default async function AuthLayout({children}) {
  const session = await getServerSession(authOptions);
  let workspaces;

  // redirect to first workspace or create default workspace and redirect
  if (session?.user.id && session.user.email) {
    await Initializer.init();
    workspaces = await workspaceService.getWorkspaces(session.user.id, session.user.email);
    if (workspaces) {
      redirect(`/${workspaces[0].id}` as Route);
    } else {
      const workspace = await workspaceService.createWorkspace(
        session?.user?.id,
        session?.user.email,
        'Default Workspace',
        'default-workspace'
      );
      if (workspace) {
        redirect(`/${workspace.id}` as Route);
      }
    }
  }

  return (
    <main className="relative flex flex-col items-center bg-secondary-space-blue justify-center h-screen p-10 space-y-10">
      {children}
    </main>
  );
}
