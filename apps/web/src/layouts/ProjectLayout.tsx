import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import Content from 'components/Content/index';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar/index';
import menu from 'config/menu/index';
import { useWorkspace } from 'providers/workspace';

const ProjectLayout = ({ children }) => {
  const { data } = useSession();
  const router = useRouter();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!data) {
      router.replace('/auth/login');
    }
  }, [data, router]);

  return (
    <main className="relative flex flex-col w-screen h-screen space-x-0 text-white md:space-x-5 md:flex-row bg-secondary-midnight">
      <Sidebar menu={menu(workspace?.slug)} />
      <Content.Projects>
        <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
        <Header breadcrumbs={['My Projects']}/>
        {children}
      </Content.Projects>
    </main>
  );
};

export default ProjectLayout;