import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { drawerOpenAtom, showLoadingAtom } from 'state';

export const useCloseViewerOnLoading = () => {
  const loading = useRecoilValue(showLoadingAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  // close viewer when loading state
  useEffect(() => {
    const handleCloseViewer = () => {
      setDrawer(false);
      window?.core?.ToggleDrawer(false);
    };

    if (Object.keys(loading).length > 0) {
      handleCloseViewer();
    }
  }, [loading, setDrawer]);
};
