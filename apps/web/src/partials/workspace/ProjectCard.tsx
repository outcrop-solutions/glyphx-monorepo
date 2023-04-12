import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

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
    <div className="group relative col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-lg bg-secondary-space-blue hover:cursor-pointer">
      <div className="absolute top-0 left-0 z-60">
        <ProjectTypeIcons project={project} />
      </div>
      <div className="absolute top-0 right-0 group-hover:flex bg-primary-dark-blue items-center justify-between p-2 rounded-md rounded-tl-none rounded-br-none">
        {/* add member */}
        <AddMemberIcon />
        {/* info button */}
        <ProjectInfoIcon />
        {/* delete button */}
        <DeleteProjectIcon onClick={deleteProject} />
      </div>
      <div onClick={() => navigate(workspaceSlug)} className="flex flex-col h-full">
        <Image className="rounded-t-md" layout="responsive" src={projectCard} alt="" />
        <footer className="mt-2 px-5 pb-5 pt-1">
          <p className="font-roboto font-medium text-sm leading-[16px] text-light-gray mb-2 h-9">{project.name}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex shrink-0 -space-x-3 -ml-px mr-2">
                {project.shared && project.shared.length > 0 ? (
                  <>
                    {project.shared.map((member, idx) => {
                      if (idx < 3) {
                        return (
                          <div
                            key={`${member}-${idx}`}
                            className={`rounded-full ${
                              idx % 2 === 0 ? 'bg-blue' : 'bg-primary-yellow'
                            } h-6 w-6 text-sm text-white flex items-center justify-center`}
                          >
                            {`${member.split('@')[0][0]?.toUpperCase()}`}
                          </div>
                        );
                      }
                    })}
                  </>
                ) : (
                  <div
                    className={`rounded-full ${
                      idx % 2 === 0 ? 'bg-cyan' : 'bg-primary-yellow'
                    } h-6 w-6 font-roboto font-medium text-[12px] leading-[14px] tracking-[0.01em] text-white flex items-center justify-center`}
                  >
                    {project.author ? `${project.author[0].toUpperCase()}` : ''}
                  </div>
                )}
              </div>
              {project.shared && project.shared.length > 4 ? (
                <div className="text-xs">{`+ ${project.shared.length - 3} more`}</div>
              ) : null}
            </div>
            <div>
              <p className="font-roboto font-medium text-sm text-gray leading-[16px] text-right">
                {dayjs().to(dayjs(project.updatedAt))}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
