import {Metadata, Route} from 'next';
import Content from 'app/_components/Content';
import Header from 'app/_components/Header';
import Sidebar from 'app/_components/Sidebar/index';
import {getServerSession} from 'next-auth';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {redirect} from 'next/navigation';

export const metadata: Metadata = {
  title: 'Workspace | Glyphx',
  description: 'Glyphx Workspace',
};

export default async function WorkspaceLayout({children}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.log({session, account: true});
    redirect(`/login` as Route);
  }

  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <Sidebar />
      <div className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
        <Header />
        {children}
      </div>
    </div>
  );
}
