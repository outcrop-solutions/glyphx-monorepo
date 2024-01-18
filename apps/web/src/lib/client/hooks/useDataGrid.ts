'use client';
import {useEffect, useMemo, useState} from 'react';
import {api} from '../network';
import {_getDataGrid, _getRowIds} from '../mutations';
import {dataGridAtom, dataGridPayloadSelector, rowIdsAtom} from 'state';
import {useRecoilState, useRecoilValue} from 'recoil';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';

const useDataGrid = () => {
  const [gridData, setGridData] = useRecoilState(dataGridAtom);
  const [pageSize, setPageSize] = useState(50);
  const [pageNumber, setPageNumber] = useState(0);
  const rowIds = useRecoilValue(rowIdsAtom);
  const {workspaceId, projectId, tableName} = useRecoilValue(dataGridPayloadSelector);
  const [isLoadingRowIds, setIsLoadingRowIds] = useState(false);
  const [isLoadingDataGrid, setIsLoadingDataGrid] = useState(false);

  const fetchRowIdsConfig = useMemo(
    () => ({
      ..._getRowIds(workspaceId, projectId, tableName, rowIds as string[], pageSize, pageNumber),
      returnData: true,
    }),
    [workspaceId, projectId, tableName, rowIds, pageSize, pageNumber]
  );

  const fetchDataGridConfig = useMemo(
    () => ({
      ..._getDataGrid(workspaceId, projectId, tableName, pageSize, pageNumber),
      returnData: true,
    }),
    [workspaceId, projectId, tableName, pageSize, pageNumber]
  );

  const fetchDataWithRowIds = async (pageNumber: number) => {
    setIsLoadingRowIds(true);
    console.log(fetchRowIdsConfig);
    const data = await api(fetchRowIdsConfig);
    console.log({data, rowIds: true});
    setGridData(
      produce((draft: WritableDraft<webTypes.IRenderableDataGrid>) => {
        // if initial load, populate columns, otherwise skip
        if (pageNumber === 0) {
          draft.columns.push(...data.columns);
        }
        // Get the set of existing glyphx_id__
        const existingIds = new Set(draft.rows.map((row) => row.glyphx_id__));

        // Filter out duplicate rows based on glyphx_id__
        const newRows = data.rows.filter((row) => !existingIds.has(row.glyphx_id__));

        // Push only new, unique rows
        draft.rows.push(...newRows);
      })
    );
    setIsLoadingRowIds(false);
  };

  // useEffect(() => {
  //   console.log({gridData});
  // }, [gridData]);

  useEffect(() => {
    if (!tableName || isLoadingRowIds || !rowIds) {
      return;
    }

    console.log('fetch data with rowIds', {tableName, isLoadingRowIds, rowIds});
    fetchDataWithRowIds(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIds, tableName, pageNumber]);

  const fetchDataWithoutRowIds = async (pageNumber: number) => {
    setIsLoadingDataGrid(true);
    console.log(fetchDataGridConfig);
    const data = await api(fetchDataGridConfig);
    console.log({data, rowIds: false});
    setGridData(
      produce((draft: WritableDraft<webTypes.IRenderableDataGrid>) => {
        // if initial load, populate columns, otherwise skip

        if (pageNumber === 0) {
          // Get the set of existing columns
          const existingKeys = new Set(draft.columns.map((col) => col.key));
          // Filter out duplicate columns based on keys
          const newCols = data.columns.filter((col) => !existingKeys.has(col.key));
          draft.columns.push(...newCols);
        }
        // Get the set of existing glyphx_id__
        const existingIds = new Set(draft.rows.map((row) => row.glyphx_id__));
        // Filter out duplicate rows based on glyphx_id__
        const newRows = data.rows.filter((row) => !existingIds.has(row.glyphx_id__));

        // Push only new, unique rows
        draft.rows.push(...newRows);
      })
    );
    setIsLoadingDataGrid(false);
  };

  useEffect(() => {
    if (!tableName || isLoadingDataGrid || rowIds) {
      return;
    }
    console.log('fetch data without rowIds', {tableName, isLoadingDataGrid, rowIds});

    fetchDataWithoutRowIds(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIds, tableName, pageNumber]);

  return {
    data: gridData,
    offset: (pageNumber + 1) * pageSize,
    setPageNumber,
    setPageSize,
    isLoading: isLoadingRowIds || isLoadingDataGrid,
  };
};

export default useDataGrid;
