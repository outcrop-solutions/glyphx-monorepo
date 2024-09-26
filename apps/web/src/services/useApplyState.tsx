'use client';
import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {activeStateAtom, drawerOpenAtom, modelRunnerAtom, projectAtom, showLoadingAtom, splitPaneSizeAtom} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {useUrl} from 'lib/client/hooks';
import {databaseTypes} from 'types';
import {useRust} from './useRust';

const useApplyState = () => {
  const session = useSession();
  const url = useUrl();
  const {downloadState} = useRust();

  const modelRunnerState = useRecoilValue(modelRunnerAtom);
  const loading = useRecoilValue(showLoadingAtom);

  const [project, setProject] = useRecoilState(projectAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);

  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  const applyState = useCallback(
    async (state) => {
      const stateId = state.id;
      if (activeState === stateId) {
        setActiveState('');
        return;
      }
      setActiveState(stateId);
      setDrawer(true);

      // only apply state if not loading
      if (!(Object.keys(loading).length > 0)) {
        // extract values
        const filteredStates = project.stateHistory?.filter((state) => !state.deletedAt);
        const state = filteredStates.find((s) => s.id === stateId);

        // get the data files
        await downloadState(stateId);

        // pass values to rust side of the house
        const camera = state.camera;
        const aspect = state.aspectRatio.width / state.aspectRatio.height;
        modelRunnerState.modelRunner.set_camera_data(camera, aspect);

        // format rowIds from string in mongo to Uint32Array for modelRunner
        const ids = (state.rowIds as any[])?.map((id) => Number(id)) as number[];
        const selectedIds = new Uint32Array(ids) ?? new Uint32Array();
        modelRunnerState.modelRunner.set_selected_glyphs(selectedIds);

        // update local react state
        const properties = state.properties;
        // replace project state
        setProject(
          produce((draft: any) => {
            // set axes and filters
            draft.state.properties = properties;
            draft.stateHistory = filteredStates;
          })
        );
      } else {
        setLoading(
          produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
            draft.processName = 'Failed to Open State Snapshot';
            draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
            draft.processEndTime = new Date();
          })
        );
        setActiveState('');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, project, session, setActiveState, setDrawer, setLoading, setResize, url, activeState]
  );

  return {applyState};
};

export default useApplyState;
