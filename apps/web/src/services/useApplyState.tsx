'use client';
import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {activeStateAtom, cameraAtom, drawerOpenAtom, projectAtom, showLoadingAtom, splitPaneSizeAtom} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {_createOpenProject} from 'lib';
import {useUrl} from 'lib/client/hooks';
import {isNullCamera} from 'lib/utils/isNullCamera';
import {databaseTypes} from 'types';
import {signDataUrls} from 'actions';

const useApplyState = () => {
  const session = useSession();
  const url = useUrl();
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const [project, setProject] = useRecoilState(projectAtom);
  const loading = useRecoilValue(showLoadingAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  const convertRowIds = (input: {[key: string]: number}[]) => {
    return input.map((obj) => Object.values(obj).join(''));
  };

  const applyState = useCallback(
    async (idx: number, newProject: any) => {
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
        const filteredStates = newProject
          ? newProject.stateHistory?.filter((state) => !state.deletedAt)
          : project.stateHistory.filter((state) => !state.deletedAt);

        const payload = filteredStates[idx];
        const payloadHash = payload.payloadHash;
        const properties = payload.properties;
        const camera = payload.camera;
        const ids = payload.rowIds ?? [];
        const rowIds = convertRowIds(ids);

        const isNullCam = isNullCamera(camera);
        const signedUrls = await signDataUrls(project?.workspace.id, project?.id, payloadHash);

        console.log({
          signedUrls,
          isNullCam,
          camera,
          properties,
          ids,
          rowIds,
          payload,
          filteredStates,
          newProject,
          project,
        });

        if (!signedUrls?.error) {
          // replace project state
          setProject(
            produce((draft: any) => {
              // set axes and filters
              draft.state.properties = properties;
              draft.stateHistory = filteredStates;
            })
          );
          if (window?.core) {
            setResize(150);
            setDrawer(true);
            window?.core?.OpenProject(
              _createOpenProject(
                signedUrls as {sdtUrl: any; sgcUrl: any; sgnUrl: any},
                project,
                session,
                url,
                false,
                rowIds,
                isNullCam ? undefined : camera
              )
            );
          }
          setCamera({});
        } else {
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processName = 'Failed to Open State Snapshot';
              draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
              draft.processEndTime = new Date();
            })
          );
          setActiveState(-1);
          setCamera({});
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, project, session, setActiveState, setDrawer, setLoading, setResize, url, activeState]
  );

  return {applyState};
};

export default useApplyState;
