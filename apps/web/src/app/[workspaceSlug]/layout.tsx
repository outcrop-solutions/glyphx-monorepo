'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {Toaster} from 'react-hot-toast';

import Content from 'app/_components/Content';
import Header from 'app/_components/Header';
import Sidebar from 'app/_components/Sidebar/index';
import menu from 'config/menu/index';
import {useWorkspace} from 'lib';

export default function WorkspaceLayout({children}) {
  const {data} = useSession();
  const router = useRouter();
  const {data: result} = useWorkspace();

  useEffect(() => {
    if (!data) {
      // router.replace('/auth/login' as Route);
    }
  }, [data, router]);

  return (
    <>
      <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
        <Sidebar menu={menu(result.workspace?.slug)} />
        <Content.Workspace>
          <Toaster position="bottom-left" toastOptions={{duration: 10000}} />
          <Header />
          {children}
        </Content.Workspace>
      </div>
    </>
  );
}
