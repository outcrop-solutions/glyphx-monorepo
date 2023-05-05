import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import Content from 'components/Content/index';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar/index';
import menu from 'config/menu/index';
import { useWorkspace } from 'lib';
import { Modals } from 'partials/layout/Modals';
import { RightSidebar } from 'partials/rightSidebar';

const ProjectLayout = ({ children }) => {
  const { data } = useSession();
  const router = useRouter();
  const { data: result } = useWorkspace();

  useEffect(() => {
    if (!data) {
      // router.replace('/auth/login');
    }
  }, [data, router]);

  return (
    <>
      <Modals />
      <main className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
        <Sidebar menu={menu(result?.workspace?.slug)} />
        <Content.Project>
          <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
          <Header />
          {children}
        </Content.Project>
        {/* Right Sidebar */}
        <RightSidebar />
      </main>
    </>
  );
};

export default ProjectLayout;
