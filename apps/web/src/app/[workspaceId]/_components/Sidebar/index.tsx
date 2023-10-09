'use client';
import {useState} from 'react';
import Link from 'next/link';
import {MenuIcon} from '@heroicons/react/outline';

// components
import sidebarMenu from 'config/menu/sidebar-static';
// hooks
import {useWorkspace, useWorkspaces} from 'lib/client';
import {drawerOpenAtom} from 'state';
import {useSetRecoilState} from 'recoil';
import {useParams} from 'next/navigation';
import menu from 'config/menu';

const staticMenu = sidebarMenu();

const Sidebar = () => {
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const {projectId} = params as {projectId: string};

  return (
    <aside
      className={`sticky z-40 flex flex-col space-y-2 text-white bg-secondary-deep-blue ${
        projectId ? '' : 'md:w-[250px] overscroll-contain md:overflow-y-auto'
      } md:h-screen`}
    >
      <div
        className={`relative flex items-center justify-center py-3 px-2 md:mx-8 text-center border-b ${
          projectId && 'border-b-gray'
        }`}
      >
        <Link href="/account">
          <div
            onClick={() => {
              setDrawer(false);
              window?.core?.ToggleDrawer(false);
            }}
            className="py-1"
          >
            {projectId ? <SmallLogo /> : <FullLogo />}
          </div>
        </Link>
        {!isProject && (
          <button className="absolute right-0 p-5 md:hidden" onClick={toggleMenu}>
            <MenuIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      <div
        className={[
          'flex-col space-y-5 md:flex md:relative md:top-0',
          showMenu ? 'absolute top-12 bg-primary-dark-blue right-0 left-0 h-screen' : 'hidden',
        ].join(' ')}
      >
        {!projectId && <Actions />}
        <div className={`flex flex-col ${projectId ? 'items-center space-y-2' : 'p-5 space-y-10'}`}>
          {renderStaticMenu()}
          {renderMenu()}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
