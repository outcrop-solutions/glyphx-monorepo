'use client';
import React, {useEffect, useState} from 'react';
import Button from 'app/_components/Button';
import {useSWRConfig} from 'swr';
import {databaseTypes, webTypes} from 'types';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {cameraAtom, imageHashAtom, modalsAtom, projectAtom, rowIdsAtom, viewerPositionSelector} from 'state';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {createState} from 'actions';

export const CreateStateModal = ({modalContent}: webTypes.CreateStateModalProps) => {
  const {mutate} = useSWRConfig();
  const setModals = useSetRecoilState(modalsAtom);
  const [camera, setCamera] = useRecoilState(cameraAtom);
  const rowIds = useRecoilValue(rowIdsAtom);
  const [image, setImage] = useRecoilState(imageHashAtom);
  const setProject = useSetRecoilState(projectAtom);
  const viewerPosition = useRecoilValue(viewerPositionSelector);
  const [name, setName] = useState('');
  const validName = name.length > 0 && name.length <= 16;

  // local state
  const handleNameChange = (event) => setName(event.target.value);

  // mutations
  const createStateTrigger = async (event) => {
    event.preventDefault();
    if (window?.core) {
      window?.core?.GetCameraPosition(true);
      window?.core?.TakeScreenShot('');
    }
  };

  useEffect(() => {
    if (Object.keys(camera).length > 0 && image.imageHash) {
      const cleanProject = {
        id: modalContent.data.id,
        workspace: {
          id: modalContent.data.workspace.id,
        },
        state: {
          properties: {
            ...modalContent.data.state.properties,
          },
        },
        files: modalContent.data.files,
      };
      const rows = (rowIds ? rowIds : []) as unknown as number[];
      createState(
        name,
        camera as unknown as webTypes.Camera,
        cleanProject as databaseTypes.IProject,
        image.imageHash,
        {
          width: (viewerPosition as webTypes.IViewerPosition).w,
          height: (viewerPosition as webTypes.IViewerPosition).h,
        } as unknown as webTypes.Aspect,
        rows
      );
    }
  }, [
    camera,
    modalContent.data.id,
    name,
    setCamera,
    setModals,
    setProject,
    mutate,
    image,
    setImage,
    viewerPosition,
    rowIds,
  ]);

  return (
    <div className="flex flex-col items-stretch justify-center px-4 py-8 space-y-5 bg-secondary-midnight rounded-md text-white">
      <div className="space-y-0 text-sm text-gray-600">
        <p>Create a state snapshot to show your teammates what you have discovered</p>
        <p>You&apos;ll be able to invite everyone later!</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold">State Name</h3>
        <p className="text-sm text-gray-400">Name your state. Keep it simple.</p>
        <input
          className="w-full px-3 py-2 border rounded bg-transparent"
          disabled={modalContent.isSubmitting}
          onChange={handleNameChange}
          type="text"
          value={name}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="" disabled={!validName || modalContent.isSubmitting} onClick={createStateTrigger}>
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Take State Snapshot</span>}
        </Button>
      </div>
    </div>
  );
};
