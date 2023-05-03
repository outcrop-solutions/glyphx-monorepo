import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import produce from 'immer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useSetRecoilState } from 'recoil';

import { web as webTypes } from '@glyphx/types';
import { _deleteProject } from 'lib/client';
import { ProjectTypeIcons } from '../icons';

import { modalsAtom } from 'state';

import projectCard from 'public/images/project.png';
import AddMemberIcon from 'public/svg/add-member-icon.svg';
import ProjectInfoIcon from 'public/svg/project-info-icon.svg';
import DeleteProjectIcon from 'public/svg/delete-project-icon.svg';
import { rightSidebarControlAtom } from 'state';
import { WritableDraft } from 'immer/dist/internal';

export const ProjectCard = ({ idx, project }) => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const setModals = useSetRecoilState(modalsAtom);

  const navigate = (slug) => {
    router.push(`/account/${slug}/${project._id}`);
  };

  const deleteProject = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_PROJECT,
          isSubmitting: false,
          data: { projectId: project._id, projectName: project.name },
        });
      })
    );
  }, [project, setModals]);

  const handleControl = (ctrl: webTypes.constants.RIGHT_SIDEBAR_CONTROL, data) => {
    setRightSidebarControl(
      produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
        draft.type = ctrl;
        draft.data = data;
      })
    );
  };

  return (
    <div className="group aspect-w-4 min-w-56 min-h-[200px] border border-gray aspect-h-4 relative col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-md bg-secondary-space-blue hover:cursor-pointer">
      <div className="absolute top-0 right-0 bg-primary-dark-blue p-2 rounded-md z-50 w-10 h-24">
        <div className="flex flex-col items-center justify-between">
          {/* add member */}
          <AddMemberIcon onClick={() => handleControl(webTypes.constants.RIGHT_SIDEBAR_CONTROL.SHARE, project)} />
          {/* info button */}
          <ProjectInfoIcon onClick={() => handleControl(webTypes.constants.RIGHT_SIDEBAR_CONTROL.INFO, project)} />
          {/* delete button */}
          <DeleteProjectIcon onClick={deleteProject} />
        </div>
      </div>
      <div onClick={() => navigate(workspaceSlug)} className="flex flex-col h-full justify-between rounded-md">
        <Image className="rounded-t-md h-5/6" layout="responsive" src={projectCard} alt="" />
        <footer className="flex flex-col w-full space-y-2 rounded-md justify-between px-4 py-3">
          <div className="flex items-center justify-between w-full">
            <p className="font-roboto font-medium truncate ellipsis text-sm leading-[16px] text-light-gray">
              {project.name}
            </p>
            <div>
              <ProjectTypeIcons project={project} />
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="font-roboto font-medium text-sm w-20 leading-[16px] text-light-gray whitespace-nowrap">
              {project.owner.name}
            </p>
            <div className="bg-yellow px-2 py-1 rounded">
              <p className="font-roboto truncate font-medium text-sm leading-[16px] text-right text-white">
                {'shared'.toUpperCase()}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
