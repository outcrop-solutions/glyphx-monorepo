'use client';
import Link from 'next/link';
import {useParams, usePathname} from 'next/navigation';
import {CubeIcon, FolderIcon, TableIcon, UserGroupIcon} from '@heroicons/react/outline';
import {Logo} from './Logo';
import {CreateWorkspace} from 'app/[workspaceId]/_components/controls/CreateWorkspace';

const Sidebar = ({workspaces}) => {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const pathname = usePathname();
  return (
    <aside
      className={`sticky z-40 flex flex-col px-4 space-y-2 border-r border-gray text-white bg-secondary-deep-blue md:w-[250px] overscroll-contain md:overflow-y-auto md:h-screen`}
    >
      <div className="relative flex items-center py-3 text-center border-b border-b-gray">
        <Logo />
      </div>
      <div
        className={
          'flex-col space-y-1 md:flex md:top-0 absolute top-12 bg-secondary-deep-blue right-0 left-0 h-screen hidden md:relative'
        }
      >
        <div className="flex-col space-y-1 md:flex border-b border-white pb-2">
          <Link href={`/${workspaceId}/templates`}>
            <div
              className={`flex items-center space-x-2 hover:bg-nav ${
                pathname?.includes('templates') && 'bg-nav'
              } cursor-pointer p-1 rounded-sm`}
            >
              <CubeIcon className="h-4 w-4" />
              <div className="text-gray-300 hover:text-white text-sm">Templates</div>
            </div>
          </Link>
          <Link href={`/${workspaceId}/data`}>
            <div
              className={`flex items-center space-x-2 hover:bg-nav ${
                pathname?.includes('data') && 'bg-nav'
              } cursor-pointer p-1 rounded-sm`}
            >
              <TableIcon className="h-4 w-4" />
              <div className="text-gray-300 hover:text-white text-sm">Data</div>
            </div>
          </Link>
          <Link href={`/${workspaceId}`}>
            <div
              className={`flex items-center space-x-2 hover:bg-nav ${
                !pathname?.includes('templates') && !pathname?.includes('data') && 'bg-nav'
              } cursor-pointer p-1 rounded-sm`}
            >
              <FolderIcon className="h-4 w-4" />
              <div className="text-gray-300 hover:text-white text-sm">Projects</div>
            </div>
          </Link>
        </div>
        <ul className={`flex flex-col items-center space-y-2 pt-2 overflow-y-auto h-96`}>
          {workspaces &&
            workspaces.map((space) => (
              <li
                key={space.id}
                className={`flex w-full items-center space-x-2 hover:bg-nav ${
                  workspaceId === space.id && 'bg-nav'
                } rounded p-1`}
              >
                <UserGroupIcon className="h-4 w-4" />
                <Link href={`/${space.id}`}>
                  <span className="text-gray-300 hover:text-white text-sm">{space.name}</span>
                </Link>
              </li>
            ))}
        </ul>
        <CreateWorkspace />
      </div>
    </aside>
  );
};

export default Sidebar;
