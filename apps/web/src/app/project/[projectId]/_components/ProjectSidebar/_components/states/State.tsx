'use client';
import {PencilIcon, TrashIcon} from '@heroicons/react/outline';
import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {activeStateAtom, drawerOpenAtom, modalsAtom, projectAtom, showLoadingAtom, splitPaneSizeAtom} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {_createOpenProject, _getSignedDataUrls, api} from 'lib';
import {useUrl} from 'lib/client/hooks';
import StateIcon from 'public/svg/state.svg';
import ActiveStateIcon from 'public/svg/active-state.svg';
import {isNullCamera} from 'lib/utils/isNullCamera';
import Image from 'next/image';
import {databaseTypes, webTypes} from 'types';

export const State = ({item, idx}) => {
  const session = useSession();
  const url = useUrl();
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setModals = useSetRecoilState(modalsAtom);
  const [project, setProject] = useRecoilValue(projectAtom);
  const loading = useRecoilValue(showLoadingAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  const convertRowIds = (input: {[key: string]: number}[]) => {
    return input.map((obj) => Object.values(obj).join(''));
  };

  const applyState = useCallback(async () => {
    if (activeState === idx) {
      setActiveState(-1);
      return;
    }
    setActiveState(idx);
    console.log('Apply state called');

    if (window && window?.core) {
      setResize(150);
      setDrawer(true);
      // return;
    }

    // only apply state if not loading
    if (!(Object.keys(loading).length > 0)) {
      const filteredStates = project.stateHistory.filter((state) => !state.deletedAt);
      const payloadHash = filteredStates[idx].payloadHash;
      const properties = filteredStates[idx];
      console.log({state: filteredStates[idx]});
      const camera = filteredStates[idx].camera;
      const ids = filteredStates[idx].rowIds ?? [];
      const rowIds = convertRowIds(ids);

      const isNullCam = isNullCamera(camera);

      await api({
        ..._getSignedDataUrls(project?.workspace.id, project?.id, payloadHash),
        onSuccess: (data) => {
          // replace project state
          // console.log({properties});
          // setProject(
          //   produce((draft: any) => {
          //     // set axes and filters
          //     draft.state.properties = properties;
          //   })
          // );

          if (window?.core) {
            setResize(150);
            setDrawer(true);
            console.log('open project called');
            window?.core?.OpenProject(
              _createOpenProject(data, project, session, url, false, rowIds, isNullCam ? undefined : camera)
            );
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
  }, [idx, loading, project, session, setActiveState, setDrawer, setLoading, setResize, url, activeState]);

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

  return (
    <li
      key={item.id}
      className="p-2 group-states hover:bg-secondary-midnight hover:text-white last:mb-0 flex items-center justify-between cursor-pointer relative z-60"
    >
      <div className="hidden group-states-hover:flex absolute p-2 rounded border bg-primary-dark-blue w-56 h-56 bottom-16 z-60">
        {item.imageHash && (
          <Image alt="state" width={300} height={200} src={`data:image/png;base64,${item.imageHash}`} />
        )}
      </div>
      <div className="flex items-center justify-center h-6 w-6">
        {activeState === idx ? <ActiveStateIcon /> : <StateIcon className="" />}
      </div>
      <div
        onClick={applyState}
        className="block group-states-hover:text-white transition duration-150 truncate grow ml-2"
      >
        <span className={`w-full text-left text-gray text-sm ${activeState === idx ? 'text-white' : ''} font-medium`}>
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
