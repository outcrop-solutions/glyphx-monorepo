'use client';
import React, {useCallback} from 'react';
import {Route} from 'next';
import {useRouter, useParams} from 'next/navigation';
import Image from 'next/image';
import produce from 'immer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {useSetRecoilState} from 'recoil';
import {modalsAtom, projectSegmentAtom, rightSidebarControlAtom} from 'state';
import {webTypes} from 'types';
// icons
import {ProjectTemplateIcons} from '../../../../project/[projectId]/_components/ProjectSidebar/_components/icons';
import AddMemberIcon from 'svg/add-member-icon.svg';
import ProjectInfoIcon from 'svg/project-info-icon.svg';
import DeleteProjectIcon from 'svg/delete-project-icon.svg';
import {WritableDraft} from 'immer/dist/internal';
import Link from 'next/link';

export const ProjectCard = ({project}) => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const params = useParams();
  const setTab = useSetRecoilState(projectSegmentAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const setModals = useSetRecoilState(modalsAtom);

  const navigate = () => {
    router.replace(`/project/${project.id}` as Route);
    setTab('FILES');
  };

  const deleteProject = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_PROJECT,
          isSubmitting: false,
          data: {projectId: project.id, projectName: project.name},
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

  const imageHash = () => {
    if (project?.imageHash?.includes('https://')) {
      return project.imageHash;
    }
    if (project.imageHash) {
      return `data:image/png;base64,${project.imageHash}`;
    }
    return '/images/project.png';
  };

  return (
    <div className="group aspect-w-4 min-w-44 min-h-[200px] border border-gray aspect-h-4 relative col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-md bg-primary-dark-blue hover:cursor-pointer">
      <div className="absolute top-0 right-0 bg-primary-dark-blue p-2 rounded-md z-50 w-10 h-24">
        <div className="flex flex-col items-center justify-between">
          <AddMemberIcon onClick={() => handleControl(webTypes.constants.RIGHT_SIDEBAR_CONTROL.SHARE, project)} />
          <ProjectInfoIcon onClick={() => handleControl(webTypes.constants.RIGHT_SIDEBAR_CONTROL.INFO, project)} />
          <DeleteProjectIcon onClick={deleteProject} />
        </div>
      </div>
      <Link href={`/project/${project.id}`} className="flex flex-col h-full justify-between rounded-md">
        <div className="rounded-t-md overflow-hidden h-5/6">
          <Image
            width={project?.aspectRatio?.width || 300}
            height={project?.aspectRatio?.height || 200}
            className="object-cover h-full w-full rounded-md"
            src={imageHash()}
            alt=""
          />
        </div>
        <footer className="flex flex-col w-full space-y-2 rounded-b justify-between px-4 py-3 z-30 bg-primary-dark-blue">
          <div className="flex items-center justify-between w-full">
            <p className="font-roboto font-medium truncate ellipsis text-sm leading-[16px] text-light-gray">
              {project.name}
            </p>
            <div>
              <ProjectTemplateIcons project={project} />
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="font-roboto font-medium text-sm w-20 leading-[16px] text-light-gray whitespace-nowrap">
              {project?.members[0]?.email?.split('@')[0]}
            </p>
            <div className="bg-yellow px-2 py-1 rounded">
              <p className="font-roboto truncate font-medium text-sm leading-[16px] text-right text-white">
                {'shared'.toUpperCase()}
              </p>
            </div>
          </div>
        </footer>
      </Link>
    </div>
  );
};
