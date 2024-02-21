'use client';
import {useEffect, useState} from 'react';
import {dataGridAtom, dataGridPayloadSelector, pageNumberAtom, rowIdsAtom} from 'state';
import {useRecoilState, useRecoilValue} from 'recoil';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import {getDataByRowId, getDataByTableName} from 'business/src/actions';

const useDataGrid = (ref) => {
  const [gridData, setGridData] = useRecoilState(dataGridAtom);
  const [pageSize, setPageSize] = useState(50);
  const [pageNumber, setPageNumber] = useRecoilState(pageNumberAtom);
  const rowIds = useRecoilValue(rowIdsAtom);
  const {workspaceId, projectId, tableName} = useRecoilValue(dataGridPayloadSelector);
  const [isLoadingRowIds, setIsLoadingRowIds] = useState(false);
  const [isLoadingDataGrid, setIsLoadingDataGrid] = useState(false);

  // resets scroll position of parent
  const resetScrollPosition = () => {
    if (ref.current) {
      ref.current.scrollTop = 0; // Reset scroll position
    }
  };

  const fetchDataWithRowIds = async (pageNumber: number) => {
    setIsLoadingRowIds(true);
    const retval = await getDataByRowId(
      workspaceId,
      projectId,
      tableName,
      rowIds as unknown as number[],
      true,
      pageSize,
      pageNumber
    );

    if (retval?.data) {
      setGridData(
        produce((draft: WritableDraft<webTypes.IRenderableDataGrid>) => {
          return retval.data;
        })
      );
      resetScrollPosition();
      setIsLoadingRowIds(false);
    }
  };

  useEffect(() => {
    if (!tableName || isLoadingRowIds || !rowIds) {
      return;
    }
    fetchDataWithRowIds(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIds, tableName, pageNumber]);

  const fetchDataWithoutRowIds = async (pageNumber: number) => {
    setIsLoadingDataGrid(true);
    const retval = await getDataByTableName(workspaceId, projectId, tableName, pageSize, pageNumber);
    if (retval?.data) {
      setGridData(
        produce((draft: WritableDraft<webTypes.IRenderableDataGrid>) => {
          if (pageNumber === 0) {
            // Get the set of existing columns
            const existingKeys = new Set(draft.columns.map((col) => col.key));
            // Filter out duplicate columns based on keys
            const newCols = retval.data.columns.filter((col) => !existingKeys.has(col.key));
            draft.columns.push(...newCols);
          }
          // Get the set of existing glyphx_id__
          const existingIds = new Set(draft.rows.map((row) => row.glyphx_id__));
          // Filter out duplicate rows based on glyphx_id__
          const newRows = retval.data.rows.filter((row) => !existingIds.has(row.glyphx_id__));
          if (pageNumber === 0) {
            draft.rows = retval.data.rows;
          } else {
            // Push only new, unique rows
            draft.rows.push(...newRows);
          }
        })
      );
      resetScrollPosition();
      setIsLoadingDataGrid(false);
    }
  };

  useEffect(() => {
    if (!tableName || isLoadingDataGrid || rowIds) {
      return;
    }
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
