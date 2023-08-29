'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Content from 'app/_components/Content';
import Header from 'app/_components/Header';
import Sidebar from 'app/_components/Sidebar';
import menu from 'config/menu/index';
import { useWorkspace } from 'lib';
import { RightSidebar } from 'app/[workspaceSlug]/_components/rightSidebar';
import { ProjectSidebar } from './_components/projectSidebar';

const ProjectLayout = ({ children }) => {
  const { data } = useSession();
  const router = useRouter();
  const { data: result } = useWorkspace();

  useEffect(() => {
    if (!data) {
      // router.replace('/auth/login' as Route);
    }
  }, [data, router]);

  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <Sidebar menu={menu(result?.workspace?.slug)} />
      <Content.Project>
        <Header />
        <div className="flex flex-row w-full h-full">
          {/* Project sidebar */}
          <ProjectSidebar />
          {/* Grid View */}
          {children}
        </div>
      </Content.Project>
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default ProjectLayout;
