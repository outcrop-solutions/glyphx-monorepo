import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useCallback } from 'react';
import StateIcon from 'public/svg/state.svg';
import { web as webTypes } from '@glyphx/types';
import { activeStateAtom, modalsAtom, showLoadingAtom } from 'state';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { WritableDraft } from 'immer/dist/internal';
import produce from 'immer';

export const State = ({ item, idx }) => {
  const setModals = useSetRecoilState(modalsAtom);
  const loading = useRecoilValue(showLoadingAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);

  const applyState = useCallback(() => {
    // only apply state if not loading
    if (Object.keys(loading).length > 0) {
      // apply item to project state remote
      // apply item to project state local
      // call open project
      setActiveState(idx);
    }
  }, [idx]);

  const deleteState = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_STATE,
          isSubmitting: false,
          data: {
            id: item._id,
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
            id: item._id,
            name: item.name,
          },
        });
      })
    );
  }, [item, setModals]);

  return (
    <li
      key={item.id}
      onClick={applyState}
      className="p-2 group-states hover:bg-gray hover:text-white last:mb-0 flex items-center justify-between cursor-pointer"
    >
      <div className="flex items-center justify-center h-6 w-6 group-states-hover:bg-white">
        <StateIcon />
      </div>
      <div className="block text-gray group-states-hover:text-white transition duration-150 truncate">
        <span className={`text-sm ${activeState === idx ? 'text-white' : ''} font-medium`}>{item.name}</span>
      </div>
      <div className="invisible group-states-hover:visible flex gap-x-2 justify-between items-center">
        <PencilIcon onClick={updateState} className="h-4 w-4" />
        <TrashIcon onClick={deleteState} className="h-4 w-4" />
      </div>
    </li>
  );
};
