import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useCallback } from 'react';
import { database as databaseTypes, web as webTypes } from '@glyphx/types';
import { activeStateAtom, modalsAtom, projectAtom, showLoadingAtom } from 'state';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { WritableDraft } from 'immer/dist/internal';
import produce from 'immer';
import { _createOpenProject, _getSignedDataUrls, api } from 'lib';
import { useSession } from 'next-auth/react';
import { useUrl } from 'lib/client/hooks';
import StateIcon from 'public/svg/state.svg';
import ActiveStateIcon from 'public/svg/active-state.svg';

export const State = ({ item, idx }) => {
  const session = useSession();
  const url = useUrl();
  const setModals = useSetRecoilState(modalsAtom);
  const project = useRecoilValue(projectAtom);
  const loading = useRecoilValue(showLoadingAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  const applyState = useCallback(async () => {
    setActiveState(idx);
    // only apply state if not loading
    if (!(Object.keys(loading).length > 0)) {
      const filteredStates = project.stateHistory.filter((state) => !state.deletedAt);
      const fileHash = filteredStates[idx].fileSystemHash;
      const camera = filteredStates[idx].camera;
      // apply item to project state remote
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Retreiving State Snapshot...';
          draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
          draft.processStartTime = new Date();
        })
      );

      api({
        ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString(), fileHash),
        onSuccess: async (data) => {
          setLoading({});
          if (window?.core) {
            window?.core?.OpenProject(_createOpenProject(data, project, session, url, camera));
          }
        },
        onError: () => {
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processName = 'Failed to Open State Snapshot';
              draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
              draft.processEndTime = new Date();
            })
          );
          setActiveState(-1);
        },
      });
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
      className="p-2 group-states hover:bg-secondary-midnight hover:text-white last:mb-0 flex items-center justify-between cursor-pointer"
    >
      <div className="flex items-center justify-center h-6 w-6">
        {activeState === idx ? <StateIcon className="" /> : <ActiveStateIcon />}
      </div>
      <div
        onClick={applyState}
        className="block group-states-hover:text-white transition duration-150 truncate grow ml-2"
      >
        <span
          className={`w-full text-left text-light-gray text-sm ${activeState === idx ? 'text-white' : ''} font-medium`}
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
