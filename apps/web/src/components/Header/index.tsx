import { useRouter } from 'next/router';
import { projectAtom } from 'state';
import { useRecoilState } from 'recoil';

import { Controls } from 'partials/layout/controls';

import BackBtnIcon from 'public/svg/back-button-icon.svg';

const Header = ({ breadcrumbs }) => {
  const [project, setProject] = useRecoilState(projectAtom);

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const backPressed = () => {
    router.push(`/account/${project.workspace.slug}`);
    setProject(null);
  };

  return (
    <div
      className={`flex flex-row h-14 items-center pr-4 justify-between ${
        project ? 'bg-secondary-space-blue border border-gray' : 'bg-transparent'
      }`}
    >
      {project ? (
        <div className="flex items-center">
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
        <div className={`${workspaceSlug ? 'pl-8' : ''}`}>
          <p className="font-rubik font-normal text-white text-[22px] leading-[26px] tracking-[0.01em]">
            {breadcrumbs.map((crumb) => crumb)}
          </p>
        </div>
      )}
      <Controls />
    </div>
  );
};

export default Header;
