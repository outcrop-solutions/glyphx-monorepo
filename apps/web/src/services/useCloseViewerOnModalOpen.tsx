'use client';
import {useEffect} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {drawerOpenAtom, modalsAtom} from 'state';

export const useCloseViewerOnModalOpen = () => {
  const modals = useRecoilValue(modalsAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  // close viewer when modal open
  useEffect(() => {
    const handleCloseViewer = () => {
      setDrawer(false);
      window?.core?.ToggleDrawer(false);
    };

    if (modals.modals.length >= 1) {
      handleCloseViewer();
    }
  }, [modals, setDrawer]);
};
