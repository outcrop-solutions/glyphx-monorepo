import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { modalsAtom } from 'state';

export const useCloseViewerOnModalOpen = () => {
  const modals = useRecoilValue(modalsAtom);

  // close viewer when datagrid empty
  useEffect(() => {
    const handleCloseViewer = () => {
      window?.core?.ToggleDrawer(false);
    };

    console.log({ modals });
    if (modals.modals.length >= 1) {
      handleCloseViewer();
    }
  }, [modals]);
};
