import {getServerSession} from 'next-auth';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {Metadata, Route} from 'next';
import {getOrCreateWorkspace} from 'lib/actions/workspace';
import {Initializer, workspaceService} from 'business';
import {redirect} from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login | Glyphx',
  description: 'Welcome to Glyphx',
};

export default async function AuthLayout({children}) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    await Initializer.init();
    const workspaces = await workspaceService.getWorkspaces(session.user.id, session.user.email as string);
    if (workspaces && workspaces.length > 0) {
      redirect(`/${workspaces[0].id}` as Route);
    } else {
      console.log('creating a workspace', {
        id: session?.user?.id,
        email: session?.user.email as string,
        name: 'Default Workspace',
        slug: 'default-workspace',
      });
      const workspace = await workspaceService.createWorkspace(
        session?.user?.id,
        session?.user.email as string,
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
