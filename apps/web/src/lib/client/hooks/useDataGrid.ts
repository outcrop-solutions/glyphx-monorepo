import { useCallback, useEffect, useState } from 'react';
import { api } from '../network';
import { _getDataGrid, _getRowIds } from '../mutations';
import { rowIdsAtom } from 'state';
import { useRecoilState } from 'recoil';

const useDataGrid = (workspaceId, projectId, tableName) => {
  const [data, setData] = useState(null);
  const [rowIds, setRowIds] = useRecoilState(rowIdsAtom);

  const fetchData = useCallback(async () => {
    if (!tableName) {
      return;
    } else if (rowIds) {
      const data = await api({
        ..._getRowIds(workspaceId, projectId, tableName, rowIds),
        returnData: true,
      });
      setData(data);
    } else {
      const data = await api({
        ..._getDataGrid(workspaceId, projectId, tableName),
        returnData: true,
      });
      setData(data);
    }
  }, [projectId, rowIds, tableName, workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data };
};

export default useDataGrid;
