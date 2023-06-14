import { useRouter } from 'next/router';
import { drawerOpenAtom, projectAtom } from 'state';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';

import { Controls } from 'partials/layout/controls';

import BackBtnIcon from 'public/svg/back-button-icon.svg';

const Header = () => {
  const project = useRecoilValue(projectAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const backPressed = () => {
    router.push(`/account/${project.workspace.slug}`);
    setDrawer(false);
    window?.core?.ToggleDrawer(false);
    setProject(null);
  };

  return (
    <div
      className={`flex flex-row h-[56px] sticky z-60 top-0 items-center bg-secondary-midnight justify-between pr-4 ${
        workspaceSlug && !router.pathname.includes('settings') && !project && 'pl-8 pt-2 bg-primary-dark-blue'
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
            // onChange={updateProjectName}
          />
        </div>
      ) : (
        <div
          className={`${
            workspaceSlug && !router.pathname.includes('settings') ? (workspaceSlug ? 'pl-0 py-3' : '') : ''
          }`}
        >
          <p className="font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] text-white">
            {workspaceSlug && !router.pathname.includes('settings')
              ? `${workspaceSlug} > Recents`
              : 'Account Dashboard'}
          </p>
        </div>
      )}
      <Controls />
    </div>
  );
};

export default Header;
