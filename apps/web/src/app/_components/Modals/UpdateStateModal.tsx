'use client';
import React, {useState} from 'react';
import Button from 'app/_components/Button';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {_updateStateName, api} from 'lib';
import {webTypes} from 'types';
import {useSetRecoilState} from 'recoil';
import {modalsAtom, projectAtom} from 'state';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';

export const UpdateStateModal = ({modalContent}: webTypes.UpdateStateModalProps) => {
  const setModals = useSetRecoilState(modalsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const [name, setName] = useState('');
  const validName = name.length > 0 && name.length <= 75;

  // local state
  const handleNameChange = (event) => setName(event.target.value);

  // mutations
  const updateState = (event) => {
    event.preventDefault();
    api({
      ..._updateStateName({id: modalContent.data.id.toString(), name: name}),
      setLoading: (state) =>
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals[0].isSubmitting = state as boolean;
          })
        ),
      onError: () => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
      },
      onSuccess: () => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
        setProject(
          produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
            draft.stateHistory.map((state) => {
              if (state.id === modalContent.data.id) {
                state.name === name;
              } else {
                return state;
              }
            });
          })
        );
      },
    });
  };

  return (
    <div className="flex flex-col items-stretch justify-center px-4 py-8 space-y-5 bg-secondary-midnight rounded-md text-white">
      <div className="space-y-0 text-sm text-gray-600">
        <p>Rename your State snapshot to better suit your needs</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold">State Name</h3>
        <p className="text-sm text-gray-400">Name your state. Keep it short and sweet (under 16 characters)</p>
        <input
          className="w-full px-3 py-2 border rounded bg-transparent"
          disabled={modalContent.isSubmitting}
          onChange={handleNameChange}
          type="text"
          value={name}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="" disabled={!validName || modalContent.isSubmitting} onClick={updateState}>
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Rename State Snapshot</span>}
        </Button>
      </div>
    </div>
  );
};
