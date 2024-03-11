'use client';
import React, {useEffect, useState} from 'react';
import {StateList} from './StateList';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {projectAtom, rowIdsAtom} from 'state/project';
import {PlusIcon} from '@heroicons/react/outline';
import {CreateStateInput} from './CreateStateInput';
import {cameraAtom, imageHashAtom, viewerPositionSelector} from 'state';
import {useSWRConfig} from 'swr';
import {webTypes} from 'types';
import useApplyState from 'services/useApplyState';
import {createState} from 'actions';

export const States = () => {
  const {mutate} = useSWRConfig();
  const project = useRecoilValue(projectAtom);
  const rowIds = useRecoilValue(rowIdsAtom);
  const [isCollapsed, setCollapsed] = useState(false);
  const [addState, setAddState] = useState(false);
  const [camera, setCamera] = useRecoilState(cameraAtom);
  const [image, setImage] = useRecoilState(imageHashAtom);
  const setProject = useSetRecoilState(projectAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('Initial State');
  const viewerPosition = useRecoilValue(viewerPositionSelector);
  const {applyState} = useApplyState();

  const callCreateState = async (camera, image, project) => {
    if (Object.keys(camera).length > 0 && image.imageHash) {
      setIsSubmitting(true);
      const aspect = {
        width: (viewerPosition as webTypes.IViewerPosition).w || 300,
        height: (viewerPosition as webTypes.IViewerPosition).h || 200,
      };
      const rows = (rowIds ? rowIds : []) as unknown as number[];
      const newProject = await createState(name, camera as webTypes.Camera, project, image.imageHash, aspect, rows);
      console.log({newProject, project, rows, viewerPosition});

      if (newProject) {
        // @ts-ignore
        const filteredStates = newProject.stateHistory?.filter((state) => !state.deletedAt);
        const idx = filteredStates.length;

        console.log({filteredStates, idx});

        applyState(idx, newProject);
        setName('Initial State');
        setIsSubmitting(false);
        setAddState(false);
      }
    }
  };

  useEffect(() => {
    console.log('within effect', project);
    callCreateState(camera, image, project);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, setCamera, setProject, mutate, image, setImage, project?.id, setAddState]);

  return (
    <div className="group flex flex-col grow">
      <summary className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:text-white hover:border-b-white hover:bg-secondary-midnight truncate border-b border-gray z-10">
        <div
          onClick={() => {
            setCollapsed(!isCollapsed);
          }}
          className="flex ml-2 items-center"
        >
          <span className="">
            <svg
              className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill="#CECECE"
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div>
            <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
              {' '}
              States{' '}
            </span>
          </div>
        </div>
        <PlusIcon
          color="#CECECE"
          className="w-5 h-5 opacity-100 mr-2 bg-secondary-space-blue border-2 border-transparent rounded-full hover:border-white"
          onClick={() => setAddState(true)}
        />
      </summary>
      {!isCollapsed && <StateList />}
      {addState && <CreateStateInput isSubmitting={isSubmitting} name={name} setName={setName} />}
    </div>
  );
};
