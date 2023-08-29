'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../network';
import { _getDataGrid, _getRowIds } from '../mutations';
import { dataGridPayloadSelector, rowIdsAtom } from 'state';
import { useRecoilValue } from 'recoil';

const useDataGrid = () => {
  const [data, setData] = useState(null);
  const rowIds = useRecoilValue(rowIdsAtom);
  const { workspaceId, projectId, tableName } = useRecoilValue(dataGridPayloadSelector);
  const [isLoadingRowIds, setIsLoadingRowIds] = useState(false);
  const [isLoadingDataGrid, setIsLoadingDataGrid] = useState(false);

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

  useEffect(() => {
    if (!tableName || isLoadingRowIds || !rowIds) {
      return;
    }

    const fetchDataWithRowIds = async () => {
      setIsLoadingRowIds(true);
      const data = await api(fetchRowIdsConfig);
      setData(data);
      setIsLoadingRowIds(false);
    };

    fetchDataWithRowIds();
  }, [rowIds, tableName, isLoadingRowIds, fetchRowIdsConfig]);

  useEffect(() => {
    if (!tableName || isLoadingDataGrid || rowIds) {
      return;
    }

    const fetchDataWithoutRowIds = async () => {
      setIsLoadingDataGrid(true);
      const data = await api(fetchDataGridConfig);
      setData(data);
      setIsLoadingDataGrid(false);
    };

    fetchDataWithoutRowIds();
  }, [isLoadingDataGrid, tableName, fetchDataGridConfig, rowIds]);

  return { data };
};

export default useDataGrid;
