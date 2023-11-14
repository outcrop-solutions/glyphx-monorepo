'use client';
import {Route} from 'next';
import {useParams, useRouter} from 'next/navigation';
import React from 'react';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {drawerOpenAtom, projectAtom} from 'state';
import BackBtnIcon from 'public/svg/back-button-icon.svg';

export const BackBtn = () => {
  const router = useRouter();
  const [project, setProject] = useRecoilState(projectAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};

  const backPressed = () => {
    // console.log({project});
    router.push(`/${project.workspace.id}` as Route);
    setDrawer(false);
    window?.core?.ToggleDrawer(false);
    setProject(null);
  };

  return (
    <button
      onClick={backPressed}
      className="flex items-center justify-center rounded-lg border border-transparent ml-4 pr-4 pl-2 pt-1 pb-1 hover:border-white"
    >
      <BackBtnIcon />
      <span className="text-light-gray font-roboto font-medium text-[14px] leading-[16px] text-center ml-2">Back</span>
    </button>
  );
};
