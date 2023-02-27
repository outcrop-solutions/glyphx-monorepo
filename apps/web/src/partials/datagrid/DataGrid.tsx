import { useState, useCallback, useMemo, useEffect } from 'react';
import { DraggableHeaderRenderer } from './DraggableHeaderRenderer';
import { useRecoilState, useRecoilValue } from 'recoil';
import { columnsSelector, rowsSelector } from 'src/state/files';
import { shareOpenAtom } from 'src/state/share';
import { showInfoAtom } from 'src/state/info';
import { showNotificationAtom } from 'src/state/notification';

import dynamic from 'next/dynamic';

const DataGrid = dynamic(() => import('@glyphx/react-data-grid'), {
  ssr: false,
});

export const Datagrid = ({ isDropped }) => {
  const rows = useRecoilValue(rowsSelector);
  const columns = useRecoilValue(columnsSelector);
  const isShareModelOpen = useRecoilValue(shareOpenAtom);
  const isShowInfoOpen = useRecoilValue(showInfoAtom);
  const isShowNotificationOpen = useRecoilValue(showNotificationAtom);

  const [sortColumns, setSortColumns] = useState([]);
  const onSortColumnsChange = useCallback((sortColumns) => {
    setSortColumns(sortColumns.slice(-1));
  }, []);

  // data grid column handling
  const draggableColumns = useMemo(() => {
    function HeaderRenderer(props) {
      return (
        <>
          {columns && columns.length > 0 && (
            <DraggableHeaderRenderer {...props} isDropped={isDropped} onColumnsReorder={handleColumnsReorder} />
          )}
        </>
      );
    }

    function handleColumnsReorder(sourceKey, targetKey) {
      const sourceColumnIndex = columns.findIndex((c) => c.key === sourceKey);
      const targetColumnIndex = columns.findIndex((c) => c.key === targetKey);
      const reorderedColumns = [...columns];

      reorderedColumns.splice(targetColumnIndex, 0, reorderedColumns.splice(sourceColumnIndex, 1)[0]);

      // setColumns(reorderedColumns);
    }

    return columns.map((c) => {
      if (c.key === 'id') return c;
      return { ...c, headerRenderer: HeaderRenderer };
    });
  }, [columns, isDropped]);

  // data grid row handling
  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return rows;
    const { columnKey, direction } = sortColumns[0];

    let sortedRows = [...rows];

    switch (columnKey) {
      case 'task':
      case 'priority':
      case 'issueType':
        sortedRows = sortedRows.sort((a, b) => a[columnKey].localeCompare(b[columnKey]));
        break;
      case 'complete':
        sortedRows = sortedRows.sort((a, b) => a[columnKey] - b[columnKey]);
        break;
      default:
    }
    return direction === 'DESC' ? sortedRows.reverse() : sortedRows;
  }, [rows, sortColumns]);

  useEffect(() => {}, [isShareModelOpen, isShowInfoOpen, isShowNotificationOpen]);

  return (
    <DataGrid
      headerRowHeight={20}
      rowHeight={20}
      columns={draggableColumns}
      rows={sortedRows}
      sortColumns={sortColumns}
      onSortColumnsChange={onSortColumnsChange}
    />
  );
};
