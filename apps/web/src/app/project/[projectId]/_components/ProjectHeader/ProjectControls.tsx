'use client';
import React, {useTransition, useState} from 'react';
import {BackBtn} from './BackBtn';
import {projectAtom} from 'state';
import {useRecoilValue} from 'recoil';
import {updateProjectName} from 'actions';

export const ProjectControls = () => {
  const project = useRecoilValue(projectAtom);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(project?.name);
  return (
    <div
      onKeyDown={async (ev) => {
        if (ev.key === 'Enter') {
          startTransition(async () => {
            await updateProjectName(project.id, name);
          });
        }
      }}
      className="flex items-center py-2"
    >
      <BackBtn />
      <input
        onChange={(e) => setName(e.target.value)}
        className="p-1 m-2 text-white font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] flex text-left outline-none border-2 border-transparent rounded-lg pr-2 bg-transparent hover:border-yellow"
        defaultValue={project?.name}
      />
    </div>
  );
};
