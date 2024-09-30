'use client';
import React, {useState} from 'react';
import StateIcon from 'svg/state.svg';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {CameraIcon} from '@heroicons/react/outline';
import {useRecoilState, useRecoilValue} from 'recoil';
import {modelRunnerAtom, projectAtom, rowIdsAtom} from 'state';
import {createState} from 'actions';
import useApplyState from 'services/useApplyState';
import {stateSnapshot} from '../../../Model/utils';

export const maxDuration = 300;

export const CreateStateInput = ({name, setName, setAddState}) => {
  const validName = name?.length > 0 && name?.length <= 75;
  const rowIds = useRecoilValue(rowIdsAtom);
  const project = useRecoilValue(projectAtom);
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const {applyState} = useApplyState();

  // local state
  const handleNameChange = (event) => setName(event.target.value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // mutations
  const createStateHandler = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const canvas = document.getElementById('glyphx-cube-model');
      if (canvas) {
        const aspect = {
          width: canvas?.clientWidth,
          height: canvas?.clientHeight,
        };

        const image = stateSnapshot();
        const camera = JSON.parse(modelRunnerState.modelRunner.get_camera_data());

        if (image) {
          const rows = (rowIds ? rowIds : []) as unknown as number[];
          const retval = await createState(name, camera, project, image, aspect, rows);

          if (retval?.state) {
            applyState(retval?.state);
            setName('Initial State');
            setIsSubmitting(false);
            setAddState(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    // TODO: add state creation logic here now that we don't need the useSocket loop of death
  };

  return (
    <div className="flex justify-between items-center bg-secondary-midnight rounded-md text-white p-2">
      <div className="flex items-center justify-center h-6 w-6">
        <StateIcon className="" />
      </div>
      <input
        autoFocus
        className="w-full text-left mx-2 pl-2 text-light-gray text-sm bg-transparent"
        onChange={handleNameChange}
        type="text"
        value={name}
      />
      <button
        className="flex items-center bg-primary-yellow text-secondary-space-blue justify-around p-1 rounded disabled:opacity-75"
        disabled={!validName || isSubmitting}
        onClick={createStateHandler}
      >
        {isSubmitting ? (
          <LoadingDots className="h-4 w-4 flex items-center justify-center" />
        ) : (
          <CameraIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};
