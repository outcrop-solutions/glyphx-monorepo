'use client';
import {Logo} from './Logo';
import {MenuBtn} from './MenuBtn';
import {CreateWorkspace} from '../../[workspaceId]/_components/controls/CreateWorkspace';
import {CubeIcon, FolderIcon, PlusCircleIcon, TableIcon, UserGroupIcon} from '@heroicons/react/outline';
import Link from 'next/link';
import {useParams} from 'next/navigation';

const Sidebar = ({workspaces}) => {
  const params = useParams();
  const isProject = !!params?.projectId;
  return (
    <aside
      className={`sticky z-40 flex flex-col px-4 space-y-2 text-white bg-secondary-deep-blue ${
        isProject ? '' : 'md:w-[250px] overscroll-contain md:overflow-y-auto'
      } md:h-screen`}
    >
      <div className="relative flex items-center py-3 text-center border-b border-b-gray">
        <Logo />
        <MenuBtn />
      </div>
      <div
        className={
          'flex-col space-y-1 md:flex md:top-0 absolute top-12 bg-secondary-deep-blue right-0 left-0 h-screen hidden md:relative'
        }
      >
        {!isProject && (
          <>
            <div className="flex-col space-y-1 md:flex border-b border-white pb-2">
              <div className="flex items-center space-x-2 hover:bg-nav cursor-pointer p-1 rounded-sm">
                <CubeIcon className="h-4 w-4" />
                <div className="text-gray-300 hover:text-white text-sm">Templates</div>
              </div>
              <div className="flex items-center space-x-2 hover:bg-nav cursor-pointer p-1 rounded-sm">
                <TableIcon className="h-4 w-4" />
                <div className="text-gray-300 hover:text-white text-sm">Data</div>
              </div>
              <div className="flex items-center space-x-2 hover:bg-nav cursor-pointer p-1 rounded-sm">
                <FolderIcon className="h-4 w-4" />
                <div className="text-gray-300 hover:text-white text-sm">Projects</div>
              </div>
            </div>
            <ul className={`flex flex-col items-center space-y-2 pt-2 overflow-y-auto h-96`}>
              {workspaces &&
                workspaces.map((space) => (
                  <li className="flex w-full items-center space-x-2 hover:bg-nav rounded p-1">
                    <UserGroupIcon className="h-4 w-4" />
                    <Link href={`/${space.id}`}>
                      <span className="text-gray-300 hover:text-white text-sm">{space.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </>
        )}
        {isProject ? <PlusCircleIcon className="w-4 h-4" /> : <CreateWorkspace />}
      </div>
    </aside>
  );
};

export default Sidebar;
