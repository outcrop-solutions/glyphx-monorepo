'use client';
import React, {useCallback} from 'react';
import StateIcon from 'svg/state.svg';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {CameraIcon} from '@heroicons/react/outline';
import {useRecoilState, useRecoilValue} from 'recoil';
import {activeStateNameAtom, isSubmittingAtom, modelRunnerAtom} from 'state';

export const maxDuration = 300;

export const CreateStateInput = () => {
  const [name, setName] = useRecoilState(activeStateNameAtom);
  const [isSubmitting, setIsSubmitting] = useRecoilState(isSubmittingAtom);

  const validName = name?.length > 0 && name?.length <= 75;
  const modelRunner = useRecoilValue(modelRunnerAtom);

  // local state
  const handleNameChange = useCallback((event) => setName(event.target.value), [setName]);

  // mutations
  const createStateHandler = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        // this is flipped back to false in provider.tsx on line 170
        setIsSubmitting(true);
        modelRunner.take_screenshot(true);
      } catch (error) {
        console.log(error);
      }
    },
    [modelRunner, setIsSubmitting]
  );

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
