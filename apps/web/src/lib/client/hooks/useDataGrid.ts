'use client';
import {useEffect, useMemo, useState} from 'react';
import {api} from '../network';
import {_getDataGrid, _getRowIds} from '../mutations';
import {dataGridPayloadSelector, rowIdsAtom} from 'state';
import {debounce} from 'lodash';
import {useRecoilValue} from 'recoil';

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

  const fetchDataWithRowIds = async () => {
    console.log('fetch data row with ids debounced');
    setIsLoadingRowIds(true);
    const data = await api(fetchRowIdsConfig);
    setData(data);
    setIsLoadingRowIds(false);
  };

  const fetchDataWithoutRowIds = async () => {
    setIsLoadingDataGrid(true);
    const data = await api(fetchDataGridConfig);
    setData(data);
    setIsLoadingDataGrid(false);
  };

  const fetchData = debounce(async () => {
    if (!tableName) {
      if (!rowIds && !isLoadingDataGrid) {
        fetchDataWithoutRowIds();
      } else if (rowIds && !isLoadingRowIds) {
        fetchDataWithRowIds();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 1000);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIds, tableName, isLoadingRowIds, fetchRowIdsConfig]);

  return {data};
};

export default useDataGrid;
