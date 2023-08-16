import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../network';
import { _getDataGrid, _getRowIds } from '../mutations';
import { dataGridPayloadSelector, rowIdsAtom } from 'state';
import { useRecoilState, useRecoilValue } from 'recoil';

const useDataGrid = () => {
  const [data, setData] = useState(null);
  const [rowIds, setRowIds] = useRecoilState(rowIdsAtom);
  const { workspaceId, projectId, tableName } = useRecoilValue(dataGridPayloadSelector);

  const fetchRowIdsConfig = useMemo(
    () => ({
      // @ts-ignore
      ..._getRowIds(workspaceId, projectId, tableName, rowIds),
      returnData: true,
    }),
    [workspaceId, projectId, tableName, rowIds]
  );

  const fetchDataGridConfig = useMemo(
    () => ({
      ..._getDataGrid(workspaceId, projectId, tableName),
      returnData: true,
    }),
    [workspaceId, projectId, tableName]
  );

  const fetchData = useCallback(async () => {
    if (!tableName) {
      return;
    } else if (rowIds) {
      const data = await api(fetchRowIdsConfig);
      console.log({ data, selection: true });
      setData(data);
    } else {
      const data = await api(fetchDataGridConfig);
      console.log({ data, selection: false });
      setData(data);
    }
  }, [rowIds, tableName, fetchRowIdsConfig, fetchDataGridConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data };
};

export default useDataGrid;
