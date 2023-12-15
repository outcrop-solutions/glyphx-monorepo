'use client';
import React, {SetStateAction, useEffect, useState} from 'react';
import {ThresholdList} from './ThresholdList';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {projectAtom} from 'state/project';
import {PlusIcon} from '@heroicons/react/outline';
import {_createState, api} from 'lib';
import {CreateThresholdInput} from './CreateThresholdInput';
import {cameraAtom, imageHashAtom, viewerPositionSelector} from 'state';
import {useSWRConfig} from 'swr';
import {webTypes} from 'types';

export const Thresholds = () => {
  const {mutate} = useSWRConfig();
  const project = useRecoilValue(projectAtom);
  const [isCollapsed, setCollapsed] = useState(false);
  const [addThreshold, setAddThreshold] = useState(false);
  const [camera, setCamera] = useRecoilState(cameraAtom);
  const [image, setImage] = useRecoilState(imageHashAtom);
  const setProject = useSetRecoilState(projectAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('New Threshold');
  const viewerPosition = useRecoilValue(viewerPositionSelector);

  useEffect(() => {
    if (Object.keys(camera).length > 0 && image.imageHash) {
      api({
        ..._createState(
          name,
          project.id as unknown as string,
          camera as unknown as webTypes.Camera,
          {
            width: (viewerPosition as webTypes.IViewerPosition).w || 300,
            height: (viewerPosition as webTypes.IViewerPosition).h || 200,
          },
          image.imageHash
        ),
        setLoading: (state) => setIsSubmitting(state as SetStateAction<boolean>),
        onError: () => {
          setCamera({});
          setImage({imageHash: false});
          setAddThreshold(false);
        },
        onSuccess: () => {
          setCamera({});
          setImage({imageHash: false});
          setAddThreshold(false);
          // TODO: revalidate project cache
          // mutate(`/api/project/${project.id}`);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, name, setCamera, setProject, mutate, image, setImage, project?.id, setAddThreshold]);

  const createThreshold = () => setAddThreshold(true);

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
              Thresholds{' '}
            </span>
          </div>
        </div>
        <PlusIcon
          color="#CECECE"
          className="w-5 h-5 opacity-100 mr-2 bg-secondary-space-blue border-2 border-transparent rounded-full hover:border-white"
          onClick={createThreshold}
        />
      </summary>
      {!isCollapsed && <ThresholdList />}
      {addThreshold && <CreateThresholdInput isSubmitting={isSubmitting} name={name} setName={setName} />}
    </div>
  );
};
