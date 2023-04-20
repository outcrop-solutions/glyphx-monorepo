import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { selectedFileIndexSelector } from 'state';

export const useCloseViewerOnEmptyDataGrid = () => {
  const selected = useRecoilValue(selectedFileIndexSelector);

  // close viewer when datagrid empty
  useEffect(() => {
    const handleCloseViewer = () => {
      window?.core?.ToggleDrawer(false);
    };

    if (selected === -1) {
      handleCloseViewer();
    }
  }, [selected]);
};
