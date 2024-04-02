'use client';
import React from 'react';
import StateIcon from 'svg/state.svg';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {CameraIcon} from '@heroicons/react/outline';

export const maxDuration = 300;

export const CreateStateInput = ({isSubmitting, name, setName}) => {
  const validName = name?.length > 0 && name?.length <= 75;
  // local state
  const handleNameChange = (event) => setName(event.target.value);

  // mutations
  const createState = async (event) => {
    event.preventDefault();
    if (window?.core) {
      window?.core?.GetCameraPosition(true);
      window?.core?.TakeScreenShot('');
    }
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
        onClick={createState}
      >
        {isSubmitting ? (
          <div className="h-4 w-4 flex items-center justify-center">
            <LoadingDots />
          </div>
        ) : (
          <CameraIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};
