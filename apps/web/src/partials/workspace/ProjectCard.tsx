import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SharedTag from 'public/svg/shared-tag.svg';
import { _deleteProject, api } from 'lib/client';
import { ProjectTypeIcons } from '../icons';

import projectCard from 'public/images/project.png';
import AddMemberIcon from 'public/svg/add-member-icon.svg';
import ProjectInfoIcon from 'public/svg/project-info-icon.svg';
import DeleteProjectIcon from 'public/svg/delete-project-icon.svg';

export const ProjectCard = ({ idx, project }) => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const navigate = (slug) => {
    router.push(`/account/${slug}/${project._id}`);
  };

  const deleteProject = (key) => {
    api({
      ..._deleteProject(key),
    });
  };

  return (
    <div className="group aspect-w-4 border border-gray aspect-h-4 relative col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-md bg-secondary-space-blue hover:cursor-pointer">
      <div className="absolute top-0 right-0 group-hover:flex bg-primary-dark-blue items-center justify-between p-2 rounded-md rounded-tl-none rounded-br-none">
        {/* add member */}
        <AddMemberIcon />
        {/* info button */}
        <ProjectInfoIcon />
        {/* delete button */}
        <DeleteProjectIcon onClick={deleteProject} />
      </div>
      <div onClick={() => navigate(workspaceSlug)} className="flex flex-col h-full justify-between rounded-md">
        <Image className="rounded-t-md h-5/6" layout="responsive" src={projectCard} alt="" />
        <footer className="flex flex-col w-full space-y-2 justify-between px-4 py-3">
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
              <p className="font-roboto font-medium text-sm leading-[16px] text-right text-white">
                {'shared'.toUpperCase()}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
