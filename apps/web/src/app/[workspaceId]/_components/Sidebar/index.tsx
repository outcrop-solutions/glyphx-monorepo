'use client';

// components
import sidebarMenu from 'config/menu/sidebar-static';
// hooks
import {drawerOpenAtom} from 'state';
import {useSetRecoilState} from 'recoil';
import {useParams} from 'next/navigation';
import {Logo} from './Logo';
import {MenuBtn} from './MenuBtn';

const staticMenu = sidebarMenu();

const Sidebar = ({isProject}) => {
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
        <Logo isProject={isProject} />
        <MenuBtn isProject={isProject} />
      </div>
      <div
        className={
          'flex-col space-y-5 md:flex md:top-0 absolute top-12 bg-primary-dark-blue right-0 left-0 h-screen hidden md:relative'
        }
      >
        {isProject && <div></div>}
        <div className={`flex flex-col ${projectId ? 'items-center space-y-2' : 'p-5 space-y-10'}`}></div>
      </div>
    </aside>
  );
};

export default Sidebar;
