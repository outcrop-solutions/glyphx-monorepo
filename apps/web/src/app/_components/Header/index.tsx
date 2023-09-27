'use client';
import {useRouter, useParams, usePathname} from 'next/navigation';
import {drawerOpenAtom, projectAtom} from 'state';
import {useRecoilValue, useSetRecoilState} from 'recoil';

import {Controls} from 'app/[workspaceId]/_components/controls';

import BackBtnIcon from 'public/svg/back-button-icon.svg';
import {Route} from 'next';
import {useWorkspace} from 'lib';

const Header = () => {
  const project = useRecoilValue(projectAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const {data} = useWorkspace();

  const router = useRouter();
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const pathname = usePathname();

  const backPressed = () => {
    router.push(`/${data.workspace.id}` as Route);
    setDrawer(false);
    window?.core?.ToggleDrawer(false);
    setProject(null);
  };

  return (
    <div
      className={`flex flex-row h-[56px] sticky z-60 top-0 items-center bg-secondary-midnight justify-between pr-4 ${
        workspaceId && !pathname?.includes('settings') && !project && 'pl-8 pt-2 bg-primary-dark-blue'
      } ${project ? 'border border-gray bg-secondary-space-blue' : 'md:pt-0'}`}
    >
      {project ? (
        <div className="flex items-center py-2">
          <button
            onClick={backPressed}
            className="flex items-center justify-center rounded-lg border border-transparent ml-4 pr-4 pl-2 pt-1 pb-1 hover:border-white"
          >
            <BackBtnIcon />
            <span className="text-light-gray font-roboto font-medium text-[14px] leading-[16px] text-center ml-2">
              Back
            </span>
          </button>
          <input
            className="p-1 m-2 text-white font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] flex text-left outline-none border-2 border-transparent rounded-lg pr-2 bg-transparent hover:border-yellow"
            defaultValue={project?.name}
          />
        </div>
      ) : (
        <div className={`${workspaceId && !pathname!.includes('settings') ? (workspaceId ? 'pl-0 py-3' : '') : ''}`}>
          <p className="font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] text-white">
            {data && !pathname!.includes('settings') ? `${data?.workspace?.slug} > Recents` : 'Account Dashboard'}
          </p>
        </div>
      )}
      <Controls />
    </div>
  );
};

export default Header;
