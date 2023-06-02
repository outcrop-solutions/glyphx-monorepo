import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import { useSWRConfig } from 'swr';
import StateIcon from 'public/svg/state.svg';
import { _createState, api } from 'lib';
import { web as webTypes } from '@glyphx/types';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { cameraAtom, imageHashAtom, modalsAtom, projectAtom } from 'state';
import { LoadingDots } from 'partials/loaders/LoadingDots';
import { CameraIcon, SaveIcon } from '@heroicons/react/outline';

export const CreateStateInput = ({ setAddState, project }) => {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [camera, setCamera] = useRecoilState(cameraAtom);
  const [image, setImage] = useRecoilState(imageHashAtom);
  const setProject = useSetRecoilState(projectAtom);
  const [name, setName] = useState('New State');
  const validName = name.length > 0 && name.length <= 16;

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

  useEffect(() => {
    console.log({ camera, image });
    if (Object.keys(camera).length > 0 && image.imageHash) {
      api({
        ..._createState(name, project._id as unknown as string, camera as unknown as webTypes.Camera, image.imageHash),
        setLoading: (state) => setIsSubmitting(state),
        onError: (_: any) => {
          setCamera({});
          setImage({ imageHash: false });
          setAddState(false);
        },
        onSuccess: (data: any) => {
          setCamera({});
          setImage({ imageHash: false });
          setAddState(false);
          mutate(`/api/project/${project._id}`);
        },
      });
    }
  }, [camera, name, setCamera, setProject, mutate, image, setImage, project._id, setAddState]);

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
        {isSubmitting ? <LoadingDots /> : <CameraIcon className="h-4 w-4" />}
      </button>
    </div>
  );
};
