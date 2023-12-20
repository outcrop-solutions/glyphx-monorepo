'use client';
import {useEffect, useMemo, useState} from 'react';
import {api} from '../network';
import {_getDataGrid, _getRowIds} from '../mutations';
import {dataGridPayloadSelector, rowIdsAtom} from 'state';
import {useRecoilValue} from 'recoil';
import {debounce} from 'lodash';

const useDataGrid = () => {
  const [data, setData] = useState(null);

  const rowIds = useRecoilValue(rowIdsAtom);
  const {workspaceId, projectId, tableName} = useRecoilValue(dataGridPayloadSelector);
  const [isLoadingRowIds, setIsLoadingRowIds] = useState(false);
  const [isLoadingDataGrid, setIsLoadingDataGrid] = useState(false);

  // fetch req configurations for selected case
  const fetchRowIdsConfig = useMemo(
    () => ({
      ..._getRowIds(workspaceId, projectId, tableName, rowIds as string[]),
      returnData: true,
    }),
    [workspaceId, projectId, tableName, rowIds]
  );

  // fetch req configurations for unselected case
  const fetchDataGridConfig = useMemo(
    () => ({
      ..._getDataGrid(workspaceId, projectId, tableName),
      returnData: true,
    }),
    [workspaceId, projectId, tableName]
  );

  const fetchDataWithRowIds = debounce(async () => {
    console.log('fetch data row with ids debounced');
    setIsLoadingRowIds(true);
    const data = await api(fetchRowIdsConfig);
    setData(data);
    setIsLoadingRowIds(false);
  }, 500);

  useEffect(() => {
    if (!tableName || isLoadingRowIds || !rowIds) {
      return;
    }
    fetchDataWithRowIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIds, tableName, isLoadingRowIds, fetchRowIdsConfig]);

  const fetchDataWithoutRowIds = debounce(async () => {
    setIsLoadingDataGrid(true);
    const data = await api(fetchDataGridConfig);
    if (!rowIds) {
      setData(data);
    }
    setIsLoadingDataGrid(false);
  }, 500);

  useEffect(() => {
    if (!tableName || isLoadingDataGrid || rowIds) {
      return;
    }

    fetchDataWithoutRowIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingDataGrid, tableName, fetchDataGridConfig, rowIds]);

  return {data};
};

export default useDataGrid;
