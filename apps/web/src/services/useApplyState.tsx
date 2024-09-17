'use client';
import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {
  activeStateAtom,
  cameraAtom,
  drawerOpenAtom,
  imageHashAtom,
  projectAtom,
  showLoadingAtom,
  splitPaneSizeAtom,
} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {useUrl} from 'lib/client/hooks';
import {callGlyphEngine} from 'lib/client/network/reqs/callGlyphEngine';

const useApplyState = () => {
  const session = useSession();
  const url = useUrl();
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);
  const [project, setProject] = useRecoilState(projectAtom);
  const loading = useRecoilValue(showLoadingAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  const convertRowIds = (input: {[key: string]: number}[]) => {
    return input.map((obj) => Object.values(obj).join(''));
  };

  const applyState = useCallback(
    async (state) => {
      if (activeState === state.id) {
        setActiveState('');
        return;
      }
      console.log('applyState', {activeState, state});
      setActiveState(state.id);
      // only apply state if not loading
      if (!(Object.keys(loading).length > 0)) {
        const camera = state.camera;
        const ids = state.rowIds ?? [];
        const rowIds = convertRowIds(ids);

        await callGlyphEngine({
          project,
          session,
          url,
          setLoading,
          setDrawer,
          setImageHash,
          setCamera,
          setResize,
          stateId: state.id,
          rowIds: rowIds,
          camera,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, project, session, setActiveState, setDrawer, setLoading, setResize, url, activeState]
  );

  return {applyState};
};

export default useApplyState;
