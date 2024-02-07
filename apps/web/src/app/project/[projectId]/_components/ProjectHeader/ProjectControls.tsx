'use client';
import React from 'react';
import {BackBtn} from './BackBtn';
import {projectAtom} from 'state';
import {useRecoilValue} from 'recoil';

export const ProjectControls = () => {
  const project = useRecoilValue(projectAtom);
  return (
    <div className="flex items-center py-2">
      <BackBtn />
      <input
        className="p-1 m-2 text-white font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] flex text-left outline-none border-2 border-transparent rounded-lg pr-2 bg-transparent hover:border-yellow"
        defaultValue={project?.name}
      />
    </div>
  );
};
