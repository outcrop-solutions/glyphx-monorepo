'use client';
import {Route} from 'next';
import {useRouter} from 'next/navigation';
import React from 'react';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {cameraAtom, drawerOpenAtom, imageHashAtom, modelRunnerAtom, projectAtom} from 'state';
import BackBtnIcon from 'svg/back-button-icon.svg';

export const BackBtn = () => {
  const router = useRouter();
  const [project, setProject] = useRecoilState(projectAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);
  // const setModelRunner = useSetRecoilState(modelRunnerAtom);

  const backPressed = () => {
    router.push(`/workspace/${project?.workspace.id}` as Route);
    setDrawer(false);
    setProject(null);
    setImageHash({
      imageHash: false,
    });
    setCamera({});
    // setModelRunner(null);
  };

  return (
    project?.workspace?.id && (
      <button
        onClick={backPressed}
        className="flex items-center justify-center rounded-lg border border-transparent ml-4 pr-4 pl-2 pt-1 pb-1 hover:border-white bg-transparent"
      >
        <BackBtnIcon className="bg-transparent" />
        <span className="text-light-gray font-roboto font-medium text-[14px] leading-[16px] text-center ml-2">
          Back
        </span>
      </button>
    )
  );
};
