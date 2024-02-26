import {getServerSession} from 'next-auth';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {Metadata, Route} from 'next';
import {redirect} from 'next/navigation';
import {Initializer} from 'business';
import {createWorkspace, getWorkspaces} from 'actions';

export const metadata: Metadata = {
  title: 'Login | Glyphx',
  description: 'Welcome to Glyphx',
};

export default async function AuthLayout({children}) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const workspaces = await getWorkspaces();
    if (workspaces && !workspaces?.error)
      if (workspaces && workspaces.length > 0) {
        redirect(`/${workspaces[0].id}` as Route);
      } else {
        const workspace = await createWorkspace('Default Workspace');
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
