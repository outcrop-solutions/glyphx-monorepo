'use client';
import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {activeStateAtom, drawerOpenAtom, modelRunnerAtom, projectAtom, showLoadingAtom} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import produce from 'immer';
import {useUrl} from 'lib/client/hooks';
import {useRust} from './useRust';

const useApplyState = () => {
  const session = useSession();
  const url = useUrl();
  const {downloadState} = useRust();

  const {initialized, modelRunner} = useRecoilValue(modelRunnerAtom);
  const loading = useRecoilValue(showLoadingAtom);

  const [project, setProject] = useRecoilState(projectAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);

  const setDrawer = useSetRecoilState(drawerOpenAtom);
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
      const isLoading = Object.keys(loading).length > 0;
      // only apply state if not loading
      if (!isLoading && project && initialized) {
        // extract values
        const states = project?.stateHistory;
        const activeStates = states?.filter((state) => !state.deletedAt);
        const stateValue = states?.find((s) => s.id === stateId);
        if (stateValue) {
          // get the data files
          await downloadState(stateId);
          // pass values to rust side of the house
          const camera = state.camera;
          const aspect = state.aspectRatio.width / state.aspectRatio.height;
          modelRunner?.set_camera_data(JSON.stringify(camera), aspect);

          // format rowIds from string in mongo to Uint32Array for modelRunner
          const ids = (state.rowIds as any[])?.map((id) => Number(id)) as number[];
          const selectedIds = new Uint32Array(ids) ?? new Uint32Array();
          modelRunner.set_selected_glyphs(selectedIds);

          // update local react state
          const properties = state.properties;
          // replace project state
          setProject(
            produce((draft: any) => {
              // set axes and filters
              draft.state.properties = properties;
              draft.stateHistory = activeStates;
            })
          );
        }
      } else {
        setActiveState('');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, project, session, setActiveState, setDrawer, setLoading, url, activeState]
  );

  return {applyState};
};

export default useApplyState;
