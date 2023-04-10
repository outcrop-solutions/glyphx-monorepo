import { useState } from 'react';
import Link from 'next/link';
import { MenuIcon } from '@heroicons/react/outline';

// components
import Actions from './actions';
import Menu from './menu';
import sidebarMenu from 'config/menu/sidebar-static';

import FullLogo from 'public/svg/full-logo.svg';

// hooks
import { useWorkspace, useWorkspaces } from 'lib/client';

const staticMenu = sidebarMenu();

const Sidebar = ({ menu }) => {
  const [showMenu, setMenuVisibility] = useState(false);
  const { data, isLoading } = useWorkspaces();
  const { data: workspace } = useWorkspace();

  const renderMenu = () => {
    return (
      workspace &&
      menu.map((item, index) => (
        <Menu key={index} data={item} isLoading={isLoading} showMenu={data?.workspaces?.length > 0 || isLoading} />
      ))
    );
  };

  const renderStaticMenu = () => {
    return staticMenu.map((item, index) => <Menu key={index} data={item} showMenu={true} />);
  };

  const toggleMenu = () => setMenuVisibility(!showMenu);

  return (
    <aside className="sticky z-40 flex flex-col space-y-2 text-white bg-secondary-deep-blue md:overflow-y-auto md:w-1/8 md:h-screen overscroll-contain">
      <div className="relative flex items-center justify-center py-4 px-2 mx-8 text-center border-b border-b-gray">
        <Link href="/account">
          <FullLogo />
        </Link>
        <button className="absolute right-0 p-5 md:hidden" onClick={toggleMenu}>
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
      <div
        className={[
          'flex-col space-y-5 md:flex md:relative md:top-0',
          showMenu ? 'absolute top-12 bg-primary-dark-blue right-0 left-0 h-screen' : 'hidden',
        ].join(' ')}
      >
        <Actions />
        <div className="flex flex-col p-5 space-y-10">
          {renderStaticMenu()}
          {renderMenu()}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
