'use client';
import {PencilIcon, TrashIcon} from '@heroicons/react/outline';
import {useCallback} from 'react';
import {modalsAtom, projectSegmentAtom} from 'state';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import StateIcon from 'svg/state.svg';
import ActiveStateIcon from '../../../../../../../svg/active-state.svg';
import Image from 'next/image';
import {webTypes} from 'types';
import useApplyState from 'services/useApplyState';

export const State = ({item, activeState}) => {
  const segment = useRecoilValue(projectSegmentAtom);
  const setModals = useSetRecoilState(modalsAtom);

  const {applyState} = useApplyState();

  const deleteState = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_STATE,
          isSubmitting: false,
          data: {
            id: item.id,
            name: item.name,
          },
        });
      })
    );
  }, [item, setModals]);

  const updateState = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.UPDATE_STATE,
          isSubmitting: false,
          data: {
            id: item.id,
            name: item.name,
          },
        });
      })
    );
  }, [item, setModals]);

  const isThreads = segment === 'COLLAB';

  return (
    <li
      key={item.id}
      className="p-2 group-states hover:bg-secondary-midnight hover:text-white last:mb-0 flex items-center justify-between cursor-pointer relative"
    >
      <div
        className={`hidden group-states-hover:flex pointer-events-none absolute p-2 rounded border bg-primary-dark-blue w-56 h-56 ${
          isThreads ? 'top-10' : 'bottom-16'
        } z-60`}
      >
        {item.imageHash && <Image alt="state" width={300} height={200} src={`${item.imageHash}`} />}
        <div className="absolute text-[10px] top-0 left-0 invisible group-states-hover:visible px-2 py-1 bg-gray">
          {item.name}
        </div>
      </div>
      <div className="flex items-center justify-center h-6 w-6">
        {activeState === item.id ? <ActiveStateIcon /> : <StateIcon className="" />}
      </div>
      <div
        onClick={() => applyState(item)}
        className="block group-states-hover:text-white transition duration-150 truncate grow ml-2"
      >
        <span
          className={`w-full text-left text-gray text-sm ${
            activeState === item.id ? 'text-white' : ''
          } font-medium z-0`}
        >
          {item.name}
        </span>
      </div>
      <div className="invisible group-states-hover:visible flex gap-x-2 justify-between items-center">
        <PencilIcon onClick={updateState} className="h-4 w-4" />
        <TrashIcon onClick={deleteState} className="h-4 w-4" />
      </div>
    </li>
  );
};
