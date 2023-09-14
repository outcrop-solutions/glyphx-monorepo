import {Metadata} from 'next';
import {ProjectSidebar} from './_components/projectSidebar';

export const metadata: Metadata = {
  title: 'Project | Glyphx',
  description: 'Glyphx Project',
};

export default async function ProjectLayout({children}) {
  return (
    <div className="flex flex-row w-full h-full">
      <ProjectSidebar />
      {/* Grid View */}
      {children}
    </div>
  );
}
