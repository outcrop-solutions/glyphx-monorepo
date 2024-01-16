'use client';
import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {
  activeStateAtom,
  drawerOpenAtom,
  modalsAtom,
  projectAtom,
  projectSegmentAtom,
  showLoadingAtom,
  splitPaneSizeAtom,
} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {_createOpenProject, _getSignedDataUrls, api} from 'lib';
import {useUrl} from 'lib/client/hooks';
import {isNullCamera} from 'lib/utils/isNullCamera';
import {databaseTypes} from 'types';

const useApplyState = () => {
  const session = useSession();
  const url = useUrl();
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const [project, setProject] = useRecoilState(projectAtom);
  const loading = useRecoilValue(showLoadingAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  const convertRowIds = (input: {[key: string]: number}[]) => {
    return input.map((obj) => Object.values(obj).join(''));
  };
  const applyState = useCallback(
    async (idx: number) => {
      if (activeState === idx) {
        setActiveState(-1);
        return;
      }
      setActiveState(idx);

      if (window && window?.core) {
        setResize(150);
        setDrawer(true);
        // return;
      }

      // only apply state if not loading
      if (!(Object.keys(loading).length > 0)) {
        const filteredStates = project.stateHistory.filter((state) => !state.deletedAt);
        const payloadHash = filteredStates[idx].payloadHash;
        const properties = filteredStates[idx].properties;
        const camera = filteredStates[idx].camera;
        const ids = filteredStates[idx].rowIds ?? [];
        const rowIds = convertRowIds(ids);

        const isNullCam = isNullCamera(camera);

        await api({
          ..._getSignedDataUrls(project?.workspace.id, project?.id, payloadHash),
          onSuccess: (data) => {
            // replace project state
            setProject(
              produce((draft: any) => {
                // set axes and filters
                draft.state.properties = properties;
              })
            );

            if (window?.core) {
              setResize(150);
              setDrawer(true);
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, project, session, setActiveState, setDrawer, setLoading, setResize, url, activeState]
  );

  return {applyState};
};

export default useApplyState;
