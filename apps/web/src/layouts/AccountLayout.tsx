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
import { Loading } from 'partials/loaders/Loading';

const AccountLayout = ({ children }) => {
  const { data } = useSession();
  const router = useRouter();
  const { data: workspace } = useWorkspace();

  useEffect(() => {
    if (!data) {
      // router.replace('/auth/login');
    }
  }, [data, router]);

  return (
    <>
      <Modals />
      <Loading />
      <main className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
        <Sidebar menu={menu(workspace?.workspace?.slug)} />
        <Content>
          <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
          <Header />
          {children}
        </Content>
      </main>
    </>
  );
};

export default AccountLayout;
