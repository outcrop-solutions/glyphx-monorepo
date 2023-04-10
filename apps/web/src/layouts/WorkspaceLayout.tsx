import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import Content from 'components/Content/index';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar/index';
import menu from 'config/menu/index';
import { useWorkspace } from 'lib';

const WorkspaceLayout = ({ children }) => {
  const { data } = useSession();
  const router = useRouter();
  const { data: result, isLoading } = useWorkspace();

  useEffect(() => {
    if (!data) {
      // router.replace('/auth/login');
    }
  }, [data, router]);

  return (
    <main className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <Sidebar menu={menu(result.workspace?.slug)} />
      <Content.Workspace>
        <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
        <Header breadcrumbs={['My Workspace']} />
        {children}
      </Content.Workspace>
    </main>
  );
};

export default WorkspaceLayout;
