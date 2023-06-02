import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useCallback } from 'react';
import { database as databaseTypes, web as webTypes } from '@glyphx/types';
import { activeStateAtom, drawerOpenAtom, modalsAtom, projectAtom, showLoadingAtom, splitPaneSizeAtom } from 'state';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { WritableDraft } from 'immer/dist/internal';
import produce from 'immer';
import { _createOpenProject, _getSignedDataUrls, api } from 'lib';
import { useSession } from 'next-auth/react';
import { useUrl } from 'lib/client/hooks';
import StateIcon from 'public/svg/state.svg';
import ActiveStateIcon from 'public/svg/active-state.svg';
import { isNullCamera } from 'lib/utils/isNullCamera';
import Image from 'next/image';

export const State = ({ item, idx }) => {
  const session = useSession();
  const url = useUrl();
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
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
      const payloadHash = filteredStates[idx].payloadHash;
      const camera = filteredStates[idx].camera;
      const isNullCam = isNullCamera(camera);

      // apply item to project state remote
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Retreiving State Snapshot...';
          draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
          draft.processStartTime = new Date();
        })
      );

      await api({
        ..._getSignedDataUrls(project?.workspace._id.toString(), project?._id.toString(), payloadHash),
        onSuccess: async (data) => {
          if (window?.core) {
            setResize(150);
            setDrawer(true);
            window?.core?.OpenProject(_createOpenProject(data, project, session, url, isNullCam ? undefined : camera));
            setLoading({});
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
  }, [idx, loading, project, session, setActiveState, setDrawer, setLoading, setResize, url]);

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
      <div className="hidden group-states-hover:flex absolute p-2 rounded border bg-primary-dark-blue w-56 h-56 bottom-16">
        <Image
          alt="state"
          layout="fill"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg=="
        />
      </div>
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
