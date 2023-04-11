import { useCallback, useEffect, useState } from 'react';
import { api } from '../network';
import { _getDataGrid } from '../mutations';

const useDataGrid = (workspaceId, projectId, tableName) => {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    if (!tableName) {
      console.log('no selected file');
      return;
    } else {
      console.log('else block');
      const data = await api({
        ..._getDataGrid(workspaceId, projectId, tableName),
        returnData: true,
      });
      setData(data);
    }
  }, [projectId, tableName, workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data };
};

export default useDataGrid;
