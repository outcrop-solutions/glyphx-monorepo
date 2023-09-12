import {redirect} from 'next/navigation';
import {Toaster} from 'react-hot-toast';
import {Metadata, Route} from 'next';
import Content from 'app/_components/Content';
import Header from 'app/_components/Header';
import Sidebar from 'app/_components/Sidebar/index';
import {getServerSession} from 'next-auth';
import {authOptions} from 'app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Workspace | Glyphx',
  description: 'Glyphx Workspace',
};

export default async function WorkspaceLayout({children}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login` as Route);
  }

  return (
    <>
      <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
        <Sidebar />
        <Content.Workspace>
          <Toaster position="bottom-left" toastOptions={{duration: 10000}} />
          <Header />
          {children}
        </Content.Workspace>
      </div>
    </>
  );
}
