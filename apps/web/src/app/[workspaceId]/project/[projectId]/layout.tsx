import {Metadata} from 'next';
import Content from 'app/_components/Content';
import Header from 'app/_components/Header';
import Sidebar from 'app/_components/Sidebar';
import {RightSidebar} from 'app/[workspaceId]/_components/rightSidebar';
import {ProjectSidebar} from './_components/projectSidebar';

export const metadata: Metadata = {
  title: 'Project | Glyphx',
  description: 'Glyphx Project',
};

export default async function ProjectLayout({children}) {
  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <Sidebar />
      <Content.Project>
        <Header />
        <div className="flex flex-row w-full h-full">
          <ProjectSidebar />
          {/* Grid View */}
          {children}
        </div>
      </Content.Project>
      <RightSidebar />
    </div>
  );
}
