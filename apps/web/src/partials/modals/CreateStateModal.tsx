import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import { useSWRConfig } from 'swr';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { _createState, api } from 'lib';
import { web as webTypes } from '@glyphx/types';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { cameraAtom, imageHashAtom, modalsAtom, projectAtom } from 'state';
import { LoadingDots } from 'partials/loaders/LoadingDots';

export const CreateStateModal = ({ modalContent }: webTypes.CreateStateModalProps) => {
  const { mutate } = useSWRConfig();
  const setModals = useSetRecoilState(modalsAtom);
  const [camera, setCamera] = useRecoilState(cameraAtom);
  const [image, setImage] = useRecoilState(imageHashAtom);
  const setProject = useSetRecoilState(projectAtom);
  const [name, setName] = useState('');
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
    if (Object.keys(camera).length > 0 && image.imageHash) {
      api({
        ..._createState(
          name,
          modalContent.data._id as unknown as string,
          camera as unknown as webTypes.Camera,
          image.imageHash
        ),
        setLoading: (state) =>
          setModals(
            produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
              draft.modals[0].isSubmitting = state;
            })
          ),
        onError: (_: any) => {
          setCamera({});
          setImage({ imageHash: false });
          setModals(
            produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
              draft.modals.splice(0, 1);
            })
          );
        },
        onSuccess: (data: any) => {
          setCamera({});
          setImage({ imageHash: false });
          setModals(
            produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
              draft.modals.splice(0, 1);
            })
          );
          mutate(`/api/project/${modalContent.data._id}`);
        },
      });
    }
  }, [camera, modalContent.data._id, name, setCamera, setModals, setProject, mutate, image, setImage]);

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
        <Button className="" disabled={!validName || modalContent.isSubmitting} onClick={createState}>
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Take State Snapshot</span>}
        </Button>
      </div>
    </div>
  );
};
